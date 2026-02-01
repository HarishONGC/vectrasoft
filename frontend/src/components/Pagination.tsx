import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/Button'

interface PaginationProps {
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

export function Pagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // Generate limited page numbers for display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5 // Maximum page buttons to show

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg bg-surface2/50 px-4 py-3 border border-border">
      {/* Info text - hidden on mobile */}
      <div className="hidden sm:block text-xs font-semibold text-muted">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>

      {/* Mobile: Simplified info */}
      <div className="sm:hidden text-xs font-semibold text-muted">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center gap-2">
        {/* Page size selector - hidden on mobile */}
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(parseInt(e.target.value))
              onPageChange(1) // Reset to first page
            }}
            className="hidden sm:block rounded-md bg-slate-200 dark:bg-slate-700 px-2 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 border border-border hover:bg-slate-300 dark:hover:bg-slate-600 transition focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="4">4 per page</option>
            <option value="6">6 per page</option>
            <option value="9">9 per page</option>
            <option value="16">16 per page</option>
            <option value="25">25 per page</option>
          </select>
        )}

        <Button
          variant="secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 px-2"
        >
          <ChevronLeft size={16} />
        </Button>

        {/* Desktop: Show page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((page, index) => (
            typeof page === 'number' ? (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`h-8 w-8 rounded-md text-xs font-medium transition ${
                  page === currentPage
                    ? 'bg-brand-500 text-white border border-brand-600'
                    : 'bg-surface text-muted hover:bg-surface2 border border-border'
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={`ellipsis-${index}`} className="px-2 text-muted">
                {page}
              </span>
            )
          ))}
        </div>

        {/* Mobile: Show current page only */}
        <div className="sm:hidden flex items-center gap-1">
          <div className="h-8 px-3 rounded-md bg-brand-500 text-white border border-brand-600 text-xs font-medium flex items-center justify-center">
            {currentPage}
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 px-2"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
