import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'

interface StatsTableProps<T> {
  data: T[]
  columns: ColumnDef<T, any>[]
  initialSortField?: string
  initialSortDesc?: boolean
  showPagination?: boolean
  zebra?: boolean
  stickyFirstCols?: number
  columnWidthsPx?: number[]
}

export default function StatsTable<T>({ 
  data, 
  columns, 
  initialSortField,
  initialSortDesc = true,
  showPagination = true,
  zebra = true,
  stickyFirstCols = 0,
  columnWidthsPx = [],
}: StatsTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(
    initialSortField ? [{ id: initialSortField, desc: initialSortDesc }] : []
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 50 },
    },
  })

  const stickyLefts = useMemo(() => {
    const lefts: number[] = []
    let acc = 0
    for (let i = 0; i < stickyFirstCols; i++) {
      lefts[i] = acc
      acc += columnWidthsPx[i] ?? 160
    }
    return lefts
  }, [stickyFirstCols, columnWidthsPx])

  return (
    <div className="overflow-auto max-h-[75vh] rounded-lg border border-border">
      <table className="min-w-full">
        <thead className="sticky top-0 z-30">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="bg-brand-navy">
              {headerGroup.headers.map((header, idx) => (
                <th
                  key={header.id}
                  className={`px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-brand-navy/80 transition-colors ${idx < stickyFirstCols ? 'sticky z-40 bg-brand-navy' : ''}`}
                  style={idx < stickyFirstCols ? { left: stickyLefts[idx], minWidth: (columnWidthsPx[idx] ?? 160) } : { minWidth: (columnWidthsPx[idx] ?? undefined) }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center space-x-1">
                    <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                    <span className={header.column.getIsSorted() ? 'text-brand-gold' : 'text-white/30'}>
                      {header.column.getIsSorted() === 'asc' ? '↑' :
                       header.column.getIsSorted() === 'desc' ? '↓' :
                       header.column.getCanSort() ? '⇅' : ''}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border">
          {table.getRowModel().rows.map((row, rIdx) => {
            const rowBg = zebra
              ? rIdx % 2 === 0 ? 'bg-surface-primary' : 'bg-table-stripe'
              : 'bg-surface-primary'
            return (
              <tr key={row.id} className={`${rowBg} hover:bg-table-hover transition-colors`}>
                {row.getVisibleCells().map((cell, idx) => (
                  <td
                    key={cell.id}
                    className={`px-4 py-3 whitespace-nowrap text-sm text-content-primary tabular-nums ${idx < stickyFirstCols ? `sticky z-10 ${rIdx % 2 === 0 ? 'bg-surface-primary' : 'bg-table-stripe'}` : ''}`}
                    style={idx < stickyFirstCols ? { left: stickyLefts[idx], minWidth: (columnWidthsPx[idx] ?? 160) } : { minWidth: (columnWidthsPx[idx] ?? undefined) }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>

      {showPagination && (
        <div className="py-3 px-4 flex items-center justify-between border-t border-border bg-surface-primary">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-content-primary bg-surface-card hover:bg-table-hover disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-content-primary bg-surface-card hover:bg-table-hover disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <span className="text-sm text-content-secondary">
              Page <span className="font-medium text-content-primary">{table.getState().pagination.pageIndex + 1}</span> of{' '}
              <span className="font-medium text-content-primary">{table.getPageCount()}</span>
            </span>
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-border bg-surface-card text-sm font-medium text-content-primary hover:bg-table-hover disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-border bg-surface-card text-sm font-medium text-content-primary hover:bg-table-hover disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
