import { NavLink, Outlet, useLocation } from 'react-router-dom'
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
      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ')
}

export default function AppLayout({ user, onLogout }: Props) {
  const name = user.displayName ?? user.email ?? 'User'
  const avatarUrl = user.photoURL
  const initials = getInitials(name)

  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const wasStudentsRoute = useRef(false)

  useEffect(() => {
    const onStudentsRoute = location.pathname.startsWith('/students')
    if (!wasStudentsRoute.current && onStudentsRoute) {
      setSidebarOpen(false)
    }
    if (wasStudentsRoute.current && !onStudentsRoute) {
      setSidebarOpen(true)
    }
    wasStudentsRoute.current = onStudentsRoute
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {!sidebarOpen ? (
        <button
          className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white/90 text-slate-700 shadow-sm backdrop-blur hover:bg-white md:left-6 md:top-6"
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
            'sticky top-0 hidden h-screen shrink-0 self-start overflow-y-auto overflow-hidden bg-white md:block',
            'transition-[width] duration-300 ease-in-out',
            sidebarOpen ? 'w-64 border-r border-slate-200' : 'w-0 border-r-0',
          ].join(' ')}
        >
          <div className="relative p-5">
            <button
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
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
            <div className="mt-1 text-xs text-slate-500">Boshqaruv paneli</div>
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
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 p-4 md:p-6">
              <div className="md:hidden">
                <div className="text-sm font-semibold">BHS</div>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{name}</div>
                    {user.email ? (
                      <div className="truncate text-xs text-slate-500">{user.email}</div>
                    ) : null}
                  </div>
                </div>

                <button
                  className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
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
