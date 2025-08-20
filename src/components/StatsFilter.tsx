interface StatsFilterProps {
  years: number[]
  selectedYear: number | null
  onYearChange: (year: number | null) => void
  showQualified?: boolean
  qualified: boolean
  onQualifiedChange: (qualified: boolean) => void
}

export default function StatsFilter({
  years,
  selectedYear,
  onYearChange,
  showQualified = true,
  qualified,
  onQualifiedChange,
}: StatsFilterProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4">
      {selectedYear !== null && (
        <div className="flex items-center space-x-2">
          <label htmlFor="year" className="text-sm font-medium text-gray-700">
            Season
          </label>
          <select
            id="year"
            value={selectedYear ?? ''}
            onChange={(e) => onYearChange(e.target.value ? parseInt(e.target.value) : null)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      )}

      {showQualified && (
        <div className="flex items-center space-x-2">
          <input
            id="qualified"
            type="checkbox"
            checked={qualified}
            onChange={(e) => onQualifiedChange(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="qualified" className="text-sm font-medium text-gray-700">
            Qualified Players Only
          </label>
        </div>
      )}
    </div>
  )
}