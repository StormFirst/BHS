import { useState } from 'react'
import type { User } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { addStudent, uploadStudentPhoto, type StudentInput } from '../lib/firebase'

type Props = {
  user: User
}

function inputClassName(disabled?: boolean) {
  return [
    'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500',
    disabled ? 'opacity-60' : '',
  ].join(' ')
}

export default function AddStudentPage({ user }: Props) {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [email, setEmail] = useState('')
  const [className, setClassName] = useState('')
  const [birthDate, setBirthDate] = useState('')

  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const parsedAge = Number(age)

      if (!firstName.trim() || !lastName.trim()) {
        throw new Error('Ism va familiya majburiy')
      }
      if (!gender.trim()) {
        throw new Error('Jinsi majburiy')
      }
      if (!Number.isFinite(parsedAge) || parsedAge <= 0) {
        throw new Error('Yosh to‘g‘ri kiritilmadi')
      }
      if (!className.trim()) {
        throw new Error('Sinfi majburiy')
      }
      if (!birthDate) {
        throw new Error("Tug'ilgan sana majburiy")
      }

      let photoUrl: string | null = null
      if (photoFile) {
        photoUrl = await uploadStudentPhoto(photoFile, user)
      }

      const payload: StudentInput = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: gender.trim(),
        age: parsedAge,
        email: email.trim() ? email.trim() : null,
        className: className.trim(),
        birthDate,
        photoUrl,
      }

      await addStudent(payload, user)
      navigate('/students')
    } catch (e) {
      setError(e instanceof Error ? e.message : "Saqlashda xatolik")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">O'quvchi qo'shish</h1>
        <p className="mt-1 text-sm text-slate-600">Yangi o'quvchi qo'shish</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm font-medium">Ism</div>
            <input
              className={inputClassName(submitting)}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <div className="text-sm font-medium">Familiyasi</div>
            <input
              className={inputClassName(submitting)}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <div className="text-sm font-medium">Yoshi</div>
            <input
              className={inputClassName(submitting)}
              type="number"
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <div className="text-sm font-medium">Jinsi</div>
            <select
              className={inputClassName(submitting)}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={submitting}
            >
              <option value="">Tanlang</option>
              <option value="Erkak">Erkak</option>
              <option value="Ayol">Ayol</option>
            </select>
          </div>

          <div>
            <div className="text-sm font-medium">Email (ixtiyoriy)</div>
            <input
              className={inputClassName(submitting)}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <div className="text-sm font-medium">Sinfi</div>
            <input
              className={inputClassName(submitting)}
              placeholder="Masalan: 7-A"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <div className="text-sm font-medium">Tug'ilgan sana</div>
            <input
              className={inputClassName(submitting)}
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <div className="text-sm font-medium">Rasm (Storage)</div>
            <input
              className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:text-white hover:file:bg-slate-800"
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
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
            onClick={() => navigate('/students')}
            disabled={submitting}
          >
            Bekor qilish
          </button>
          <button
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            onClick={() => void handleSubmit()}
            disabled={submitting}
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  )
}
