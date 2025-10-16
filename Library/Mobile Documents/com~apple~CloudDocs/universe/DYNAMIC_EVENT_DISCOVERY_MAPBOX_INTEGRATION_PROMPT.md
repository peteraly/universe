# 🗺️ Dynamic Event Discovery Mapbox Integration Prompt

## **OBJECTIVE**
Transform the Discovery Dial application into a comprehensive event discovery platform by adding a dynamic Mapbox integration that allows users to filter events by time, day, and category, with real-time map updates and event listings.

## **CONTEXT**
The Discovery Dial application currently focuses on compass-style navigation. This enhancement will add a new "Event Discovery" view that complements the existing dial interface, providing users with both intuitive compass navigation and detailed map-based event exploration.

## **CORE REQUIREMENTS**

### **1. Mock Event Data Integration**
- **Extend existing event data** from `categories.json` and WordPress.com integration
- **Create comprehensive mock events** that align with current category structure
- **Ensure data consistency** with existing compass categories (Social, Education, Recreation, Professional)
- **Include realistic coordinates** for the target geographic area

### **2. Dynamic Filtering System**
- **Time-based filters**: Morning, Afternoon, Evening, Night
- **Day-based filters**: Today, Tomorrow, This Week, Weekend
- **Category filters**: All existing primary categories from compass
- **Real-time updates**: Instant map and list updates on filter changes

### **3. Mapbox Integration**
- **Seamless integration** with existing Discovery Dial design
- **Dark theme consistency** matching current black/white aesthetic
- **Responsive design** for mobile and desktop
- **Interactive markers** with event details

## **TECHNICAL IMPLEMENTATION**

### **Phase 1: Enhanced Event Data Structure**

1. **Extend Mock Event Data**
   ```javascript
   // src/data/mockEvents.js
   export const MOCK_EVENTS = [
     {
       id: 'event-001',
       name: 'Tech Innovation Meetup',
       categoryPrimary: 'Professional',
       categorySecondary: 'Technology',
       time: 'Evening',
       day: 'Wednesday',
       date: '2025-10-15',
       coordinates: [-74.0060, 40.7128], // NYC coordinates
       description: 'Monthly tech meetup featuring AI and machine learning discussions',
       venue: 'Tech Hub NYC',
       price: 'Free',
       attendees: 45,
       organizer: 'NYC Tech Community'
     },
     {
       id: 'event-002',
       name: 'Morning Yoga in the Park',
       categoryPrimary: 'Recreation',
       categorySecondary: 'Fitness',
       time: 'Morning',
       day: 'Saturday',
       date: '2025-10-18',
       coordinates: [-74.0059, 40.7589],
       description: 'Outdoor yoga session in Central Park',
       venue: 'Central Park - Sheep Meadow',
       price: '$15',
       attendees: 25,
       organizer: 'NYC Yoga Collective'
     },
     // ... additional events
   ];
   ```

2. **Integrate with Existing Categories**
   ```javascript
   // Ensure alignment with existing category structure
   const CATEGORY_MAPPING = {
     'Social': ['Community', 'Networking', 'Social'],
     'Education': ['Workshop', 'Seminar', 'Learning'],
     'Recreation': ['Fitness', 'Sports', 'Outdoor'],
     'Professional': ['Technology', 'Business', 'Career']
   };
   ```

### **Phase 2: Filter Controls UI**

1. **Create Filter Component**
   ```jsx
   // src/components/EventDiscoveryFilters.jsx
   import React, { useState } from 'react';
   
   const EventDiscoveryFilters = ({ onFilterChange, currentFilters }) => {
     const [filters, setFilters] = useState({
       time: 'All',
       day: 'Today',
       category: 'All'
     });
   
     const timeOptions = ['All', 'Morning', 'Afternoon', 'Evening', 'Night'];
     const dayOptions = ['Today', 'Tomorrow', 'This Week', 'Weekend'];
     const categoryOptions = ['All', 'Social', 'Education', 'Recreation', 'Professional'];
   
     return (
       <div className="event-discovery-filters">
         {/* Time Filter */}
         <div className="filter-group">
           <label>Time</label>
           <div className="filter-buttons">
             {timeOptions.map(option => (
               <button
                 key={option}
                 className={`filter-btn ${filters.time === option ? 'active' : ''}`}
                 onClick={() => handleFilterChange('time', option)}
               >
                 {option}
               </button>
             ))}
           </div>
         </div>
         
         {/* Day Filter */}
         <div className="filter-group">
           <label>Day</label>
           <div className="filter-buttons">
             {dayOptions.map(option => (
               <button
                 key={option}
                 className={`filter-btn ${filters.day === option ? 'active' : ''}`}
                 onClick={() => handleFilterChange('day', option)}
               >
                 {option}
               </button>
             ))}
           </div>
         </div>
         
         {/* Category Filter */}
         <div className="filter-group">
           <label>Category</label>
           <div className="filter-buttons">
             {categoryOptions.map(option => (
               <button
                 key={option}
                 className={`filter-btn ${filters.category === option ? 'active' : ''}`}
                 onClick={() => handleFilterChange('category', option)}
               >
                 {option}
               </button>
             ))}
           </div>
         </div>
       </div>
     );
   };
   ```

