import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useParams } from 'react-router-dom'
import { listenStudent, type Student } from '../lib/firebase'

export default function StudentPortfolioPage() {
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

  type PortfolioType = 'certificate' | 'image' | 'video'

  type PortfolioItem = {
    id: string
    title: string
    date: string
    type: PortfolioType
    previewKind: 'image' | 'pdf'
    previewUrl: string
  }

  const items: PortfolioItem[] = useMemo(
    () => [
      {
        id: 'cert-1',
        title: 'English Level Certificate',
        date: '2026-02-05',
        type: 'certificate',
        previewKind: 'pdf',
        previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
      {
        id: 'img-1',
        title: 'Science Fair Project',
        date: '2026-03-12',
        type: 'image',
        previewKind: 'image',
        previewUrl: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&q=60',
      },
      {
        id: 'img-2',
        title: 'Art Work: Minimal Poster',
        date: '2026-04-01',
        type: 'image',
        previewKind: 'image',
        previewUrl: 'https://images.unsplash.com/photo-1526481280695-3c687fd5432c?auto=format&fit=crop&w=1200&q=60',
      },
      {
        id: 'cert-2',
        title: 'Coding Bootcamp Certificate',
        date: '2026-04-16',
        type: 'certificate',
        previewKind: 'pdf',
        previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
      {
        id: 'vid-1',
        title: 'Robotics Demo (Video)',
        date: '2026-04-20',
        type: 'video',
        previewKind: 'image',
        previewUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=60',
      },
    ],
    [],
  )

  const [filter, setFilter] = useState<PortfolioType | 'all'>('all')
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null)

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items
    return items.filter((i) => i.type === filter)
  }, [filter, items])

  function tabClass({ isActive }: { isActive: boolean }) {
    return [
      'inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition',
      isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-slate-700 hover:bg-white hover:shadow-sm dark:text-slate-200 dark:hover:bg-slate-900/60',
    ].join(' ')
  }

  function filterPillClass(active: boolean) {
    return [
      'inline-flex items-center rounded-xl border px-3 py-1.5 text-sm font-medium transition',
      active
        ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-900/60 dark:bg-blue-950/25 dark:text-blue-300'
        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-200 dark:hover:bg-slate-900/40',
    ].join(' ')
  }

  function typeBadge(t: PortfolioType) {
    if (t === 'certificate') return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300'
    if (t === 'image') return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300'
    return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/25 dark:text-red-300'
  }

  if (!id) {
    return (
      <div className="grid gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Portfolio</h1>
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
            <NavLink to={`/students/${id}/clubs`} className={tabClass}>
              Clubs
            </NavLink>
            <NavLink to={`/students/${id}/portfolio`} className={tabClass} end>
              Portfolio
            </NavLink>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-base font-semibold text-slate-900 dark:text-white">Portfolio</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Ishlar, sertifikatlar va media</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" className={filterPillClass(filter === 'all')} onClick={() => setFilter('all')}>
              Hammasi
            </button>
            <button
              type="button"
              className={filterPillClass(filter === 'certificate')}
              onClick={() => setFilter('certificate')}
            >
              Certificates
            </button>
            <button type="button" className={filterPillClass(filter === 'image')} onClick={() => setFilter('image')}>
              Images
            </button>
            <button type="button" className={filterPillClass(filter === 'video')} onClick={() => setFilter('video')}>
              Videos
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((it) => (
            <button
              key={it.id}
              type="button"
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/30"
              onClick={() => setActiveItem(it)}
            >
              <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-900/60">
                <img
                  src={it.previewUrl}
                  alt={it.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute left-3 top-3 inline-flex rounded-xl border px-2.5 py-1 text-xs font-semibold backdrop-blur-sm bg-white/70 dark:bg-slate-950/40 dark:text-slate-100 dark:border-slate-800">
                  {it.previewKind.toUpperCase()}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{it.title}</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{it.date}</div>
                  </div>
                  <div className={['inline-flex shrink-0 rounded-xl border px-2.5 py-1 text-xs font-semibold', typeBadge(it.type)].join(' ')}>
                    {it.type}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {filteredItems.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300">
              Hozircha mos portfolio topilmadi.
            </div>
          ) : null}
        </div>
      </div>

      {activeItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{activeItem.title}</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{activeItem.date}</div>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900/40"
                onClick={() => setActiveItem(null)}
                aria-label="Yopish"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto p-4">
              {activeItem.previewKind === 'pdf' ? (
                <iframe title={activeItem.title} src={activeItem.previewUrl} className="h-[70vh] w-full rounded-xl border border-slate-200 dark:border-slate-800" />
              ) : (
                <img src={activeItem.previewUrl} alt={activeItem.title} className="w-full rounded-xl border border-slate-200 object-cover dark:border-slate-800" />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
