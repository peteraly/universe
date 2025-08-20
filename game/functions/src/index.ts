import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

const db = admin.firestore()

// Types
interface EventData {
  title: string
  description?: string
  datetimeISO: string
  timezone: string
  location: string
  maxSlots: number
  visibility: 'public' | 'invite-only'
  cutoffMinutes?: number
}

interface UpdateEventData extends Partial<EventData> {
  id: string
}

// Helper function to get user from auth context
const getUser = async (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }
  
  const userDoc = await db.collection('users').doc(context.auth.uid).get()
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found')
  }
  
  return {
    id: context.auth.uid,
    ...userDoc.data()
  }
}

// Helper function to check if event exists and user has access
const getEventAndCheckAccess = async (eventId: string, userId: string) => {
  const eventDoc = await db.collection('events').doc(eventId).get()
  if (!eventDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Event not found')
  }
  
  const eventData = eventDoc.data()!
  
  // Check if event is past cutoff
  const eventTime = new Date(eventData.datetimeISO)
  const cutoffTime = new Date(eventTime.getTime() - (eventData.cutoffMinutes || 30) * 60 * 1000)
  
  if (new Date() > cutoffTime) {
    throw new functions.https.HttpsError('failed-precondition', 'Event registration is closed')
  }
  
  // Check visibility for invite-only events
  if (eventData.visibility === 'invite-only' && eventData.createdBy !== userId) {
    // Check if user has invite
    const inviteDoc = await db.collection('invites')
      .where('eventId', '==', eventId)
      .where('invitedUserId', '==', userId)
      .where('status', '==', 'accepted')
      .get()
    
    if (inviteDoc.empty) {
      throw new functions.https.HttpsError('permission-denied', 'Event is invite-only')
    }
  }
  
  return { eventDoc, eventData }
}

// Claim a seat for an event
export const claimSeat = functions.https.onCall(async (data, context) => {
  try {
    const { eventId } = data
    const user = await getUser(context)
    
    if (!eventId) {
      throw new functions.https.HttpsError('invalid-argument', 'Event ID is required')
    }
    
    const { eventDoc, eventData } = await getEventAndCheckAccess(eventId, user.id)
    
    // Check if user is already attending or on waitlist
    const existingAttendee = await db.collection('eventAttendees').doc(eventId).get()
    const existingWaitlist = await db.collection('eventWaitlist').doc(eventId).get()
    
    if (existingAttendee.exists && existingAttendee.data()![user.id]) {
      throw new functions.https.HttpsError('already-exists', 'User is already attending this event')
    }
    
    if (existingWaitlist.exists && existingWaitlist.data()!.entries?.[user.id]) {
      throw new functions.https.HttpsError('already-exists', 'User is already on waitlist')
    }
    
    // Get current attendee count
    const attendeeCount = existingAttendee.exists ? Object.keys(existingAttendee.data()!).length : 0
    
    return await db.runTransaction(async (transaction) => {
      // Check if there's still space
      if (attendeeCount < eventData.maxSlots) {
        // Add to attendees
        const attendeeData = {
          userId: user.id,
          eventId,
          joinedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'confirmed'
        }
        
        transaction.set(
          db.collection('eventAttendees').doc(eventId),
          { [user.id]: attendeeData },
          { merge: true }
        )
        
        // Update event status to confirmed if this fills the event
        if (attendeeCount + 1 >= eventData.maxSlots) {
          transaction.update(eventDoc.ref, { status: 'confirmed' })
        }
        
        return { success: true, status: 'confirmed' }
      } else {
        // Add to waitlist
        const waitlistDoc = await db.collection('eventWaitlist').doc(eventId).get()
        const currentWaitlist = waitlistDoc.exists ? waitlistDoc.data()!.entries || {} : {}
        const waitlistPosition = Object.keys(currentWaitlist).length + 1
        
        const waitlistEntry = {
          userId: user.id,
          eventId,
          joinedAt: admin.firestore.FieldValue.serverTimestamp(),
          position: waitlistPosition
        }
        
        transaction.set(
          db.collection('eventWaitlist').doc(eventId),
          { entries: { ...currentWaitlist, [user.id]: waitlistEntry } },
          { merge: true }
        )
        
        return { success: true, status: 'waitlist', position: waitlistPosition }
      }
    })
  } catch (error) {
    console.error('Error claiming seat:', error)
    throw error
  }
})

