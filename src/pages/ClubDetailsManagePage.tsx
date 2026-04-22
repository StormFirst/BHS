import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  listenClubStudents,
  listenStudents,
  type ClubStudentRef,
  type Student,
} from '../lib/firebase'

export default function ClubDetailsManagePage() {
  const { clubId } = useParams()
  const [studentRefs, setStudentRefs] = useState<ClubStudentRef[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loadingRefs, setLoadingRefs] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(true)

  useEffect(() => {
    const unsub = listenStudents((items) => {
      setStudents(items)
      setLoadingStudents(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!clubId) return
    const unsub = listenClubStudents(clubId, (items) => {
      setStudentRefs(items)
      setLoadingRefs(false)
    })
    return () => unsub()
  }, [clubId])

  const byId = useMemo(() => {
    const m = new Map<string, Student>()
    for (const s of students) m.set(s.id, s)
    return m
  }, [students])

  const clubName = useMemo(() => {
    const first = studentRefs[0]
    return (first?.clubName ?? '').trim() || "To'garak"
  }, [studentRefs])

  if (!clubId) {
    return (
      <div className="grid gap-4">
        <div>
          <h1 className="text-2xl font-semibold">To'garak</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Club ID topilmadi.</p>
        </div>
        <Link className="w-fit rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800" to="/management/clubs">
          Orqaga
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{clubName}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Biriktirilgan o'quvchilar</p>
        </div>
        <Link
          className="w-fit rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
          to="/management/clubs"
        >
          Orqaga
        </Link>
      </div>

      {loadingRefs ? (
        <div className="text-sm text-slate-600 dark:text-slate-300">Loading...</div>
      ) : studentRefs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
          Hali o'quvchi biriktirilmagan.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {studentRefs.map((r) => {
            const s = byId.get(r.studentId)
            const fullName = s ? `${(s.firstName ?? '').trim()} ${(s.lastName ?? '').trim()}`.trim() : r.studentId
            return (
              <div
                key={`${r.studentId}:${r.assignmentId}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{fullName || '-'}</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Sinf: {(s?.className ?? '').trim() || '-'}</div>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/students/${r.studentId}`}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900/40"
                  >
                    Profilga o'tish
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {loadingStudents ? null : null}
    </div>
  )
}
