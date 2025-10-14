# Discovery Dial Layout Verification Prompt

## 🎯 **Layout Requirements Verification**

### **📱 Core Layout Structure**

#### **🔄 Central Circular Dial (Middle of Screen)**
- **Position:** Centered in the middle of the screen
- **Content:** Event name and information displayed inside the circle
- **Layout:**
  - **Event Name:** Primary text (e.g., "Art Gallery Opening")
  - **Category:** Secondary text below name (e.g., "Arts/Culture")
  - **Price:** Tertiary text below category (e.g., "Free")
- **Styling:** Semi-transparent white background with clean white border
- **Size:** Large, prominent circular dial (60-70% of screen width)

#### **🎯 Four Directional Buttons (North, East, South, West)**
- **Layout:** 2x2 grid positioned below the central dial
- **Button Positions:**
  - **North (↑):** "Deep Dive" - Top position
  - **East (→):** "Action" - Right position  
  - **South (↓):** "Vibe Shift" - Bottom position
  - **West (←):** "Social" - Left position
- **Styling:** Solid colored backgrounds with proper active/inactive states
- **Touch Targets:** Minimum 44px height for mobile optimization

#### **⏰ Time Selector (Right Side, Single Column)**
- **Position:** Fixed to the right middle side of screen
- **Layout:** Single vertical column of time options
- **Content:** Time options in individual rows:
  - "Now"
  - "Today" 
  - "Tonight"
  - "This Week"
  - "This Month"
  - "Later"
- **Styling:** Semi-transparent background with rounded corners
- **Interaction:** One-thumb time chooser with smooth scrolling

## 🔧 **Implementation Requirements**

### **📱 Layout Structure:**
```jsx
<div className="min-h-screen bg-gradient-to-b from-purple-500 via-blue-500 to-purple-700">
  {/* Main content area */}
  <div className="flex flex-col items-center justify-center">
    {/* Title */}
    <h1>Discovery Dial</h1>
    
    {/* Central circular dial with event info */}
    <div className="circular-dial">
      <div className="event-info">
        <h2>{eventName}</h2>
        <p>{category}</p>
        <p>{price}</p>
      </div>
    </div>
    
    {/* Instructions */}
    <div className="instructions">
      <p>Swipe the dial to discover events</p>
      <p>Hold down the dial for time filter options</p>
    </div>
    
    {/* Four directional buttons */}
    <div className="grid grid-cols-2 gap-3">
      <button className="north">↑ Deep Dive</button>
      <button className="east">→ Action</button>
      <button className="south">↓ Vibe Shift</button>
      <button className="west">← Social</button>
    </div>
  </div>
  
  {/* Right-side time selector */}
  <div className="fixed right-4 top-1/2 -translate-y-1/2">
    <div className="time-selector-column">
      {timeOptions.map(option => (
        <button key={option}>{option}</button>
      ))}
    </div>
  </div>
</div>
```

### **🎨 Visual Design Specifications:**

#### **🔄 Central Circular Dial:**
- **Size:** `w-[60vw] h-[60vw]` with max constraints
- **Background:** `bg-white/10 backdrop-blur-sm`
- **Border:** `border border-white/40 rounded-full`
- **Content:** Centered text with proper hierarchy
- **Animation:** Smooth transitions when changing events

#### **🎯 Directional Buttons:**
- **Grid:** `grid grid-cols-2 gap-3`
- **Styling:** Solid colored backgrounds
- **Active State:** Colored background with shadow
- **Inactive State:** Purple background
- **Touch Targets:** `min-h-[44px]`

#### **⏰ Time Selector:**
- **Position:** `fixed right-4 top-1/2 -translate-y-1/2`
- **Layout:** `flex flex-col space-y-1`
- **Styling:** Semi-transparent with rounded corners
- **Interaction:** One-thumb scrolling with smooth animations

## ✅ **Verification Checklist**

### **📱 Layout Verification:**
- [ ] **Central circular dial** displays event name and info
- [ ] **Four directional buttons** in 2x2 grid (North, East, South, West)
- [ ] **Time selector** on right side in single column
- [ ] **Proper spacing** between all elements
- [ ] **Mobile optimization** with touch-friendly targets

### **🎨 Visual Verification:**
- [ ] **Circular dial** is prominent and centered
- [ ] **Button labels** match directions (Deep Dive ↑, Action →, Vibe Shift ↓, Social ←)
- [ ] **Time selector** is vertically aligned on right side
- [ ] **Color scheme** matches design requirements
- [ ] **Typography hierarchy** is clear and readable

### **📱 Functionality Verification:**
- [ ] **Event display** updates when navigating
- [ ] **Directional buttons** respond to clicks
- [ ] **Time selector** responds to scrolling
- [ ] **Smooth animations** for all interactions
- [ ] **Mobile gestures** work properly

## 🎯 **Success Criteria**

### **📱 Layout Requirements:**
1. **Central circular dial** with event information
2. **Four directional buttons** in proper grid layout
3. **Right-side time selector** in single column
4. **Proper mobile optimization** for all screen sizes
5. **Clean, minimal design** with intuitive navigation

### **🎨 Visual Requirements:**
1. **Event name and info** clearly displayed in circle
2. **Directional buttons** properly labeled and positioned
3. **Time selector** easily accessible on right side
4. **Consistent styling** throughout interface
5. **Smooth animations** for all interactions

### **📱 Mobile Requirements:**
1. **Touch-friendly targets** for all interactive elements
2. **Responsive design** that works on all devices
3. **Smooth scrolling** for time selector
4. **Proper safe area** handling for mobile notches
5. **Performance optimization** for mobile devices

## 🔧 **Implementation Notes**

### **📱 Key Components:**
- **Central Dial:** Event display with proper text hierarchy
- **Directional Grid:** 2x2 button layout with proper labels
- **Time Selector:** Vertical column on right side
- **Mobile Optimization:** Touch targets and responsive design

### **🎨 Styling Requirements:**
- **Gradient background** (purple to blue)
- **Semi-transparent overlays** for depth
- **Clean typography** with proper hierarchy
- **Smooth animations** for all interactions
- **Mobile-first design** approach

The Discovery Dial should have a central circular dial with event information, four directional buttons in a 2x2 grid, and a single-column time selector on the right side, all optimized for mobile use with smooth animations and intuitive navigation.

