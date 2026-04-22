import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useParams } from 'react-router-dom'
import { listenStudent, type Student } from '../lib/firebase'

export default function StudentAcademicActivityPage() {
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

  const subjects = useMemo(
    () => [
      { name: 'Matematika', grade: 92, teacher: 'A. Karimov', progress: 86 },
      { name: 'Ingliz tili', grade: 78, teacher: 'D. Smith', progress: 74 },
      { name: 'Fizika', grade: 64, teacher: 'S. Rahmonov', progress: 61 },
      { name: 'Informatika', grade: 96, teacher: 'N. Sodiqova', progress: 91 },
    ],
    [],
  )

  const averageGrade = useMemo(() => {
    if (subjects.length === 0) return 0
    return Math.round(subjects.reduce((acc, s) => acc + s.grade, 0) / subjects.length)
  }, [subjects])

  const bestSubject = useMemo(() => {
    const best = [...subjects].sort((a, b) => b.grade - a.grade)[0]
    return best ? `${best.name} (${best.grade}%)` : '-'
  }, [subjects])

  const resultsTimeline = useMemo(
    () => [
      { title: 'Semester 1', date: '2026-01-12', gpa: 4.5, note: 'Yaxshi boshlanish' },
      { title: 'Semester 2', date: '2026-03-20', gpa: 4.2, note: 'Barqaror natija' },
      { title: 'Oylik test', date: '2026-04-10', gpa: 4.6, note: 'O‘sish bor' },
    ],
    [],
  )

  function gradeTone(grade: number) {
    if (grade >= 85) return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/60', bar: 'bg-emerald-500' }
    if (grade >= 70) return { badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/25 dark:text-amber-300 dark:border-amber-900/60', bar: 'bg-amber-500' }
    return { badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/25 dark:text-red-300 dark:border-red-900/60', bar: 'bg-red-500' }
  }

  function tabClass({ isActive }: { isActive: boolean }) {
    return [
      'inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition',
      isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-slate-700 hover:bg-white hover:shadow-sm dark:text-slate-200 dark:hover:bg-slate-900/60',
    ].join(' ')
  }

  if (!id) {
    return (
      <div className="grid gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Akademik faoliyat</h1>
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
            <NavLink to={`/students/${id}/academic-activity`} className={tabClass} end>
              Academic Activity
            </NavLink>
            <NavLink to={`/students/${id}/clubs`} className={tabClass}>
              Clubs
            </NavLink>
            <NavLink to={`/students/${id}/portfolio`} className={tabClass}>
              Portfolio
            </NavLink>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">O'rtacha baho</div>
          <div className="mt-2 flex items-end gap-2">
            <div className="text-3xl font-semibold text-slate-900 dark:text-white">{averageGrade}%</div>
            <div className="pb-1 text-sm text-slate-500 dark:text-slate-400">so'nggi fanlar</div>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900/60">
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${Math.min(100, Math.max(0, averageGrade))}%` }} />
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Eng yaxshi fan</div>
          <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{bestSubject}</div>
          <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">Barqaror yuqori natija</div>
        </div>

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">So'nggi natija</div>
          <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Oylik test</div>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">GPA: 4.6 / 5.0</div>
          <div className="mt-3 inline-flex rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            Green = good
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-slate-900 dark:text-white">Fanlar bo'yicha natijalar</div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Baholar, ustozlar va progress</div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {subjects.map((s) => {
                const tone = gradeTone(s.grade)
                return (
                  <div
                    key={s.name}
                    className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:from-slate-950/30 dark:to-slate-950/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{s.name}</div>
                        <div className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">Ustoz: {s.teacher}</div>
                      </div>
                      <div className={["shrink-0 rounded-xl border px-2.5 py-1 text-xs font-semibold", tone.badge].join(' ')}>
                        {s.grade}%
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Progress</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{s.progress}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900/60">
                        <div className={["h-full rounded-full transition-all", tone.bar].join(' ')} style={{ width: `${Math.min(100, Math.max(0, s.progress))}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
            <div className="text-base font-semibold text-slate-900 dark:text-white">Natijalar tarixi</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Timeline / history</div>

            <div className="mt-4 grid gap-3">
              {resultsTimeline.map((r, idx) => (
                <div key={`${r.title}-${idx}`} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{r.title}</div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{r.date}</div>
                    </div>
                    <div className="rounded-xl bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">GPA {r.gpa}</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">{r.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
