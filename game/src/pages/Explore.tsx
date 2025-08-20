import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getEventsWithAttendees, mockConnections } from '../lib/mockData'
import { useMockAuth } from '../contexts/MockAuthContext'
import { useEventState } from '../contexts/EventStateContext'
import { EventCard3Lane } from '../components/EventCard3Lane'
import { DemoBanner } from '../components/DemoBanner'
import { QuickFilters } from '../components/QuickFilters'
import { AdvancedFilters } from '../components/AdvancedFilters'
import { 
  filterEvents, 
  sortEvents, 
  FilterState, 
  getActiveFilterCount,
  clearAllFilters,
  filtersToURLParams,
  urlParamsToFilters,
  FilterContext
} from '../lib/eventFilters'
import { logUserEventSignal } from '../lib/aiRanking'
import { ResilienceService } from '../lib/resilience'
import { getDefaultUserProfile, calculateFriendCloseness } from '../lib/enhancedRanking'
import { EventWithAttendees } from '../types'
import { SlidersHorizontal, Sparkles, Calendar, MapPin, Plus, Search, Users, Clock } from 'lucide-react'
import { ResilienceMonitor } from '../components/ResilienceMonitor'
import { buildFeedPolicy, FeedContext } from '../lib/feedPolicy'

export const Explore: React.FC = () => {
  const { user } = useMockAuth()
  const { state: eventState, setEvents, joinEvent, leaveEvent } = useEventState()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)
  const [useAIRanking, setUseAIRanking] = useState(true)
  const [resilienceService] = useState(() => new ResilienceService())
  const [userProfile] = useState(() => user ? getDefaultUserProfile(user.id) : null)
  const [friendCloseness, setFriendCloseness] = useState<any[]>([])
  const [showAllEventsModal, setShowAllEventsModal] = useState(false)
  
  // Initialize filters from URL params or defaults
  const [filters, setFilters] = useState<FilterState>(() => {
    const urlFilters = urlParamsToFilters(searchParams)
    return urlFilters
  })

  // Load all events
  useEffect(() => {
    const timer = setTimeout(() => {
      const eventsWithAttendees = getEventsWithAttendees()
      setEvents(eventsWithAttendees as unknown as EventWithAttendees[])
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [user, setEvents])

  // Create filter context with user data
  const filterContext = useMemo<FilterContext>(() => {
    if (!user) return {}
    
    const connections = mockConnections.filter((conn: any) => 
      conn.userAId === user.id || conn.userBId === user.id
    )
    
    const userConnections = connections.map((conn: any) => 
      conn.userAId === user.id ? conn.userBId : conn.userAId
    )
    
    // Calculate friend closeness
    const closeness = calculateFriendCloseness(
      userConnections,
      [], // Mock co-attendance history
      []  // Mock DM history
    )
    setFriendCloseness(closeness)
    
    return {
      currentUser: user,
      userLocation: { lat: 40.7829, lng: -73.9654 }, // NYC coordinates for demo
      userSports: ['Basketball', 'Board Games', 'Fitness'], // Mock user sports
      userConnections,
      userTimezone: 'America/New_York'
    }
  }, [user])

  // Apply new feed policy
  const [feedPolicy, setFeedPolicy] = useState<any>(null)
  
  useEffect(() => {
    const updateFeed = async () => {
      if (!user || eventState.events.length === 0) return
      
      // Create feed context
      const feedContext: FeedContext = {
        currentUser: user,
        userLocation: filterContext.userLocation,
        userConnections: filterContext.userConnections || [],
        currentTime: new Date()
      }
      
      // Build feed policy
      const policy = buildFeedPolicy(eventState.events, feedContext)
      setFeedPolicy(policy)
    }
    
    updateFeed()
  }, [eventState.events, user, filterContext])

  // Update URL when filters change
  useEffect(() => {
    const params = filtersToURLParams(filters)
    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  // Filter change handlers
  const handleQuickFilterChange = useCallback((key: keyof typeof filters.quick, value: boolean) => {
    setFilters(prev => ({
      ...prev,
      quick: { ...prev.quick, [key]: value }
    }))
  }, [])

  const handleAdvancedFiltersChange = useCallback((advancedFilters: typeof filters.advanced) => {
    setFilters(prev => ({ ...prev, advanced: advancedFilters }))
  }, [])

  const handleClearAllFilters = useCallback(() => {
    setFilters(clearAllFilters())
  }, [])

  const activeFilterCount = getActiveFilterCount(filters)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!feedPolicy && !loading) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
          {/* Quick Filters */}
          <QuickFilters
            filters={filters.quick}
            onFilterChange={handleQuickFilterChange}
            onClearAll={handleClearAllFilters}
            totalFilterCount={activeFilterCount}
            className="sticky top-0 z-10"
          />
          
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">No events match your filters</h2>
              <p className="text-gray-600 mb-6">Try adjusting your filters or check back later for new events!</p>
              <div className="flex flex-col gap-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearAllFilters}
                    className="btn-secondary"
                  >
                    Clear all filters
                  </button>
                )}
                {user && (
                  <a href="/create" className="btn-primary">
                    Create an Event
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <DemoBanner />
        
        {/* Quick Filters - Compact */}
        <QuickFilters
          filters={filters.quick}
          onFilterChange={handleQuickFilterChange}
          onClearAll={handleClearAllFilters}
          totalFilterCount={activeFilterCount}
          className="px-4 py-2"
        />
        
        {/* Header - Compact */}
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">
                {useAIRanking && user ? 'For You' : 'Explore'}
              </h1>
              {useAIRanking && user && (
                <Sparkles className="w-4 h-4 text-accent-600" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* AI Toggle */}
              {user && (
                <button
                  onClick={() => setUseAIRanking(!useAIRanking)}
                  className={`
                    p-1.5 rounded-lg border transition-all duration-200
                    focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2
                    ${useAIRanking
                      ? 'bg-accent-600 text-white border-accent-600' 
                      : 'bg-surface text-fg border-border hover:bg-bg-muted'
                    }
                  `}
                  aria-label={useAIRanking ? 'Disable AI ranking' : 'Enable AI ranking'}
                  title={useAIRanking ? 'Switch to chronological' : 'Switch to personalized'}
                >
                  <Sparkles className="w-3 h-3" />
                </button>
              )}
              
              <button
                onClick={() => setIsAdvancedFiltersOpen(true)}
                className={`
                  p-1.5 rounded-lg border transition-all duration-200 relative
                  focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2
                  ${activeFilterCount > 0 
                    ? 'bg-accent-600 text-white border-accent-600' 
                    : 'bg-surface text-fg border-border hover:bg-bg-muted'
                  }
                `}
                aria-label="Open advanced filters"
              >
                <SlidersHorizontal className="w-3 h-3" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-error text-white rounded-full w-4 h-4 text-xs font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {/* Event count */}
          <p className="text-xs text-gray-600 mt-1">
            {feedPolicy && feedPolicy.forYou.length > 0 
              ? `${feedPolicy.forYou.length} event${feedPolicy.forYou.length === 1 ? '' : 's'} available`
              : 'Discover events near you'
            }
          </p>
        </div>

        {/* Main Content - Single View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {feedPolicy ? (
            <>
                                  {/* Primary Event Stack - Most Important Event */}
                    {feedPolicy.forYou.length > 0 && (
                      <div className="bg-white border-b border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-lg font-bold text-gray-900">Featured Event</h2>
                          <span className="text-xs text-gray-500">
                            {feedPolicy.forYou.length} more available
                          </span>
                        </div>
                        
                        <div className="flex justify-center">
                          <div className="w-full max-w-md">
                            <EventCard3Lane
                              event={feedPolicy.forYou[0]}
                              onStateChange={(updatedEvent) => {
                                if (user && updatedEvent.currentUserAttendee) {
                                  logUserEventSignal({
                                    userId: user.id,
                                    eventId: updatedEvent.id,
                                    action: 'join',
                                    timestamp: new Date(),
                                    actionId: `primary-${updatedEvent.id}-${user.id}-${Date.now()}`,
                                    context: {
                                      position: 0,
                                      sessionId: `session_${Date.now()}`
                                    }
                                  })
                                }
                              }}
                              showReason={true}
                              showNewBadge={true}
                              showSpotsOpenedBadge={true}
                              isPrimary={true}
                            />
                          </div>
                        </div>
                      </div>
                    )}
              
              {/* Key Metrics Row */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {feedPolicy?.forYou?.length || 0}
                    </div>
                    <div className="text-xs text-blue-600">Available</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {feedPolicy?.mySchedule?.length || 0}
                    </div>
                    <div className="text-xs text-green-600">Joined</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {feedPolicy?.optionalSections?.reduce((acc: number, section: any) => acc + section.events.length, 0) || 0}
                    </div>
                    <div className="text-xs text-purple-600">Featured</div>
                  </div>
                </div>
              </div>
              
                                  {/* Horizontal Event Feed - Remaining Events */}
                    {feedPolicy.forYou.length > 1 && (
                      <div className="bg-white border-b border-gray-200 p-4 flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="text-sm font-semibold text-gray-900">More Events</h2>
                          <button
                            onClick={() => setShowAllEventsModal(true)}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            View All ({feedPolicy.forYou.length})
                          </button>
                        </div>
                        
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                          {feedPolicy.forYou.slice(1, 5).map((event: EventWithAttendees) => (
                            <div 
                              key={event.id} 
                              className="flex-shrink-0"
                              style={{ scrollSnapAlign: 'start' }}
                            >
                              <EventCard3Lane
                                event={event}
                                onStateChange={(updatedEvent) => {
                                  if (user && updatedEvent.currentUserAttendee) {
                                    logUserEventSignal({
                                      userId: user.id,
                                      eventId: updatedEvent.id,
                                      action: 'join',
                                      timestamp: new Date(),
                                      actionId: `feed-${updatedEvent.id}-${user.id}-${Date.now()}`,
                                      context: {
                                        position: feedPolicy.forYou.findIndex((e: EventWithAttendees) => e.id === event.id),
                                        sessionId: `session_${Date.now()}`
                                      }
                                    })
                                  }
                                }}
                                showReason={false}
                                showNewBadge={true}
                                showSpotsOpenedBadge={true}
                                compact={true}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
              
              {/* Quick Actions Bar */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="grid grid-cols-4 gap-3">
                  <button className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Search className="w-5 h-5 text-gray-600 mb-1" />
                    <span className="text-xs text-gray-600">Search</span>
                  </button>
                  <button className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Plus className="w-5 h-5 text-gray-600 mb-1" />
                    <span className="text-xs text-gray-600">Host</span>
                  </button>
                  <button className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Users className="w-5 h-5 text-gray-600 mb-1" />
                    <span className="text-xs text-gray-600">Friends</span>
                  </button>
                  <button className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Clock className="w-5 h-5 text-gray-600 mb-1" />
                    <span className="text-xs text-gray-600">History</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p>Loading feed...</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* All Events Modal */}
      {showAllEventsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[80vh] rounded-t-xl overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">All Events</h2>
                <button
                  onClick={() => setShowAllEventsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="space-y-1">
                {feedPolicy?.forYou?.map((event: EventWithAttendees) => (
                  <EventCard3Lane
                    key={event.id}
                    event={event}
                    onStateChange={(updatedEvent) => {
                      if (user && updatedEvent.currentUserAttendee) {
                        logUserEventSignal({
                          userId: user.id,
                          eventId: updatedEvent.id,
                          action: 'join',
                          timestamp: new Date(),
                          actionId: `modal-${updatedEvent.id}-${user.id}-${Date.now()}`,
                          context: {
                            position: feedPolicy.forYou.findIndex((e: EventWithAttendees) => e.id === event.id),
                            sessionId: `session_${Date.now()}`
                          }
                        })
                      }
                    }}
                    showReason={true}
                    showNewBadge={true}
                    showSpotsOpenedBadge={true}
                    compact={true}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Advanced Filters Bottom Sheet */}
      <AdvancedFilters
        isOpen={isAdvancedFiltersOpen}
        onClose={() => setIsAdvancedFiltersOpen(false)}
        filters={filters.advanced}
        onFiltersChange={handleAdvancedFiltersChange}
        onApply={() => setIsAdvancedFiltersOpen(false)}
        onClear={handleClearAllFilters}
      />
      
      {/* Resilience Monitor (Development Only) */}
      <ResilienceMonitor resilienceService={resilienceService} />
    </div>
  )
}
