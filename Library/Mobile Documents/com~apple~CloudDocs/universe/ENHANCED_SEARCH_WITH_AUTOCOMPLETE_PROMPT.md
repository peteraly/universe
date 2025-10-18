# Enhanced Search Bar with Autocomplete - Implementation Prompt

## Objective
Create a highly visible, translucent search bar at the top of the page with real-time autocomplete dropdown suggestions.

## Requirements

### 1. Visual Design
- **Position**: Fixed at the very top of the page (top: 12px)
- **Opacity**: Semi-transparent background with glassmorphism effect
- **Width**: Full-width on mobile, max 700px on desktop
- **Visibility**: High contrast with shadow for better visibility
- **Z-index**: 300 (above all other elements)

### 2. Autocomplete Dropdown
- **Trigger**: Show suggestions as user types (minimum 1 character)
- **Suggestions Include**:
  - Event names
  - Venue/location names
  - Popular tags
  - Categories
  - Recent searches (optional)
- **Design**:
  - Appears below search input
  - Semi-transparent background matching search bar
  - Hover effects on suggestions
  - Keyboard navigation (up/down arrows, Enter to select, ESC to close)
  - Click to select

### 3. Suggestion Logic
- Extract unique values from all events:
  - Event names (top 10 matches)
  - Venues (unique locations)
  - Tags (most relevant)
  - Categories/Subcategories
- Filter suggestions based on current input
- Sort by relevance (prioritize exact matches, then partial matches)
- Limit to 8-10 suggestions maximum

### 4. User Experience
- **Auto-highlight**: First suggestion highlighted by default
- **Keyboard navigation**: Arrow keys to navigate, Enter to select
- **Click outside**: Close dropdown when clicking outside
- **Mobile-friendly**: Large touch targets (44px minimum height)
- **Loading state**: Show "Searching..." while filtering

### 5. Technical Implementation
- Debounce input (200ms) to prevent excessive filtering
- Memoize suggestion extraction for performance
- Use React hooks (useState, useEffect, useCallback, useMemo)
- Accessible (ARIA roles, labels, keyboard support)

## Files to Create/Modify

### New Files:
1. `src/utils/searchSuggestions.js` - Logic for generating suggestions
2. Enhanced `UniversalSearchBar.jsx` with autocomplete

### Modified Files:
1. `UniversalSearchBar.css` - Add dropdown styles
2. `App.jsx` - Pass event data for suggestions

## Success Criteria
- [ ] Search bar visible immediately on page load
- [ ] Dropdown appears when typing (1+ characters)
- [ ] Suggestions are relevant and accurate
- [ ] Keyboard navigation works smoothly
- [ ] Mobile-friendly touch interactions
- [ ] Performance: < 100ms suggestion generation
- [ ] Accessible to screen readers
- [ ] Works on all devices and browsers

## Example User Flow
1. User lands on page → sees search bar at top
2. User types "j" → dropdown shows: "Jazz Night", "Japanese Festival", "Jogging Club", etc.
3. User types "ja" → dropdown narrows to "Jazz Night", "Japanese Festival"
4. User presses down arrow → first suggestion highlighted
5. User presses Enter → search executes with selected suggestion
6. Events filter to match search term

## Design Specifications

### Search Bar:
- Background: `rgba(255, 255, 255, 0.9)`
- Backdrop filter: `blur(20px)`
- Border: `1px solid rgba(0, 0, 0, 0.1)`
- Box shadow: `0 4px 12px rgba(0, 0, 0, 0.15)`
- Border radius: `12px`

### Dropdown:
- Background: `rgba(255, 255, 255, 0.95)`
- Backdrop filter: `blur(20px)`
- Max height: `300px` (scrollable)
- Item padding: `12px 16px`
- Hover background: `rgba(0, 0, 0, 0.05)`
- Selected background: `rgba(0, 123, 255, 0.1)`

### Typography:
- Input font size: `16px` (prevent iOS zoom)
- Suggestion font size: `14px`
- Font weight: 400 (regular), 600 (matched text)
- Color: `#000` (input), `#333` (suggestions)

## Implementation Priority
1. **Phase 1**: Enhanced visibility (more opaque, better positioning)
2. **Phase 2**: Basic dropdown (show all suggestions)
3. **Phase 3**: Smart filtering (relevant suggestions only)
4. **Phase 4**: Keyboard navigation
5. **Phase 5**: Polish (animations, mobile optimization)

