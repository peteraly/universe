// Seed data for GameOn app testing
// Run this in Firebase console or via admin SDK

const seedData = {
  users: [
    {
      id: 'user1',
      displayName: 'Alice Johnson',
      email: 'alice@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-01T10:00:00Z')
    },
    {
      id: 'user2',
      displayName: 'Bob Smith',
      email: 'bob@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-02T11:00:00Z')
    },
    {
      id: 'user3',
      displayName: 'Carol Davis',
      email: 'carol@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-03T12:00:00Z')
    },
    {
      id: 'user4',
      displayName: 'David Wilson',
      email: 'david@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-04T13:00:00Z')
    }
  ],
  
  events: [
    {
      id: 'event1',
      title: 'Board Game Night',
      description: 'Join us for an evening of strategy and fun! We\'ll have Catan, Ticket to Ride, and more. All skill levels welcome.',
      datetimeISO: '2024-02-15T19:00:00Z',
      timezone: 'America/New_York',
      location: 'Central Park Community Center',
      maxSlots: 8,
      status: 'pending',
      visibility: 'public',
      createdBy: 'user1',
      createdAt: new Date('2024-01-10T14:00:00Z'),
      updatedAt: new Date('2024-01-10T14:00:00Z'),
      cutoffMinutes: 30
    },
    {
      id: 'event2',
      title: 'Tech Meetup: React Best Practices',
      description: 'Learn about the latest React patterns and best practices from industry experts. Networking and pizza included!',
      datetimeISO: '2024-02-20T18:30:00Z',
      timezone: 'America/New_York',
      location: 'Tech Hub Downtown',
      maxSlots: 12,
      status: 'pending',
      visibility: 'public',
      createdBy: 'user2',
      createdAt: new Date('2024-01-12T15:00:00Z'),
      updatedAt: new Date('2024-01-12T15:00:00Z'),
      cutoffMinutes: 60
    },
    {
      id: 'event3',
      title: 'Private Dinner Party',
      description: 'Intimate dinner party with close friends. Please bring a dish to share.',
      datetimeISO: '2024-02-18T19:30:00Z',
      timezone: 'America/New_York',
      location: '123 Oak Street, Apartment 4B',
      maxSlots: 6,
      status: 'pending',
      visibility: 'invite-only',
      createdBy: 'user3',
      createdAt: new Date('2024-01-15T16:00:00Z'),
      updatedAt: new Date('2024-01-15T16:00:00Z'),
      cutoffMinutes: 120
    },
    {
      id: 'event4',
      title: 'Hiking Adventure',
      description: 'Scenic hike through the mountains. Moderate difficulty, bring water and snacks. Meet at the trailhead.',
      datetimeISO: '2024-02-25T09:00:00Z',
      timezone: 'America/New_York',
      location: 'Mountain Trailhead Parking Lot',
      maxSlots: 15,
      status: 'pending',
      visibility: 'public',
      createdBy: 'user4',
      createdAt: new Date('2024-01-18T17:00:00Z'),
      updatedAt: new Date('2024-01-18T17:00:00Z'),
      cutoffMinutes: 45
    }
  ],
  
  eventAttendees: {
    event1: {
      user1: {
        userId: 'user1',
        eventId: 'event1',
        joinedAt: new Date('2024-01-10T14:30:00Z'),
        status: 'confirmed'
      },
      user2: {
        userId: 'user2',
        eventId: 'event1',
        joinedAt: new Date('2024-01-11T10:15:00Z'),
        status: 'confirmed'
      },
      user3: {
        userId: 'user3',
        eventId: 'event1',
        joinedAt: new Date('2024-01-12T16:45:00Z'),
        status: 'confirmed'
      }
    },
    event2: {
      user2: {
        userId: 'user2',
        eventId: 'event2',
        joinedAt: new Date('2024-01-12T15:30:00Z'),
        status: 'confirmed'
      },
      user4: {
        userId: 'user4',
        eventId: 'event2',
        joinedAt: new Date('2024-01-13T11:20:00Z'),
        status: 'confirmed'
      }
    }
  },
  
  eventWaitlist: {
    event1: {
      entries: {
        user4: {
          userId: 'user4',
          eventId: 'event1',
          joinedAt: new Date('2024-01-13T09:30:00Z'),
          position: 1
        }
      }
    }
  },
  
  connections: [
    {
      userAId: 'user1',
      userBId: 'user2',
      createdAt: new Date('2024-01-05T10:00:00Z')
    },
    {
      userAId: 'user1',
      userBId: 'user3',
      createdAt: new Date('2024-01-06T11:00:00Z')
    },
    {
      userAId: 'user2',
      userBId: 'user4',
      createdAt: new Date('2024-01-07T12:00:00Z')
    }
  ],
  
  invites: [
    {
      id: 'invite1',
      eventId: 'event3',
      invitedUserId: 'user1',
      status: 'accepted',
      createdAt: new Date('2024-01-15T16:30:00Z'),
      updatedAt: new Date('2024-01-16T10:00:00Z')
    },
    {
      id: 'invite2',
      eventId: 'event3',
      invitedUserId: 'user2',
      status: 'pending',
      createdAt: new Date('2024-01-15T16:35:00Z'),
      updatedAt: new Date('2024-01-15T16:35:00Z')
    }
  ]
};

// Usage instructions:
// 1. In Firebase Console, go to Firestore Database
// 2. Create the collections: users, events, eventAttendees, eventWaitlist, connections, invites
// 3. Add the documents with the data above
// 4. For testing, you can use these user IDs to simulate different users

console.log('Seed data ready. Copy and paste into Firebase Console or use with admin SDK.');