2. **Filter Styling (Tailwind CSS)**
   ```css
   /* src/styles/eventDiscovery.css */
   .event-discovery-filters {
     @apply bg-black border-b border-white/20 p-4;
   }
   
   .filter-group {
     @apply mb-4;
   }
   
   .filter-group label {
     @apply text-white text-sm font-medium mb-2 block;
   }
   
   .filter-buttons {
     @apply flex flex-wrap gap-2;
   }
   
   .filter-btn {
     @apply px-3 py-1 text-sm border border-white/30 text-white 
            hover:bg-white/10 transition-colors duration-200;
   }
   
   .filter-btn.active {
     @apply bg-white text-black border-white;
   }
   
   @media (max-width: 768px) {
     .filter-buttons {
       @apply flex-col;
     }
     
     .filter-btn {
       @apply w-full text-center;
     }
   }
   ```

### **Phase 3: Mapbox Integration**

1. **Mapbox Component**
   ```jsx
   // src/components/EventDiscoveryMap.jsx
   import React, { useEffect, useRef, useState } from 'react';
   import mapboxgl from 'mapbox-gl';
   
   const EventDiscoveryMap = ({ events, onEventSelect }) => {
     const mapContainer = useRef(null);
     const map = useRef(null);
     const markers = useRef([]);
   
     useEffect(() => {
       if (map.current) return; // Initialize map only once
   
       mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN_HERE';
   
       map.current = new mapboxgl.Map({
         container: mapContainer.current,
         style: 'mapbox://styles/mapbox/dark-v11', // Dark theme to match app
         center: [-74.0060, 40.7128], // Default center
         zoom: 12
       });
   
       // Add navigation controls
       map.current.addControl(new mapboxgl.NavigationControl());
   
       // Add fullscreen control
       map.current.addControl(new mapboxgl.FullscreenControl());
     }, []);
   
     // Update markers when events change
     useEffect(() => {
       if (!map.current) return;
   
       // Clear existing markers
       markers.current.forEach(marker => marker.remove());
       markers.current = [];
   
       // Add new markers
       events.forEach(event => {
         const marker = new mapboxgl.Marker({
           color: getCategoryColor(event.categoryPrimary)
         })
         .setLngLat(event.coordinates)
         .setPopup(
           new mapboxgl.Popup({ offset: 25 })
           .setHTML(`
             <div class="event-popup">
               <h3 class="text-black font-bold">${event.name}</h3>
               <p class="text-gray-600">${event.categoryPrimary} • ${event.time}</p>
               <p class="text-sm">${event.venue}</p>
             </div>
           `)
         )
         .addTo(map.current);
   
         markers.current.push(marker);
       });
   
       // Fit map to show all markers
       if (events.length > 0) {
         const bounds = new mapboxgl.LngLatBounds();
         events.forEach(event => bounds.extend(event.coordinates));
         map.current.fitBounds(bounds, { padding: 50 });
       }
     }, [events]);
   
     return (
       <div className="event-discovery-map">
         <div ref={mapContainer} className="map-container" />
       </div>
     );
   };
   ```

2. **Map Styling**
   ```css
   .event-discovery-map {
     @apply w-full h-96 md:h-[500px] relative;
   }
   
   .map-container {
     @apply w-full h-full rounded-lg overflow-hidden;
   }
   
   .event-popup {
     @apply p-2 min-w-[200px];
   }
   ```

### **Phase 4: Event List Component**

