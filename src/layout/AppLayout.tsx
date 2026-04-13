import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import type { User } from 'firebase/auth'

type Props = {
  user: User
  onLogout: () => Promise<void>
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return 'U'
  const first = parts[0]?.[0] ?? ''
  const last = (parts.length > 1 ? parts[parts.length - 1] : parts[0])?.[0] ?? ''
  return (first + last).toUpperCase()
}

function navClass({ isActive }: { isActive: boolean }) {
  return [
    'flex items-center rounded-md px-3 py-2 text-sm transition',
    isActive
      ? 'bg-indigo-600 text-white'
      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60 dark:hover:text-white',
  ].join(' ')
}

type Crumb = {
  label: string
  to?: string
}

function buildBreadcrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('?')[0]?.split('#')[0]?.split('/').filter(Boolean) ?? []
  const crumbs: Crumb[] = [{ label: 'Dashboard', to: '/' }]

  if (segments.length === 0) return crumbs

  const [root, a, b, c] = segments

  if (root === 'students') {
    crumbs.push({ label: "O'quvchilar", to: '/students' })

    if (a === 'new') {
      crumbs.push({ label: "O'quvchi qo'shish" })
      return crumbs
    }

    if (a) {
      crumbs.push({ label: `O'quvchi: ${a}`, to: `/students/${a}` })
    }

    if (b === 'exam') {
      crumbs.push({ label: 'Tekshiruv' })
      return crumbs
    }

    if (b === 'exams' && c) {
      crumbs.push({ label: 'Tekshiruvlar', to: `/students/${a}/exams` })
      crumbs.push({ label: `Tekshiruv: ${c}` })
      return crumbs
    }

    return crumbs
  }

  if (root === 'nurses') {
    crumbs.push({ label: 'Hamshiralar', to: '/nurses' })

    if (a === 'new') {
      crumbs.push({ label: "Hamshira qo'shish" })
      return crumbs
    }

    if (a) {
      crumbs.push({ label: `Hamshira: ${a}` })
      return crumbs
    }

    return crumbs
  }

  if (root === 'settings') {
    crumbs.push({ label: 'Sozlamalar' })
    return crumbs
  }

  return crumbs
}

export default function AppLayout({ user, onLogout }: Props) {
  const name = user.displayName ?? user.email ?? 'User'
  const avatarUrl = user.photoURL
  const initials = getInitials(name)

  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const wasStudentsRoute = useRef(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  })

  useEffect(() => {
    const pathname = location.pathname
    const onStudentsRoute = pathname.startsWith('/students')
    const onStudentsList = pathname === '/students'
    const onAddStudent = pathname === '/students/new'
    const onStudentsInner = pathname.startsWith('/students/') && !onAddStudent

    if (onStudentsInner) {
      setSidebarOpen(false)
    } else if (onStudentsRoute && (onStudentsList || onAddStudent)) {
      setSidebarOpen(true)
    } else if (wasStudentsRoute.current && !onStudentsRoute) {
      setSidebarOpen(true)
    }

    wasStudentsRoute.current = onStudentsRoute
  }, [location.pathname])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const breadcrumbs = buildBreadcrumbs(location.pathname)

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-300/35 via-sky-200/30 to-transparent blur-3xl dark:from-indigo-500/35 dark:via-cyan-400/20" />
        <div className="absolute -bottom-44 -left-24 h-[560px] w-[560px] rounded-full bg-gradient-to-tr from-fuchsia-300/28 via-indigo-200/22 to-transparent blur-3xl dark:from-fuchsia-500/25 dark:via-indigo-400/15" />
        <div className="absolute right-[-120px] top-[18%] h-[460px] w-[460px] rounded-full bg-gradient-to-tr from-amber-200/28 via-rose-200/24 to-transparent blur-3xl dark:from-amber-400/20 dark:via-rose-400/20" />
      </div>
      {!sidebarOpen ? (
        <button
          className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white/90 text-slate-700 shadow-sm backdrop-blur hover:bg-white dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900 md:left-6 md:top-6"
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Sidebar ochish"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        </button>
      ) : null}
      <div className="flex min-h-screen">
        <aside
          className={[
            'sticky top-0 hidden h-screen shrink-0 self-start overflow-y-auto overflow-hidden bg-white/90 backdrop-blur md:block dark:bg-slate-950/70',
            'transition-[width] duration-300 ease-in-out',
            sidebarOpen ? 'w-64 border-r border-slate-200 dark:border-slate-800' : 'w-0 border-r-0',
          ].join(' ')}
        >
          <div className="relative p-5">
            <button
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Sidebar yopish"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>

            <div className="text-base font-semibold">BHS</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Boshqaruv paneli</div>
          </div>

          <nav className="px-3 pb-6">
            <div className="grid gap-1">
              <NavLink to="/" end className={navClass}>
                Dashboard
              </NavLink>
              <NavLink to="/nurses" className={navClass}>
                Hamshiralar
              </NavLink>
              <NavLink to="/students/new" end className={navClass}>
                O'quvchi qo'shish
              </NavLink>
              <NavLink to="/students" end className={navClass}>
                O'quvchilar ro'yxati
              </NavLink>
              <NavLink to="/settings" className={navClass}>
                Sozlamalar
              </NavLink>
            </div>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 p-4 md:p-6">
              <div className="md:hidden">
                <div className="text-sm font-semibold">BHS</div>
              </div>

              <nav className="hidden min-w-0 flex-1 md:block" aria-label="Breadcrumb">
                <ol className="flex min-w-0 items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  {breadcrumbs.map((c, idx) => {
                    const isLast = idx === breadcrumbs.length - 1
                    return (
                      <li key={`${c.label}-${idx}`} className="flex min-w-0 items-center gap-2">
                        {idx > 0 ? <span className="text-slate-300 dark:text-slate-700">/</span> : null}
                        {c.to && !isLast ? (
                          <Link className="truncate hover:text-slate-900 dark:hover:text-white" to={c.to}>
                            {c.label}
                          </Link>
                        ) : (
                          <span className={['truncate', isLast ? 'text-slate-900' : ''].join(' ')}>{c.label}</span>
                        )}
                      </li>
                    )
                  })}
                </ol>
              </nav>

              <div className="ml-auto flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white/80 text-slate-700 shadow-sm backdrop-blur hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900"
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Kunduzgi rejim' : 'Tungi rejim'}
                  title={theme === 'dark' ? 'Kunduzgi rejim' : 'Tungi rejim'}
                >
                  {theme === 'dark' ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
                      <path d="M12 2v2" />
                      <path d="M12 20v2" />
                      <path d="m4.93 4.93 1.41 1.41" />
                      <path d="m17.66 17.66 1.41 1.41" />
                      <path d="M2 12h2" />
                      <path d="M20 12h2" />
                      <path d="m6.34 17.66-1.41 1.41" />
                      <path d="m19.07 4.93-1.41 1.41" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
                    </svg>
                  )}
                </button>
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="h-9 w-9 rounded-full border border-slate-200 object-cover dark:border-slate-800"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{name}</div>
                    {user.email ? (
                      <div className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                    ) : null}
                  </div>
                </div>

                <button
                  className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                  onClick={() => void onLogout()}
                >
                  Chiqish
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
