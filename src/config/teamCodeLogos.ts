export type TeamCodeMeta = { name: string; logo: string }

export const TEAM_CODE_MAP: Record<string, TeamCodeMeta> = {
  "100": { name: "100% Real Juice", logo: "percent-real-juice-logo.png" },
  "BB": { name: "The Bungalow Boys", logo: "bungalow-boys-logo.png" },
  "BS": { name: "Bilabial Stops", logo: "bilabial-stops-logo.png" },
  "BSX": { name: "Blue Sox", logo: "blue-sox-logo.png" },
  "CAN": { name: "Cannonball Coming", logo: "cannonball-coming-logo.png" },
  "CNW": { name: "Chicken'n'Wiffles", logo: "chicken-n-wiffles-logo.png" },
  "RBI": { name: "RBI Steaks", logo: "rbi-steaks-logo.png" },
  "SHRL": { name: "Sheryl Crows", logo: "sheryl-crows-logo.png" },
  "WCW": { name: "West Coast Washout", logo: "west-coast-washout-logo.png" },
  "WH": { name: "Wiffle House", logo: "wiffle-house-logo.png" },
  "SK": { name: "Skull Knights", logo: "berzerkers-logo.png" },
  "DAS": { name: "Dingers and Swingers", logo: "american-dreams-logo.png" },
  "SD": { name: "Swing Dome", logo: "swingdome-logo.png" },
  "CC": { name: "Caught Cooking", logo: "caught-cooking-logo.png" },
}

export function resolveTeamByCode(code?: string): { name?: string; logoUrl?: string } {
  if (!code) return {}
  const meta = TEAM_CODE_MAP[code.toUpperCase()]
  if (!meta) return {}
  return { name: meta.name, logoUrl: `/images/teams/${meta.logo}` }
}
