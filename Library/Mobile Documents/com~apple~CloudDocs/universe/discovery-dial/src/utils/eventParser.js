// Event Parser for different websites
// Tailored specifically for Things To Do DC and other event sites

const PARSER_CONFIG = {
  'thingstododc.com': {
    name: 'Things To Do DC',
    eventSelector: '.event-item, .event-card',
    titleSelector: 'h3, .event-title',
    dateSelector: '.event-date, .date',
    timeSelector: '.event-time, .time',
    venueSelector: '.event-venue, .venue',
    locationSelector: '.event-location, .location',
    descriptionSelector: '.event-description, .description',
    priceSelector: '.event-price, .price',
    detailsButtonSelector: 'a[href*="event-details"], .event-details',
    paginationSelector: '.pagination, .page-nav',
    nextPageSelector: '.next-page, .next',
    requiresClick: true, // This site needs click to get full details
    baseUrl: 'https://thingstododc.com'
  },
  'eventbrite.com': {
    name: 'Eventbrite',
    eventSelector: '.event-card, .eds-event-card',
    titleSelector: '.event-title, .eds-event-card__formatted-name',
    dateSelector: '.event-date, .eds-event-card__formatted-date',
    venueSelector: '.event-venue, .eds-event-card__sub-title',
    requiresClick: false
  },
  'meetup.com': {
    name: 'Meetup',
    eventSelector: '.eventCard, .event-card',
    titleSelector: '.eventCardHead--title, .event-title',
    dateSelector: '.eventCardHead--date, .event-date',
    venueSelector: '.eventCardHead--location, .event-venue',
    requiresClick: false
  }
}

export const detectWebsite = (url) => {
  try {
    const domain = new URL(url).hostname.toLowerCase()
    
    // Check for exact matches first
    for (const [key, config] of Object.entries(PARSER_CONFIG)) {
      if (domain.includes(key)) {
        return { key, config }
      }
    }
    
    // Default parser for unknown sites
    return {
      key: 'default',
      config: {
        name: 'Generic Event Site',
        eventSelector: '.event, .event-item, .event-card',
        titleSelector: 'h1, h2, h3, .title, .event-title',
        dateSelector: '.date, .event-date, .datetime',
        venueSelector: '.venue, .location, .place',
        requiresClick: false
      }
    }
  } catch (error) {
    console.error('Error detecting website:', error)
    return null
  }
}

export const parseEvents = async (url, progressCallback) => {
  const websiteInfo = detectWebsite(url)
  if (!websiteInfo) {
    throw new Error('Invalid URL or unsupported website')
  }

  const { key, config } = websiteInfo
  
  try {
    // Simulate parsing progress
    progressCallback(10)
    
    // In a real implementation, this would use Puppeteer or similar
    // to actually scrape the website. For now, we'll simulate the process.
    
    const mockEvents = await simulateParsing(url, config, progressCallback)
    
    progressCallback(100)
    return mockEvents
    
  } catch (error) {
    console.error('Error parsing events:', error)
    throw new Error(`Failed to parse events from ${config.name}: ${error.message}`)
  }
}

const simulateParsing = async (url, config, progressCallback) => {
  // Simulate the parsing process with realistic delays
  const steps = [
    { progress: 20, message: 'Loading page...' },
    { progress: 40, message: 'Extracting event listings...' },
    { progress: 60, message: 'Getting event details...' },
    { progress: 80, message: 'Processing data...' },
    { progress: 95, message: 'Finalizing...' }
  ]

  for (const step of steps) {
    await new Promise(resolve => setTimeout(resolve, 500))
    progressCallback(step.progress)
  }

  // Generate mock events based on the website
  if (url.includes('thingstododc.com')) {
    return generateThingsToDoDCEvents()
  }
  
  // Default mock events
  return generateMockEvents()
}

