"use client"

import { useState } from 'react'

interface SeasonAccordionProps {
  year: number
  champion: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export default function SeasonAccordion({
  year,
  champion,
  children,
  defaultOpen = false,
}: SeasonAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-6 py-4 bg-surface-card hover:bg-table-hover transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-content-primary">{year}</span>
          <span className="text-content-secondary">—</span>
          <span className="text-content-primary font-medium">
            Champion: <span className="text-brand-navy">{champion}</span>
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-content-secondary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-surface-secondary border-t border-border">
          {children}
        </div>
      )}
    </div>
  )
}
