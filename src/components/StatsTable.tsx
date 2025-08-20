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
import Link from 'next/link'

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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, idx) => (
                <th
                  key={header.id}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${idx < stickyFirstCols ? 'sticky z-20 bg-gray-50' : ''}`}
                  style={idx < stickyFirstCols ? { left: stickyLefts[idx], minWidth: (columnWidthsPx[idx] ?? 160) } : { minWidth: (columnWidthsPx[idx] ?? undefined) }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center space-x-1">
                    <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                    <span>
                      {header.column.getIsSorted() === 'asc' && '↑'}
                      {header.column.getIsSorted() === 'desc' && '↓'}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, rIdx) => (
            <tr key={row.id} className={`${zebra ? (rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50') : 'bg-white'} hover:bg-gray-100`}>
              {row.getVisibleCells().map((cell, idx) => (
                <td
                  key={cell.id}
                  className={`px-6 py-3 whitespace-nowrap text-sm text-gray-900 ${idx < stickyFirstCols ? 'sticky z-10 bg-inherit' : ''}`}
                  style={idx < stickyFirstCols ? { left: stickyLefts[idx], minWidth: (columnWidthsPx[idx] ?? 160) } : { minWidth: (columnWidthsPx[idx] ?? undefined) }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {showPagination && (
        <div className="py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex gap-x-2">
              <span className="text-sm text-gray-700">
                Page <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> of{' '}
                <span className="font-medium">{table.getPageCount()}</span>
              </span>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}