1. **Event List Display**
   ```jsx
   // src/components/EventDiscoveryList.jsx
   import React from 'react';
   
   const EventDiscoveryList = ({ events, onEventSelect }) => {
     if (events.length === 0) {
       return (
         <div className="no-events">
           <p className="text-white/60 text-center py-8">
             No events found matching your filters
           </p>
         </div>
       );
     }
   
     return (
       <div className="event-discovery-list">
         <div className="events-header">
           <h3 className="text-white font-semibold">
             {events.length} Event{events.length !== 1 ? 's' : ''} Found
           </h3>
         </div>
         
         <div className="events-grid">
           {events.map(event => (
             <div
               key={event.id}
               className="event-card"
               onClick={() => onEventSelect(event)}
             >
               <div className="event-header">
                 <h4 className="event-title">{event.name}</h4>
                 <span className="event-category">{event.categoryPrimary}</span>
               </div>
               
               <div className="event-details">
                 <p className="event-time">{event.time} • {event.day}</p>
                 <p className="event-venue">{event.venue}</p>
                 <p className="event-description">{event.description}</p>
               </div>
               
               <div className="event-footer">
                 <span className="event-price">{event.price}</span>
                 <span className="event-attendees">{event.attendees} attending</span>
               </div>
             </div>
           ))}
         </div>
       </div>
     );
   };
   ```

2. **Event List Styling**
   ```css
   .event-discovery-list {
     @apply p-4;
   }
   
   .events-header {
     @apply mb-4;
   }
   
   .events-grid {
     @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
   }
   
   .event-card {
     @apply bg-white/5 border border-white/20 rounded-lg p-4 
            hover:bg-white/10 transition-colors duration-200 cursor-pointer;
   }
   
   .event-header {
     @apply flex justify-between items-start mb-2;
   }
   
   .event-title {
     @apply text-white font-semibold text-lg;
   }
   
   .event-category {
     @apply text-xs bg-white/20 text-white px-2 py-1 rounded;
   }
   
   .event-details {
     @apply mb-3;
   }
   
   .event-time {
     @apply text-white/80 text-sm;
   }
   
   .event-venue {
     @apply text-white/60 text-sm;
   }
   
   .event-description {
     @apply text-white/70 text-sm mt-1;
   }
   
   .event-footer {
     @apply flex justify-between items-center text-xs text-white/60;
   }
   ```

### **Phase 5: Main Event Discovery Component**

1. **Integration Component**
   ```jsx
   // src/components/EventDiscovery.jsx
   import React, { useState, useMemo } from 'react';
   import EventDiscoveryFilters from './EventDiscoveryFilters';
   import EventDiscoveryMap from './EventDiscoveryMap';
   import EventDiscoveryList from './EventDiscoveryList';
   import { MOCK_EVENTS } from '../data/mockEvents';
   
   const EventDiscovery = () => {
     const [filters, setFilters] = useState({
       time: 'All',
       day: 'Today',
       category: 'All'
     });
   
     const [selectedEvent, setSelectedEvent] = useState(null);
   
     // Filter events based on current filters
     const filteredEvents = useMemo(() => {
       return MOCK_EVENTS.filter(event => {
         const timeMatch = filters.time === 'All' || event.time === filters.time;
         const dayMatch = filters.day === 'All' || event.day === filters.day;
         const categoryMatch = filters.category === 'All' || event.categoryPrimary === filters.category;
         
         return timeMatch && dayMatch && categoryMatch;
       });
     }, [filters]);
   
     const handleFilterChange = (filterType, value) => {
       setFilters(prev => ({
         ...prev,
         [filterType]: value
       }));
     };
   
     const handleEventSelect = (event) => {
       setSelectedEvent(event);
       // Optional: Center map on selected event
     };
   
     return (
       <div className="event-discovery">
         <div className="discovery-header">
           <h2 className="text-white text-2xl font-bold mb-2">
             Event Discovery
           </h2>
           <p className="text-white/70">
             Find events happening around you
           </p>
         </div>
         
         <EventDiscoveryFilters
           filters={filters}
           onFilterChange={handleFilterChange}
         />
         
         <div className="discovery-content">
           <div className="map-section">
             <EventDiscoveryMap
               events={filteredEvents}
               onEventSelect={handleEventSelect}
             />
           </div>
           
           <div className="list-section">
             <EventDiscoveryList
               events={filteredEvents}
               onEventSelect={handleEventSelect}
             />
           </div>
         </div>
       </div>
     );
   };
   
   export default EventDiscovery;
   ```

2. **Main Layout Styling**
   ```css
   .event-discovery {
     @apply min-h-screen bg-black text-white;
   }
   
   .discovery-header {
     @apply p-6 border-b border-white/20;
   }
   
   .discovery-content {
     @apply flex flex-col lg:flex-row;
   }
   
   .map-section {
     @apply lg:w-1/2 p-4;
   }
   
   .list-section {
     @apply lg:w-1/2 p-4 max-h-[600px] overflow-y-auto;
   }
   
   @media (max-width: 1024px) {
     .discovery-content {
       @apply flex-col;
     }
     
     .map-section {
       @apply w-full h-64;
     }
     
     .list-section {
       @apply w-full;
     }
   }
   ```

