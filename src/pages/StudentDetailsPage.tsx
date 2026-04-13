import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { Bounds, Center, useGLTF } from '@react-three/drei'
import type { Object3D } from 'three'
import { listenStudent, listenStudentExams, updateStudent, type Student, type StudentExam } from '../lib/firebase'

function fieldLabel(label: string, value: string) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  )
}

function GenderIllustration({ gender }: { gender: string }) {
  const g = (gender ?? '').trim().toLowerCase()
  const isMale = g.includes('erkak') || g === 'male' || g === 'm'
  const isFemale = g.includes('ayol') || g === 'female' || g === 'f'
  const modelPath = isMale ? '/men.glb' : isFemale ? '/women.glb' : '/men.glb'
  const bg = isMale ? 'from-indigo-50 to-sky-100' : 'from-rose-50 to-fuchsia-100'

  useGLTF.preload('/men.glb')
  useGLTF.preload('/women.glb')

  return (
    <div className="w-full max-w-[260px]">
      <div className={["relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br p-4 dark:border-slate-800 dark:from-slate-900/70 dark:to-slate-900/30", bg].join(' ')}>
        <div className="text-xs font-medium text-slate-600 dark:text-slate-300">3D ko‘rinish</div>
        <div className="mt-3 h-[300px] w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
          <Canvas camera={{ position: [0, 0.4, 4.2], fov: 34 }}>
            <ambientLight intensity={0.85} />
            <directionalLight position={[3, 5, 4]} intensity={1.2} />
            <directionalLight position={[-3, 2, -2]} intensity={0.6} />
            <Bounds fit clip observe margin={0.9}>
              <Center>
                <StudentModel key={modelPath} modelPath={modelPath} />
              </Center>
            </Bounds>
          </Canvas>
        </div>
      </div>
    </div>
  )
}

function StudentModel({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath) as { scene: Object3D }
  const clone = useMemo(() => scene.clone(), [scene])
  return <primitive object={clone} />
}

