import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { Bounds, Center, useGLTF } from '@react-three/drei'
import type { Object3D } from 'three'
import {
  assignClubToStudent,
  listenClubs,
  listenStudentClubs,
  listenStudent,
  listenStudentExams,
  removeClubFromStudent,
  updateStudent,
  type Club,
  type Student,
  type StudentClubAssignment,
  type StudentExam,
} from '../lib/firebase'

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
    <div className="w-full shrink-0 md:w-[260px]">
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

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    const y = String(d.getFullYear())
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  })

  type StudentTab = 'academic' | 'clubs' | 'portfolio' | 'info'
  const [activeTab, setActiveTab] = useState<StudentTab>('academic')

  const [exams, setExams] = useState<StudentExam[]>([])
  const [loadingExams, setLoadingExams] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [clubs, setClubs] = useState<Club[]>([])
  const [loadingClubs, setLoadingClubs] = useState(true)
  const [studentClubs, setStudentClubs] = useState<StudentClubAssignment[]>([])
  const [loadingStudentClubs, setLoadingStudentClubs] = useState(true)
  const [selectedClubId, setSelectedClubId] = useState('')

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

  useEffect(() => {
    const unsub = listenClubs((items) => {
      setClubs(items)
      setLoadingClubs(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!id) return
    const unsub = listenStudentClubs(id, (items) => {
      setStudentClubs(items)
      setLoadingStudentClubs(false)
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

  function tabClass(isActive: boolean) {
    return [
      'inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition',
      isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-slate-700 hover:bg-white hover:shadow-sm dark:text-slate-200 dark:hover:bg-slate-900/60',
    ].join(' ')
  }

  const academicSubjects = useMemo(
    () => [
      { name: 'Matematika', grade: 92, teacher: 'A. Karimov', progress: 86 },
      { name: 'Ingliz tili', grade: 78, teacher: 'D. Smith', progress: 74 },
      { name: 'Fizika', grade: 64, teacher: 'S. Rahmonov', progress: 61 },
      { name: 'Informatika', grade: 96, teacher: 'N. Sodiqova', progress: 91 },
    ],
    [],
  )

  const averageGrade = useMemo(() => {
    if (academicSubjects.length === 0) return 0
    return Math.round(academicSubjects.reduce((acc, s) => acc + s.grade, 0) / academicSubjects.length)
  }, [academicSubjects])

  const bestSubject = useMemo(() => {
    const best = [...academicSubjects].sort((a, b) => b.grade - a.grade)[0]
    return best ? `${best.name} (${best.grade}%)` : '-'
  }, [academicSubjects])

  const resultsTimeline = useMemo(
    () => [
      { title: 'Semester 1', date: '2026-01-12', gpa: 4.5, note: 'Yaxshi boshlanish' },
      { title: 'Semester 2', date: '2026-03-20', gpa: 4.2, note: 'Barqaror natija' },
      { title: 'Oylik test', date: '2026-04-10', gpa: 4.6, note: 'O‘sish bor' },
    ],
    [],
  )

  function gradeTone(grade: number) {
    if (grade >= 85)
      return {
        badge:
          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/60',
        bar: 'bg-emerald-500',
      }
    if (grade >= 70)
      return {
        badge:
          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/25 dark:text-amber-300 dark:border-amber-900/60',
        bar: 'bg-amber-500',
      }
    return {
      badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/25 dark:text-red-300 dark:border-red-900/60',
      bar: 'bg-red-500',
    }
  }

  const selectedClub = useMemo(() => {
    return clubs.find((c) => c.id === selectedClubId) ?? null
  }, [clubs, selectedClubId])

  const assignedClubIds = useMemo(() => {
    return new Set(studentClubs.map((x) => x.clubId))
  }, [studentClubs])

  async function handleAssignClub() {
    if (!id || !selectedClub) return
    await assignClubToStudent(id, { clubId: selectedClub.id, clubName: selectedClub.name })
    setSelectedClubId('')
  }

  type PortfolioType = 'certificate' | 'image' | 'video'
  type PortfolioItem = {
    id: string
    title: string
    date: string
    type: PortfolioType
  }

  const portfolioItems = useMemo<PortfolioItem[]>(
    () => [
      { id: 'p1', title: 'English Level Certificate', date: '2026-02-05', type: 'certificate' },
      { id: 'p2', title: 'Science Fair Project', date: '2026-03-12', type: 'image' },
      { id: 'p3', title: 'Robotics Demo', date: '2026-04-20', type: 'video' },
    ],
    [],
  )

  function portfolioBadge(t: PortfolioType) {
    if (t === 'certificate') return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300'
    if (t === 'image') return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300'
    return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/25 dark:text-red-300'
  }

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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/20 md:w-auto">
          <button type="button" className={tabClass(activeTab === 'academic')} onClick={() => setActiveTab('academic')}>
            Akademik faoliyat
          </button>
          <button type="button" className={tabClass(activeTab === 'clubs')} onClick={() => setActiveTab('clubs')}>
            To'garaklar
          </button>
          <button type="button" className={tabClass(activeTab === 'portfolio')} onClick={() => setActiveTab('portfolio')}>
            Portfolio
          </button>
          <button type="button" className={tabClass(activeTab === 'info')} onClick={() => setActiveTab('info')}>
            Ma'lumotlar
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-950/30">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 2v2" />
              <path d="M16 2v2" />
              <path d="M3 10h18" />
              <path d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
            </svg>
            <input
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Sana tanlash"
            />
          </div>

          <Link className="w-fit rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500" to={`/students/${id}/exam`}>
            Tekshiruv
          </Link>
          <Link className="w-fit rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500" to={`/students/${id}/illness-history`}>
            Kasallik tarixi
          </Link>
          <Link className="w-fit rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800" to="/students">
            Orqaga
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
        {activeTab === 'academic' ? (
          <div className="grid gap-4">
            <div>
              <div className="text-base font-semibold text-slate-900 dark:text-white">Akademik faoliyat</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Tanlangan sana: {selectedDate}</div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/30">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">O'rtacha baho</div>
                <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{averageGrade}%</div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900/60">
                  <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${Math.min(100, Math.max(0, averageGrade))}%` }} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/30">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Eng yaxshi fan</div>
                <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{bestSubject}</div>
                <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">Yuqori natija</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/30">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">So'nggi natija</div>
                <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Oylik test</div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">GPA: 4.6 / 5.0</div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/30">
                  <div className="text-base font-semibold text-slate-900 dark:text-white">Fanlar bo'yicha natijalar</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Baholar va progress</div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {academicSubjects.map((s) => {
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
                            <div className={['shrink-0 rounded-xl border px-2.5 py-1 text-xs font-semibold', tone.badge].join(' ')}>
                              {s.grade}%
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                              <span>Progress</span>
                              <span className="font-medium text-slate-700 dark:text-slate-200">{s.progress}%</span>
                            </div>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900/60">
                              <div className={['h-full rounded-full transition-all', tone.bar].join(' ')} style={{ width: `${Math.min(100, Math.max(0, s.progress))}%` }} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/30">
                  <div className="text-base font-semibold text-slate-900 dark:text-white">Natijalar tarixi</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Timeline</div>

                  <div className="mt-4 grid gap-3">
                    {resultsTimeline.map((r, idx) => (
                      <div key={`${r.title}-${idx}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
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
        ) : null}

        {activeTab === 'clubs' ? (
          <div className="grid gap-4">
            <div>
              <div className="text-base font-semibold text-slate-900 dark:text-white">To'garaklar</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Tanlangan sana: {selectedDate}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/30">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">O'quvchiga to'garak biriktirish</div>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:focus:border-blue-400"
                  value={selectedClubId}
                  onChange={(e) => setSelectedClubId(e.target.value)}
                >
                  <option value="">To'garakni tanlang</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id} disabled={assignedClubIds.has(c.id)}>
                      {c.name}{assignedClubIds.has(c.id) ? ' (biriktirilgan)' : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500 disabled:opacity-60"
                  disabled={!selectedClubId}
                  onClick={() => void handleAssignClub()}
                >
                  Biriktirish
                </button>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-200">
                  {loadingClubs ? 'To\'garaklar yuklanmoqda...' : `Jami: ${clubs.length}`}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Biriktirilgan to'garaklar</div>
              {loadingStudentClubs ? (
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Loading...</div>
              ) : studentClubs.length === 0 ? (
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Hali to'garak biriktirilmagan.</div>
              ) : (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {studentClubs.map((sc) => (
                    <div
                      key={sc.id}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/30"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{sc.clubName}</div>
                      </div>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-white text-red-700 shadow-sm transition hover:bg-red-50 dark:border-red-900/60 dark:bg-slate-950/30 dark:text-red-300 dark:hover:bg-red-950/30"
                        onClick={() => (id ? void removeClubFromStudent(id, sc.id) : null)}
                        aria-label="Biriktirilgan to'garakni o'chirish"
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
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {activeTab === 'portfolio' ? (
          <div className="grid gap-4">
            <div>
              <div className="text-base font-semibold text-slate-900 dark:text-white">Portfolio</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Tanlangan sana: {selectedDate}</div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {portfolioItems.map((it) => (
                <div
                  key={it.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{it.title}</div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{it.date}</div>
                    </div>
                    <div className={['inline-flex shrink-0 rounded-xl border px-2.5 py-1 text-xs font-semibold', portfolioBadge(it.type)].join(' ')}>
                      {it.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === 'info' ? (
          <div className="grid gap-4">
            <div>
              <div className="text-base font-semibold text-slate-900 dark:text-white">Ma'lumotlar</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">O'quvchi haqida asosiy ma'lumotlar</div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-lg font-semibold">{fullName}</div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">O'quvchi profili</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className={[
                    'w-fit rounded-md px-3 py-2 text-sm font-medium text-white',
                    editing ? 'bg-sky-700 hover:bg-sky-600' : 'bg-blue-600 hover:bg-blue-500',
                  ].join(' ')}
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

            {student ? (
              <div className="grid gap-4 md:grid-cols-3">
                {fieldLabel('Ism', (student.firstName ?? '').trim() || '-')}
                {fieldLabel('Familiya', (student.lastName ?? '').trim() || '-')}
                {fieldLabel('Sinfi', (student.className ?? '').trim() || '-')}
                {fieldLabel('Email', (student.email ?? '').trim() || '-')}
                {fieldLabel('Yosh', Number.isFinite(student.age) ? String(student.age) : '-')}
                {fieldLabel('Jinsi', (student.gender ?? '').trim() || '-')}
                {fieldLabel("Tug'ilgan sana", (student.birthDate ?? '').trim() || '-')}
              </div>
            ) : (
              <div className="text-sm text-slate-600 dark:text-slate-300">Loading...</div>
            )}
          </div>
        ) : null}
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
