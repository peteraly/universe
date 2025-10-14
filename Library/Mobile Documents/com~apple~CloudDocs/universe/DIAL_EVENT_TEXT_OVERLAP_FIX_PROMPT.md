# DIAL EVENT TEXT OVERLAP FIX PROMPT

## Context
The Discovery Dial application has a critical text overlap issue:
- **Southern Dial Text Interference**: Text at the southern part of the dial (South position labels, subcategories, etc.) overlaps with event information
- **Event Display Conflicts**: Event title, description, and other event details are being obscured by dial text
- **Layout Collision**: The dial's southern region and event information area are competing for the same visual space
- **Readability Issues**: Users cannot properly read event information due to text overlap

## Task: Fix Text Overlap and Ensure Clear Event Information Display

### 1. **Diagnose Text Overlap Issues**
- Identify which specific text elements are overlapping (South labels, subcategories, event info)
- Check the positioning and z-index of dial text vs. event information
- Analyze the layout boundaries and spacing between dial and event areas
- Review responsive design behavior on different screen sizes
- Check for dynamic text sizing that might cause overflow

### 2. **Implement Layout Separation**
- Create clear visual separation between dial area and event information area
- Establish proper spacing and margins to prevent overlap
- Implement responsive layout that adapts to different screen sizes
- Add proper z-index layering to ensure event info is always readable
- Create dedicated event information zones that don't conflict with dial

### 3. **Optimize Dial Text Positioning**
- Adjust southern dial text positioning to avoid event area
- Implement dynamic text positioning based on event information presence
- Add text wrapping or truncation for long labels
- Ensure dial text doesn't extend beyond designated dial boundaries
- Implement smart text hiding/showing based on available space

### 4. **Enhance Event Information Display**
- Create dedicated event information container with proper positioning
- Implement clear visual hierarchy for event title, description, and details
- Add proper spacing and padding around event information
- Ensure event information is always visible and readable
- Implement responsive text sizing for event information

### 5. **Add Dynamic Layout Management**
- Implement layout adjustments based on content length
- Add smart positioning that adapts to different event information sizes
- Create fallback layouts for edge cases
- Implement proper overflow handling for long text
- Add visual indicators when text is truncated or hidden

## Expected Outcome
- ✅ No text overlap between dial and event information
- ✅ Clear, readable event title and description
- ✅ Proper visual separation between dial and event areas
- ✅ Responsive layout that works on all screen sizes
- ✅ Dynamic text positioning that adapts to content
- ✅ Proper z-index layering for all text elements
- ✅ Smart text management for long content

## Files to Check and Update
- `src/components/EnhancedDial.jsx` - Main dial component and text positioning
- `src/components/EventCompassFinal.jsx` - Event information display
- `src/components/DiscoveryDialCompass.jsx` - Dial layout and positioning
- `src/App.css` - Global layout and spacing
- `src/index.css` - Base styles and positioning
- Any event display components
- Layout and positioning CSS files

## Implementation Recommendations

### Layout Separation System
```css
/* Clear separation between dial and event areas */
.dial-container {
  position: relative;
  width: 100%;
  height: 60vh; /* Limit dial to 60% of viewport height */
  margin-bottom: 2rem;
  z-index: 10;
}

.event-information-area {
  position: relative;
  width: 100%;
  height: 40vh; /* Event area gets 40% of viewport height */
  padding: 1rem;
  z-index: 20; /* Higher than dial */
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
}

/* Prevent dial text from extending into event area */
.dial-text-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* Southern dial text positioning */
.dial-south-text {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 80%;
  text-align: center;
  z-index: 15;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 0.5rem;
  border-radius: 0.5rem;
}
```

### Dynamic Text Positioning
```javascript
// Dynamic text positioning based on event information
const getDialTextPosition = useCallback((textType, hasEventInfo) => {
  const basePositions = {
    south: { bottom: '10px', left: '50%', transform: 'translateX(-50%)' },
    subcategory: { bottom: '30px', left: '50%', transform: 'translateX(-50%)' }
  };
  
  // Adjust positioning if event information is present
  if (hasEventInfo) {
    return {
      ...basePositions[textType],
      bottom: '5px', // Move closer to dial center
      fontSize: '0.9em' // Slightly smaller text
    };
  }
  
  return basePositions[textType];
}, []);

// Smart text visibility management
const shouldShowDialText = useCallback((textType, eventInfoHeight) => {
  const availableSpace = window.innerHeight * 0.6; // Dial area height
  const eventAreaHeight = eventInfoHeight || 0;
  const requiredSpace = availableSpace - eventAreaHeight;
  
  return requiredSpace > 100; // Show text only if enough space
}, []);
```

