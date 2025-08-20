import { httpsCallable } from 'firebase/functions'
import { functions } from './firebase'
import { CreateEventData, UpdateEventData } from '../types'

// Cloud Function calls
const claimSeatFunction = httpsCallable(functions, 'claimSeat')
const leaveSeatFunction = httpsCallable(functions, 'leaveSeat')
const createEventFunction = httpsCallable(functions, 'createEvent')
const updateEventFunction = httpsCallable(functions, 'updateEvent')
const cancelEventFunction = httpsCallable(functions, 'cancelEvent')

export const claimSeat = async (eventId: string) => {
  try {
    const result = await claimSeatFunction({ eventId })
    return result.data
  } catch (error) {
    console.error('Error claiming seat:', error)
    throw error
  }
}

export const leaveSeat = async (eventId: string) => {
  try {
    const result = await leaveSeatFunction({ eventId })
    return result.data
  } catch (error) {
    console.error('Error leaving seat:', error)
    throw error
  }
}

export const createEvent = async (eventData: CreateEventData) => {
  try {
    const result = await createEventFunction(eventData)
    return result.data
  } catch (error) {
    console.error('Error creating event:', error)
    throw error
  }
}

export const updateEvent = async (eventData: UpdateEventData) => {
  try {
    const result = await updateEventFunction(eventData)
    return result.data
  } catch (error) {
    console.error('Error updating event:', error)
    throw error
  }
}

export const cancelEvent = async (eventId: string) => {
  try {
    const result = await cancelEventFunction({ eventId })
    return result.data
  } catch (error) {
    console.error('Error cancelling event:', error)
    throw error
  }
}