export default function StudentDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  const [exams, setExams] = useState<StudentExam[]>([])
  const [loadingExams, setLoadingExams] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [email, setEmail] = useState('')
  const [className, setClassName] = useState('')
  const [birthDate, setBirthDate] = useState('')

  useEffect(() => {
    if (!id) return
    const unsub = listenStudent(id, (s) => {
      setStudent(s)
      setLoading(false)
    })
    return () => unsub()
  }, [id])

  useEffect(() => {
    if (!student) return
    setFirstName((student.firstName ?? '').trim())
    setLastName((student.lastName ?? '').trim())
    setGender((student.gender ?? '').trim())
    setAge(Number.isFinite(student.age) ? String(student.age) : '')
    setEmail((student.email ?? '').trim())
    setClassName((student.className ?? '').trim())
    setBirthDate((student.birthDate ?? '').trim())
  }, [student])

  useEffect(() => {
    if (!id) return
    const unsub = listenStudentExams(id, (items) => {
      setExams(items)
      setLoadingExams(false)
    })
    return () => unsub()
  }, [id])

  function formatExamDate(exam: StudentExam) {
    const ts = exam.createdAt
    if (!ts) return '-'
    const d = ts.toDate()
    return d.toLocaleString()
  }

  function formatExamNurse(exam: StudentExam) {
    const name = (exam.nurseName ?? '').trim()
    const nurseId = (exam.nurseId ?? '').trim()
    if (nurseId && name) return `${nurseId} - ${name}`
    return name || '-'
  }

  const fullName = useMemo(() => {
    if (!student) return '-'
    return `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim() || '-'
  }, [student])

  async function handleSaveStudent() {
    if (!id || !student) return
    setSaving(true)
    setSaveError(null)
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
      if (!birthDate.trim()) {
        throw new Error("Tug'ilgan sana majburiy")
      }

      await updateStudent(id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: gender.trim(),
        age: parsedAge,
        email: email.trim() ? email.trim() : null,
        className: className.trim(),
        birthDate: birthDate.trim(),
      })

      setEditing(false)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Saqlashda xatolik')
    } finally {
      setSaving(false)
    }
  }

  if (!id) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">O'quvchi</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Student ID topilmadi.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="text-sm text-slate-600 dark:text-slate-300">Loading...</div>
  }

  if (!student) {
    return (
      <div className="grid gap-4">
        <div>
          <h1 className="text-2xl font-semibold">O'quvchi topilmadi</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Bu student o‘chirilgan yoki mavjud emas.</p>
        </div>
        <Link className="w-fit rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800" to="/students">
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
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">O'quvchi profili</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="w-fit rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900"
            type="button"
            onClick={() => {
              if (!student) return
              if (editing) {
                setFirstName((student.firstName ?? '').trim())
                setLastName((student.lastName ?? '').trim())
                setGender((student.gender ?? '').trim())
                setAge(Number.isFinite(student.age) ? String(student.age) : '')
                setEmail((student.email ?? '').trim())
                setClassName((student.className ?? '').trim())
                setBirthDate((student.birthDate ?? '').trim())
                setSaveError(null)
                setEditing(false)
                return
              }
              setSaveError(null)
              setEditing(true)
            }}
          >
            {editing ? 'Bekor qilish' : 'Tahrirlash'}
          </button>
          {editing ? (
            <button
              className="w-fit rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
              type="button"
              onClick={() => void handleSaveStudent()}
              disabled={saving}
            >
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          ) : null}
          <Link
            className="w-fit rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            to={`/students/${id}/exam`}
          >
            Tekshiruv
          </Link>
          <Link
            className="w-fit rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900"
            to={`/students/${id}/illness-history`}
          >
            Kasallik tarixi
          </Link>
          <Link
            className="w-fit rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
            to="/students"
          >
            Orqaga
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="shrink-0">
            {student.photoUrl ? (
              <img
                src={student.photoUrl}
                alt={fullName}
                className="h-28 w-28 rounded-xl border border-slate-200 object-cover dark:border-slate-800"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
                No image
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Ism</div>
                  <input
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:focus:border-indigo-400"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Familiya</div>
                  <input
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:focus:border-indigo-400"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Jinsi</div>
                  <select
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:focus:border-indigo-400"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    disabled={saving}
                  >
                    <option value="">Tanlang</option>
                    <option value="Erkak">Erkak</option>
                    <option value="Ayol">Ayol</option>
                  </select>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Yosh</div>
                  <input
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:focus:border-indigo-400"
                    type="number"
                    inputMode="numeric"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Sinfi</div>
                  <input
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:focus:border-indigo-400"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Tug'ilgan sana</div>
                  <input
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:focus:border-indigo-400"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Email (ixtiyoriy)</div>
                  <input
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:focus:border-indigo-400"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={saving}
                  />
                </div>
                {saveError ? (
                  <div className="md:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                    {saveError}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {fieldLabel('Email', student.email ?? '-')}
                {fieldLabel('Sinfi', student.className ?? '-')}
                {fieldLabel('Yosh', Number.isFinite(student.age) ? String(student.age) : '-')}
                {fieldLabel('Jinsi', (student.gender ?? '').trim() || '-')}
                {fieldLabel("Tug'ilgan sana", student.birthDate ?? '-')}
              </div>
            )}
          </div>

          <GenderIllustration gender={student.gender} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
        <div className="text-base font-semibold">Tekshiruvlar ro'yxati</div>
        {loadingExams ? (
          <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">Loading...</div>
        ) : exams.length === 0 ? (
          <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">Hali tekshiruvlar yo‘q.</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                  <th className="border-b border-slate-200 pb-2 dark:border-slate-800">Sana</th>
                  <th className="border-b border-slate-200 pb-2 dark:border-slate-800">Hamshira</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr
                    key={exam.id}
                    className="cursor-pointer text-sm text-slate-900 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-900/40"
                    onClick={() => navigate(`/students/${id}/exams/${exam.id}`)}
                  >
                    <td className="border-b border-slate-100 py-2 pr-4 dark:border-slate-800/70">{formatExamDate(exam)}</td>
                    <td className="border-b border-slate-100 py-2 dark:border-slate-800/70">{formatExamNurse(exam)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
