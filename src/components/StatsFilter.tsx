interface StatsFilterProps {
  years: number[]
  selectedYear: number | null
  onYearChange: (year: number | null) => void
  teams?: string[]
  selectedTeam?: string | null
  onTeamChange?: (team: string | null) => void
  showQualified?: boolean
  qualified: boolean
  onQualifiedChange: (qualified: boolean) => void
}

export default function StatsFilter({
  years,
  selectedYear,
  onYearChange,
  teams = [],
  selectedTeam = null,
  onTeamChange,
  showQualified = true,
  qualified,
  onQualifiedChange,
}: StatsFilterProps) {
  return (
    <div className="bg-surface-card border border-border rounded-lg p-4 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
      {selectedYear !== null && (
        <div className="flex items-center gap-2">
          <label htmlFor="year" className="text-sm font-semibold text-content-primary">
            Season
          </label>
          <select
            id="year"
            value={selectedYear ?? ''}
            onChange={(e) => onYearChange(e.target.value ? parseInt(e.target.value) : null)}
            className="bg-surface-primary border border-border rounded-md px-3 py-2 text-sm text-content-primary focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-colors"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      )}

      {teams.length > 0 && onTeamChange && (
        <div className="flex items-center gap-2">
          <label htmlFor="team" className="text-sm font-semibold text-content-primary">
            Team
          </label>
          <select
            id="team"
            value={selectedTeam ?? ''}
            onChange={(e) => onTeamChange(e.target.value || null)}
            className="bg-surface-primary border border-border rounded-md px-3 py-2 text-sm text-content-primary focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-colors"
          >
            <option value="">All Teams</option>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>
      )}

      {showQualified && (
        <div className="flex items-center gap-2">
          <input
            id="qualified"
            type="checkbox"
            checked={qualified}
            onChange={(e) => onQualifiedChange(e.target.checked)}
            className="h-4 w-4 rounded border-border text-brand-navy focus:ring-brand-gold accent-brand-navy"
          />
          <label htmlFor="qualified" className="text-sm font-semibold text-content-primary">
            Qualified Players Only
          </label>
        </div>
      )}
    </div>
  )
}
