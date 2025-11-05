'use client'

import { memo, useCallback, useMemo } from 'react'
import { X } from 'lucide-react'
import type { WorkstationSidebarProps } from '../../types/workstation'
import { SavedViewsButtons } from './SavedViewsButtons'
import { AdvancedUserFilters, type UserFilters as AUserFilters } from '../AdvancedUserFilters'
import './workstation.css'

export const WorkstationSidebar = memo(function WorkstationSidebar({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  stats,
  onAddUser,
  onReset,
}: WorkstationSidebarProps) {
  // Helper to safely extract string filter values
  const getFilterValue = (value: any): string | undefined => {
    return typeof value === 'string' ? value : undefined
  }

  const handleViewChange = useCallback((viewName: string, roleFilter?: string) => {
    if (onFiltersChange) {
      onFiltersChange({
        search: '',
        role: roleFilter || undefined,
        status: undefined,
        department: undefined,
        dateRange: 'all',
      } as any)
    }
  }, [onFiltersChange])

  const handleResetClick = useCallback(() => {
    if (onFiltersChange) {
      onFiltersChange({})
    }
    if (onReset) {
      onReset()
    }
  }, [onFiltersChange, onReset])

  // Map filters from WorkstationIntegrated format to AdvancedUserFilters format
  const mappedFilters: AUserFilters = useMemo(() => ({
    search: getFilterValue((filters as any)?.search) || '',
    role: getFilterValue((filters as any)?.role),
    status: getFilterValue((filters as any)?.status),
    department: getFilterValue((filters as any)?.department),
    dateRange: getFilterValue((filters as any)?.dateRange),
  }), [filters])

  return (
    <div className="workstation-sidebar-content">
      {/* Close Button - Mobile Only */}
      <button
        className="sidebar-close-btn md:hidden"
        onClick={onClose}
        aria-label="Close sidebar"
      >
        <X size={20} />
      </button>

      {/* Quick Stats Section */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">Quick Stats</h3>
        <div className="sidebar-stats-container">
          {stats && (
            <>
              <div className="stat-item">
                <span className="stat-label">Total Users</span>
                <span className="stat-value">{(stats as any).total || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active</span>
                <span className="stat-value">{((stats as any).clients || 0) + ((stats as any).staff || 0) + ((stats as any).admins || 0) || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending</span>
                <span className="stat-value">0</span>
              </div>
            </>
          )}
          {!stats && (
            <div className="stat-item">
              <span className="stat-label">Loading...</span>
            </div>
          )}
        </div>
      </div>

      {/* Saved Views Section */}
      <SavedViewsButtons
        activeView="all"
        onViewChange={handleViewChange}
        viewCounts={{
          all: (stats as any)?.total || 0,
          clients: (stats as any)?.clients || 0,
          team: ((stats as any)?.staff || 0) + ((stats as any)?.admins || 0),
          admins: (stats as any)?.admins || 0,
        }}
        className="sidebar-saved-views"
      />

      {/* Filters Section - Scrollable */}
      <div className="sidebar-section sidebar-filters flex-1 overflow-y-auto">
        <h3 className="sidebar-title">Filters</h3>
        <div className="sidebar-filters-container">
          <AdvancedUserFilters
            filters={mappedFilters}
            onFiltersChange={(f) => onFiltersChange?.(f as any)}
            onReset={onReset}
          />
        </div>
      </div>

      {/* Footer - Reset Button */}
      <div className="sidebar-footer">
        <button
          className="sidebar-reset-btn"
          onClick={handleResetClick}
          aria-label="Reset all filters"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )
})

// Add missing styles to workstation.css
const additionalStyles = `
.sidebar-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.2s ease;
}

.sidebar-close-btn:hover {
  background: var(--accent);
}

.sidebar-saved-views {
  margin: 0;
  padding: 0;
  border: none;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-input,
.filter-select {
  padding: 0.5rem 0.75rem;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  color: var(--foreground);
  transition: border-color 0.2s ease;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-light);
}

.filter-input::placeholder {
  color: var(--muted-foreground);
}
`
