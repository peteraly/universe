# Discovery Dial Design Update Prompt

## 🎯 **Current State Analysis**
We have all the core pieces built but need to refine the design to match the exact specifications below. The current implementation has:
- ✅ Central circular dial with event details
- ✅ Four directional buttons (North, South, East, West)
- ✅ Right-side vertical time selector
- ✅ Mobile-responsive layout
- ✅ Framer Motion animations

## 🎨 **VISUAL DESIGN REQUIREMENTS**

### **📱 Full-Screen Layout**
- **Background:** Soft purple → blue vertical gradient (from-purple-500 via-blue-500 to-purple-700)
- **Layout:** Full-screen with proper safe area handling for mobile notches
- **Centering:** Dial vertically centered within screen safe area

### **🔄 Central Circular Dial**
- **Size:** 60-70% of viewport width, auto-resize on smaller screens
- **Background:** Semi-transparent white overlay with subtle backdrop blur
- **Border:** Clean white border with rounded corners
- **Content Layout:**
  - **Event name:** Bold, white, centered, large text
  - **Category:** Smaller, light white/gray, below name
  - **Price:** Same style as category, below category
- **Animation:** Smooth fade transition (0.3-0.4s) when changing events

### **📝 Title and Instructions**
- **Title:** "Discovery Dial" in bold white, centered above dial
- **Instructions:** Two lines below dial:
  - "Swipe the dial to discover events"
  - "Hold down the dial for time filter options"
- **Styling:** Small, white, semi-transparent (opacity-70)

### **🎯 Four Directional Buttons (2x2 Grid)**
- **Layout:** 2x2 grid under instructions
- **Labels and Icons:**
  - **Top-left:** "Deep Dive" (↑) - Blue accent
  - **Top-right:** "Vibe Shift" (↓) - Green accent  
  - **Bottom-left:** "Social" (←) - Red accent
  - **Bottom-right:** "Action" (→) - Orange accent
- **Styling:** Rounded squares with soft shadows and pastel gradients
- **Active states:** Outline with subtle glow in accent colors
- **Touch targets:** Minimum 44px height for mobile

### **📊 Last Gesture Indicator**
- **Text:** "Last gesture: [direction]" in green accent color
- **Position:** Small text at bottom
- **Font:** Tiny font size

## 🕓 **RIGHT-SIDE TIME DIAL (Enhanced)**

### **📱 Visual Design**
- **Position:** Fixed to right edge of screen
- **Layout:** Vertical column of time options
- **Styling:** Small rounded chips with time labels
- **Default state:** Low opacity (opacity-50)
- **Active state:** Full opacity with slight glow
- **Animation:** Scale animation on selection (Framer Motion)

### **⏰ Time Options**
- **Now**
- **Today** 
- **Tonight**
- **This Week**
- **This Month**
- **Later**

### **🎯 Interaction Behavior**
- **Scrollable:** If needed, but ideally all options fit vertically
- **Touch support:** Finger swipe and click
- **Selection feedback:** Brief highlight/enlarge animation
- **Integration:** Updates event feed (console log for now)

## ⚙️ **FUNCTIONAL BEHAVIOR**

### **🔄 Event Navigation**
- **Swipe Up:** "Deep Dive" event
- **Swipe Down:** "Vibe Shift" event  
- **Swipe Left:** "Social" event
- **Swipe Right:** "Action" event
- **Animation:** Smooth fade transition (0.3-0.4s)
- **Feedback:** Haptic-like animation feedback

### **⏰ Time Filtering**
- **Hold down dial:** Reveals inline time selector focus (highlight right column)
- **Time selection:** Updates event feed
- **State tracking:** Record last gesture direction

### **📱 Mobile Gestures**
- **Swipe gestures:** Natural up, down, left, right
- **Touch targets:** All buttons minimum 44px height
- **No modals:** Everything happens inline
- **Responsive:** Use Tailwind responsive utilities (sm:, md:)

## 🧠 **DATA STRUCTURE**

### **📋 Event Data**
```javascript
const events = [
  { 
    name: "Beach Volleyball Tournament", 
    category: "Social/Fun", 
    price: "Free",
    date: "2024-03-15",
    time: "14:00"
  },
  { 
    name: "Food Truck Festival", 
    category: "Social/Fun", 
    price: "Free",
    date: "2024-04-05", 
    time: "12:00"
  },
  { 
    name: "Tech Meetup: AI & Machine Learning", 
    category: "Professional", 
    price: "Free",
    date: "2024-04-10",
    time: "19:00"
  },
  { 
    name: "Art Gallery Opening", 
    category: "Arts/Culture", 
    price: "Free",
    date: "2024-03-28",
    time: "19:00"
  }
];
```

## 🧩 **TECHNICAL SPECIFICATIONS**

### **📦 Tech Stack**
- **Framework:** React + Tailwind + Framer Motion
- **Layout:** Mobile-first responsive design
- **Animations:** Framer Motion with easeInOut cubic
- **Styling:** Minimal, clean, gradient, rounded, centered

### **🏗️ Component Structure**
```
DiscoveryDial.jsx (main UI)
├── Central circular dial
├── Four directional buttons
├── Instructions text
├── Last gesture indicator
└── Right-side time selector
```

### **📝 Code Organization**
```javascript
// L1_Curation – Event Data Loading
// L2_Health – State and Validation  
// L3_Config – UI / Layout Settings
// L4_Intelligence – Gesture & Filter Logic
```

### **🎯 Console Logging**
- Log every direction swipe
- Log time changes
- Log gesture state changes
- Log event transitions

## ✅ **IMPLEMENTATION GOALS**

### **🎨 Visual Consistency**
- **Minimal design:** Clean, soft, calm aesthetic
- **Gradient background:** Purple to blue vertical gradient
- **Rounded elements:** All buttons and dials with rounded corners
- **Centered layout:** Everything properly centered
- **Mobile-native:** Feels native on mobile devices

### **⚡ Performance**
- **Smooth animations:** 60fps transitions
- **Responsive:** Scales properly on all screen sizes
- **Touch-optimized:** All interactions feel natural
- **Distraction-free:** Clean, focused interface

### **🔄 Integration**
- **Seamless flow:** Time selector integrates with circular dial
- **Gesture harmony:** All interactions work together
- **State management:** Proper state tracking and updates
- **Visual feedback:** Clear indication of all interactions

## 🎯 **SUCCESS CRITERIA**

1. **Exact visual match** to the screenshots provided
2. **Smooth, fluid animations** for all state changes
3. **Mobile-first responsive** design that works on all devices
4. **Intuitive time filtering** with right-side vertical selector
5. **Natural gesture support** for event navigation
6. **Clean, minimal aesthetic** that feels native and distraction-free

The updated Discovery Dial should feel like a native mobile app with smooth animations, intuitive gestures, and a clean, minimal design that perfectly matches the provided screenshots while adding the enhanced right-side time selector functionality.

