import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteStudent, listenStudents, type Student } from '../lib/firebase'

function getInitials(firstName?: string | null, lastName?: string | null) {
  const f = (firstName ?? '').trim()[0] ?? ''
  const l = (lastName ?? '').trim()[0] ?? ''
  const initials = (f + l).toUpperCase()
  return initials || 'S'
}

export default function StudentsListPage() {
  const navigate = useNavigate()

  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const unsub = listenStudents((s) => {
      setStudents(s)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const visibleStudents = useMemo(() => {
    return students.filter((s) => {
      const first = (s.firstName ?? '').trim()
      const last = (s.lastName ?? '').trim()
      const email = (s.email ?? '').trim()
      const cls = (s.className ?? '').trim()

      return (
        first.length > 0 &&
        last.length > 0 &&
        email.length > 0 &&
        cls.length > 0 &&
        Number.isFinite(s.age) &&
        Number.isFinite(s.heightCm) &&
        Number.isFinite(s.weightKg) &&
        Number.isFinite(s.hemoglobinGL)
      )
    })
  }, [students])

  const total = useMemo(() => visibleStudents.length, [visibleStudents.length])

  function openDeleteModal(studentId: string) {
    if (deletingId) return
    setConfirmDeleteId(studentId)
  }

  async function confirmDelete() {
    if (!confirmDeleteId || deletingId) return
    const id = confirmDeleteId
    setDeletingId(id)
    try {
      await deleteStudent(id)
      setConfirmDeleteId(null)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">O'quvchilar ro'yxati</h1>
          <p className="mt-1 text-sm text-slate-600">
            Jami: <span className="font-medium">{total}</span>
          </p>
        </div>

        <Link
          to="/students/new"
          className="w-fit rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          O'quvchi qo'shish
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">O'quvchi</th>
                <th className="px-4 py-3 font-medium">Sinfi</th>
                <th className="px-4 py-3 font-medium">Yosh</th>
                <th className="px-4 py-3 font-medium">Tug'ilgan sana</th>
                <th className="px-4 py-3 font-medium">Bo‘y / Vazn</th>
                <th className="px-4 py-3 font-medium">Ko‘rish</th>
                <th className="px-4 py-3 font-medium">Gemoglobin</th>
                <th className="px-4 py-3 font-medium">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map((s) => (
                <tr
                  key={s.id}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50 last:border-b-0"
                  onClick={() => navigate(`/students/${s.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {s.photoUrl ? (
                        <img
                          src={s.photoUrl}
                          alt={`${s.firstName} ${s.lastName}`}
                          className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700">
                          {getInitials(s.firstName, s.lastName)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {(s.firstName ?? '').trim() || '-'} {(s.lastName ?? '').trim() || ''}
                        </div>
                        <div className="truncate text-xs text-slate-500">{s.email ?? '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{s.className ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-700">{Number.isFinite(s.age) ? s.age : '-'}</td>
                  <td className="px-4 py-3 text-slate-700">{s.birthDate ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {Number.isFinite(s.heightCm) ? s.heightCm : '-'} sm /{' '}
                    {Number.isFinite(s.weightKg) ? s.weightKg : '-'} kg
                  </td>
                  <td className="px-4 py-3 text-slate-700">{s.vision ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {Number.isFinite(s.hemoglobinGL) ? s.hemoglobinGL : '-'} g/L
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="cursor-pointer rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteModal(s.id)
                        }}
                        disabled={deletingId === s.id}
                      >
                        {deletingId === s.id ? "O'chirilmoqda" : "O'chirish"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-slate-600">Loading...</div>
        ) : null}

        {!loading && visibleStudents.length === 0 ? (
          <div className="p-4 text-sm text-slate-600">Hali o'quvchilar yo'q.</div>
        ) : null}
      </div>

      {confirmDeleteId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={(e) => {
              e.stopPropagation()
              return deletingId ? null : setConfirmDeleteId(null)
            }}
          />
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-lg">
            <div className="text-lg font-semibold">O'quvchini o'chirish</div>
            <div className="mt-2 text-sm text-slate-600">
              Rostdan ham o'quvchini o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
                onClick={() => setConfirmDeleteId(null)}
                disabled={Boolean(deletingId)}
              >
                Bekor qilish
              </button>
              <button
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
                onClick={() => void confirmDelete()}
                disabled={Boolean(deletingId)}
              >
                {deletingId ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
