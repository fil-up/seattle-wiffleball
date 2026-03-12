import Link from 'next/link'

interface PodiumPlayer {
  rank: number
  name: string
  playerId: string
  value: string | number
  team?: string
}

interface LeaderboardPodiumProps {
  title: string
  players: PodiumPlayer[]
}

const PODIUM_CONFIG = [
  {
    order: 1,
    border: 'border-content-secondary',
    bg: 'bg-surface-secondary',
    badgeBg: 'bg-content-secondary',
    padding: 'pt-4 pb-3',
    textSize: 'text-lg',
    valueSize: 'text-xl',
    label: '2nd',
  },
  {
    order: 0,
    border: 'border-brand-gold',
    bg: 'bg-brand-gold/10',
    badgeBg: 'bg-brand-gold',
    padding: 'pt-6 pb-4',
    textSize: 'text-xl',
    valueSize: 'text-2xl',
    label: '1st',
  },
  {
    order: 2,
    border: 'border-amber-700',
    bg: 'bg-amber-700/10',
    badgeBg: 'bg-amber-700',
    padding: 'pt-3 pb-3',
    textSize: 'text-base',
    valueSize: 'text-lg',
    label: '3rd',
  },
]

export default function LeaderboardPodium({ title, players }: LeaderboardPodiumProps) {
  if (players.length === 0) return null

  const podiumPlayers = players.slice(0, 3)
  const restPlayers = players.slice(3, 10)
  const showPodium = podiumPlayers.length >= 3

  return (
    <div>
      <h3 className="text-lg font-semibold text-content-primary mb-3">{title}</h3>

      {showPodium ? (
        <div className="flex items-end justify-center gap-3 md:gap-4 mb-4">
          {[1, 0, 2].map((podiumIdx) => {
            const player = podiumPlayers[podiumIdx]
            const config = PODIUM_CONFIG[podiumIdx === 0 ? 1 : podiumIdx === 1 ? 0 : 2]
            if (!player) return null

            return (
              <div
                key={player.playerId + player.rank}
                className={`w-1/3 border-t-4 ${config.border} ${config.bg} rounded-b-lg ${config.padding} px-3 text-center`}
              >
                <div
                  className={`${config.badgeBg} text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 font-bold ${config.textSize}`}
                >
                  {player.rank}
                </div>
                <Link
                  href={`/stats/players/${player.playerId}`}
                  className="text-brand-navy dark:text-brand-gold hover:text-brand-navy/80 dark:hover:text-brand-gold/80 font-medium text-sm block truncate"
                >
                  {player.name}
                </Link>
                {player.team && (
                  <span className="text-xs text-content-secondary block mt-0.5">{player.team}</span>
                )}
                <div className={`${config.valueSize} font-bold text-content-primary mt-1`}>
                  {player.value}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="mb-4">
          {podiumPlayers.map((player) => (
            <div
              key={player.playerId + player.rank}
              className="flex justify-between items-center py-2 border-b border-border"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-content-secondary w-6">{player.rank}</span>
                <Link
                  href={`/stats/players/${player.playerId}`}
                  className="text-sm text-brand-navy dark:text-brand-gold hover:text-brand-navy/80 dark:hover:text-brand-gold/80"
                >
                  {player.name}
                </Link>
              </div>
              <span className="text-sm font-semibold text-content-primary">{player.value}</span>
            </div>
          ))}
        </div>
      )}

      {restPlayers.length > 0 && (
        <div>
          {restPlayers.map((player) => (
            <div
              key={player.playerId + player.rank}
              className="flex justify-between items-center py-2 border-b border-border"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-content-secondary w-6">{player.rank}</span>
                <Link
                  href={`/stats/players/${player.playerId}`}
                  className="text-sm text-brand-navy dark:text-brand-gold hover:text-brand-navy/80 dark:hover:text-brand-gold/80"
                >
                  {player.name}
                </Link>
              </div>
              <span className="text-sm font-semibold text-content-primary">{player.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
