# Discovery Dial Full Implementation Prompt

## 🎯 **Complete Discovery Dial Implementation Requirements**

### **📱 Layout & Visual Design**

#### **🎨 Background & Layout:**
- **Full-screen gradient:** `bg-gradient-to-b from-indigo-500 via-purple-500 to-violet-600`
- **Mobile-first responsive design** with proper safe area handling
- **No modals/popups** - everything inline on homepage
- **Centered layout** with proper spacing and typography hierarchy

#### **🔄 Central Circular Event Card:**
- **Position:** Exact center of viewport (60-70% width on mobile, responsive)
- **Styling:** `rounded-full border border-white/40 shadow-[0_0_60px_rgba(255,255,255,0.08)] backdrop-blur-sm`
- **Content Layout:**
  - **Event Title:** `text-white font-semibold text-xl sm:text-2xl` (bold, centered)
  - **Category:** Smaller text below title (centered)
  - **Price/Free:** Smallest text below category (centered)
- **Outer glow:** Subtle 10-14px blur outline
- **High contrast** white text on semi-transparent background

#### **📝 Helper Text & Controls:**
- **Helper text:** "Swipe the dial to discover events" (`text-white/70 text-sm`)
- **Four directional buttons** in 2×2 grid below circle:
  - **↑ Deep Dive** (up)
  - **↓ Vibe Shift** (down)  
  - **← Social** (left)
  - **→ Action** (right)
- **Button styling:** `rounded-xl bg-white/12 hover:bg-white/16 focus-visible:ring-2 focus-visible:ring-white/60 transition`
- **Active button colors:** up=blue, down=green, left=rose, right=amber (subtle)
- **Last gesture indicator:** Tiny line at bottom (`text-green-400 text-xs`)

### **🎯 Interaction & Gestures**

#### **📱 Swipe Gestures:**
- **Swipe up:** Deep Dive
- **Swipe down:** Vibe Shift
- **Swipe left:** Social
- **Swipe right:** Action
- **Cross-fade animation:** Framer Motion, 250-350ms
- **Keyboard support:** Arrow keys trigger same actions
- **Accessibility:** Proper `aria-label` and focus rings

#### **⏰ Time Picker (Two Elements):**

##### **A) Cycle Button (Compact, Centered):**
- **Position:** Under helper text, above 2×2 grid
- **Function:** Cycle through time filters
- **Options:** Today → Tomorrow → This Week → This Month → (loop)
- **Animation:** Quick text fade/slide on each cycle
- **State:** Console.log selected value on change

##### **B) Right-Side Vertical Time Slider:**
- **Collapsed state:** Slim vertical rail, right edge, 60% opacity
- **Expanded state:** Vertical slider overlay (inline, no modal)
- **Time options:** Now, 8a, 10a, 12p, 2p, 4p, 6p, 8p, 10p
- **Interaction:** Drag thumb to snap to nearest tick
- **Auto-collapse:** Collapse after 1s inactivity
- **Styling:** 
  - **Collapsed:** `fixed right-1 top-24 bottom-24 w-2 rounded-full bg-white/30 hover:bg-white/50 transition opacity-60`
  - **Expanded:** `right-3 w-12 p-2 rounded-xl bg-white/25 backdrop-blur-md shadow-lg opacity-100`

### **📊 State Management**

#### **🔧 Local State Variables:**
```javascript
const [currentEventIndex, setCurrentEventIndex] = useState(0)
const [lastGesture, setLastGesture] = useState('')
const [timeFilterCycle, setTimeFilterCycle] = useState('today') // 'today' | 'tomorrow' | 'thisWeek' | 'thisMonth'
const [startTime, setStartTime] = useState(0) // minutes since midnight
```

#### **📋 Event Dataset:**
```javascript
const events = [
  { name: "Beach Volleyball Tournament", category: "Social/Fun", price: "Free" },
  { name: "Food Truck Festival", category: "Social/Fun", price: "Free" },
  { name: "Tech Meetup: AI & Machine Learning", category: "Professional", price: "Free" },
  { name: "Art Gallery Opening", category: "Arts/Culture", price: "Free" }
]
```

#### **📝 Console Logging:**
```javascript
console.log({ action, direction?, timeFilterCycle, startTime })
```

### **🏗️ Component Structure**

#### **📁 File Organization:**
```
/components/
├── DiscoveryDial.jsx          # Main layout component
├── RightTimeSlider.jsx        # Collapsed/expanded rail + draggable slider
└── useSwipe.js               # Swipe gesture detection hook
```

