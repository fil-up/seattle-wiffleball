export interface PlayerHittingStats {
  name: string;
  year: number;
  games: number;
  atBats: number;
  runs: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  rbis: number;
  walks: number;
  strikeouts: number;
  avg: number;
  obp: number;
  slg: number;
  ops: number;
}

export interface PlayerPitchingStats {
  name: string;
  year: number;
  games: number;
  inningsPitched: number;
  wins: number;
  losses: number;
  saves: number;
  strikeouts: number;
  walks: number;
  hits: number;
  runs: number;
  earnedRuns: number;
  era: number;
  whip: number;
}

export interface TeamStats {
  name: string;
  year: number;
  wins: number;
  losses: number;
  winningPercentage: number;
  runsScored: number;
  runsAllowed: number;
  runDifferential: number;
}

export interface Player {
  id: string;
  name: string;
  imageUrl?: string;
  careerHittingStats: PlayerHittingStats;
  careerPitchingStats: PlayerPitchingStats;
  yearlyHittingStats: PlayerHittingStats[];
  yearlyPitchingStats: PlayerPitchingStats[];
}
