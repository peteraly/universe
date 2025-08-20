import React, { useState } from 'react'
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { type AdvancedFilters as AdvancedFiltersType, SPORTS_CATEGORIES, SKILL_LEVELS } from '../lib/eventFilters'
import { Button } from './Button'

interface AdvancedFiltersProps {
  isOpen: boolean
  onClose: () => void
  filters: AdvancedFiltersType
  onFiltersChange: (filters: AdvancedFiltersType) => void
  onApply: () => void
  onClear: () => void
}

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
}

const FilterSection: React.FC<FilterSectionProps> = ({ 
  title, 
  children, 
  defaultExpanded = true 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="border-b border-divider pb-6 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-4 text-left"
      >
        <h3 className="text-lg font-medium text-fg">{title}</h3>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-fg-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 text-fg-muted" />
        )}
      </button>
      {isExpanded && children}
    </div>
  )
}

interface MultiSelectProps {
  options: readonly string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder: string
}

const MultiSelect: React.FC<MultiSelectProps> = ({ 
  options, 
  selected, 
  onChange, 
  placeholder 
}) => {
  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-fg-muted mb-2">
        {selected.length === 0 ? placeholder : `${selected.length} selected`}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map(option => (
          <button
            key={option}
            onClick={() => handleToggle(option)}
            className={`
              px-3 py-2 text-sm font-medium rounded-md border transition-all duration-200
              text-left focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2
              ${selected.includes(option)
                ? 'bg-accent-600 text-white border-accent-600'
                : 'bg-surface text-fg border-border hover:bg-bg-muted'
              }
            `}
            aria-pressed={selected.includes(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApply,
  onClear
}) => {
  const [localFilters, setLocalFilters] = useState<AdvancedFiltersType>(filters)

  const handleSportsChange = (sports: string[]) => {
    setLocalFilters(prev => ({ ...prev, sports }))
  }

  const handleVisibilityChange = (visibility: string[]) => {
    setLocalFilters(prev => ({ ...prev, visibility: visibility as ('public' | 'invite_auto' | 'invite_manual')[] }))
  }

  const handleSkillLevelChange = (skillLevel: string[]) => {
    setLocalFilters(prev => ({ ...prev, skillLevel: skillLevel as ('beginner' | 'casual' | 'competitive')[] }))
  }

  const handleMaxDistanceChange = (distance: number | null) => {
    setLocalFilters(prev => ({ ...prev, maxDistance: distance }))
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    onApply()
    onClose()
  }

  const handleClear = () => {
    setLocalFilters({
      sports: [],
      visibility: ['public'],
      skillLevel: [],
      indoorOutdoor: [],
      equipment: [],
      ageRange: null,
      maxDistance: null,
      timeWindow: {}
    })
    onClear()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-modal"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-modal bg-surface rounded-t-lg shadow-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-divider">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-fg" />
            <h2 className="text-lg font-semibold text-fg">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-fg-muted hover:text-fg hover:bg-bg-muted rounded-md transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 pb-20">
          {/* Sports & Activity Type */}
          <FilterSection title="Sports & Activities">
            <MultiSelect
              options={SPORTS_CATEGORIES}
              selected={localFilters.sports}
              onChange={handleSportsChange}
              placeholder="Choose sports"
            />
          </FilterSection>

          {/* Event Visibility */}
          <FilterSection title="Event Type">
            <MultiSelect
              options={['public', 'invite_auto', 'invite_manual'] as const}
              selected={localFilters.visibility}
              onChange={handleVisibilityChange}
              placeholder="All event types"
            />
            <div className="text-xs text-fg-muted mt-2">
              Invite-only events only appear if you're invited
            </div>
          </FilterSection>

          {/* Skill Level */}
          <FilterSection title="Skill Level">
            <MultiSelect
              options={SKILL_LEVELS}
              selected={localFilters.skillLevel}
              onChange={handleSkillLevelChange}
              placeholder="All skill levels"
            />
          </FilterSection>

          {/* Distance */}
          <FilterSection title="Distance">
            <div className="space-y-3">
              <div className="text-sm text-fg-muted">
                Within {localFilters.maxDistance || 25} miles
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={localFilters.maxDistance || 25}
                onChange={(e) => handleMaxDistanceChange(parseInt(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent-600"
              />
              <div className="flex justify-between text-xs text-fg-muted">
                <span>1 mi</span>
                <span>25 mi</span>
              </div>
            </div>
          </FilterSection>

          {/* Time Window */}
          <FilterSection title="When" defaultExpanded={false}>
            <div className="space-y-4">
              <div>
                <label className="label">Start Date</label>
                <input
                  type="date"
                  className="input"
                  value={localFilters.timeWindow.startDate ? 
                    localFilters.timeWindow.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    timeWindow: {
                      ...prev.timeWindow,
                      startDate: e.target.value ? new Date(e.target.value) : undefined
                    }
                  }))}
                />
              </div>
              <div>
                <label className="label">End Date</label>
                <input
                  type="date"
                  className="input"
                  value={localFilters.timeWindow.endDate ? 
                    localFilters.timeWindow.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    timeWindow: {
                      ...prev.timeWindow,
                      endDate: e.target.value ? new Date(e.target.value) : undefined
                    }
                  }))}
                />
              </div>
            </div>
          </FilterSection>
        </div>

        {/* Footer actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface border-t border-divider">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={handleClear}
              className="flex-1"
            >
              Clear
            </Button>
            <Button
              variant="primary"
              onClick={handleApply}
              className="flex-1"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