#### **🎨 Tailwind Classes:**
- **Gradient background:** `bg-gradient-to-b from-indigo-500 via-purple-500 to-violet-600`
- **Circle card:** `rounded-full border border-white/40 shadow-[0_0_60px_rgba(255,255,255,0.08)] backdrop-blur-sm`
- **Event title:** `text-white font-semibold text-xl sm:text-2xl`
- **Helper text:** `text-white/70 text-sm`
- **Buttons:** `rounded-xl bg-white/12 hover:bg-white/16 focus-visible:ring-2 focus-visible:ring-white/60 transition`
- **Right rail collapsed:** `fixed right-1 top-24 bottom-24 w-2 rounded-full bg-white/30 hover:bg-white/50 transition opacity-60`
- **Right rail expanded:** `right-3 w-12 p-2 rounded-xl bg-white/25 backdrop-blur-md shadow-lg opacity-100`

### **🎬 Animation Requirements**

#### **🔄 Framer Motion Animations:**
- **Circle content:** Cross-fade + slight scale on event change
- **Cycle button:** Text slide/fade on each cycle
- **Right slider:** Width/opacity transition (expand/collapse)
- **Thumb drag:** Smooth drag with snap to nearest tick
- **Auto-collapse:** Graceful collapse after 1s inactivity

#### **📱 Gesture Detection:**
- **Swipe detection:** Up/down/left/right on circle
- **Touch support:** Proper touch event handling
- **Keyboard support:** Arrow keys for desktop
- **Accessibility:** Screen reader announcements

### **📱 Mobile Optimization**

#### **🎯 iPhone Safari Requirements:**
- **No horizontal scroll** - proper viewport handling
- **No modals** - everything inline
- **One-handed reach** - proper button positioning
- **Safe area insets** - iOS notch and home indicator support
- **Touch targets** - minimum 44px for all interactive elements

#### **♿ Accessibility Features:**
- **ARIA labels:** Proper labeling for all interactive elements
- **Focus management:** Visible focus rings for keyboard navigation
- **Screen reader:** `aria-live="polite"` on event title region
- **Keyboard support:** Full keyboard navigation support

### **🔧 Technical Implementation**

#### **📦 Dependencies:**
- **React** with hooks for state management
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Custom swipe detection** hook

#### **🎯 Key Functions:**
```javascript
// Swipe detection
const useSwipe = (onSwipe) => { /* implementation */ }

// Time filter cycling
const cycleTimeFilter = () => { /* implementation */ }

// Event navigation
const navigateEvent = (direction) => { /* implementation */ }

// Time slider interaction
const handleTimeSlider = (time) => { /* implementation */ }
```

### **✅ Acceptance Criteria**

#### **📱 Layout Requirements:**
- [ ] **Event info inside centered circle** with proper hierarchy
- [ ] **All controls below circle** (helper text, buttons, cycle button)
- [ ] **No horizontal scroll** on mobile
- [ ] **Proper safe area handling** for iOS

#### **⏰ Time Picker Requirements:**
- [ ] **Cycle Button** rotates Today → Tomorrow → This Week → This Month
- [ ] **Right-side vertical slider** expands on tap
- [ ] **Draggable thumb** with snap to nearest tick
- [ ] **Auto-collapse** after 1s inactivity
- [ ] **Console logging** for all interactions

#### **🎯 Interaction Requirements:**
- [ ] **Swipe gestures** on circle trigger navigation
- [ ] **Button taps** update circle with animations
- [ ] **Keyboard support** with arrow keys
- [ ] **Smooth transitions** for all state changes
- [ ] **Accessibility compliance** with proper ARIA labels

#### **📱 Mobile Requirements:**
- [ ] **iPhone Safari compatibility** with no issues
- [ ] **One-handed operation** for all interactions
- [ ] **No modals or popups** - everything inline
- [ ] **Smooth 60fps animations** on mobile
- [ ] **Proper touch targets** for all interactive elements

### **🎯 Implementation Notes**

#### **📱 Production-Ready Requirements:**
- **Clean, minimal design** with no extra chrome
- **Smooth animations** using Framer Motion
- **Proper error handling** and fallbacks
- **Console logging** for debugging and analytics
- **Accessibility compliance** for all users
- **Mobile-first responsive design**

#### **🔧 Code Quality:**
- **TypeScript support** (optional but recommended)
- **Proper component structure** with clear separation of concerns
- **Reusable hooks** for gesture detection
- **Clean, readable code** with proper comments
- **Performance optimization** for mobile devices

The implementation should deliver a production-ready Discovery Dial that matches the exact specifications, with smooth animations, proper mobile optimization, and accessibility compliance, ready for immediate use in a React application.
