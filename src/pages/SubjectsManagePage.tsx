import { useEffect, useState } from 'react'
import { addSubject, deleteSubject, listenSubjects, type Subject } from '../lib/firebase'

export default function SubjectsManagePage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsub = listenSubjects((items) => {
      setSubjects(items)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  async function handleAdd() {
    const n = name.trim()
    if (!n || saving) return
    setSaving(true)
    try {
      await addSubject({ name: n })
      setName('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Fanlar</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Qo'shish / o'chirish</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
        <div className="text-base font-semibold">Fan qo'shish</div>
        <div className="mt-3 flex flex-col gap-2 md:flex-row">
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:focus:border-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: Matematika"
            disabled={saving}
          />
          <button
            type="button"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 disabled:opacity-60"
            onClick={() => void handleAdd()}
            disabled={saving}
          >
            {saving ? 'Saqlanmoqda...' : "Qo'shish"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="text-sm text-slate-600 dark:text-slate-300">Loading...</div>
        ) : subjects.length === 0 ? (
          <div className="text-sm text-slate-600 dark:text-slate-300">Hali fanlar yo'q.</div>
        ) : (
          subjects.map((s) => (
            <div
              key={s.id}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{s.name}</div>
                </div>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-white text-red-700 shadow-sm transition hover:bg-red-50 dark:border-red-900/60 dark:bg-slate-950/30 dark:text-red-300 dark:hover:bg-red-950/30"
                  onClick={() => void deleteSubject(s.id)}
                  aria-label="Fanni o'chirish"
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
            </div>
          ))
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
        Eslatma: Fanlar o'quvchilarga biriktirilmaydi.
      </div>
    </div>
  )
}
