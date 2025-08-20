# GameOn - Quick Setup Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
cd functions && npm install && cd ..
```

### 2. Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Google + Anonymous)
3. Create Firestore database
4. Enable Cloud Functions
5. Update `src/lib/firebase.ts` with your Firebase config

### 3. Development Mode
```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, start the React app
npm run dev
```

### 4. Production Deployment
```bash
npm run build
firebase deploy
```

## 🎯 Key Features Implemented

✅ **Bubble UI for Seat Availability** - Visual representation with filled/outline bubbles  
✅ **Swipeable Event Discovery** - Touch and keyboard navigation  
✅ **One Seat Per Account** - Strict enforcement via Cloud Functions  
✅ **Auto-Promotion Waitlist** - FIFO waitlist with automatic promotion  
✅ **Real-time Updates** - Live synchronization with Firestore  
✅ **Privacy Controls** - Names only visible to connected users  
✅ **Public vs Invite-Only Events** - Flexible visibility settings  
✅ **Secure Cloud Functions** - All mutations handled server-side  
✅ **Minimalist Design** - Clean UI with Tailwind CSS  
✅ **Responsive Design** - Works on desktop and mobile  

## 🏗 Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Firebase Auth + Firestore + Cloud Functions
- **Real-time**: Firestore listeners for live updates
- **Security**: Firestore security rules + Cloud Function validation

## 📱 Pages & Components

- **Explore** (`/explore`) - Swipeable event discovery
- **Event Detail** (`/event/:id`) - Event details with BubbleBar and JoinButton
- **Dashboard** (`/dashboard`) - User's hosted and joined events
- **Create Event** (`/create`) - Event creation form
- **Login** (`/login`) - Authentication with Google/Anonymous

## 🔧 Core Components

- **BubbleBar** - Seat availability visualization
- **EventCard** - Event display with swipe support
- **JoinButton** - Join/leave functionality with optimistic updates
- **AttendeeList** - Privacy-aware attendee display
- **EventStatusChip** - Event status indicators

## 🛡 Security Features

- All mutations go through Cloud Functions
- Firestore security rules enforce access control
- Privacy controls for attendee names
- Invite-only event protection
- One seat per account enforcement

## 🎨 Design System

- **Colors**: Neutral grays + primary blue accent
- **Typography**: Inter font family
- **Components**: Consistent card and button styles
- **Animations**: Smooth transitions and hover effects

## 📊 Data Models

- **users** - User profiles and authentication
- **events** - Event details and metadata
- **eventAttendees** - Attendance records
- **eventWaitlist** - Waitlist management
- **connections** - User relationships for privacy
- **invites** - Invite-only event access

## 🚀 Ready for Production

The app includes:
- ✅ TypeScript for type safety
- ✅ ESLint for code quality
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states
- ✅ Optimistic updates
- ✅ Security rules
- ✅ Cloud Functions
- ✅ Real-time sync

## 🎉 Next Steps

1. Set up your Firebase project
2. Deploy Cloud Functions
3. Configure security rules
4. Add seed data for testing
5. Customize branding and colors
6. Add additional features (notifications, etc.)

---

**GameOn** - Making group events simple, secure, and social! 🎉

