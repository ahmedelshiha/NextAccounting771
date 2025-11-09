'use client'

import React, { useCallback, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { X } from 'lucide-react'
import { FilterMultiSelect, FilterOption } from './FilterMultiSelect'
import { FilterPills } from './FilterPill'
import { ExportButton } from './ExportButton'
import { FilterState } from '../hooks/useFilterState'
import { UserItem } from '../contexts/UserDataContext'

export interface UserDirectoryFilterBarEnhancedProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onToggleRole?: (role: string) => void
  onToggleStatus?: (status: string) => void
  onClearRoles?: () => void
  onClearStatuses?: () => void

  selectedCount: number
  totalCount: number
  filteredCount: number
  filteredUsers?: UserItem[]
  allUsers?: UserItem[]
  selectedUserIds?: Set<string>
  onSelectAll: (selected: boolean) => void

  roleOptions?: FilterOption[]
  statusOptions?: FilterOption[]

  onClearFilters: () => void
  multiSelect?: boolean
  showExport?: boolean
}

const DEFAULT_ROLE_OPTIONS: FilterOption[] = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'TEAM_LEAD', label: 'Team Lead' },
  { value: 'TEAM_MEMBER', label: 'Team Member' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'CLIENT', label: 'Client' },
  { value: 'VIEWER', label: 'Viewer' }
]

const DEFAULT_STATUS_OPTIONS: FilterOption[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SUSPENDED', label: 'Suspended' }
]

export function UserDirectoryFilterBarEnhanced({
  filters,
  onFiltersChange,
  onToggleRole,
  onToggleStatus,
  onClearRoles,
  onClearStatuses,
  selectedCount,
  totalCount,
  filteredCount,
  onSelectAll,
  roleOptions = DEFAULT_ROLE_OPTIONS,
  statusOptions = DEFAULT_STATUS_OPTIONS,
  onClearFilters,
  multiSelect = true
}: UserDirectoryFilterBarEnhancedProps) {
  const hasActiveFilters = !!(
    filters.search || 
    (filters.roles?.length ?? 0) > 0 || 
    (filters.statuses?.length ?? 0) > 0
  )

  const allFiltered = selectedCount === filteredCount && filteredCount > 0

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onFiltersChange({ ...filters, search: value })
  }, [filters, onFiltersChange])

  const handleSelectAllChange = useCallback((checked: boolean) => {
    onSelectAll(checked)
  }, [onSelectAll])

  // Get selected role/status labels for pills
  const selectedRoles = useMemo(() => {
    return (filters.roles || []).map(value => {
      const option = roleOptions.find(opt => opt.value === value)
      return { value, label: option?.label || value }
    })
  }, [filters.roles, roleOptions])

  const selectedStatuses = useMemo(() => {
    return (filters.statuses || []).map(value => {
      const option = statusOptions.find(opt => opt.value === value)
      return { value, label: option?.label || value }
    })
  }, [filters.statuses, statusOptions])

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
      {/* Main filter row */}
      <div 
        className="grid grid-cols-[40px_minmax(180px,2fr)_1fr_1fr_auto] gap-3 p-3 items-center"
        role="toolbar"
        aria-label="User directory filters"
      >
        {/* Select All Checkbox */}
        <div className="flex items-center justify-center">
          <Checkbox
            checked={allFiltered && selectedCount > 0}
            onCheckedChange={handleSelectAllChange}
            aria-label={selectedCount > 0 ? 'Deselect all users' : 'Select all filtered users'}
            title={selectedCount > 0 ? 'Deselect all' : 'Select all filtered users'}
          />
        </div>

        {/* Search Input */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search name, email, phone..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full text-sm pl-3 pr-8"
            aria-label="Search users by name, email, or phone"
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ ...filters, search: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Multi-select role filter */}
        <FilterMultiSelect
          label="Roles"
          placeholder="All Roles"
          options={roleOptions}
          selectedValues={filters.roles || []}
          onToggle={onToggleRole || (() => {})}
          onClear={onClearRoles || (() => {})}
          ariaLabel="Filter by roles (multi-select)"
        />

        {/* Multi-select status filter */}
        <FilterMultiSelect
          label="Status"
          placeholder="All Statuses"
          options={statusOptions}
          selectedValues={filters.statuses || []}
          onToggle={onToggleStatus || (() => {})}
          onClear={onClearStatuses || (() => {})}
          ariaLabel="Filter by status (multi-select)"
        />

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="outline"
            size="sm"
            className="text-xs"
            aria-label="Clear all filters"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter Pills Row */}
      {hasActiveFilters && (
        <FilterPills
          search={filters.search}
          roles={selectedRoles}
          statuses={selectedStatuses}
          onRemoveSearch={() => onFiltersChange({ ...filters, search: '' })}
          onRemoveRole={(role) => onToggleRole?.(role)}
          onRemoveStatus={(status) => onToggleStatus?.(status)}
          onClearAll={onClearFilters}
        />
      )}

      {/* Results Counter Row */}
      <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-100 bg-gray-50">
        <span aria-live="polite" aria-atomic="true">
          {selectedCount > 0 && (
            <span className="font-medium text-gray-700">
              {selectedCount} selected
            </span>
          )}
          {selectedCount > 0 && ' • '}
          <span>
            {filteredCount} of {totalCount} users
          </span>
        </span>
      </div>
    </div>
  )
}
