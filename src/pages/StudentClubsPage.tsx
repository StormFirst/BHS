import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useParams } from 'react-router-dom'
import { listenStudent, type Student } from '../lib/firebase'

export default function StudentClubsPage() {
  const { id } = useParams()

  const [student, setStudent] = useState<Student | null>(null)
  const [loadingStudent, setLoadingStudent] = useState(true)

  useEffect(() => {
    if (!id) return
    const unsub = listenStudent(id, (s) => {
      setStudent(s)
      setLoadingStudent(false)
    })
    return () => unsub()
  }, [id])

  const fullName = useMemo(() => {
    const first = (student?.firstName ?? '').trim()
    const last = (student?.lastName ?? '').trim()
    return `${first} ${last}`.trim() || `O'quvchi: ${id ?? '-'}`
  }, [id, student?.firstName, student?.lastName])

  const ageLabel = useMemo(() => {
    const age = student?.age
    return Number.isFinite(age) ? `${age} yosh` : '-'
  }, [student?.age])

  const classLabel = useMemo(() => {
    return (student?.className ?? '').trim() || '-'
  }, [student?.className])

  type Club = {
    name: string
    schedule: string
    instructor: string
    status: 'active' | 'inactive'
    icon: 'sports' | 'art' | 'code' | 'music' | 'science' | 'debate'
  }

  const clubs: Club[] = useMemo(
    () => [
      { name: 'Futbol', schedule: 'Du/Chor/Ju 16:00', instructor: 'M. Ismoilov', status: 'active', icon: 'sports' },
      { name: 'Rassomchilik', schedule: 'Sesh/Pay 15:30', instructor: 'Z. Akbarova', status: 'active', icon: 'art' },
      { name: 'Coding Club', schedule: 'Shanba 11:00', instructor: 'I. Rustamov', status: 'active', icon: 'code' },
      { name: 'Musiqa', schedule: 'Juma 14:30', instructor: 'L. Tursunova', status: 'inactive', icon: 'music' },
      { name: 'Science Lab', schedule: 'Chorshanba 15:00', instructor: 'B. Haydarov', status: 'active', icon: 'science' },
      { name: 'Debate', schedule: 'Yakshanba 10:00', instructor: 'S. Qodirov', status: 'inactive', icon: 'debate' },
    ],
    [],
  )

  function tabClass({ isActive }: { isActive: boolean }) {
    return [
      'inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition',
      isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-slate-700 hover:bg-white hover:shadow-sm dark:text-slate-200 dark:hover:bg-slate-900/60',
    ].join(' ')
  }

  function statusBadge(status: Club['status']) {
    return status === 'active'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300'
      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-200'
  }

  function iconFor(kind: Club['icon']) {
    const base = 'h-5 w-5'
    switch (kind) {
      case 'sports':
        return (
          <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10" />
            <path d="M12 2a10 10 0 0 0 0 20" />
            <path d="M2 12h20" />
          </svg>
        )
      case 'art':
        return (
          <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22a10 10 0 1 0-10-10c0 3.5 2 6 5 6 1.5 0 2.5-1 4-1 1.5 0 2.5 1 4 1 3 0 5-2.5 5-6" />
            <path d="M7.5 10h.01" />
            <path d="M12 8h.01" />
            <path d="M16.5 10h.01" />
          </svg>
        )
      case 'code':
        return (
          <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m16 18 6-6-6-6" />
            <path d="m8 6-6 6 6 6" />
            <path d="m14 4-4 16" />
          </svg>
        )
      case 'music':
        return (
          <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="7" cy="18" r="3" />
            <circle cx="19" cy="16" r="3" />
          </svg>
        )
      case 'science':
        return (
          <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2v6l-5.5 9.5A4 4 0 0 0 8 22h8a4 4 0 0 0 3.5-4.5L14 8V2" />
            <path d="M8 14h8" />
          </svg>
        )
      case 'debate':
        return (
          <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
            <path d="M8 9h8" />
            <path d="M8 13h5" />
          </svg>
        )
    }
  }

  if (!id) {
    return (
      <div className="grid gap-4">
        <div>
          <h1 className="text-2xl font-semibold">To'garaklar</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Student ID topilmadi.</p>
        </div>
        <Link className="w-fit rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800" to="/students">
          Orqaga
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
        <div className="bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-emerald-500/10 p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">O'quvchi profili</div>
              <h1 className="mt-1 truncate text-2xl font-semibold text-slate-900 dark:text-white">{fullName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center rounded-xl border border-slate-200 bg-white/70 px-3 py-1 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                  {loadingStudent ? 'Yuklanmoqda...' : ageLabel}
                </span>
                <span className="inline-flex items-center rounded-xl border border-slate-200 bg-white/70 px-3 py-1 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                  Sinf: {loadingStudent ? '-' : classLabel}
                </span>
                <span className="inline-flex items-center rounded-xl border border-slate-200 bg-white/70 px-3 py-1 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                  ID: <span className="ml-1 font-medium text-slate-900 dark:text-slate-100">{id}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800" to={`/students/${id}`}>
                Orqaga
              </Link>
            </div>
          </div>

          <div className="mt-5 flex w-full flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white/70 p-2 shadow-sm dark:border-slate-800 dark:bg-slate-950/30">
            <NavLink to={`/students/${id}/academic-activity`} className={tabClass}>
              Academic Activity
            </NavLink>
            <NavLink to={`/students/${id}/clubs`} className={tabClass} end>
              Clubs
            </NavLink>
            <NavLink to={`/students/${id}/portfolio`} className={tabClass}>
              Portfolio
            </NavLink>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clubs.map((c) => (
          <div
            key={c.name}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/15 to-indigo-500/10 text-blue-700 shadow-sm ring-1 ring-slate-200 dark:text-blue-200 dark:ring-slate-800">
                  {iconFor(c.icon)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{c.name}</div>
                  <div className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">Haftalik: {c.schedule}</div>
                </div>
              </div>

              <div className={["inline-flex shrink-0 rounded-xl border px-2.5 py-1 text-xs font-semibold", statusBadge(c.status)].join(' ')}>
                {c.status === 'active' ? 'Active' : 'Inactive'}
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-slate-500 dark:text-slate-400">Instructor</div>
                <div className="truncate font-medium text-slate-900 dark:text-slate-100">{c.instructor}</div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-slate-500 dark:text-slate-400">Holat</div>
                <div className="font-medium text-slate-900 dark:text-slate-100">{c.status === 'active' ? 'Faol' : 'Nofaol'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
