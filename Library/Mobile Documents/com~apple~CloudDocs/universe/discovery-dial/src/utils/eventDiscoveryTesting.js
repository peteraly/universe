// Event Discovery Testing Utilities
// Run these in browser console to test functionality

export const eventDiscoveryTesting = {
  // Test view switching
  testViewSwitch: () => {
    console.log('🧪 Testing view switching...');
    const button = document.querySelector('.add-button');
    if (button) {
      button.click();
      console.log('✅ View switch button clicked');
      setTimeout(() => {
        const currentView = document.querySelector('.event-discovery') ? 'discovery' : 'compass';
        console.log(`✅ Current view: ${currentView}`);
      }, 500);
    } else {
      console.error('❌ Toggle button not found');
    }
  },

  // Test filter functionality
  testFilters: () => {
    console.log('🧪 Testing filter functionality...');
    const filters = document.querySelectorAll('.filter-btn');
    if (filters.length > 0) {
      const firstFilter = filters[0];
      firstFilter.click();
      console.log('✅ Filter clicked:', firstFilter.textContent);
      
      // Check if map updated
      setTimeout(() => {
        const markers = document.querySelectorAll('.mapboxgl-marker');
        console.log(`✅ Map markers count: ${markers.length}`);
      }, 500);
    } else {
      console.error('❌ No filter buttons found');
    }
  },

  // Test event selection
  testEventSelection: () => {
    console.log('🧪 Testing event selection...');
    const eventCard = document.querySelector('.event-card');
    if (eventCard) {
      eventCard.click();
      console.log('✅ Event card clicked');
      
      setTimeout(() => {
        const overlay = document.querySelector('.selected-event-overlay');
        if (overlay) {
          console.log('✅ Event overlay opened');
        } else {
          console.error('❌ Event overlay not found');
        }
      }, 500);
    } else {
      console.error('❌ No event cards found');
    }
  },

  // Test mobile responsiveness
  testMobileResponsiveness: () => {
    console.log('🧪 Testing mobile responsiveness...');
    const isMobile = window.innerWidth <= 768;
    console.log(`📱 Mobile detected: ${isMobile}`);
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    const eventCards = document.querySelectorAll('.event-card');
    const toggleButton = document.querySelector('.add-button');
    
    console.log(`📊 Filter buttons: ${filterButtons.length}`);
    console.log(`📊 Event cards: ${eventCards.length}`);
    console.log(`📊 Toggle button: ${toggleButton ? 'Found' : 'Not found'}`);
    
    // Check touch targets
    if (isMobile) {
      const smallTargets = Array.from(filterButtons).filter(btn => {
        const rect = btn.getBoundingClientRect();
        return rect.width < 44 || rect.height < 44;
      });
      
      if (smallTargets.length === 0) {
        console.log('✅ All touch targets meet 44px minimum');
      } else {
        console.warn(`⚠️ ${smallTargets.length} touch targets below 44px minimum`);
      }
    }
  },

  // Test map functionality
  testMapFunctionality: () => {
    console.log('🧪 Testing map functionality...');
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
      console.log('✅ Map container found');
      
      const markers = document.querySelectorAll('.mapboxgl-marker');
      console.log(`✅ Map markers: ${markers.length}`);
      
      // Test marker click
      if (markers.length > 0) {
        const firstMarker = markers[0];
        firstMarker.click();
        console.log('✅ Marker clicked');
      }
    } else {
      console.error('❌ Map container not found');
    }
  },

  // Run all tests
  runAllTests: () => {
    console.log('🚀 Running comprehensive Event Discovery tests...');
    console.log('='.repeat(50));
    
    this.testViewSwitch();
    setTimeout(() => this.testFilters(), 1000);
    setTimeout(() => this.testEventSelection(), 2000);
    setTimeout(() => this.testMobileResponsiveness(), 3000);
    setTimeout(() => this.testMapFunctionality(), 4000);
    
    setTimeout(() => {
      console.log('='.repeat(50));
      console.log('✅ All tests completed!');
    }, 5000);
  },

  // Performance test
  testPerformance: () => {
    console.log('🧪 Testing performance...');
    const startTime = performance.now();
    
    // Test filter performance
    const filters = document.querySelectorAll('.filter-btn');
    if (filters.length > 0) {
      filters[0].click();
      const endTime = performance.now();
      const filterTime = endTime - startTime;
      
      if (filterTime < 200) {
        console.log(`✅ Filter response time: ${filterTime.toFixed(2)}ms (Good)`);
      } else {
        console.warn(`⚠️ Filter response time: ${filterTime.toFixed(2)}ms (Slow)`);
      }
    }
  }
};

// Expose to global scope for console testing
if (typeof window !== 'undefined') {
  window.eventDiscoveryTesting = eventDiscoveryTesting;
  console.log('🧪 Event Discovery testing utilities loaded!');
  console.log('📋 Available commands:');
  console.log('  - eventDiscoveryTesting.runAllTests()');
  console.log('  - eventDiscoveryTesting.testViewSwitch()');
  console.log('  - eventDiscoveryTesting.testFilters()');
  console.log('  - eventDiscoveryTesting.testEventSelection()');
  console.log('  - eventDiscoveryTesting.testMobileResponsiveness()');
  console.log('  - eventDiscoveryTesting.testMapFunctionality()');
  console.log('  - eventDiscoveryTesting.testPerformance()');
}
