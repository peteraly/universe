# GameOn - Minimalist Group Events App

A production-ready MVP web app for creating and joining group events with bubble seat visualization, waitlist management, and privacy controls.

## 🚀 Features

### Core Functionality
- **Bubble UI for Seat Availability**: Visual representation of event capacity with filled/outline bubbles
- **Swipeable Event Discovery**: Touch and keyboard navigation through events
- **One Seat Per Account**: Strict enforcement of single attendance per user
- **Auto-Promotion Waitlist**: FIFO waitlist that automatically promotes when slots open
- **Real-time Updates**: Live synchronization within 500ms perceived latency

### Privacy & Security
- **Privacy Controls**: Attendee names only visible to connected users
- **Public vs Invite-Only**: Flexible event visibility settings
- **Secure Cloud Functions**: All mutations handled server-side
- **Firestore Security Rules**: Comprehensive access control

### User Experience
- **Minimalist Design**: Clean, modern UI with neutral grays and accent colors
- **Optimistic Updates**: Immediate UI feedback with server rollback
- **Responsive Design**: Works on desktop and mobile devices
- **Timezone Support**: Explicit timezone display and handling

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Swipeable** for touch interactions
- **Day.js** for date/time handling
- **Lucide React** for icons

### Backend
- **Firebase Authentication** (Google + Anonymous)
- **Firestore** for real-time database
- **Cloud Functions** (TypeScript) for server-side logic
- **Firebase Hosting** for deployment

### Development
- **Firebase Emulators** for local development
- **TypeScript** for type safety
- **ESLint** for code quality

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- Firebase CLI
- Git

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd gameon
npm install
cd functions && npm install && cd ..
```

### 2. Firebase Setup
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project (or use existing)
firebase init

# Update firebase.json and .firebaserc with your project ID
```

### 3. Configure Firebase
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Google + Anonymous)
3. Create Firestore database
4. Enable Cloud Functions
5. Update `src/lib/firebase.ts` with your config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
}
```

### 4. Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

### 5. Deploy Cloud Functions
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### 6. Seed Data (Optional)
Use the provided `seed-data.js` to populate your database with sample events and users.

### 7. Start Development
```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, start the React app
npm run dev
```

## 🏗 Project Structure

```
gameon/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── BubbleBar.tsx   # Seat availability visualization
│   │   ├── EventCard.tsx   # Event display card
│   │   ├── JoinButton.tsx  # Join/leave functionality
│   │   └── ...
│   ├── pages/              # Route components
│   │   ├── Explore.tsx     # Event discovery
│   │   ├── EventDetail.tsx # Event details
│   │   ├── Dashboard.tsx   # User dashboard
│   │   └── ...
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Firebase configuration
│   └── types/              # TypeScript definitions
├── functions/              # Firebase Cloud Functions
│   ├── src/
│   │   └── index.ts        # Cloud Functions implementation
│   └── package.json
├── firestore.rules         # Firestore security rules
├── firebase.json           # Firebase configuration
└── seed-data.js           # Sample data for testing
```

## 🎯 Key Features Implementation

### BubbleBar Component
- Displays up to 12 bubbles with overflow indicator
- Shows user's seat with special styling
- Real-time updates as people join/leave

### Event Management
- **Create Events**: Hosts can set title, description, date/time, location, capacity
- **Join/Leave**: One-click attendance management
- **Waitlist**: Automatic promotion when slots open
- **Privacy**: Public vs invite-only events

### Security Rules
- Users can only read events they have access to
- Only hosts can edit/cancel their events
- Attendee data protected by privacy controls
- All mutations go through Cloud Functions

## 🚀 Deployment

### Production Build
```bash
npm run build
firebase deploy
```

### Environment Variables
Set up environment variables for production:
- Firebase config in `src/lib/firebase.ts`
- Update `.firebaserc` with production project ID

## 🧪 Testing

### Manual Testing Scenarios
1. **Two users claiming last seat**: Only one should succeed
2. **Leaving confirmed event**: Event stays confirmed, waitlist promotes
3. **Privacy controls**: Names only visible to connected users
4. **Invite-only events**: Hidden unless invited
5. **Swipe navigation**: Works on touch and keyboard

### Emulator Testing
```bash
# Start all emulators
firebase emulators:start

# Test specific services
firebase emulators:start --only functions,firestore
```

## 📱 Usage Guide

### For Event Hosts
1. Sign in with Google or as Guest
2. Click "Create Event" from dashboard
3. Fill in event details (title, date, location, capacity)
4. Choose visibility (public or invite-only)
5. Share event link or invite specific users

### For Attendees
1. Browse events on the Explore page
2. Swipe through available events
3. Click "Join Event" to claim a seat
4. View event details and attendee list
5. Leave event if needed (promotes waitlist)

### Privacy Features
- **Connected Users**: See real names of people you're connected with
- **Anonymous Users**: See "Anonymous" for unconnected users
- **Your Events**: Always see your own name and events you're hosting

## 🔧 Configuration

### Customization
- **Colors**: Update `tailwind.config.js` for brand colors
- **Timezone**: Default timezone in `CreateEvent.tsx`
- **Cutoff Times**: Default registration cutoff in Cloud Functions
- **Max Bubbles**: Change `maxBubblesToShow` in `BubbleBar.tsx`

### Firebase Configuration
- **Authentication**: Enable additional providers in Firebase Console
- **Security Rules**: Modify `firestore.rules` for custom access patterns
- **Functions**: Add new Cloud Functions in `functions/src/index.ts`

## 🐛 Troubleshooting

### Common Issues
1. **Firebase Config**: Ensure all config values are correct
2. **Emulator Connection**: Check emulator ports and connection
3. **Security Rules**: Verify rules allow necessary operations
4. **Functions Deployment**: Ensure TypeScript compilation succeeds

### Debug Mode
```bash
# Enable debug logging
firebase functions:config:set debug.enabled=true

# View function logs
firebase functions:log
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues:
1. Check the troubleshooting section
2. Review Firebase documentation
3. Open an issue on GitHub

---

**GameOn** - Making group events simple, secure, and social! 🎉

