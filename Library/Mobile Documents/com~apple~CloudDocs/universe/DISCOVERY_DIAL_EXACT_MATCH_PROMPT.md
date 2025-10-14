# DISCOVERY DIAL EXACT MATCH PROMPT

## Context
The current Discovery Dial implementation is missing critical components and doesn't match the exact specifications. This prompt will ensure the implementation matches the provided screenshot exactly.

## 🎯 **EXACT REQUIREMENTS FROM SCREENSHOT**

### **1. Central Circular Event Card**
- **Large circular bubble** in the exact center of the screen
- **Event name** (bold, large font) - "Art Gallery Opening"
- **Category** (smaller font) - "Arts/Culture" 
- **Price** (smallest font) - "Free"
- **All text centered** inside the circle
- **Semi-transparent** with subtle outline
- **60-70% viewport width** on mobile

### **2. Background & Layout**
- **Full-screen gradient** (purple→blue)
- **Helper text below circle:** "Swipe the dial to discover events"
- **2x2 button grid** below helper text
- **Last gesture indicator** at bottom: "Last gesture: north" (muted green)

### **3. Directional Buttons (2x2 Grid)**
- **↑ Deep Dive** (top-left, blue border when active)
- **↓ Vibe Shift** (top-right)
- **← Social** (bottom-left) 
- **→ Action** (bottom-right)
- **Rounded rectangles** with subtle shadows
- **Active state:** Blue border (not outline glow)

### **4. MISSING COMPONENTS (Critical)**
- **❌ Cycle Button:** Should be centered under helper text, above 2x2 grid
- **❌ Right-Side Time Slider:** Should be slim rail on right edge, expandable

## 🔧 **IMPLEMENTATION FIX**

### **Step 1: Verify Current DiscoveryDial.jsx Structure**
Check if the component has:
- Central circular card with proper sizing
- Event info inside circle (title, category, price)
- Helper text below circle
- 2x2 directional button grid
- Cycle button for time filter
- Right-side time slider
- Last gesture indicator

### **Step 2: Fix Missing Components**
**A) Add Cycle Button:**
```jsx
{/* Cycle Button - MISSING */}
<motion.button
  onClick={cycleTimeFilter}
  className="
    px-4 py-2 rounded-xl
    bg-white/12 hover:bg-white/16
    focus-visible:ring-2 focus-visible:ring-white/60
    transition-all duration-200
    text-white text-sm font-medium
    mb-6
  "
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  {timeFilterLabels[timeFilterCycle]}
</motion.button>
```

**B) Add Right-Side Time Slider:**
```jsx
{/* Right-Side Time Slider - MISSING */}
<RightTimeSlider 
  onTimeChange={handleTimeSliderChange}
  currentTime={startTime}
/>
```

### **Step 3: Verify Component Structure**
The DiscoveryDial.jsx should have this exact structure:
```jsx
return (
  <div className="min-h-screen bg-gradient-to-b from-indigo-500 via-purple-500 to-violet-600 flex flex-col items-center justify-center px-4 py-6 relative overflow-hidden">
    
    {/* Central Circular Event Card */}
    <div className="relative w-[60vw] h-[60vw] sm:w-[50vw] sm:h-[50vw] max-w-80 max-h-80 flex items-center justify-center mb-6">
      <motion.div className="w-full h-full rounded-full border border-white/40 shadow-[0_0_60px_rgba(255,255,255,0.08)] backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer transition-all duration-300">
        <AnimatePresence mode="wait">
          <motion.div key={currentEventIndex} className="text-center px-6">
            <h2 className="text-white font-semibold text-xl sm:text-2xl mb-2">{currentEvent.name}</h2>
            <p className="text-white/80 text-sm mb-1">{currentEvent.category}</p>
            <p className="text-white/60 text-xs">{currentEvent.price}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>

    {/* Helper Text */}
    <div className="text-white/70 text-sm text-center mb-6">
      Swipe the dial to discover events
    </div>

    {/* Cycle Button - CRITICAL MISSING COMPONENT */}
    <motion.button onClick={cycleTimeFilter} className="px-4 py-2 rounded-xl bg-white/12 hover:bg-white/16 focus-visible:ring-2 focus-visible:ring-white/60 transition-all duration-200 text-white text-sm font-medium mb-6">
      {timeFilterLabels[timeFilterCycle]}
    </motion.button>

    {/* Four Directional Buttons */}
    <div className="grid grid-cols-2 gap-3 w-full max-w-72 mb-6">
      {/* Button implementation */}
    </div>

    {/* Last Gesture Indicator */}
    {lastGesture && (
      <div className="text-green-400 text-xs font-medium">
        Last gesture: {lastGesture}
      </div>
    )}

    {/* Right-Side Time Slider - CRITICAL MISSING COMPONENT */}
    <RightTimeSlider 
      onTimeChange={handleTimeSliderChange}
      currentTime={startTime}
    />
  </div>
)
```

### **Step 4: Verify RightTimeSlider Component**
Ensure `RightTimeSlider.jsx` exists and has:
- Collapsed state: slim rail on right edge
- Expanded state: draggable thumb with time options
- Auto-collapse after 1s inactivity
- Proper positioning: `fixed right-1 top-24 bottom-24`

### **Step 5: Verify useSwipe Hook**
Ensure `useSwipe.js` exists and provides:
- Touch gesture detection
- Direction mapping (up/down/left/right)
- Proper callback handling

## 🚨 **CRITICAL ISSUES TO FIX**

### **Issue 1: Missing Cycle Button**
- **Problem:** No cycle button visible in screenshot
- **Solution:** Add cycle button between helper text and 2x2 grid
- **Position:** Centered, under helper text, above buttons

### **Issue 2: Missing Right-Side Time Slider**
- **Problem:** No right-side time slider visible
- **Solution:** Add RightTimeSlider component
- **Position:** Fixed right edge, slim rail that expands

### **Issue 3: Component Integration**
- **Problem:** Components may not be properly imported
- **Solution:** Verify all imports and component structure

## 🎯 **SUCCESS CRITERIA**

### **Visual Match:**
- ✅ Central circular card with event info
- ✅ Full-screen gradient background
- ✅ Helper text below circle
- ✅ 2x2 directional button grid
- ✅ **Cycle button** (currently missing)
- ✅ **Right-side time slider** (currently missing)
- ✅ Last gesture indicator

### **Functional Match:**
- ✅ Swipe gestures work on circular card
- ✅ Button taps work
- ✅ Cycle button changes time filter
- ✅ Time slider expands and collapses
- ✅ Console logging for all interactions

## 🔧 **IMPLEMENTATION STEPS**

1. **Check current DiscoveryDial.jsx** for missing components
2. **Add cycle button** if missing
3. **Add RightTimeSlider** if missing
4. **Verify imports** for all components
5. **Test on mobile device** to match screenshot
6. **Deploy to Vercel** with fixes

## 📱 **TESTING CHECKLIST**

- [ ] Central circular card displays event info
- [ ] Cycle button visible and functional
- [ ] Right-side time slider visible and functional
- [ ] 2x2 button grid works
- [ ] Swipe gestures work
- [ ] Console logging works
- [ ] Mobile responsive
- [ ] Matches screenshot exactly

This prompt will ensure the Discovery Dial matches your exact specifications and includes all missing components.

