/**
 * Event Audit and Analysis System
 * Analyzes current sample events and identifies gaps in filter coverage
 */

import { MOCK_EVENTS, FILTER_OPTIONS } from '../data/mockEvents.js';
import { ENHANCED_SAMPLE_EVENTS } from '../data/enhancedSampleEvents.js';

// ========================================
// EVENT COVERAGE ANALYSIS
// ========================================

/**
 * Analyze current event coverage across all filters
 */
export const auditCurrentEvents = (events = MOCK_EVENTS) => {
  const analysis = {
    totalEvents: events.length,
    filterCoverage: {
      time: {},
      day: {},
      category: {}
    },
    coordinateValidation: [],
    categoryDistribution: {},
    missingCombinations: [],
    recommendations: []
  };

  // Analyze filter coverage
  FILTER_OPTIONS.time.forEach(time => {
    const count = events.filter(e => e.time === time).length;
    analysis.filterCoverage.time[time] = count;
  });

  FILTER_OPTIONS.day.forEach(day => {
    const count = events.filter(e => e.day === day).length;
    analysis.filterCoverage.day[day] = count;
  });

  FILTER_OPTIONS.category.forEach(category => {
    const count = events.filter(e => e.categoryPrimary === category).length;
    analysis.filterCoverage.category[category] = count;
  });

  // Validate coordinates
  events.forEach(event => {
    const hasCoordinates = !!(event.latitude && event.longitude) || !!(event.coordinates);
    const validCoordinates = hasCoordinates && isValidCoordinate(
      event.latitude || event.coordinates?.[1], 
      event.longitude || event.coordinates?.[0]
    );
    
    analysis.coordinateValidation.push({
      id: event.id,
      name: event.name,
      hasCoordinates,
      validCoordinates,
      coordinates: event.latitude && event.longitude ? 
        [event.longitude, event.latitude] : event.coordinates
    });
  });

  // Category distribution
  events.forEach(event => {
    analysis.categoryDistribution[event.categoryPrimary] = 
      (analysis.categoryDistribution[event.categoryPrimary] || 0) + 1;
  });

  // Find missing filter combinations
  analysis.missingCombinations = findMissingCombinations(events);

  // Generate recommendations
  analysis.recommendations = generateRecommendations(analysis);

  return analysis;
};

/**
 * Find missing filter combinations that return no results
 */
const findMissingCombinations = (events) => {
  const missing = [];
  
  FILTER_OPTIONS.time.forEach(time => {
    FILTER_OPTIONS.day.forEach(day => {
      FILTER_OPTIONS.category.forEach(category => {
        if (time === 'All' && day === 'All' && category === 'All') return;
        
        const filteredEvents = events.filter(event => {
          const timeMatch = time === 'All' || event.time === time;
          const dayMatch = day === 'All' || event.day === day;
          const categoryMatch = category === 'All' || event.categoryPrimary === category;
          
          return timeMatch && dayMatch && categoryMatch;
        });
        
        if (filteredEvents.length === 0) {
          missing.push({ time, day, category, count: 0 });
        }
      });
    });
  });
  
  return missing;
};

/**
 * Generate recommendations based on analysis
 */
const generateRecommendations = (analysis) => {
  const recommendations = [];
  
  // Check for empty filter combinations
  if (analysis.missingCombinations.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      type: 'MISSING_COMBINATIONS',
      message: `${analysis.missingCombinations.length} filter combinations return no results`,
      details: analysis.missingCombinations.slice(0, 5) // Show first 5
    });
  }
  
  // Check for low coverage in specific filters
  Object.entries(analysis.filterCoverage.time).forEach(([time, count]) => {
    if (time !== 'All' && count === 0) {
      recommendations.push({
        priority: 'HIGH',
        type: 'EMPTY_TIME_FILTER',
        message: `No events for time filter: ${time}`,
        details: { time, count }
      });
    }
  });
  
  Object.entries(analysis.filterCoverage.day).forEach(([day, count]) => {
    if (day !== 'All' && count === 0) {
      recommendations.push({
        priority: 'HIGH',
        type: 'EMPTY_DAY_FILTER',
        message: `No events for day filter: ${day}`,
        details: { day, count }
      });
    }
  });
  
  Object.entries(analysis.filterCoverage.category).forEach(([category, count]) => {
    if (category !== 'All' && count === 0) {
      recommendations.push({
        priority: 'HIGH',
        type: 'EMPTY_CATEGORY_FILTER',
        message: `No events for category filter: ${category}`,
        details: { category, count }
      });
    }
  });
  
  // Check coordinate validation
  const invalidCoordinates = analysis.coordinateValidation.filter(c => !c.validCoordinates);
  if (invalidCoordinates.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      type: 'INVALID_COORDINATES',
      message: `${invalidCoordinates.length} events have invalid coordinates`,
      details: invalidCoordinates.slice(0, 3) // Show first 3
    });
  }
  
  // Check total event count
  if (analysis.totalEvents < 50) {
    recommendations.push({
      priority: 'MEDIUM',
      type: 'LOW_EVENT_COUNT',
      message: `Only ${analysis.totalEvents} events - consider adding more for better demo coverage`,
      details: { current: analysis.totalEvents, recommended: 100 }
    });
  }
  
  return recommendations;
};