const generateThingsToDoDCEvents = () => {
  return [
    {
      id: 'ttd-1',
      title: 'Caribbean Evening at the Embassy of Saint Kitts and Nevis',
      date: '2024-10-10',
      time: '07:00PM',
      venue: 'Embassy of Saint Kitts and Nevis',
      location: 'Washington, DC',
      description: 'Experience the vibrant culture of Saint Kitts and Nevis with traditional music, dance, and cuisine.',
      price: '$45',
      status: 'active',
      sourceUrl: 'https://thingstododc.com/event/caribbean-evening',
      parsedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString()
    },
    {
      id: 'ttd-2',
      title: 'Roof Top Nightclub Tour And Experience',
      date: '2024-10-10',
      time: '09:00PM',
      venue: 'Various DC Rooftops',
      location: 'Washington, DC',
      description: 'Explore the best rooftop venues in DC with exclusive access and VIP treatment.',
      price: '$65',
      status: 'active',
      sourceUrl: 'https://thingstododc.com/event/rooftop-tour',
      parsedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString()
    },
    {
      id: 'ttd-3',
      title: 'Margarita Cruise on the Potomac',
      date: '2024-10-11',
      time: '06:45PM',
      venue: 'Potomac River',
      location: 'Washington, DC',
      description: 'Enjoy a scenic cruise on the Potomac River with unlimited margaritas and live music.',
      price: '$55',
      status: 'active',
      sourceUrl: 'https://thingstododc.com/event/margarita-cruise',
      parsedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString()
    },
    {
      id: 'ttd-4',
      title: 'Annual October Hayride and Bonfire',
      date: '2024-10-11',
      time: '07:30PM',
      venue: 'Local Farm',
      location: 'Northern Virginia',
      description: 'Traditional fall hayride followed by a cozy bonfire with hot cider and s\'mores.',
      price: '$35',
      status: 'active',
      sourceUrl: 'https://thingstododc.com/event/hayride-bonfire',
      parsedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString()
    },
    {
      id: 'ttd-5',
      title: 'International Chocolate Tour of Embassy Row',
      date: '2024-10-12',
      time: '12:00PM',
      venue: 'Embassy Row',
      location: 'Washington, DC',
      description: 'Sample chocolates from around the world while learning about different cultures.',
      price: '$40',
      status: 'active',
      sourceUrl: 'https://thingstododc.com/event/chocolate-tour',
      parsedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString()
    }
  ]
}

const generateMockEvents = () => {
  return [
    {
      id: 'mock-1',
      title: 'Sample Event 1',
      date: '2024-10-15',
      time: '07:00PM',
      venue: 'Sample Venue',
      location: 'Washington, DC',
      description: 'This is a sample event description.',
      price: '$25',
      status: 'active',
      sourceUrl: 'https://example.com/event/1',
      parsedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString()
    },
    {
      id: 'mock-2',
      title: 'Sample Event 2',
      date: '2024-10-16',
      time: '08:00PM',
      venue: 'Another Venue',
      location: 'Washington, DC',
      description: 'Another sample event description.',
      price: '$30',
      status: 'pending',
      sourceUrl: 'https://example.com/event/2',
      parsedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString()
    }
  ]
}

export const checkForNewEvents = async (url, existingEvents) => {
  try {
    const newEvents = await parseEvents(url, () => {})
    
    // Compare with existing events to find new ones
    const existingIds = new Set(existingEvents.map(event => event.id))
    const newEventsOnly = newEvents.filter(event => !existingIds.has(event.id))
    
    return newEventsOnly
  } catch (error) {
    console.error('Error checking for new events:', error)
    return []
  }
}

export const exportToCSV = (events) => {
  const headers = ['Title', 'Date', 'Time', 'Venue', 'Location', 'Description', 'Price', 'Status', 'Source URL']
  const csvContent = [
    headers.join(','),
    ...events.map(event => [
      `"${event.title}"`,
      event.date,
      event.time,
      `"${event.venue}"`,
      `"${event.location}"`,
      `"${event.description}"`,
      event.price,
      event.status,
      event.sourceUrl
    ].join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `events-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

