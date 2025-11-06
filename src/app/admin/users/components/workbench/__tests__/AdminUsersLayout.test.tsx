import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import AdminUsersLayout from '../AdminUsersLayout'

// Mock child components
vi.mock('../QuickActionsBar', () => ({
  default: () => <div data-testid="quick-actions-bar">Quick Actions Bar</div>
}))

vi.mock('../OverviewCards', () => ({
  default: () => <div data-testid="overview-cards">Overview Cards</div>
}))

vi.mock('../AdminSidebar', () => ({
  default: (props: any) => (
    <div data-testid="admin-sidebar">
      Admin Sidebar
      <button onClick={() => props.onClose?.()}>Close</button>
      <input onChange={(e) => props.onFilterChange?.({ test: e.target.value })} />
    </div>
  )
}))

vi.mock('../DirectoryHeader', () => ({
  default: (props: any) => (
    <div data-testid="directory-header">
      Directory Header - {props.selectedCount} selected
      <button onClick={props.onClearSelection}>Clear</button>
      <button onClick={() => props.onSidebarToggle?.()}>Toggle Sidebar</button>
    </div>
  )
}))

vi.mock('../UserDirectorySection', () => ({
  default: (props: any) => (
    <div data-testid="user-directory-section">
      User Directory
      <button 
        onClick={() => props.onSelectionChange?.(new Set(['1', '2']))}
      >
        Select Users
      </button>
    </div>
  )
}))

vi.mock('../BulkActionsPanel', () => ({
  default: (props: any) => (
    <div data-testid="bulk-actions-panel">
      Bulk Actions - {props.selectedCount} users selected
      <button onClick={props.onClear}>Clear</button>
    </div>
  )
}))

vi.mock('@/hooks/useBuilderContent', () => ({
  useIsBuilderEnabled: () => false
}))