/**
 * Validate coordinate format and range
 */
const isValidCoordinate = (lat, lng) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
};

// ========================================
// EVENT GENERATION
// ========================================

/**
 * Generate events to fill filter coverage gaps
 */
export const generateMissingEvents = (currentEvents, targetCoverage = {}) => {
  const defaultTargets = {
    time: { Morning: 15, Afternoon: 20, Evening: 25, Night: 10 },
    day: { Today: 20, Tomorrow: 15, 'This Week': 25, Weekend: 20 },
    category: { Social: 25, Education: 20, Recreation: 20, Professional: 15 }
  };
  
  const targets = { ...defaultTargets, ...targetCoverage };
  const missingEvents = [];
  
  // Generate events for time gaps
  Object.entries(targets.time).forEach(([time, targetCount]) => {
    const currentCount = currentEvents.filter(e => e.time === time).length;
    const needed = Math.max(0, targetCount - currentCount);
    
    for (let i = 0; i < needed; i++) {
      missingEvents.push(generateEventForTime(time, currentEvents.length + missingEvents.length + 1));
    }
  });
  
  // Generate events for day gaps
  Object.entries(targets.day).forEach(([day, targetCount]) => {
    const currentCount = currentEvents.filter(e => e.day === day).length;
    const needed = Math.max(0, targetCount - currentCount);
    
    for (let i = 0; i < needed; i++) {
      missingEvents.push(generateEventForDay(day, currentEvents.length + missingEvents.length + 1));
    }
  });
  
  // Generate events for category gaps
  Object.entries(targets.category).forEach(([category, targetCount]) => {
    const currentCount = currentEvents.filter(e => e.categoryPrimary === category).length;
    const needed = Math.max(0, targetCount - currentCount);
    
    for (let i = 0; i < needed; i++) {
      missingEvents.push(generateEventForCategory(category, currentEvents.length + missingEvents.length + 1));
    }
  });
  
  return missingEvents;
};

/**
 * Generate event for specific time filter
 */
const generateEventForTime = (time, index) => {
  const timeConfigs = {
    Morning: { startTime: '09:00', endTime: '12:00', day: 'Today' },
    Afternoon: { startTime: '14:00', endTime: '17:00', day: 'This Week' },
    Evening: { startTime: '18:00', endTime: '21:00', day: 'Today' },
    Night: { startTime: '22:00', endTime: '01:00', day: 'Weekend' }
  };
  
  const config = timeConfigs[time];
  const categories = ['Social', 'Education', 'Recreation', 'Professional'];
  const category = categories[index % categories.length];
  
  return {
    id: `generated-${time.toLowerCase()}-${index}`,
    name: `${time} ${category} Event ${index}`,
    description: `A ${time.toLowerCase()} ${category.toLowerCase()} event for demo purposes.`,
    categoryPrimary: category,
    categorySecondary: getSubcategoryForCategory(category),
    venue: `${category} Venue ${index}`,
    address: `${index} Demo St, San Francisco, CA`,
    latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
    longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
    time: time,
    day: config.day,
    date: '2024-01-15',
    startTime: config.startTime,
    endTime: config.endTime,
    price: Math.random() > 0.5 ? 'Free' : `$${Math.floor(Math.random() * 50) + 10}`,
    attendees: Math.floor(Math.random() * 100) + 10,
    maxAttendees: Math.floor(Math.random() * 200) + 50,
    organizer: `${category} Organizer`,
    tags: [category.toLowerCase(), time.toLowerCase()],
    website: `https://example.com/${category.toLowerCase()}-${index}`
  };
};

/**
 * Generate event for specific day filter
 */
const generateEventForDay = (day, index) => {
  const dayConfigs = {
    Today: { time: 'Evening', startTime: '18:00', endTime: '21:00' },
    Tomorrow: { time: 'Morning', startTime: '09:00', endTime: '12:00' },
    'This Week': { time: 'Afternoon', startTime: '14:00', endTime: '17:00' },
    Weekend: { time: 'Afternoon', startTime: '14:00', endTime: '18:00' }
  };
  
  const config = dayConfigs[day];
  const categories = ['Social', 'Education', 'Recreation', 'Professional'];
  const category = categories[index % categories.length];
  
  return {
    id: `generated-${day.toLowerCase().replace(' ', '-')}-${index}`,
    name: `${day} ${category} Event ${index}`,
    description: `A ${day.toLowerCase()} ${category.toLowerCase()} event for demo purposes.`,
    categoryPrimary: category,
    categorySecondary: getSubcategoryForCategory(category),
    venue: `${category} Venue ${index}`,
    address: `${index} Demo St, San Francisco, CA`,
    latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
    longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
    time: config.time,
    day: day,
    date: '2024-01-15',
    startTime: config.startTime,
    endTime: config.endTime,
    price: Math.random() > 0.5 ? 'Free' : `$${Math.floor(Math.random() * 50) + 10}`,
    attendees: Math.floor(Math.random() * 100) + 10,
    maxAttendees: Math.floor(Math.random() * 200) + 50,
    organizer: `${category} Organizer`,
    tags: [category.toLowerCase(), day.toLowerCase()],
    website: `https://example.com/${category.toLowerCase()}-${index}`
  };
};

