import React, { useState, useEffect } from 'react';
import { eventService, EVENT_STATUS, AI_CONFIDENCE_LEVELS } from '../../lib/data/eventService.js';
import { can } from '../../lib/auth/rbac.js';
import EventDataGrid from '../data/EventDataGrid.jsx';
import EventEditModal from '../modals/EventEditModal.jsx';
import AlgorithmicPreviewPanel from '../preview/AlgorithmicPreviewPanel.jsx';

const EventCurationHub = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load events on component mount and when filters change
  useEffect(() => {
    loadEvents();
  }, [filters, searchTerm]);

  const loadEvents = async (page = 1) => {
    setIsLoading(true);
    try {
      const result = await eventService.getEvents({
        page,
        pageSize: 20,
        sortBy: 'aiConfidence',
        sortOrder: 'asc', // Show lowest confidence first
        filters,
        search: searchTerm
      });
      
      setEvents(result.events);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleEventUpdate = async (eventId, updates) => {
    try {
      await eventService.updateEvent(eventId, updates);
      loadEvents(pagination.page); // Reload current page
      setShowEditModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  const handleEventArchive = async (eventId) => {
    if (window.confirm('Are you sure you want to archive this event?')) {
      try {
        await eventService.archiveEvent(eventId, user.name);
        loadEvents(pagination.page);
      } catch (error) {
        console.error('Failed to archive event:', error);
      }
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handlePageChange = (newPage) => {
    loadEvents(newPage);
  };

  // Get analytics for the header
  const getAnalytics = () => {
    const total = pagination.totalItems || 0;
    const lowConfidence = events.filter(e => e.aiConfidenceLevel === AI_CONFIDENCE_LEVELS.CRITICAL).length;
    const staging = events.filter(e => e.status === EVENT_STATUS.STAGING).length;
    
    return { total, lowConfidence, staging };
  };

  const analytics = getAnalytics();

  return (
    <div className="space-y-6">
      {/* Header with Analytics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Event Curation Hub</h2>
            <p className="text-gray-600">Manage and curate events with AI-assisted quality control</p>
          </div>
          {can('create_events') && (
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Event
            </button>
          )}
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📊</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">Total Events</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">⚠️</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-900">Low Confidence</p>
                <p className="text-2xl font-bold text-red-600">{analytics.lowConfidence}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">⏳</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-900">In Staging</p>
                <p className="text-2xl font-bold text-yellow-600">{analytics.staging}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✅</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Ready to Publish</p>
                <p className="text-2xl font-bold text-green-600">
                  {events.filter(e => e.aiConfidenceLevel === AI_CONFIDENCE_LEVELS.HIGH && e.status === EVENT_STATUS.STAGING).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange({ status: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value={EVENT_STATUS.STAGING}>Staging</option>
              <option value={EVENT_STATUS.PUBLISHED}>Published</option>
              <option value={EVENT_STATUS.ARCHIVED}>Archived</option>
            </select>

            <select
              value={filters.confidenceLevel || ''}
              onChange={(e) => handleFilterChange({ confidenceLevel: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Confidence Levels</option>
              <option value={AI_CONFIDENCE_LEVELS.CRITICAL}>Critical (&lt;40%)</option>
              <option value={AI_CONFIDENCE_LEVELS.LOW}>Low (40-59%)</option>
              <option value={AI_CONFIDENCE_LEVELS.MEDIUM}>Medium (60-79%)</option>
              <option value={AI_CONFIDENCE_LEVELS.HIGH}>High (80-100%)</option>
            </select>

            <button
              onClick={() => setFilters({})}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-white rounded-lg shadow-sm">
        <EventDataGrid
          events={events}
          pagination={pagination}
          isLoading={isLoading}
          onEventSelect={handleEventSelect}
          onEventArchive={handleEventArchive}
          onPageChange={handlePageChange}
          canEdit={can('edit_events')}
          canDelete={can('delete_events')}
        />
      </div>

      {/* Event Edit Modal */}
      {showEditModal && (
        <EventEditModal
          event={selectedEvent}
          onSave={handleEventUpdate}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
          }}
          canEdit={can('edit_events')}
        />
      )}

      {/* Algorithmic Preview Panel */}
      {selectedEvent && (
        <AlgorithmicPreviewPanel
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default EventCurationHub;