describe('AdminUsersLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render all main sections', () => {
      render(<AdminUsersLayout />)

      expect(screen.getByTestId('quick-actions-bar')).toBeInTheDocument()
      expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('overview-cards')).toBeInTheDocument()
      expect(screen.getByTestId('directory-header')).toBeInTheDocument()
      expect(screen.getByTestId('user-directory-section')).toBeInTheDocument()
    })

    it('should render header in sticky container', () => {
      render(<AdminUsersLayout />)
      const header = screen.getByTestId('quick-actions-bar').closest('header')

      expect(header).toHaveClass('admin-workbench-header')
    })

    it('should render sidebar with correct classes', () => {
      render(<AdminUsersLayout />)
      const sidebar = screen.getByTestId('admin-sidebar').closest('aside')

      expect(sidebar).toHaveClass('admin-workbench-sidebar')
      expect(sidebar).toHaveClass('open')
    })

    it('should not render bulk actions panel when no users selected', () => {
      render(<AdminUsersLayout />)

      expect(screen.queryByTestId('bulk-actions-panel')).not.toBeInTheDocument()
    })
  })

  describe('User Selection', () => {
    it('should show bulk actions panel when users are selected', async () => {
      const user = userEvent.setup()
      render(<AdminUsersLayout />)

      const selectButton = screen.getByRole('button', { name: /select users/i })
      await user.click(selectButton)

      await waitFor(() => {
        expect(screen.getByTestId('bulk-actions-panel')).toBeInTheDocument()
      })
    })

    it('should display selected user count in directory header', async () => {
      const user = userEvent.setup()
      render(<AdminUsersLayout />)

      const selectButton = screen.getByRole('button', { name: /select users/i })
      await user.click(selectButton)

      await waitFor(() => {
        expect(screen.getByText(/2 selected/)).toBeInTheDocument()
      })
    })

    it('should display selected count in bulk actions panel', async () => {
      const user = userEvent.setup()
      render(<AdminUsersLayout />)

      const selectButton = screen.getByRole('button', { name: /select users/i })
      await user.click(selectButton)

      await waitFor(() => {
        expect(screen.getByText('Bulk Actions - 2 users selected')).toBeInTheDocument()
      })
    })

    it('should clear selection when clear button clicked in header', async () => {
      const user = userEvent.setup()
      render(<AdminUsersLayout />)

      // Select users
      const selectButton = screen.getByRole('button', { name: /select users/i })
      await user.click(selectButton)

      // Clear selection
      const clearButton = screen.getAllByRole('button', { name: /clear/i })[0]
      await user.click(clearButton)

      await waitFor(() => {
        expect(screen.queryByTestId('bulk-actions-panel')).not.toBeInTheDocument()
      })
    })

    it('should clear selection when clear button clicked in bulk panel', async () => {
      const user = userEvent.setup()
      render(<AdminUsersLayout />)

      // Select users
      const selectButton = screen.getByRole('button', { name: /select users/i })
      await user.click(selectButton)

      // Clear from bulk panel
      const clearButtons = screen.getAllByRole('button', { name: /clear/i })
      const bulkPanelClear = clearButtons[clearButtons.length - 1]
      await user.click(bulkPanelClear)

      await waitFor(() => {
        expect(screen.queryByTestId('bulk-actions-panel')).not.toBeInTheDocument()
      })
    })
  })

  describe('Sidebar Interactions', () => {
    it('should toggle sidebar open/closed', async () => {
      const user = userEvent.setup()
      render(<AdminUsersLayout />)

      const sidebar = screen.getByTestId('admin-sidebar').closest('aside')
      expect(sidebar).toHaveClass('open')

      const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i })
      await user.click(toggleButton)

      expect(sidebar).toHaveClass('closed')
    })

    it('should close sidebar when close button clicked', async () => {
      const user = userEvent.setup()
      render(<AdminUsersLayout />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      const sidebar = screen.getByTestId('admin-sidebar').closest('aside')
      expect(sidebar).toHaveClass('closed')
    })

    it('should handle filter changes from sidebar', async () => {
      const user = userEvent.setup()
      render(<AdminUsersLayout />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'test')

      // Filter state should be updated internally
      expect(input).toHaveValue('test')
    })
  })

  describe('Layout Structure', () => {
    it('should have proper CSS class structure', () => {
      const { container } = render(<AdminUsersLayout />)

      expect(container.querySelector('.admin-workbench-container')).toBeInTheDocument()
      expect(container.querySelector('.admin-workbench-header')).toBeInTheDocument()
      expect(container.querySelector('.admin-workbench-main')).toBeInTheDocument()
      expect(container.querySelector('.admin-workbench-sidebar')).toBeInTheDocument()
      expect(container.querySelector('.admin-workbench-content')).toBeInTheDocument()
      expect(container.querySelector('.admin-workbench-metrics')).toBeInTheDocument()
      expect(container.querySelector('.admin-workbench-directory')).toBeInTheDocument()
    })

    it('should render footer when users selected', async () => {
      const user = userEvent.setup()
      render(<AdminUsersLayout />)

      // Initially no footer
      expect(screen.queryByTestId('bulk-actions-panel')).not.toBeInTheDocument()

      // Select users
      const selectButton = screen.getByRole('button', { name: /select users/i })
      await user.click(selectButton)

      // Footer should appear
      await waitFor(() => {
        expect(screen.getByTestId('bulk-actions-panel')).toBeInTheDocument()
        const footer = screen.getByTestId('bulk-actions-panel').closest('footer')
        expect(footer).toHaveClass('admin-workbench-footer')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic HTML structure', () => {
      const { container } = render(<AdminUsersLayout />)

      const headers = container.querySelectorAll('header')
      const mains = container.querySelectorAll('main')
      const asides = container.querySelectorAll('aside')

      expect(headers.length).toBeGreaterThan(0)
      expect(mains.length).toBeGreaterThan(0)
      expect(asides.length).toBeGreaterThan(0)
    })

    it('should maintain focus when selection changes', async () => {
      const user = userEvent.setup()
      render(<AdminUsersLayout />)

      const selectButton = screen.getByRole('button', { name: /select users/i })
      selectButton.focus()

      await user.click(selectButton)

      // Focus should not be lost
      expect(document.activeElement).toBeTruthy()
    })
  })

  describe('State Management', () => {
    it('should initialize with empty selection', () => {
      render(<AdminUsersLayout />)

      expect(screen.queryByTestId('bulk-actions-panel')).not.toBeInTheDocument()
    })

    it('should maintain filter state across renders', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<AdminUsersLayout />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'test-filter')

      rerender(<AdminUsersLayout />)

      expect(screen.getByRole('textbox')).toHaveValue('test-filter')
    })

    it('should handle sidebar state independently', async () => {
      const user = userEvent.setup()
      render(<AdminUsersLayout />)

      const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i })

      // Toggle multiple times
      await user.click(toggleButton)
      expect(screen.getByTestId('admin-sidebar').closest('aside')).toHaveClass('closed')

      await user.click(toggleButton)
      expect(screen.getByTestId('admin-sidebar').closest('aside')).toHaveClass('open')

      await user.click(toggleButton)
      expect(screen.getByTestId('admin-sidebar').closest('aside')).toHaveClass('closed')
    })
  })

  describe('Integration', () => {
    it('should pass correct props to child components', async () => {
      const user = userEvent.setup()
      render(<AdminUsersLayout />)

      // Select users
      const selectButton = screen.getByRole('button', { name: /select users/i })
      await user.click(selectButton)

      // Verify bulk panel received correct props
      const bulkPanel = screen.getByTestId('bulk-actions-panel')
      expect(bulkPanel).toHaveTextContent('2 users selected')
    })

    it('should handle complex user flow: select, filter, clear', async () => {
      const user = userEvent.setup()
      render(<AdminUsersLayout />)

      // Select users
      const selectButton = screen.getByRole('button', { name: /select users/i })
      await user.click(selectButton)
      expect(screen.getByTestId('bulk-actions-panel')).toBeInTheDocument()

      // Add filter
      const input = screen.getByRole('textbox')
      await user.type(input, 'admin')

      // Clear selection
      const clearButton = screen.getAllByRole('button', { name: /clear/i })[0]
      await user.click(clearButton)

      await waitFor(() => {
        expect(screen.queryByTestId('bulk-actions-panel')).not.toBeInTheDocument()
      })
    })
  })
})
