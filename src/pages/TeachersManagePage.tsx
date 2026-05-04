import { useEffect, useMemo, useState } from 'react'
import {
  addTeacher,
  deleteTeacher,
  listenClubs,
  listenSubjects,
  listenTeachers,
  updateTeacher,
  type Club,
  type Subject,
  type Teacher,
} from '../lib/firebase'

export default function TeachersManagePage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [clubs, setClubs] = useState<Club[]>([])

  const [loadingTeachers, setLoadingTeachers] = useState(true)
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [loadingClubs, setLoadingClubs] = useState(true)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('')

  useEffect(() => {
    const unsub = listenTeachers((items) => {
      setTeachers(items)
      setLoadingTeachers(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const unsub = listenSubjects((items) => {
      setSubjects(items)
      setLoadingSubjects(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const unsub = listenClubs((items) => {
      setClubs(items)
      setLoadingClubs(false)
    })
    return () => unsub()
  }, [])

  const selectedTeacher = useMemo(() => {
    return teachers.find((t) => t.id === selectedTeacherId) ?? null
  }, [teachers, selectedTeacherId])

  async function handleAddTeacher() {
    const fn = firstName.trim()
    const ln = lastName.trim()
    if (!fn || !ln || saving) return

    setSaving(true)
    try {
      await addTeacher({ firstName: fn, lastName: ln, email: email.trim() ? email.trim() : null })
      setFirstName('')
      setLastName('')
      setEmail('')
    } finally {
      setSaving(false)
    }
  }

  async function toggleSubject(subjectId: string) {
    if (!selectedTeacher) return
    const next = selectedTeacher.subjectIds.includes(subjectId)
      ? selectedTeacher.subjectIds.filter((x) => x !== subjectId)
      : [...selectedTeacher.subjectIds, subjectId]
    await updateTeacher(selectedTeacher.id, { subjectIds: next })
  }

  async function toggleClub(clubId: string) {
    if (!selectedTeacher) return
    const next = selectedTeacher.clubIds.includes(clubId)
      ? selectedTeacher.clubIds.filter((x) => x !== clubId)
      : [...selectedTeacher.clubIds, clubId]
    await updateTeacher(selectedTeacher.id, { clubIds: next })
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">O'qituvchilar</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Ro'yxat va fan/to'garak biriktirish</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
        <div className="text-base font-semibold">O'qituvchi qo'shish</div>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:focus:border-blue-400"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ism"
            disabled={saving}
          />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:focus:border-blue-400"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Familiya"
            disabled={saving}
          />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:focus:border-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (ixtiyoriy)"
            disabled={saving}
          />
          <button
            type="button"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 disabled:opacity-60"
            onClick={() => void handleAddTeacher()}
            disabled={saving}
          >
            {saving ? 'Saqlanmoqda...' : "Qo'shish"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
          <div className="text-base font-semibold">O'qituvchilar ro'yxati</div>
          {loadingTeachers ? (
            <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">Loading...</div>
          ) : teachers.length === 0 ? (
            <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">Hali o'qituvchi yo'q.</div>
          ) : (
            <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800/70 dark:border-slate-800">
              {teachers.map((t) => {
                const active = t.id === selectedTeacherId
                const fullName = `${(t.firstName ?? '').trim()} ${(t.lastName ?? '').trim()}`.trim()
                return (
                  <div
                    key={t.id}
                    className={[
                      'flex items-center justify-between gap-3 px-4 py-3 transition',
                      active ? 'bg-slate-50 dark:bg-slate-900/40' : 'bg-white hover:bg-slate-50 dark:bg-slate-950/30 dark:hover:bg-slate-900/30',
                    ].join(' ')}
                  >
                    <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setSelectedTeacherId(t.id)}>
                      <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{fullName || '-'}</div>
                      <div className="truncate text-xs text-slate-500 dark:text-slate-400">{(t.email ?? '').trim() || '-'}</div>
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-white text-red-700 shadow-sm transition hover:bg-red-50 dark:border-red-900/60 dark:bg-slate-950/30 dark:text-red-300 dark:hover:bg-red-950/30"
                      onClick={() => void deleteTeacher(t.id)}
                      aria-label="O'qituvchini o'chirish"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
          <div className="text-base font-semibold">Biriktirish</div>
          {!selectedTeacher ? (
            <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">O'qituvchini tanlang.</div>
          ) : (
            <div className="mt-4 grid gap-5">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Fanlar</div>
                {loadingSubjects ? (
                  <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Loading...</div>
                ) : subjects.length === 0 ? (
                  <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Fanlar yo'q.</div>
                ) : (
                  <div className="mt-3 grid gap-2">
                    {subjects.map((s) => {
                      const checked = selectedTeacher.subjectIds.includes(s.id)
                      return (
                        <label
                          key={s.id}
                          className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900/40"
                        >
                          <span className="truncate">{s.name}</span>
                          <input type="checkbox" checked={checked} onChange={() => void toggleSubject(s.id)} />
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">To'garaklar</div>
                {loadingClubs ? (
                  <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Loading...</div>
                ) : clubs.length === 0 ? (
                  <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">To'garaklar yo'q.</div>
                ) : (
                  <div className="mt-3 grid gap-2">
                    {clubs.map((c) => {
                      const checked = selectedTeacher.clubIds.includes(c.id)
                      return (
                        <label
                          key={c.id}
                          className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900/40"
                        >
                          <span className="truncate">{c.name}</span>
                          <input type="checkbox" checked={checked} onChange={() => void toggleClub(c.id)} />
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
