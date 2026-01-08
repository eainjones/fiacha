'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const navLinks = [
    { href: '/', label: 'Dashboard', checkExact: true },
    { href: '/politicians', label: 'Politicians' },
    { href: '/promises', label: 'Promises' },
    { href: '/parties', label: 'Parties' },
    { href: '/counties', label: 'Counties' },
  ]
  const visibleLinks = user
    ? [...navLinks, { href: '/review-queue', label: 'Review Queue' }, { href: '/admin/review', label: 'Admin Review' }]
    : navLinks

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 dark:bg-slate-900 dark:border-slate-700" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity" aria-label="Fiacha home">
              <Logo size="sm" />
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-10 sm:flex sm:space-x-1">
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    link.checkExact
                      ? isActive('/') && !pathname.includes('/promises') && !pathname.includes('/politicians') && !pathname.includes('/add') && !pathname.includes('/counties')
                        ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                      : isActive(link.href)
                        ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                  }`}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <Link
                  href="/add"
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  + Add New
                </Link>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/add"
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  + Add New
                </Link>
                <Link
                  href="/auth/sign-in"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`sm:hidden transition-all duration-200 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
      >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                link.checkExact
                  ? isActive('/') && !pathname.includes('/promises') && !pathname.includes('/politicians') && !pathname.includes('/add') && !pathname.includes('/counties')
                    ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                  : isActive(link.href)
                    ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
              aria-current={isActive(link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-4 pb-2 border-t border-gray-100 dark:border-slate-700">
            {user ? (
              <>
                <Link
                  href="/add"
                  className="block w-full text-center px-3 py-2 rounded-md text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  + Add New
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left mt-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/add"
                  className="block w-full text-center px-3 py-2 rounded-md text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  + Add New
                </Link>
                <Link
                  href="/auth/sign-in"
                  className="block w-full text-center mt-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