/**
 * Generate event for specific category filter
 */
const generateEventForCategory = (category, index) => {
  const timeOptions = ['Morning', 'Afternoon', 'Evening', 'Night'];
  const dayOptions = ['Today', 'Tomorrow', 'This Week', 'Weekend'];
  const time = timeOptions[index % timeOptions.length];
  const day = dayOptions[index % dayOptions.length];
  
  return {
    id: `generated-${category.toLowerCase()}-${index}`,
    name: `${category} Event ${index}`,
    description: `A ${category.toLowerCase()} event for demo purposes.`,
    categoryPrimary: category,
    categorySecondary: getSubcategoryForCategory(category),
    venue: `${category} Venue ${index}`,
    address: `${index} Demo St, San Francisco, CA`,
    latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
    longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
    time: time,
    day: day,
    date: '2024-01-15',
    startTime: '14:00',
    endTime: '17:00',
    price: Math.random() > 0.5 ? 'Free' : `$${Math.floor(Math.random() * 50) + 10}`,
    attendees: Math.floor(Math.random() * 100) + 10,
    maxAttendees: Math.floor(Math.random() * 200) + 50,
    organizer: `${category} Organizer`,
    tags: [category.toLowerCase()],
    website: `https://example.com/${category.toLowerCase()}-${index}`
  };
};

/**
 * Get appropriate subcategory for category
 */
const getSubcategoryForCategory = (category) => {
  const subcategories = {
    Social: ['Networking', 'Parties', 'Meetups', 'Food', 'Music'],
    Education: ['Workshops', 'Classes', 'Seminars', 'Technology', 'Arts'],
    Recreation: ['Sports', 'Fitness', 'Outdoor', 'Games', 'Adventure'],
    Professional: ['Business', 'Career', 'Industry', 'Networking', 'Entrepreneurship']
  };
  
  const options = subcategories[category] || ['General'];
  return options[Math.floor(Math.random() * options.length)];
};

// ========================================
// TESTING AND VALIDATION
// ========================================

/**
 * Test all filter combinations
 */
export const testAllFilterCombinations = (events) => {
  const results = [];
  let totalCombinations = 0;
  let emptyCombinations = 0;
  
  FILTER_OPTIONS.time.forEach(time => {
    FILTER_OPTIONS.day.forEach(day => {
      FILTER_OPTIONS.category.forEach(category => {
        if (time === 'All' && day === 'All' && category === 'All') return;
        
        totalCombinations++;
        
        const filteredEvents = events.filter(event => {
          const timeMatch = time === 'All' || event.time === time;
          const dayMatch = day === 'All' || event.day === day;
          const categoryMatch = category === 'All' || event.categoryPrimary === category;
          
          return timeMatch && dayMatch && categoryMatch;
        });
        
        const isEmpty = filteredEvents.length === 0;
        if (isEmpty) emptyCombinations++;
        
        results.push({
          time,
          day,
          category,
          count: filteredEvents.length,
          isEmpty,
          events: filteredEvents.map(e => e.id)
        });
      });
    });
  });
  
  return {
    totalCombinations,
    emptyCombinations,
    successRate: ((totalCombinations - emptyCombinations) / totalCombinations) * 100,
    results
  };
};

/**
 * Run comprehensive event audit
 */
export const runComprehensiveAudit = () => {
  console.log('🔍 Starting comprehensive event audit...');
  
  // Audit current mock events
  const mockAudit = auditCurrentEvents(MOCK_EVENTS);
  console.log('📊 Mock Events Audit:', mockAudit);
  
  // Audit enhanced sample events
  const enhancedAudit = auditCurrentEvents(ENHANCED_SAMPLE_EVENTS);
  console.log('📊 Enhanced Events Audit:', enhancedAudit);
  
  // Test filter combinations
  const mockFilterTest = testAllFilterCombinations(MOCK_EVENTS);
  const enhancedFilterTest = testAllFilterCombinations(ENHANCED_SAMPLE_EVENTS);
  
  console.log('🧪 Mock Events Filter Test:', mockFilterTest);
  console.log('🧪 Enhanced Events Filter Test:', enhancedFilterTest);
  
  // Generate recommendations
  const recommendations = {
    mockEvents: mockAudit.recommendations,
    enhancedEvents: enhancedAudit.recommendations,
    filterCoverage: {
      mock: mockFilterTest.successRate,
      enhanced: enhancedFilterTest.successRate
    }
  };
  
  console.log('💡 Recommendations:', recommendations);
  
  return {
    mockAudit,
    enhancedAudit,
    mockFilterTest,
    enhancedFilterTest,
    recommendations
  };
};

export default {
  auditCurrentEvents,
  generateMissingEvents,
  testAllFilterCombinations,
  runComprehensiveAudit
};
