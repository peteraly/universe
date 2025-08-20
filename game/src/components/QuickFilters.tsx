import React from 'react'
import { MapPin, Clock, Users, Star, List, X } from 'lucide-react'
import { type QuickFilters as QuickFiltersType } from '../lib/eventFilters'

interface QuickFiltersProps {
  filters: QuickFiltersType
  onFilterChange: (key: keyof QuickFiltersType, value: boolean) => void
  onClearAll: () => void
  totalFilterCount: number
  className?: string
}

interface FilterChipConfig {
  key: keyof QuickFiltersType
  label: string
  icon: React.ComponentType<{ className?: string }>
  activeClass: string
}

const FILTER_CHIPS: FilterChipConfig[] = [
  {
    key: 'openSeats',
    label: 'Open seats',
    icon: Users,
    activeClass: 'bg-accent-600 text-white border-accent-600'
  },
  {
    key: 'nearMe',
    label: 'Near me',
    icon: MapPin,
    activeClass: 'bg-accent-600 text-white border-accent-600'
  },
  {
    key: 'tonight',
    label: 'Tonight',
    icon: Clock,
    activeClass: 'bg-accent-600 text-white border-accent-600'
  },
  {
    key: 'thisWeekend',
    label: 'Weekend',
    icon: Clock,
    activeClass: 'bg-accent-600 text-white border-accent-600'
  },
  {
    key: 'friendsAttending',
    label: 'Friends',
    icon: Users,
    activeClass: 'bg-accent-600 text-white border-accent-600'
  },
  {
    key: 'mySports',
    label: 'My sports',
    icon: Star,
    activeClass: 'bg-accent-600 text-white border-accent-600'
  },
  {
    key: 'waitlistOnly',
    label: 'Waitlist only',
    icon: List,
    activeClass: 'bg-warn text-white border-warn'
  }
]

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  filters,
  onFilterChange,
  onClearAll,
  totalFilterCount,
  className = ''
}) => {
  return (
    <div className={`bg-surface border-b border-divider ${className}`}>
      <div className="container-page px-4 py-3">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {/* Filter chips */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {FILTER_CHIPS.map(chip => {
              const isActive = filters[chip.key]
              const IconComponent = chip.icon

              return (
                <button
                  key={chip.key}
                  onClick={() => onFilterChange(chip.key, !isActive)}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                    border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2
                    ${isActive 
                      ? chip.activeClass 
                      : 'bg-surface text-fg border-border hover:bg-bg-muted'
                    }
                  `}
                  aria-pressed={isActive}
                  aria-label={`${isActive ? 'Remove' : 'Add'} ${chip.label} filter`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{chip.label}</span>
                </button>
              )
            })}
          </div>

          {/* Clear all button - only show when filters are active */}
          {totalFilterCount > 0 && (
            <div className="flex-shrink-0 ml-2 pl-2 border-l border-divider">
              <button
                onClick={onClearAll}
                className="
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                  text-fg-muted border border-border hover:bg-bg-muted hover:text-fg
                  transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2
                "
                aria-label="Clear all filters"
              >
                <X className="w-4 h-4" />
                <span>Clear all</span>
                {totalFilterCount > 0 && (
                  <span className="
                    inline-flex items-center justify-center w-5 h-5 text-xs font-bold
                    bg-error text-white rounded-full ml-1
                  ">
                    {totalFilterCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Scroll hint for mobile
export const QuickFiltersScrollHint: React.FC = () => {
  return (
    <div className="text-center text-xs text-fg-muted py-1">
      ← Swipe to see more filters →
    </div>
  )
}