// Leave a seat or waitlist
export const leaveSeat = functions.https.onCall(async (data, context) => {
  try {
    const { eventId } = data
    const user = await getUser(context)
    
    if (!eventId) {
      throw new functions.https.HttpsError('invalid-argument', 'Event ID is required')
    }
    
    const { eventDoc, eventData } = await getEventAndCheckAccess(eventId, user.id)
    
    return await db.runTransaction(async (transaction) => {
      // Check if user is attending
      const attendeeDoc = await db.collection('eventAttendees').doc(eventId).get()
      const waitlistDoc = await db.collection('eventWaitlist').doc(eventId).get()
      
      let wasAttending = false
      let wasWaitlisted = false
      
      if (attendeeDoc.exists && attendeeDoc.data()![user.id]) {
        // Remove from attendees
        const attendees = { ...attendeeDoc.data()! }
        delete attendees[user.id]
        
        transaction.set(
          db.collection('eventAttendees').doc(eventId),
          attendees
        )
        
        wasAttending = true
      }
      
      if (waitlistDoc.exists && waitlistDoc.data()!.entries?.[user.id]) {
        // Remove from waitlist
        const waitlist = { ...waitlistDoc.data()!.entries }
        delete waitlist[user.id]
        
        // Reorder positions
        const reorderedWaitlist: any = {}
        let newPosition = 1
        Object.values(waitlist).forEach((entry: any) => {
          reorderedWaitlist[entry.userId] = { ...entry, position: newPosition++ }
        })
        
        transaction.set(
          db.collection('eventWaitlist').doc(eventId),
          { entries: reorderedWaitlist }
        )
        
        wasWaitlisted = true
      }
      
      if (!wasAttending && !wasWaitlisted) {
        throw new functions.https.HttpsError('not-found', 'User is not attending or waitlisted')
      }
      
      // If user was attending and there are people on waitlist, promote first person
      if (wasAttending && waitlistDoc.exists && Object.keys(waitlistDoc.data()!.entries || {}).length > 0) {
        const waitlist = waitlistDoc.data()!.entries
        const firstWaitlistEntry = Object.values(waitlist).sort((a: any, b: any) => a.position - b.position)[0] as any
        
        // Add to attendees
        transaction.set(
          db.collection('eventAttendees').doc(eventId),
          { [firstWaitlistEntry.userId]: { ...firstWaitlistEntry, status: 'confirmed' } },
          { merge: true }
        )
        
        // Remove from waitlist
        const updatedWaitlist = { ...waitlist }
        delete updatedWaitlist[firstWaitlistEntry.userId]
        
        // Reorder remaining waitlist
        const reorderedWaitlist: any = {}
        let newPosition = 1
        Object.values(updatedWaitlist).forEach((entry: any) => {
          reorderedWaitlist[entry.userId] = { ...entry, position: newPosition++ }
        })
        
        transaction.set(
          db.collection('eventWaitlist').doc(eventId),
          { entries: reorderedWaitlist }
        )
      }
      
      return { success: true }
    })
  } catch (error) {
    console.error('Error leaving seat:', error)
    throw error
  }
})

// Create a new event
export const createEvent = functions.https.onCall(async (data: EventData, context) => {
  try {
    const user = await getUser(context)
    
    if (!data.title || !data.datetimeISO || !data.location || !data.maxSlots) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields')
    }
    
    const eventData = {
      ...data,
      createdBy: user.id,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }
    
    const eventRef = await db.collection('events').add(eventData)
    
    return { success: true, eventId: eventRef.id }
  } catch (error) {
    console.error('Error creating event:', error)
    throw error
  }
})

// Update an event
export const updateEvent = functions.https.onCall(async (data: UpdateEventData, context) => {
  try {
    const user = await getUser(context)
    
    if (!data.id) {
      throw new functions.https.HttpsError('invalid-argument', 'Event ID is required')
    }
    
    const eventDoc = await db.collection('events').doc(data.id).get()
    if (!eventDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Event not found')
    }
    
    const eventData = eventDoc.data()!
    if (eventData.createdBy !== user.id) {
      throw new functions.https.HttpsError('permission-denied', 'Only event host can update event')
    }
    
    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }
    delete updateData.id // Remove id from update data
    
    await db.collection('events').doc(data.id).update(updateData)
    
    return { success: true }
  } catch (error) {
    console.error('Error updating event:', error)
    throw error
  }
})

// Cancel an event
export const cancelEvent = functions.https.onCall(async (data, context) => {
  try {
    const { eventId } = data
    const user = await getUser(context)
    
    if (!eventId) {
      throw new functions.https.HttpsError('invalid-argument', 'Event ID is required')
    }
    
    const eventDoc = await db.collection('events').doc(eventId).get()
    if (!eventDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Event not found')
    }
    
    const eventData = eventDoc.data()!
    if (eventData.createdBy !== user.id) {
      throw new functions.https.HttpsError('permission-denied', 'Only event host can cancel event')
    }
    
    await db.collection('events').doc(eventId).update({
      status: 'cancelled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error cancelling event:', error)
    throw error
  }
})

