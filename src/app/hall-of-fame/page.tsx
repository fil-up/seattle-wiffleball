import Image from 'next/image'
import hallOfFameData from '@/data/hall-of-fame.json'

interface HallOfFameEntry {
  id: string
  name: string
  inductionYear: number
  image: string
  bio: string
  seasonsPlayed: number
  teams: string[]
  awards: string[]
  careerStats: {
    games?: number | null
    avg?: number | null
    homeRuns?: number | null
    ops?: number | null
    wrcPlus?: number | null
    wins?: number | null
    losses?: number | null
    era?: number | null
    strikeouts?: number | null
    whip?: number | null
  }
}

function TrophyIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 15.5a5.5 5.5 0 005.5-5.5V4h2a1 1 0 011 1v2a3 3 0 01-3 3h-.17A6.52 6.52 0 0112 15.5zm0 0a5.5 5.5 0 01-5.5-5.5V4h-2a1 1 0 00-1 1v2a3 3 0 003 3h.17A6.52 6.52 0 0012 15.5zM9 18h6v2H9v-2zm-1 3h8v1H8v-1zM7.5 4h9V10a4.5 4.5 0 11-9 0V4z" />
    </svg>
  )
}

function StarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

const AWARD_ICONS: Record<string, typeof TrophyIcon> = {
  'MVP': TrophyIcon,
  'Cy Young': StarIcon,
  'Batting Title': StarIcon,
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatStat(value: number, decimals: number): string {
  return value.toFixed(decimals)
}

function HittingStats({ stats }: { stats: HallOfFameEntry['careerStats'] }) {
  const entries: { label: string; value: string }[] = []

  if (stats.avg != null) entries.push({ label: 'AVG', value: formatStat(stats.avg, 3) })
  if (stats.homeRuns != null) entries.push({ label: 'HR', value: String(stats.homeRuns) })
  if (stats.ops != null) entries.push({ label: 'OPS', value: formatStat(stats.ops, 3) })
  if (stats.wrcPlus != null) entries.push({ label: 'wRC+', value: String(stats.wrcPlus) })

  if (entries.length === 0) return null

  return (
    <div>
      <h4 className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2">Hitting</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {entries.map((e) => (
          <div key={e.label} className="bg-surface-secondary rounded-md px-3 py-2 text-center">
            <div className="text-lg font-bold text-content-primary">{e.value}</div>
            <div className="text-xs text-content-secondary">{e.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PitchingStats({ stats }: { stats: HallOfFameEntry['careerStats'] }) {
  const entries: { label: string; value: string }[] = []

  if (stats.wins != null && stats.losses != null) {
    entries.push({ label: 'W-L', value: `${stats.wins}-${stats.losses}` })
  } else if (stats.wins != null) {
    entries.push({ label: 'W', value: String(stats.wins) })
  }
  if (stats.era != null) entries.push({ label: 'ERA', value: formatStat(stats.era, 2) })
  if (stats.strikeouts != null) entries.push({ label: 'K', value: String(stats.strikeouts) })
  if (stats.whip != null) entries.push({ label: 'WHIP', value: formatStat(stats.whip, 2) })

  if (entries.length === 0) return null

  return (
    <div>
      <h4 className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2">Pitching</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {entries.map((e) => (
          <div key={e.label} className="bg-surface-secondary rounded-md px-3 py-2 text-center">
            <div className="text-lg font-bold text-content-primary">{e.value}</div>
            <div className="text-xs text-content-secondary">{e.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlayerCard({ entry }: { entry: HallOfFameEntry }) {
  const initials = getInitials(entry.name)

  return (
    <div className="bg-surface-card rounded-lg shadow-md overflow-hidden mb-8">
      <div className="flex flex-col md:flex-row">
        {/* Bust image / placeholder */}
        <div className="flex-shrink-0 flex items-center justify-center bg-surface-secondary p-6 md:w-72">
          <div className="relative w-48 h-48 md:w-56 md:h-56">
            <div className="absolute inset-0 flex items-center justify-center bg-brand-navy rounded-full">
              <span className="text-white text-4xl font-bold">{initials}</span>
            </div>
            <Image
              src={entry.image}
              alt={entry.name}
              width={300}
              height={300}
              className="relative rounded-full object-cover w-full h-full z-10"
              unoptimized
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-content-primary">{entry.name}</h2>
          <p className="text-sm text-content-secondary mt-1">
            Class of {entry.inductionYear}
            {entry.teams.length > 0 && <> &bull; {entry.teams.join(', ')}</>}
            {entry.seasonsPlayed > 0 && <> &bull; {entry.seasonsPlayed} seasons</>}
          </p>

          {/* Awards */}
          {entry.awards.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {entry.awards.map((award) => {
                const Icon = AWARD_ICONS[award]
                return (
                  <span
                    key={award}
                    className="inline-flex items-center gap-1.5 bg-brand-navy/10 dark:bg-brand-gold/20 text-brand-navy dark:text-brand-gold px-3 py-1 rounded-full text-sm font-medium"
                    title={award}
                  >
                    {Icon && <Icon className="fill-brand-gold" />}
                    {award}
                  </span>
                )
              })}
            </div>
          )}

          {/* Bio */}
          <p className="text-content-primary leading-relaxed mt-4">{entry.bio}</p>

          {/* Career stats */}
          {(entry.careerStats.avg != null ||
            entry.careerStats.homeRuns != null ||
            entry.careerStats.ops != null ||
            entry.careerStats.wrcPlus != null ||
            entry.careerStats.wins != null ||
            entry.careerStats.era != null ||
            entry.careerStats.strikeouts != null ||
            entry.careerStats.whip != null) && (
            <div className="mt-6 space-y-4">
              <HittingStats stats={entry.careerStats} />
              <PitchingStats stats={entry.careerStats} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HallOfFamePage() {
  const entries = (hallOfFameData.inductees as HallOfFameEntry[])
    .filter((e) => !e.id.startsWith('template') && !e.name.startsWith('Template'))
    .sort((a, b) => b.inductionYear - a.inductionYear)

  return (
    <div>

      {/* Header */}
      <div className="bg-brand-navy text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Hall of Fame</h1>
          <p className="text-xl md:text-2xl text-blue-100">
            Honoring the legends of Seattle Wiffleball
          </p>
        </div>
      </div>

      {/* Player cards */}
      <div className="container mx-auto px-4 py-16">
        {entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-content-secondary">No inductees yet — check back soon</p>
          </div>
        ) : (
          entries.map((entry) => <PlayerCard key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  )
}
