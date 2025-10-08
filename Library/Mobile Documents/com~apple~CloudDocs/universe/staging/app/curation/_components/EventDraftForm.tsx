#Context: Event Draft Form with StartTimeField Integration
// Example usage of StartTimeField in L1_Curation workflow
// Part of V12.0 L1 Event Curation Hub implementation

import React, { useState } from 'react';
import { StartTimeField, useStartTimeField } from './StartTimeField';

interface EventDraftFormProps {
  onSubmit?: (draft: any) => void;
  onCancel?: () => void;
}

export const EventDraftForm: React.FC<EventDraftFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  // Use the StartTimeField hook
  const { value: startTime, handleTimeSelected, eventDraft } = useStartTimeField('12:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const draft = {
      title,
      description,
      venue,
      startTime,
      tags,
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    
    // Log for development (no production writes)
    console.log('Event Draft Submitted:', draft);
    onSubmit?.(draft);
  };

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create Event Draft</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter event title"
            required
          />
        </div>

        {/* Start Time Field */}
        <StartTimeField
          value={startTime}
          onTimeSelected={handleTimeSelected}
          label="Event Start Time"
          required
          format="12h"
          granularityMinutes={15}
          className="mb-4"
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your event"
          />
        </div>

        {/* Venue */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Venue
          </label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Event location"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleTagAdd(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add tags (press Enter to add)"
          />
        </div>

        {/* Event Draft Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Draft Status</h3>
          <div className="text-sm text-gray-600">
            <p><strong>Start Time:</strong> {startTime}</p>
            <p><strong>Status:</strong> {eventDraft.status}</p>
            <p><strong>Last Updated:</strong> {eventDraft.updatedAt}</p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Draft
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventDraftForm;
