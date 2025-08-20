// Complete Sample Data for GameOn App
// This creates a realistic social network with users, events, connections, and interactions

const completeGameOnData = {
  // 20 Realistic Users with Diverse Profiles
  users: [
    {
      id: 'user_alex_chen',
      displayName: 'Alex Chen',
      email: 'alex.chen@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-15T10:00:00Z'),
      bio: 'Software engineer who loves board games and hiking'
    },
    {
      id: 'user_maria_garcia',
      displayName: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-10T11:00:00Z'),
      bio: 'Event organizer and yoga instructor'
    },
    {
      id: 'user_james_wilson',
      displayName: 'James Wilson',
      email: 'james.wilson@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-08T12:00:00Z'),
      bio: 'Photographer and outdoor enthusiast'
    },
    {
      id: 'user_sarah_kim',
      displayName: 'Sarah Kim',
      email: 'sarah.kim@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-12T13:00:00Z'),
      bio: 'UX designer and coffee connoisseur'
    },
    {
      id: 'user_mike_johnson',
      displayName: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-05T14:00:00Z'),
      bio: 'Fitness trainer and nutrition coach'
    },
    {
      id: 'user_emily_davis',
      displayName: 'Emily Davis',
      email: 'emily.davis@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-20T15:00:00Z'),
      bio: 'Marketing manager and book club organizer'
    },
    {
      id: 'user_david_brown',
      displayName: 'David Brown',
      email: 'david.brown@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-18T16:00:00Z'),
      bio: 'Chef and food blogger'
    },
    {
      id: 'user_lisa_anderson',
      displayName: 'Lisa Anderson',
      email: 'lisa.anderson@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-22T17:00:00Z'),
      bio: 'Data scientist and board game enthusiast'
    },
    {
      id: 'user_tom_martinez',
      displayName: 'Tom Martinez',
      email: 'tom.martinez@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-14T18:00:00Z'),
      bio: 'Music producer and concert organizer'
    },
    {
      id: 'user_anna_taylor',
      displayName: 'Anna Taylor',
      email: 'anna.taylor@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-25T19:00:00Z'),
      bio: 'Graphic designer and art workshop host'
    },
    {
      id: 'user_ryan_lee',
      displayName: 'Ryan Lee',
      email: 'ryan.lee@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-16T20:00:00Z'),
      bio: 'Startup founder and tech meetup organizer'
    },
    {
      id: 'user_jessica_white',
      displayName: 'Jessica White',
      email: 'jessica.white@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-30T21:00:00Z'),
      bio: 'Teacher and community garden coordinator'
    },
    {
      id: 'user_carlos_rodriguez',
      displayName: 'Carlos Rodriguez',
      email: 'carlos.rodriguez@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-28T22:00:00Z'),
      bio: 'Language teacher and cultural exchange organizer'
    },
    {
      id: 'user_nina_patel',
      displayName: 'Nina Patel',
      email: 'nina.patel@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-02-01T23:00:00Z'),
      bio: 'Environmental scientist and hiking guide'
    },
    {
      id: 'user_ben_clark',
      displayName: 'Ben Clark',
      email: 'ben.clark@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-02-03T10:00:00Z'),
      bio: 'Game developer and indie game night host'
    },
    {
      id: 'user_sophie_martin',
      displayName: 'Sophie Martin',
      email: 'sophie.martin@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-02-05T11:00:00Z'),
      bio: 'Interior designer and home organizing workshops'
    },
    {
      id: 'user_kevin_ng',
      displayName: 'Kevin Ng',
      email: 'kevin.ng@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-02-07T12:00:00Z'),
      bio: 'Finance analyst and investment club organizer'
    },
    {
      id: 'user_rachel_thompson',
      displayName: 'Rachel Thompson',
      email: 'rachel.thompson@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-02-09T13:00:00Z'),
      bio: 'Veterinarian and pet meetup coordinator'
    },
    {
      id: 'user_daniel_hill',
      displayName: 'Daniel Hill',
      email: 'daniel.hill@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-02-11T14:00:00Z'),
      bio: 'Architect and urban sketching group leader'
    },
    {
      id: 'user_amanda_green',
      displayName: 'Amanda Green',
      email: 'amanda.green@email.com',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-02-13T15:00:00Z'),
      bio: 'Therapist and mindfulness workshop facilitator'
    }
  ],

  // 15+ Diverse Events with Different Categories
  events: [
    {
      id: 'event_board_game_night',
      title: 'Epic Board Game Night',
      description: 'Join us for an evening of strategy and fun! We\'ll have Catan, Ticket to Ride, Wingspan, and many more. All skill levels welcome. Snacks and drinks provided!',
      datetimeISO: '2024-03-15T19:00:00Z',
      timezone: 'America/New_York',
      location: 'Central Park Community Center, Room 204',
      maxSlots: 12,
      status: 'pending',
      visibility: 'public',
      createdBy: 'user_alex_chen',
      createdAt: new Date('2024-02-10T14:00:00Z'),
      updatedAt: new Date('2024-02-10T14:00:00Z'),
      cutoffMinutes: 30,
      category: 'Games'
    },
    {
      id: 'event_yoga_sunrise',
      title: 'Sunrise Yoga in the Park',
      description: 'Start your day with intention and movement. This gentle flow class is perfect for all levels. Bring your own mat and water. Beautiful sunrise views guaranteed!',
      datetimeISO: '2024-03-18T06:30:00Z',
      timezone: 'America/New_York',
      location: 'Riverside Park, Great Lawn',
      maxSlots: 20,
      status: 'confirmed',
      visibility: 'public',
      createdBy: 'user_maria_garcia',
      createdAt: new Date('2024-02-12T15:00:00Z'),
      updatedAt: new Date('2024-02-12T15:00:00Z'),
      cutoffMinutes: 60,
      category: 'Fitness'
    },
    {
      id: 'event_photography_walk',
      title: 'Golden Hour Photography Walk',
      description: 'Capture the magic of golden hour in Brooklyn Bridge Park. Perfect for beginners and pros alike. We\'ll cover composition, lighting, and editing tips.',
      datetimeISO: '2024-03-20T17:30:00Z',
      timezone: 'America/New_York',
      location: 'Brooklyn Bridge Park, Pier 1',
      maxSlots: 8,
      status: 'pending',
      visibility: 'public',
      createdBy: 'user_james_wilson',
      createdAt: new Date('2024-02-14T16:00:00Z'),
      updatedAt: new Date('2024-02-14T16:00:00Z'),
      cutoffMinutes: 45,
      category: 'Creative'
    },
    {
      id: 'event_coffee_cupping',
      title: 'Coffee Cupping & Tasting Session',
      description: 'Learn the art of coffee tasting! We\'ll explore beans from different regions, discuss flavor profiles, and learn professional cupping techniques.',
      datetimeISO: '2024-03-22T10:00:00Z',
      timezone: 'America/New_York',
      location: 'Third Wave Coffee Roasters',
      maxSlots: 10,
      status: 'pending',
      visibility: 'public',
      createdBy: 'user_sarah_kim',
      createdAt: new Date('2024-02-16T17:00:00Z'),
      updatedAt: new Date('2024-02-16T17:00:00Z'),
      cutoffMinutes: 120,
      category: 'Food & Drink'
    },
    {
      id: 'event_hiit_bootcamp',
      title: 'HIIT Bootcamp in Central Park',
      description: 'High-intensity interval training session for all fitness levels. Burn calories, build strength, and have fun! Equipment provided.',
      datetimeISO: '2024-03-25T07:00:00Z',
      timezone: 'America/New_York',
      location: 'Central Park, Sheep Meadow',
      maxSlots: 15,
      status: 'confirmed',
      visibility: 'public',
      createdBy: 'user_mike_johnson',
      createdAt: new Date('2024-02-18T18:00:00Z'),
      updatedAt: new Date('2024-02-18T18:00:00Z'),
      cutoffMinutes: 30,
      category: 'Fitness'
    },
    {
      id: 'event_book_club_dystopian',
      title: 'Dystopian Fiction Book Club',
      description: 'This month we\'re discussing "The Power" by Naomi Alderman. Join us for thoughtful discussion, wine, and cheese. New members welcome!',
      datetimeISO: '2024-03-28T19:30:00Z',
      timezone: 'America/New_York',
      location: 'Cozy Corner Bookstore',
      maxSlots: 12,
      status: 'pending',
      visibility: 'public',
      createdBy: 'user_emily_davis',
      createdAt: new Date('2024-02-20T19:00:00Z'),
      updatedAt: new Date('2024-02-20T19:00:00Z'),
      cutoffMinutes: 60,
      category: 'Education'
    },
    {
      id: 'event_pasta_making',
      title: 'Homemade Pasta Workshop',
      description: 'Learn to make fresh pasta from scratch! We\'ll cover fettuccine, ravioli, and gnocchi. Includes dinner with wine pairing.',
      datetimeISO: '2024-03-30T18:00:00Z',
      timezone: 'America/New_York',
      location: 'Chef David\'s Kitchen Studio',
      maxSlots: 8,
      status: 'pending',
      visibility: 'invite_manual',
      createdBy: 'user_david_brown',
      createdAt: new Date('2024-02-22T20:00:00Z'),
      updatedAt: new Date('2024-02-22T20:00:00Z'),
      cutoffMinutes: 180,
      category: 'Food & Drink'
    },
    {
      id: 'event_data_viz_workshop',
      title: 'Data Visualization with D3.js',
      description: 'Hands-on workshop creating interactive data visualizations. Bring your laptop! Coffee and pastries provided.',
      datetimeISO: '2024-04-02T14:00:00Z',
      timezone: 'America/New_York',
      location: 'TechHub Co-working Space',
      maxSlots: 16,
      status: 'pending',
      visibility: 'public',
      createdBy: 'user_lisa_anderson',
      createdAt: new Date('2024-02-24T21:00:00Z'),
      updatedAt: new Date('2024-02-24T21:00:00Z'),
      cutoffMinutes: 60,
      category: 'Technology'
    },
    {
      id: 'event_jazz_listening',
      title: 'Jazz Listening Session: Blue Note Era',
      description: 'Deep dive into the golden age of Blue Note Records. We\'ll listen to classics while learning about the artists and their stories.',
      datetimeISO: '2024-04-05T20:00:00Z',
      timezone: 'America/New_York',
      location: 'Vinyl & Vibes Record Shop',
      maxSlots: 14,
      status: 'pending',
      visibility: 'public',
      createdBy: 'user_tom_martinez',
      createdAt: new Date('2024-02-26T22:00:00Z'),
      updatedAt: new Date('2024-02-26T22:00:00Z'),
      cutoffMinutes: 45,
      category: 'Music'
    },
    {
      id: 'event_watercolor_workshop',
      title: 'Botanical Watercolor Workshop',
      description: 'Paint beautiful botanical illustrations using watercolor techniques. All materials included. Perfect for beginners and intermediate artists.',
      datetimeISO: '2024-04-08T15:00:00Z',
      timezone: 'America/New_York',
      location: 'Art Studio Collective',
      maxSlots: 10,
      status: 'pending',
      visibility: 'public',
      createdBy: 'user_anna_taylor',
      createdAt: new Date('2024-02-28T23:00:00Z'),
      updatedAt: new Date('2024-02-28T23:00:00Z'),
      cutoffMinutes: 90,
      category: 'Creative'
    },
    {
      id: 'event_startup_pitch',
      title: 'Startup Pitch Night',
      description: 'Watch local entrepreneurs pitch their ideas! Networking, pizza, and drinks. Great for founders, investors, and startup enthusiasts.',
      datetimeISO: '2024-04-10T18:30:00Z',
      timezone: 'America/New_York',
      location: 'Innovation Hub Auditorium',
      maxSlots: 50,
      status: 'confirmed',
      visibility: 'public',
      createdBy: 'user_ryan_lee',
      createdAt: new Date('2024-03-01T10:00:00Z'),
      updatedAt: new Date('2024-03-01T10:00:00Z'),
      cutoffMinutes: 30,
      category: 'Business'
    },
    {
      id: 'event_community_garden',
      title: 'Community Garden Spring Planting',
      description: 'Help us prepare the garden for spring! We\'ll plant vegetables, herbs, and flowers. Tools provided, just bring enthusiasm!',
      datetimeISO: '2024-04-12T09:00:00Z',
      timezone: 'America/New_York',
      location: 'Greenpoint Community Garden',
      maxSlots: 25,
      status: 'pending',
      visibility: 'public',
      createdBy: 'user_jessica_white',
      createdAt: new Date('2024-03-03T11:00:00Z'),
      updatedAt: new Date('2024-03-03T11:00:00Z'),
      cutoffMinutes: 60,
      category: 'Community'
    },
    {
      id: 'event_language_exchange',
      title: 'Spanish-English Language Exchange',
      description: 'Practice your Spanish or English in a fun, relaxed environment. All levels welcome! Light refreshments provided.',
      datetimeISO: '2024-04-15T19:00:00Z',
      timezone: 'America/New_York',
      location: 'Cultural Center Café',
      maxSlots: 20,
      status: 'pending',
      visibility: 'public',
      createdBy: 'user_carlos_rodriguez',
      createdAt: new Date('2024-03-05T12:00:00Z'),
      updatedAt: new Date('2024-03-05T12:00:00Z'),
      cutoffMinutes: 30,
      category: 'Education'
    },
    {
      id: 'event_nature_hike',
      title: 'Wildflower Identification Hike',
      description: 'Learn to identify spring wildflowers on this guided nature walk. Perfect for nature lovers and photography enthusiasts.',
      datetimeISO: '2024-04-18T08:00:00Z',
      timezone: 'America/New_York',
      location: 'Bear Mountain State Park Trailhead',
      maxSlots: 12,
      status: 'pending',
      visibility: 'public',
      createdBy: 'user_nina_patel',
      createdAt: new Date('2024-03-07T13:00:00Z'),
      updatedAt: new Date('2024-03-07T13:00:00Z'),
      cutoffMinutes: 120,
      category: 'Outdoors'
    },
    {
      id: 'event_indie_game_night',
      title: 'Indie Game Discovery Night',
      description: 'Play and discover amazing indie games! From puzzle platformers to narrative adventures. Pizza and energy drinks included.',
      datetimeISO: '2024-04-20T17:00:00Z',
      timezone: 'America/New_York',
      location: 'GameDev Collective Space',
      maxSlots: 16,
      status: 'pending',
      visibility: 'invite_manual',
      createdBy: 'user_ben_clark',
      createdAt: new Date('2024-03-09T14:00:00Z'),
      updatedAt: new Date('2024-03-09T14:00:00Z'),
      cutoffMinutes: 45,
      category: 'Games'
    }
  ],

  // Event Attendees - Realistic attendance patterns
  eventAttendees: {
    event_board_game_night: {
      user_alex_chen: {
        userId: 'user_alex_chen',
        eventId: 'event_board_game_night',
        joinedAt: new Date('2024-02-10T14:30:00Z'),
        status: 'confirmed'
      },
      user_lisa_anderson: {
        userId: 'user_lisa_anderson',
        eventId: 'event_board_game_night',
        joinedAt: new Date('2024-02-11T10:15:00Z'),
        status: 'confirmed'
      },
      user_ben_clark: {
        userId: 'user_ben_clark',
        eventId: 'event_board_game_night',
        joinedAt: new Date('2024-02-12T16:45:00Z'),
        status: 'confirmed'
      },
      user_sarah_kim: {
        userId: 'user_sarah_kim',
        eventId: 'event_board_game_night',
        joinedAt: new Date('2024-02-13T09:20:00Z'),
        status: 'confirmed'
      },
      user_emily_davis: {
        userId: 'user_emily_davis',
        eventId: 'event_board_game_night',
        joinedAt: new Date('2024-02-14T11:30:00Z'),
        status: 'confirmed'
      },
      user_mike_johnson: {
        userId: 'user_mike_johnson',
        eventId: 'event_board_game_night',
        joinedAt: new Date('2024-02-15T14:00:00Z'),
        status: 'confirmed'
      }
    },
    event_yoga_sunrise: {
      user_maria_garcia: {
        userId: 'user_maria_garcia',
        eventId: 'event_yoga_sunrise',
        joinedAt: new Date('2024-02-12T15:30:00Z'),
        status: 'confirmed'
      },
      user_amanda_green: {
        userId: 'user_amanda_green',
        eventId: 'event_yoga_sunrise',
        joinedAt: new Date('2024-02-13T11:20:00Z'),
        status: 'confirmed'
      },
      user_jessica_white: {
        userId: 'user_jessica_white',
        eventId: 'event_yoga_sunrise',
        joinedAt: new Date('2024-02-14T08:45:00Z'),
        status: 'confirmed'
      },
      user_nina_patel: {
        userId: 'user_nina_patel',
        eventId: 'event_yoga_sunrise',
        joinedAt: new Date('2024-02-15T12:10:00Z'),
        status: 'confirmed'
      },
      user_sophie_martin: {
        userId: 'user_sophie_martin',
        eventId: 'event_yoga_sunrise',
        joinedAt: new Date('2024-02-16T09:30:00Z'),
        status: 'confirmed'
      },
      user_rachel_thompson: {
        userId: 'user_rachel_thompson',
        eventId: 'event_yoga_sunrise',
        joinedAt: new Date('2024-02-17T07:15:00Z'),
        status: 'confirmed'
      },
      user_sarah_kim: {
        userId: 'user_sarah_kim',
        eventId: 'event_yoga_sunrise',
        joinedAt: new Date('2024-02-18T10:45:00Z'),
        status: 'confirmed'
      },
      user_emily_davis: {
        userId: 'user_emily_davis',
        eventId: 'event_yoga_sunrise',
        joinedAt: new Date('2024-02-19T13:20:00Z'),
        status: 'confirmed'
      }
    },
    event_photography_walk: {
      user_james_wilson: {
        userId: 'user_james_wilson',
        eventId: 'event_photography_walk',
        joinedAt: new Date('2024-02-14T16:30:00Z'),
        status: 'confirmed'
      },
      user_anna_taylor: {
        userId: 'user_anna_taylor',
        eventId: 'event_photography_walk',
        joinedAt: new Date('2024-02-15T11:20:00Z'),
        status: 'confirmed'
      },
      user_daniel_hill: {
        userId: 'user_daniel_hill',
        eventId: 'event_photography_walk',
        joinedAt: new Date('2024-02-16T14:45:00Z'),
        status: 'confirmed'
      },
      user_sophie_martin: {
        userId: 'user_sophie_martin',
        eventId: 'event_photography_walk',
        joinedAt: new Date('2024-02-17T09:10:00Z'),
        status: 'confirmed'
      },
      user_alex_chen: {
        userId: 'user_alex_chen',
        eventId: 'event_photography_walk',
        joinedAt: new Date('2024-02-18T16:30:00Z'),
        status: 'confirmed'
      }
    },
    event_hiit_bootcamp: {
      user_mike_johnson: {
        userId: 'user_mike_johnson',
        eventId: 'event_hiit_bootcamp',
        joinedAt: new Date('2024-02-18T18:30:00Z'),
        status: 'confirmed'
      },
      user_maria_garcia: {
        userId: 'user_maria_garcia',
        eventId: 'event_hiit_bootcamp',
        joinedAt: new Date('2024-02-19T10:15:00Z'),
        status: 'confirmed'
      },
      user_nina_patel: {
        userId: 'user_nina_patel',
        eventId: 'event_hiit_bootcamp',
        joinedAt: new Date('2024-02-20T12:45:00Z'),
        status: 'confirmed'
      },
      user_alex_chen: {
        userId: 'user_alex_chen',
        eventId: 'event_hiit_bootcamp',
        joinedAt: new Date('2024-02-21T08:20:00Z'),
        status: 'confirmed'
      },
      user_james_wilson: {
        userId: 'user_james_wilson',
        eventId: 'event_hiit_bootcamp',
        joinedAt: new Date('2024-02-22T15:30:00Z'),
        status: 'confirmed'
      },
      user_tom_martinez: {
        userId: 'user_tom_martinez',
        eventId: 'event_hiit_bootcamp',
        joinedAt: new Date('2024-02-23T11:00:00Z'),
        status: 'confirmed'
      },
      user_ryan_lee: {
        userId: 'user_ryan_lee',
        eventId: 'event_hiit_bootcamp',
        joinedAt: new Date('2024-02-24T09:45:00Z'),
        status: 'confirmed'
      },
      user_daniel_hill: {
        userId: 'user_daniel_hill',
        eventId: 'event_hiit_bootcamp',
        joinedAt: new Date('2024-02-25T14:15:00Z'),
        status: 'confirmed'
      },
      user_kevin_ng: {
        userId: 'user_kevin_ng',
        eventId: 'event_hiit_bootcamp',
        joinedAt: new Date('2024-02-26T16:30:00Z'),
        status: 'confirmed'
      },
      user_carlos_rodriguez: {
        userId: 'user_carlos_rodriguez',
        eventId: 'event_hiit_bootcamp',
        joinedAt: new Date('2024-02-27T12:00:00Z'),
        status: 'confirmed'
      },
      user_david_brown: {
        userId: 'user_david_brown',
        eventId: 'event_hiit_bootcamp',
        joinedAt: new Date('2024-02-28T10:30:00Z'),
        status: 'confirmed'
      },
      user_ben_clark: {
        userId: 'user_ben_clark',
        eventId: 'event_hiit_bootcamp',
        joinedAt: new Date('2024-03-01T13:45:00Z'),
        status: 'confirmed'
      },
      user_amanda_green: {
        userId: 'user_amanda_green',
        eventId: 'event_hiit_bootcamp',
        joinedAt: new Date('2024-03-02T11:20:00Z'),
        status: 'confirmed'
      },
      user_lisa_anderson: {
        userId: 'user_lisa_anderson',
        eventId: 'event_hiit_bootcamp',
        joinedAt: new Date('2024-03-03T15:10:00Z'),
        status: 'confirmed'
      },
      user_rachel_thompson: {
        userId: 'user_rachel_thompson',
        eventId: 'event_hiit_bootcamp',
        joinedAt: new Date('2024-03-04T09:00:00Z'),
        status: 'confirmed'
      }
    },
    event_startup_pitch: {
      user_ryan_lee: {
        userId: 'user_ryan_lee',
        eventId: 'event_startup_pitch',
        joinedAt: new Date('2024-03-01T10:30:00Z'),
        status: 'confirmed'
      },
      user_lisa_anderson: {
        userId: 'user_lisa_anderson',
        eventId: 'event_startup_pitch',
        joinedAt: new Date('2024-03-01T14:15:00Z'),
        status: 'confirmed'
      },
      user_alex_chen: {
        userId: 'user_alex_chen',
        eventId: 'event_startup_pitch',
        joinedAt: new Date('2024-03-02T11:30:00Z'),
        status: 'confirmed'
      },
      user_sarah_kim: {
        userId: 'user_sarah_kim',
        eventId: 'event_startup_pitch',
        joinedAt: new Date('2024-03-02T16:45:00Z'),
        status: 'confirmed'
      },
      user_kevin_ng: {
        userId: 'user_kevin_ng',
        eventId: 'event_startup_pitch',
        joinedAt: new Date('2024-03-03T09:20:00Z'),
        status: 'confirmed'
      },
      user_emily_davis: {
        userId: 'user_emily_davis',
        eventId: 'event_startup_pitch',
        joinedAt: new Date('2024-03-03T13:10:00Z'),
        status: 'confirmed'
      },
      user_ben_clark: {
        userId: 'user_ben_clark',
        eventId: 'event_startup_pitch',
        joinedAt: new Date('2024-03-04T10:00:00Z'),
        status: 'confirmed'
      },
      user_tom_martinez: {
        userId: 'user_tom_martinez',
        eventId: 'event_startup_pitch',
        joinedAt: new Date('2024-03-04T15:30:00Z'),
        status: 'confirmed'
      },
      user_daniel_hill: {
        userId: 'user_daniel_hill',
        eventId: 'event_startup_pitch',
        joinedAt: new Date('2024-03-05T12:45:00Z'),
        status: 'confirmed'
      },
      user_anna_taylor: {
        userId: 'user_anna_taylor',
        eventId: 'event_startup_pitch',
        joinedAt: new Date('2024-03-05T17:20:00Z'),
        status: 'confirmed'
      }
    }
  },

  // Event Waitlists - Some events with waitlists to test the feature
  eventWaitlist: {
    event_board_game_night: {
      entries: {
        user_tom_martinez: {
          userId: 'user_tom_martinez',
          eventId: 'event_board_game_night',
          joinedAt: new Date('2024-02-16T09:30:00Z'),
          position: 1
        },
        user_james_wilson: {
          userId: 'user_james_wilson',
          eventId: 'event_board_game_night',
          joinedAt: new Date('2024-02-17T14:20:00Z'),
          position: 2
        },
        user_david_brown: {
          userId: 'user_david_brown',
          eventId: 'event_board_game_night',
          joinedAt: new Date('2024-02-18T11:45:00Z'),
          position: 3
        }
      }
    },
    event_photography_walk: {
      entries: {
        user_maria_garcia: {
          userId: 'user_maria_garcia',
          eventId: 'event_photography_walk',
          joinedAt: new Date('2024-02-19T10:15:00Z'),
          position: 1
        },
        user_emily_davis: {
          userId: 'user_emily_davis',
          eventId: 'event_photography_walk',
          joinedAt: new Date('2024-02-20T13:30:00Z'),
          position: 2
        }
      }
    },
    event_pasta_making: {
      entries: {
        user_sarah_kim: {
          userId: 'user_sarah_kim',
          eventId: 'event_pasta_making',
          joinedAt: new Date('2024-02-24T16:00:00Z'),
          position: 1
        },
        user_alex_chen: {
          userId: 'user_alex_chen',
          eventId: 'event_pasta_making',
          joinedAt: new Date('2024-02-25T11:30:00Z'),
          position: 2
        }
      }
    }
  },

  // User Connections - Social network for privacy testing
  connections: [
    // Alex Chen's network
    { userAId: 'user_alex_chen', userBId: 'user_sarah_kim', createdAt: new Date('2024-01-20T10:00:00Z') },
    { userAId: 'user_alex_chen', userBId: 'user_lisa_anderson', createdAt: new Date('2024-01-22T11:00:00Z') },
    { userAId: 'user_alex_chen', userBId: 'user_ben_clark', createdAt: new Date('2024-01-25T12:00:00Z') },
    { userAId: 'user_alex_chen', userBId: 'user_ryan_lee', createdAt: new Date('2024-01-28T13:00:00Z') },
    
    // Maria Garcia's network
    { userAId: 'user_maria_garcia', userBId: 'user_amanda_green', createdAt: new Date('2024-01-18T14:00:00Z') },
    { userAId: 'user_maria_garcia', userBId: 'user_nina_patel', createdAt: new Date('2024-01-20T15:00:00Z') },
    { userAId: 'user_maria_garcia', userBId: 'user_jessica_white', createdAt: new Date('2024-01-23T16:00:00Z') },
    { userAId: 'user_maria_garcia', userBId: 'user_mike_johnson', createdAt: new Date('2024-01-26T17:00:00Z') },
    
    // James Wilson's network
    { userAId: 'user_james_wilson', userBId: 'user_anna_taylor', createdAt: new Date('2024-01-21T18:00:00Z') },
    { userAId: 'user_james_wilson', userBId: 'user_daniel_hill', createdAt: new Date('2024-01-24T19:00:00Z') },
    { userAId: 'user_james_wilson', userBId: 'user_sophie_martin', createdAt: new Date('2024-01-27T20:00:00Z') },
    
    // Sarah Kim's network
    { userAId: 'user_sarah_kim', userBId: 'user_emily_davis', createdAt: new Date('2024-01-19T09:00:00Z') },
    { userAId: 'user_sarah_kim', userBId: 'user_anna_taylor', createdAt: new Date('2024-01-22T10:00:00Z') },
    { userAId: 'user_sarah_kim', userBId: 'user_sophie_martin', createdAt: new Date('2024-01-25T11:00:00Z') },
    
    // Additional cross-connections
    { userAId: 'user_emily_davis', userBId: 'user_lisa_anderson', createdAt: new Date('2024-01-23T12:00:00Z') },
    { userAId: 'user_mike_johnson', userBId: 'user_nina_patel', createdAt: new Date('2024-01-24T13:00:00Z') },
    { userAId: 'user_david_brown', userBId: 'user_carlos_rodriguez', createdAt: new Date('2024-01-25T14:00:00Z') },
    { userAId: 'user_tom_martinez', userBId: 'user_ben_clark', createdAt: new Date('2024-01-26T15:00:00Z') },
    { userAId: 'user_kevin_ng', userBId: 'user_ryan_lee', createdAt: new Date('2024-01-27T16:00:00Z') },
    { userAId: 'user_rachel_thompson', userBId: 'user_amanda_green', createdAt: new Date('2024-01-28T17:00:00Z') },
    { userAId: 'user_daniel_hill', userBId: 'user_anna_taylor', createdAt: new Date('2024-01-29T18:00:00Z') },
    { userAId: 'user_sophie_martin', userBId: 'user_jessica_white', createdAt: new Date('2024-01-30T19:00:00Z') },
    
    // Create some mutual connections
    { userAId: 'user_lisa_anderson', userBId: 'user_ben_clark', createdAt: new Date('2024-02-01T20:00:00Z') },
    { userAId: 'user_ryan_lee', userBId: 'user_sarah_kim', createdAt: new Date('2024-02-02T21:00:00Z') },
    { userAId: 'user_emily_davis', userBId: 'user_alex_chen', createdAt: new Date('2024-02-03T22:00:00Z') }
  ],

  // Invites for invite-only events
  invites: [
    // Pasta making workshop invites
    {
      id: 'invite_pasta_maria',
      eventId: 'event_pasta_making',
      invitedUserId: 'user_maria_garcia',
      status: 'accepted',
      createdAt: new Date('2024-02-22T20:30:00Z'),
      updatedAt: new Date('2024-02-23T10:00:00Z')
    },
    {
      id: 'invite_pasta_emily',
      eventId: 'event_pasta_making',
      invitedUserId: 'user_emily_davis',
      status: 'accepted',
      createdAt: new Date('2024-02-22T20:35:00Z'),
      updatedAt: new Date('2024-02-23T14:30:00Z')
    },
    {
      id: 'invite_pasta_lisa',
      eventId: 'event_pasta_making',
      invitedUserId: 'user_lisa_anderson',
      status: 'pending',
      createdAt: new Date('2024-02-22T20:40:00Z'),
      updatedAt: new Date('2024-02-22T20:40:00Z')
    },
    {
      id: 'invite_pasta_tom',
      eventId: 'event_pasta_making',
      invitedUserId: 'user_tom_martinez',
      status: 'declined',
      createdAt: new Date('2024-02-22T20:45:00Z'),
      updatedAt: new Date('2024-02-24T11:20:00Z')
    },
    {
      id: 'invite_pasta_james',
      eventId: 'event_pasta_making',
      invitedUserId: 'user_james_wilson',
      status: 'accepted',
      createdAt: new Date('2024-02-22T20:50:00Z'),
      updatedAt: new Date('2024-02-25T09:15:00Z')
    },
    
    // Indie game night invites
    {
      id: 'invite_game_alex',
      eventId: 'event_indie_game_night',
      invitedUserId: 'user_alex_chen',
      status: 'accepted',
      createdAt: new Date('2024-03-09T14:30:00Z'),
      updatedAt: new Date('2024-03-10T16:00:00Z')
    },
    {
      id: 'invite_game_lisa',
      eventId: 'event_indie_game_night',
      invitedUserId: 'user_lisa_anderson',
      status: 'accepted',
      createdAt: new Date('2024-03-09T14:35:00Z'),
      updatedAt: new Date('2024-03-11T12:30:00Z')
    },
    {
      id: 'invite_game_ryan',
      eventId: 'event_indie_game_night',
      invitedUserId: 'user_ryan_lee',
      status: 'pending',
      createdAt: new Date('2024-03-09T14:40:00Z'),
      updatedAt: new Date('2024-03-09T14:40:00Z')
    },
    {
      id: 'invite_game_sarah',
      eventId: 'event_indie_game_night',
      invitedUserId: 'user_sarah_kim',
      status: 'accepted',
      createdAt: new Date('2024-03-09T14:45:00Z'),
      updatedAt: new Date('2024-03-12T10:15:00Z')
    },
    {
      id: 'invite_game_tom',
      eventId: 'event_indie_game_night',
      invitedUserId: 'user_tom_martinez',
      status: 'accepted',
      createdAt: new Date('2024-03-09T14:50:00Z'),
      updatedAt: new Date('2024-03-13T14:45:00Z')
    }
  ]
};

// Usage Instructions:
console.log('=== GameOn Complete Sample Data ===');
console.log('📊 Data Overview:');
console.log(`👥 Users: ${completeGameOnData.users.length}`);
console.log(`🎉 Events: ${completeGameOnData.events.length}`);
console.log(`🤝 Connections: ${completeGameOnData.connections.length}`);
console.log(`💌 Invites: ${completeGameOnData.invites.length}`);

console.log('\n🎯 Event Categories:');
const categories = completeGameOnData.events.reduce((acc, event) => {
  acc[event.category] = (acc[event.category] || 0) + 1;
  return acc;
}, {});
Object.entries(categories).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count} events`);
});

console.log('\n🔐 Privacy Testing:');
console.log('- Connected users will see real names');
console.log('- Unconnected users will see "Anonymous"');
console.log('- Test with different user perspectives');

console.log('\n📱 Features to Test:');
console.log('✅ Bubble UI with different attendee counts');
console.log('✅ Waitlist functionality');
console.log('✅ Privacy controls based on connections');
console.log('✅ Public vs invite-only events');
console.log('✅ Event status (pending vs confirmed)');
console.log('✅ Different event categories and times');

console.log('\n🚀 Ready for Firebase import!');

export default completeGameOnData;