### Event Information Container
```jsx
// Dedicated event information component
const EventInformationDisplay = ({ event, isVisible }) => {
  if (!isVisible || !event) return null;
  
  return (
    <div className="event-information-area">
      <div className="event-content">
        <h2 className="event-title">{event.title}</h2>
        <p className="event-description">{event.description}</p>
        <div className="event-details">
          <span className="event-time">{event.time}</span>
          <span className="event-location">{event.location}</span>
        </div>
      </div>
    </div>
  );
};

// CSS for event information
.event-information-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40vh;
  background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.7));
  backdrop-filter: blur(10px);
  z-index: 30;
  padding: 1rem;
  overflow-y: auto;
}

.event-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.event-description {
  font-size: 1rem;
  color: #cccccc;
  line-height: 1.5;
  margin-bottom: 1rem;
}
```

### Responsive Layout Management
```css
/* Mobile-first responsive design */
@media (max-width: 768px) {
  .dial-container {
    height: 50vh; /* Smaller dial on mobile */
  }
  
  .event-information-area {
    height: 50vh; /* Larger event area on mobile */
  }
  
  .dial-south-text {
    font-size: 0.8em;
    padding: 0.3rem;
  }
}

@media (min-width: 769px) {
  .dial-container {
    height: 60vh;
  }
  
  .event-information-area {
    height: 40vh;
  }
}

/* Landscape orientation adjustments */
@media (orientation: landscape) and (max-height: 600px) {
  .dial-container {
    height: 70vh;
  }
  
  .event-information-area {
    height: 30vh;
  }
  
  .dial-south-text {
    display: none; /* Hide southern text in landscape */
  }
}
```

### Smart Text Management
```javascript
// Text truncation and overflow handling
const truncateText = useCallback((text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}, []);

// Dynamic text sizing based on available space
const getTextSize = useCallback((availableHeight) => {
  if (availableHeight < 200) return '0.8em';
  if (availableHeight < 300) return '0.9em';
  return '1em';
}, []);

// Smart text positioning with collision detection
const getOptimalTextPosition = useCallback((textElement, eventArea) => {
  const textRect = textElement.getBoundingClientRect();
  const eventRect = eventArea.getBoundingClientRect();
  
  // Check for overlap
  const isOverlapping = !(
    textRect.bottom < eventRect.top ||
    textRect.top > eventRect.bottom ||
    textRect.right < eventRect.left ||
    textRect.left > eventRect.right
  );
  
  if (isOverlapping) {
    // Move text up to avoid overlap
    return {
      bottom: `${eventRect.top - textRect.height - 10}px`,
      left: '50%',
      transform: 'translateX(-50%)'
    };
  }
  
  return null; // No adjustment needed
}, []);
```

## Success Criteria
- ✅ No text overlap between dial and event information
- ✅ Event title and description are always readable
- ✅ Proper visual separation between dial and event areas
- ✅ Responsive layout works on all screen sizes
- ✅ Dynamic text positioning adapts to content
- ✅ Smart text management for long content
- ✅ Proper z-index layering for all elements
- ✅ Smooth transitions when switching between events

## Testing Requirements
- Test on various screen sizes (mobile, tablet, desktop)
- Test with different event information lengths
- Verify text positioning in portrait and landscape orientations
- Test with long event titles and descriptions
- Verify no overlap occurs when switching between events
- Test responsive behavior on different devices
- Ensure accessibility with screen readers
- Validate proper text contrast and readability

## Additional Recommendations
1. **Add text animation** for smooth transitions between events
2. **Implement text search** within event descriptions
3. **Add text highlighting** for important event details
4. **Create text scaling** options for accessibility
5. **Add text-to-speech** for event information
6. **Implement text sharing** functionality
7. **Add text bookmarking** for favorite events
8. **Create text filtering** by event type or category
