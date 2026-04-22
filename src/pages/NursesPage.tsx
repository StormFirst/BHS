import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteNurse, listenNurses, type Nurse } from '../lib/firebase'

function formatDate(value: unknown) {
  if (!value || typeof value !== 'object') return '-'
  const v = value as { toDate?: () => Date }
  const d = v.toDate?.()
  if (!d) return '-'
  return d.toLocaleString()
}

export default function NursesPage() {
  const [nurses, setNurses] = useState<Nurse[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const unsub = listenNurses((items) => {
      setNurses(items)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const total = useMemo(() => nurses.length, [nurses.length])

  function openDeleteModal(nurseId: string) {
    if (deletingId) return
    setConfirmDeleteId(nurseId)
  }

  async function confirmDelete() {
    if (!confirmDeleteId || deletingId) return
    const id = confirmDeleteId
    setDeletingId(id)
    try {
      await deleteNurse(id)
      setConfirmDeleteId(null)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hamshiralar</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Jami: <span className="font-medium">{total}</span>
          </p>
        </div>

        <Link
          to="/nurses/new"
          className="w-fit rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Hamshira qo'shish
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Ism familiya</th>
                <th className="px-4 py-3 font-medium">Yosh</th>
                <th className="px-4 py-3 font-medium">Qo'shilgan sana</th>
                <th className="px-4 py-3 font-medium">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {nurses.map((n) => (
                <tr key={n.id} className="border-b border-slate-100 last:border-b-0 dark:border-slate-800/70">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{n.nurseId}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                    {(n.firstName ?? '').trim()} {(n.lastName ?? '').trim()}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{Number.isFinite(n.age) ? n.age : '-'}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{formatDate(n.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/nurses/${n.id}`}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900"
                      >
                        Ko'rish / Edit
                      </Link>
                      <button
                        className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:bg-slate-950/30 dark:text-red-300 dark:hover:bg-red-950/30"
                        onClick={() => openDeleteModal(n.id)}
                        disabled={!!deletingId}
                        type="button"
                      >
                        O'chirish
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-slate-600 dark:text-slate-300">Loading...</div>
        ) : null}
        {!loading && nurses.length === 0 ? (
          <div className="p-4 text-sm text-slate-600 dark:text-slate-300">Hali hamshiralar yo'q.</div>
        ) : null}
      </div>

      {confirmDeleteId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full rounded-xl bg-white p-5 shadow-lg dark:border dark:border-slate-800 dark:bg-slate-950">
            <div className="text-base font-semibold">Hamshiralarni o‘chirish</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Rostdan ham bu hamshiralarni o‘chirmoqchimisiz?</div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900"
                onClick={() => setConfirmDeleteId(null)}
                disabled={!!deletingId}
                type="button"
              >
                Bekor qilish
              </button>
              <button
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
                onClick={() => void confirmDelete()}
                disabled={!!deletingId}
                type="button"
              >
                {deletingId ? 'O‘chirilmoqda...' : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
