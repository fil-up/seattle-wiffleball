"use client"

import { useState } from 'react'
import Link from 'next/link'

const navLinks = [
  { href: '/', label: 'Home', icon: <path d="M10 2L2 8v10h6v-6h4v6h6V8l-8-6z"/> },
  { href: '/news', label: 'News', icon: <><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm2 2v2h8V7H6zm0 4v2h8v-2H6zm0 4v2h4v-2H6z"/></> },
  { href: '/stats/players', label: 'Players', icon: <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/> },
  { href: '/stats/teams', label: 'Teams', icon: <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/> },
  { href: '/leaderboards', label: 'Leaderboards', icon: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/> },
  { href: '/schedule', label: 'Schedule', icon: <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z"/> },
  { href: '/media', label: 'Media', icon: <path d="M6.5 5.5v9l7-4.5-7-4.5zM10 18a8 8 0 110-16 8 8 0 010 16z"/> },
]

export default function PageNavigation() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="bg-[#25397B] shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-white">Seattle Wiffle</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    {link.icon}
                  </svg>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="text-white hover:text-blue-200"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={menuOpen ? 'block md:hidden' : 'hidden'}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-blue-200 hover:bg-[#1e2f63] flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  {link.icon}
                </svg>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
