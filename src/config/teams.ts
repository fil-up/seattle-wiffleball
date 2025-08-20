export const teams = [
  {
    id: '100-percent-real-juice',
    name: '100% Real Juice',
    logoPath: '/images/teams/100-percent-real-juice.png'
  },
  {
    id: 'american-dreams',
    name: 'American Dreams',
    logoPath: '/images/teams/american-dreams-logo.png'
  },
  {
    id: 'berzerkers',
    name: 'Berzerkers',
    logoPath: '/images/teams/berzerkers-logo.png'
  },
  {
    id: 'bilabial-stops',
    name: 'Bilabial Stops',
    logoPath: '/images/teams/bilabial-stops-logo.png'
  },
  {
    id: 'caught-cooking',
    name: 'Caught Cooking',
    logoPath: '/images/teams/caught-cooking-logo.png'
  },
  {
    id: 'chicken-n-wiffles',
    name: "Chicken n' Wiffles",
    logoPath: '/images/teams/chicken-n-wiffles-logo.png'
  },
  {
    id: 'sheryl-crows',
    name: 'Sheryl Crows',
    logoPath: '/images/teams/sheryl-crows-logo.png'
  },
  {
    id: 'swingdome',
    name: 'Swingdome',
    logoPath: '/images/teams/swingdome-logo.png'
  },
  {
    id: 'west-coast-washout',
    name: 'West Coast Washout',
    logoPath: '/images/teams/west-coast-washout-logo.png'
  },
  {
    id: 'wiffle-house',
    name: 'Wiffle House',
    logoPath: '/images/teams/wiffle-house-logo.png'
  }
]

export const getTeamById = (id: string) => {
  return teams.find(team => team.id === id)
}

export const getTeamByName = (name: string) => {
  return teams.find(team => team.name === name)
}