### **Phase 6: Integration with Existing App**

1. **Add to Main App**
   ```jsx
   // src/App.jsx - Add new route/view
   import EventDiscovery from './components/EventDiscovery';
   
   // Add state for view switching
   const [currentView, setCurrentView] = useState('compass'); // 'compass' or 'discovery'
   
   // Add navigation between views
   const toggleView = () => {
     setCurrentView(prev => prev === 'compass' ? 'discovery' : 'compass');
   };
   
   return (
     <ErrorBoundary name="App">
       {currentView === 'compass' ? (
         <EventCompassFinal
           categories={categoriesData.categories}
           wordPressEvents={wordPressComEvents}
           wordPressLoading={loading}
           wordPressError={error}
           wordPressCategories={categories}
           wordPressStats={stats}
           currentTimeframe={currentTimeframe}
           onTimeframeChange={handleTimeframeChange}
         />
       ) : (
         <EventDiscovery />
       )}
       
       <AddButton onClick={toggleView} />
     </ErrorBoundary>
   );
   ```

2. **Update AddButton for View Toggle**
   ```jsx
   // src/components/AddButton.jsx - Update to toggle between views
   const AddButton = ({ onClick, currentView }) => {
     return (
       <button
         onClick={onClick}
         className="add-button"
         aria-label={currentView === 'compass' ? 'Switch to Map View' : 'Switch to Compass View'}
       >
         {currentView === 'compass' ? '🗺️' : '🧭'}
       </button>
     );
   };
   ```

## **INSTALLATION REQUIREMENTS**

1. **Install Mapbox GL JS**
   ```bash
   npm install mapbox-gl
   ```

2. **Add Mapbox CSS**
   ```jsx
   // src/main.jsx
   import 'mapbox-gl/dist/mapbox-gl.css';
   ```

3. **Environment Variables**
   ```bash
   # .env.local
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```

## **TESTING PROTOCOL**

### **1. Filter Functionality**
- [ ] Time filters work correctly
- [ ] Day filters work correctly
- [ ] Category filters work correctly
- [ ] Multiple filters work in combination
- [ ] Default "Today & Now" view shows appropriate events

### **2. Map Integration**
- [ ] Map loads with dark theme
- [ ] Markers appear for filtered events
- [ ] Map bounds adjust to show all markers
- [ ] Popups show event information
- [ ] Map is responsive on mobile

### **3. Event List**
- [ ] List updates with filter changes
- [ ] Event cards display correctly
- [ ] Click events work for event selection
- [ ] Empty state shows when no events match

### **4. Cross-Platform Testing**
- [ ] Desktop: All features work correctly
- [ ] Mobile: Touch interactions work
- [ ] Tablet: Layout adapts properly
- [ ] Different screen sizes: Responsive design

## **SUCCESS CRITERIA**

### **Functional Requirements**
- ✅ Dynamic filtering by time, day, and category
- ✅ Real-time map updates with filtered events
- ✅ Interactive event list with detailed information
- ✅ Seamless integration with existing Discovery Dial
- ✅ Responsive design across all devices

### **Design Requirements**
- ✅ Dark theme consistency with existing app
- ✅ Clean, intuitive filter interface
- ✅ Professional map presentation
- ✅ Mobile-optimized touch interactions

### **Performance Requirements**
- ✅ Fast filter updates (< 200ms)
- ✅ Smooth map interactions
- ✅ Efficient marker rendering
- ✅ Minimal bundle size impact

## **IMPLEMENTATION TIMELINE**

- **Phase 1**: Mock event data and structure (30 minutes)
- **Phase 2**: Filter controls UI (45 minutes)
- **Phase 3**: Mapbox integration (60 minutes)
- **Phase 4**: Event list component (30 minutes)
- **Phase 5**: Main integration component (45 minutes)
- **Phase 6**: App integration and testing (30 minutes)

**Total Estimated Time**: 4 hours

## **ROLLBACK PLAN**

If any issues arise:
1. **Git revert** to previous working state
2. **Test** core compass functionality
3. **Identify** specific integration issues
4. **Implement** targeted fixes
5. **Re-test** before proceeding

---

**PRIORITY**: High - Major feature enhancement
**IMPACT**: Transforms app into comprehensive event discovery platform
**COMPLEXITY**: Medium-High - Requires Mapbox integration and complex filtering logic
