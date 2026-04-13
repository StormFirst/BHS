import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listenNurse, updateNurse, type Nurse, type NurseInput } from '../lib/firebase'

function inputClassName(disabled?: boolean) {
  return [
    'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100 dark:focus:border-indigo-400',
    disabled ? 'opacity-60' : '',
  ].join(' ')
}

export default function NurseDetailsPage() {
  const { id } = useParams()
  const [nurse, setNurse] = useState<Nurse | null>(null)
  const [loading, setLoading] = useState(true)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const unsub = listenNurse(id, (n) => {
      setNurse(n)
      setLoading(false)
    })
    return () => unsub()
  }, [id])

  useEffect(() => {
    if (!nurse) return
    setFirstName((nurse.firstName ?? '').trim())
    setLastName((nurse.lastName ?? '').trim())
    setAge(Number.isFinite(nurse.age) ? String(nurse.age) : '')
  }, [nurse])

  const fullName = useMemo(() => {
    if (!nurse) return '-'
    return `${(nurse.firstName ?? '').trim()} ${(nurse.lastName ?? '').trim()}`.trim() || '-'
  }, [nurse])

  async function handleSave() {
    if (!id) return
    setSaving(true)
    setError(null)
    try {
      const parsedAge = Number(age)
      if (!firstName.trim() || !lastName.trim()) {
        throw new Error('Ism va familiya majburiy')
      }
      if (!Number.isFinite(parsedAge) || parsedAge <= 0) {
        throw new Error('Yosh to‘g‘ri kiritilmadi')
      }

      const payload: NurseInput = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: parsedAge,
      }

      await updateNurse(id, payload)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Saqlashda xatolik')
    } finally {
      setSaving(false)
    }
  }

  if (!id) {
    return (
      <div className="grid gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Hamshira</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Hamshira ID topilmadi.</p>
        </div>
        <Link className="w-fit rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800" to="/nurses">
          Orqaga
        </Link>
      </div>
    )
  }

  if (loading) {
    return <div className="text-sm text-slate-600 dark:text-slate-300">Loading...</div>
  }

  if (!nurse) {
    return (
      <div className="grid gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Hamshira topilmadi</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Bu hamshira o‘chirilgan yoki mavjud emas.</p>
        </div>
        <Link className="w-fit rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800" to="/nurses">
          Orqaga
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{fullName}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Hamshira profili</p>
        </div>

        <Link className="w-fit rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800" to="/nurses">
          Orqaga
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Hamshira ID</div>
            <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">{(nurse.nurseId ?? '').trim() || '-'}</div>
          </div>

          <div className="md:col-span-3" />

          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Ism</div>
            <input className={inputClassName(saving)} value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={saving} />
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Familiya</div>
            <input className={inputClassName(saving)} value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={saving} />
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Yoshi</div>
            <input
              className={inputClassName(saving)}
              type="number"
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              disabled={saving}
            />
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900"
            disabled={saving}
            type="button"
          >
            Bekor qilish
          </button>
          <button
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            onClick={() => void handleSave()}
            disabled={saving}
            type="button"
          >
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  )
}
