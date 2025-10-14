# Discovery Dial Design Restoration Prompt

## 🎯 **Design Requirements Based on Screenshots**

### **📱 Core Layout Structure**
- **Full-screen gradient background** (purple to blue gradient)
- **Large circular dial** in center with event details
- **Event information** displayed inside the circle
- **Four directional buttons** in 2x2 grid below the dial
- **Vertical time selector** on the right side of screen

### **🔄 Central Circular Dial**
- **Size:** Large, prominent circular dial (approximately 70% of screen width)
- **Background:** Semi-transparent white overlay with subtle backdrop blur
- **Border:** Clean white border with rounded corners
- **Content:** Event name, category, and price displayed inside the circle
- **Typography:** 
  - Event name: Large, bold, white text
  - Category: Medium, white/80 opacity
  - Price: Small, white/60 opacity

### **📋 Event Display Details**
- **Event Name:** Primary text, bold, centered
- **Category:** Secondary text below name
- **Price:** Tertiary text at bottom
- **Layout:** All text centered within the circular dial
- **Animation:** Smooth transitions when switching between events

### **🎯 Four Directional Buttons (2x2 Grid)**
- **Layout:** Grid positioned below the central dial
- **Labels:**
  - **North (↑):** "Deep Dive" - Blue accent
  - **South (↓):** "Vibe Shift" - Green accent  
  - **East (→):** "Action" - Orange accent
  - **West (←):** "Social" - Red accent
- **Styling:** Rounded buttons with icons and labels
- **Active states:** Colored borders and background highlights
- **Touch targets:** Minimum 70px height for mobile

### **⏰ Vertical Time Selector (Right Side)**
- **Position:** Fixed to the right side of screen
- **Layout:** Single vertical column
- **Content:** Time options in individual rows
- **Styling:** Semi-transparent background with rounded corners
- **Options:** Today, This Week, Next Week, This Month
- **Interaction:** Tap to select, visual feedback on selection
- **Mobile optimization:** Touch-friendly with proper spacing

### **🎨 Visual Design System**
- **Background:** Full-screen gradient (purple-500 via blue-500 to purple-700)
- **Text:** White text with varying opacity levels
- **Buttons:** Semi-transparent white backgrounds with colored accents
- **Borders:** Clean white borders with rounded corners
- **Shadows:** Subtle drop shadows for depth
- **Spacing:** Mobile-optimized padding and margins

### **📱 Mobile Optimization**
- **Responsive sizing:** Dial scales appropriately for different screen sizes
- **Touch targets:** All interactive elements meet 44px minimum
- **Safe areas:** Proper handling of iPhone notches and home indicators
- **Gestures:** Support for swipe navigation and long-press interactions
- **Performance:** Smooth 60fps animations and transitions

### **🔄 Interaction States**
- **Loading:** Spinner or skeleton while events load
- **Empty state:** "No events available" message when no events
- **Active selection:** Visual feedback for selected time range
- **Button states:** Hover, active, and focus states for all buttons
- **Gesture feedback:** Visual response to swipe and touch interactions

### **🎯 Key Features to Implement**
1. **Central circular dial** with event details
2. **Four directional navigation buttons** with proper labels
3. **Right-side vertical time selector** with time options
4. **Smooth animations** between states
5. **Mobile-first responsive design**
6. **Touch-optimized interactions**
7. **Clean, minimal aesthetic** matching the screenshots

### **📐 Technical Specifications**
- **Framework:** React with Framer Motion for animations
- **Styling:** Tailwind CSS for responsive design
- **Layout:** Flexbox/Grid for proper positioning
- **Accessibility:** ARIA labels and keyboard navigation
- **Performance:** Optimized for mobile devices

### **🎨 Color Scheme**
- **Primary background:** Purple to blue gradient
- **Text:** White with opacity variations (100%, 80%, 60%)
- **Accent colors:** Blue (North), Green (South), Orange (East), Red (West)
- **Overlays:** Semi-transparent white backgrounds
- **Borders:** White with varying opacity levels

This design should create a clean, intuitive interface that matches the screenshots exactly, with the central circular dial for events, directional buttons for navigation, and the vertical time selector on the right side for filtering events by time period.

