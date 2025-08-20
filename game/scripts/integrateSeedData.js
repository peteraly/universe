#!/usr/bin/env node

/**
 * GameOn Seed Data Integration Script
 * 
 * This script loads the generated seed data and integrates it into the GameOn app
 * by replacing the existing mock data with the new comprehensive dataset.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the generated seed data
function loadSeedData() {
  const seedDir = path.join(__dirname, 'seed');
  const datasetPath = path.join(seedDir, 'dataset.json');
  
  if (!fs.existsSync(datasetPath)) {
    console.error('❌ Seed data not found. Please run the seeder first:');
    console.error('   cd scripts && npm run generate');
    process.exit(1);
  }
  
  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
  console.log('✅ Loaded seed data:', {
    users: dataset.users.length,
    events: dataset.events.length,
    memberships: dataset.memberships.length,
    invites: dataset.invites.length,
    requests: dataset.requests.length
  });
  
  return dataset;
}

// Transform seed data to match GameOn's expected format
function transformSeedData(dataset) {
  console.log('🔄 Transforming data to GameOn format...');
  
  // Transform users
  const users = dataset.users.map(user => ({
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: new Date(user.createdAt),
    location: user.location,
    timezone: user.timezone,
    sportsAffinity: user.sportsAffinity,
    reliability: user.reliability,
    activityLevel: user.activityLevel,
    joinFrequency: user.joinFrequency,
    superHost: user.superHost,
    friends: user.friends
  }));
  
  // Transform events to match EventWithAttendees format
  const events = dataset.events.map(event => {
    // Extract current user membership if exists
    const currentUserMembership = dataset.memberships.find(m => 
      m.eventId === event.id && m.userId === 'user_001' // Assuming user_001 is current user
    );
    
    // Transform attendees and waitlist
    const attendees = event.attendees.map(attendee => ({
      userId: attendee.userId,
      user: users.find(u => u.id === attendee.userId)
    }));
    
    const waitlist = event.waitlist.map(waitlisted => ({
      userId: waitlisted.userId,
      user: users.find(u => u.id === waitlisted.userId),
      position: waitlisted.position
    }));
    
    // Transform memberships for this event
    const eventMemberships = dataset.memberships
      .filter(m => m.eventId === event.id)
      .map(m => ({
        id: m.id,
        eventId: m.eventId,
        userId: m.userId,
        status: m.status,
        joinedAt: m.joinedAt ? new Date(m.joinedAt) : undefined,
        waitlistedAt: m.waitlistedAt ? new Date(m.waitlistedAt) : undefined,
        waitlistOrder: m.waitlistOrder,
        user: users.find(u => u.id === m.userId)
      }));
    
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      sport: event.sport,
      city: event.city,
      neighborhood: event.neighborhood,
      hostId: event.hostId,
      visibility: event.visibility,
      status: event.status,
      maxSlots: event.maxSlots,
      attendeeCount: event.attendeeCount,
      waitlistCount: event.waitlistCount,
      startAt: event.startAt,
      endAt: event.endAt,
      durationMinutes: event.durationMinutes,
      cutoffMinutes: event.cutoffMinutes,
      tz: event.tz,
      location: event.location,
      createdBy: event.createdBy,
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
      cancelled: event.cancelled,
      attendees,
      waitlist,
      memberships: eventMemberships,
      currentUserAttendee: currentUserMembership?.status === 'attending' ? attendees.find(a => a.userId === 'user_001') : null,
      currentUserWaitlist: currentUserMembership?.status === 'waitlisted' ? waitlist.find(w => w.userId === 'user_001') : null,
      currentUserMembership: currentUserMembership || null
    };
  });
  
  // Transform other relationships
  const invites = dataset.invites.map(invite => ({
    id: invite.id,
    eventId: invite.eventId,
    userId: invite.userId,
    status: invite.status,
    createdAt: new Date(invite.createdAt),
    expiresAt: new Date(invite.expiresAt)
  }));
  
  const requests = dataset.requests.map(request => ({
    id: request.id,
    eventId: request.eventId,
    userId: request.userId,
    status: request.status,
    requestedAt: new Date(request.requestedAt),
    respondedAt: request.respondedAt ? new Date(request.respondedAt) : null
  }));
  
  return { users, events, invites, requests };
}

// Generate the new mock data file
function generateMockDataFile(transformedData) {
  console.log('📝 Generating new mock data file...');
  
  const mockDataContent = `// Auto-generated mock data from seed
// Generated on: ${new Date().toISOString()}
// Source: scripts/seed/dataset.json

import { EventWithAttendees, User, EventMembership, Invite, EventRequest } from '../types';

// Users
export const mockUsers: User[] = ${JSON.stringify(transformedData.users, null, 2)};

// Events with attendees
export const mockEvents: EventWithAttendees[] = ${JSON.stringify(transformedData.events, null, 2)};

// Memberships (flattened from events)
export const mockMemberships: EventMembership[] = ${JSON.stringify(
    transformedData.events.flatMap(e => e.memberships), null, 2
)};

// Invites
export const mockInvites: Invite[] = ${JSON.stringify(transformedData.invites, null, 2)};

// Requests
export const mockRequests: EventRequest[] = ${JSON.stringify(transformedData.requests, null, 2)};

// Helper function to get events with attendees (for backward compatibility)
export const getEventsWithAttendees = (): EventWithAttendees[] => {
  return mockEvents;
};

// Helper function to get user by ID
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

// Helper function to get event by ID
export const getEventById = (id: string): EventWithAttendees | undefined => {
  return mockEvents.find(event => event.id === id);
};

// Helper function to get event attendees
export const getEventAttendees = (eventId: string) => {
  const event = mockEvents.find(e => e.id === eventId);
  return event?.attendees || [];
};

// Helper function to get event waitlist
export const getEventWaitlist = (eventId: string) => {
  const event = mockEvents.find(e => e.id === eventId);
  return event?.waitlist || [];
};

// Current mock user (first user from seed)
export const currentMockUser = mockUsers[0];

// Social connections (friends)
export const mockConnections = mockUsers.flatMap(user => 
  user.friends.map(friendId => ({
    userAId: user.id,
    userBId: friendId,
    createdAt: user.createdAt
  }))
);

// Helper function to check if users are connected
export const isUserConnected = (userAId: string, userBId: string): boolean => {
  return mockConnections.some(conn => 
    (conn.userAId === userAId && conn.userBId === userBId) ||
    (conn.userAId === userBId && conn.userBId === userAId)
  );
};
`;

  const outputPath = path.join(__dirname, '..', 'src', 'lib', 'mockData.ts');
  fs.writeFileSync(outputPath, mockDataContent);
  
  console.log(`✅ Generated new mock data file: ${outputPath}`);
  return outputPath;
}

// Main function
function main() {
  console.log('🚀 GameOn Seed Data Integration');
  console.log('================================');
  
  try {
    // Load seed data
    const dataset = loadSeedData();
    
    // Transform to GameOn format
    const transformedData = transformSeedData(dataset);
    
    // Generate new mock data file
    const outputPath = generateMockDataFile(transformedData);
    
    console.log('\n🎉 Integration complete!');
    console.log('📊 Summary:');
    console.log(`   Users: ${transformedData.users.length}`);
    console.log(`   Events: ${transformedData.events.length}`);
    console.log(`   Invites: ${transformedData.invites.length}`);
    console.log(`   Requests: ${transformedData.requests.length}`);
    console.log(`   Output: ${outputPath}`);
    
    console.log('\n🔄 Next steps:');
    console.log('   1. Restart your dev server to load new data');
    console.log('   2. The app will now use the comprehensive seed data');
    console.log('   3. All events, users, and relationships are now realistic');
    
  } catch (error) {
    console.error('❌ Integration failed:', error.message);
    process.exit(1);
  }
}

main();
