'use client'

import { useState, Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import ThemeToggle from './ThemeToggle'

const primaryLinks = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'Players', href: '/stats/players' },
  { label: 'Teams', href: '/teams' },
  { label: 'Leaderboards', href: '/leaderboards' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Media', href: '/media' },
]

const secondaryLinks = [
  { label: 'Rules', href: '/rules' },
  { label: 'Archives', href: '/archives' },
  { label: 'Info', href: '/info' },
  { label: 'Hall of Fame', href: '/hall-of-fame' },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href)
}

export default function SiteNavigation() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
    <div className="sticky top-0 z-50">
      {/* Desktop navigation */}
      <nav className="hidden md:block bg-brand-navy">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-1">
              <Link href="/" className="flex items-center gap-2 mr-4">
                <span className="text-white font-bold text-lg">Seattle Wiffle</span>
              </Link>
              {primaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(pathname, link.href)
                      ? 'text-white border-b-2 border-brand-gold'
                      : 'text-white/80 hover:text-brand-gold'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {secondaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(pathname, link.href)
                      ? 'text-white border-b-2 border-brand-gold'
                      : 'text-white/60 hover:text-brand-gold'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>
      {/* Desktop gold accent line */}
      <div className="hidden md:block bg-brand-gold h-[3px]" />

      {/* Mobile navigation */}
      <nav className="md:hidden bg-brand-navy">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">Seattle Wiffle</span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileOpen(true)}
                className="text-white p-1.5"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile gold accent line */}
      <div className="md:hidden bg-brand-gold h-[3px]" />
    </div>

      {/* Mobile slide-in panel */}
      <Transition show={mobileOpen} as={Fragment}>
        <Dialog onClose={() => setMobileOpen(false)} className="relative z-50 md:hidden">
          <TransitionChild
            as={Fragment}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="transition-transform duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="fixed inset-y-0 right-0 w-72 bg-surface-primary shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-bold text-content-primary">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-content-secondary hover:text-content-primary p-1"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="py-2">
                {primaryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-6 py-3 border-b border-border transition-colors ${
                      isActive(pathname, link.href)
                        ? 'text-brand-navy dark:text-brand-gold font-bold'
                        : 'text-content-primary hover:text-brand-navy dark:hover:text-brand-gold'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="px-6 pt-4 pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-content-secondary">More</span>
                </div>
                {secondaryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-6 py-3 border-b border-border transition-colors ${
                      isActive(pathname, link.href)
                        ? 'text-brand-navy dark:text-brand-gold font-bold'
                        : 'text-content-primary hover:text-brand-navy dark:hover:text-brand-gold'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  )
}
