import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addNurse, type NurseInput } from '../lib/firebase'

function inputClassName(disabled?: boolean) {
  return [
    'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500',
    disabled ? 'opacity-60' : '',
  ].join(' ')
}

export default function AddNursePage() {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    setSubmitting(true)
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

      await addNurse(payload)
      navigate('/nurses')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Saqlashda xatolik')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Hamshira qo'shish</h1>
        <p className="mt-1 text-sm text-slate-600">Yangi hamshira qo'shish</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-xs font-medium text-slate-500">Ism</div>
            <input
              className={inputClassName(submitting)}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500">Familiya</div>
            <input
              className={inputClassName(submitting)}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500">Yoshi</div>
            <input
              className={inputClassName(submitting)}
              type="number"
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
            onClick={() => navigate('/nurses')}
            disabled={submitting}
          >
            Bekor qilish
          </button>
          <button
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            onClick={() => void handleAdd()}
            disabled={submitting}
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  )
}
