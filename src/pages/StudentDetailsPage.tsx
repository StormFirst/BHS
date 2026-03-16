import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { listenStudent, listenStudentExams, type Student, type StudentExam } from '../lib/firebase'

function fieldLabel(label: string, value: string) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-sm text-slate-900">{value}</div>
    </div>
  )
}

function GenderIllustration({ gender }: { gender: string }) {
  const g = (gender ?? '').trim().toLowerCase()
  const isMale = g === 'erkak'

  const bg = isMale ? 'from-indigo-50 to-sky-50' : 'from-rose-50 to-fuchsia-50'
  const accent = isMale ? '#4f46e5' : '#e11d48'
  const shirt = isMale ? '#60a5fa' : '#fb7185'
  const pants = isMale ? '#1f2937' : '#7c3aed'
  const hair = isMale ? '#0f172a' : '#111827'
  const shoe = isMale ? '#0f172a' : '#111827'

  return (
    <div className={["hidden md:block", 'w-full max-w-[260px]'].join(' ')}>
      <div className={["relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br p-4", bg].join(' ')}>
        <div className="text-xs font-medium text-slate-600">Ko‘rinish</div>
        <div className="mt-3 flex items-center justify-center">
          <svg width="210" height="300" viewBox="0 0 210 300" role="img" aria-label={isMale ? 'Erkak' : 'Ayol'}>
            <rect x="8" y="8" width="194" height="284" rx="26" fill="white" opacity="0.9" />

            <circle cx="105" cy="70" r="34" fill="#f5d0a9" />
            <path
              d={isMale ? 'M73 62 C82 38, 128 38, 137 62 C124 54, 86 54, 73 62 Z' : 'M66 70 C70 38, 140 38, 144 70 C132 60, 78 60, 66 70 Z'}
              fill={hair}
            />
            {!isMale ? <path d="M70 78 C58 112, 60 136, 80 162 C86 136, 84 104, 70 78 Z" fill={hair} opacity="0.9" /> : null}
            {!isMale ? <path d="M140 78 C152 112, 150 136, 130 162 C124 136, 126 104, 140 78 Z" fill={hair} opacity="0.9" /> : null}

            <circle cx="93" cy="70" r="4" fill="#0f172a" opacity="0.8" />
            <circle cx="117" cy="70" r="4" fill="#0f172a" opacity="0.8" />
            <path d="M97 86 C102 92, 108 92, 113 86" stroke="#9a3412" strokeWidth="3" fill="none" strokeLinecap="round" />

            <rect x="92" y="100" width="26" height="22" rx="11" fill="#f5d0a9" />

            <path d="M66 132 C72 106, 138 106, 144 132 L144 178 C134 196, 76 196, 66 178 Z" fill={shirt} />
            <path d="M66 132 C56 140, 50 160, 54 174 C62 200, 78 196, 82 178 Z" fill={shirt} opacity="0.95" />
            <path d="M144 132 C154 140, 160 160, 156 174 C148 200, 132 196, 128 178 Z" fill={shirt} opacity="0.95" />
            <circle cx="62" cy="188" r="9" fill="#f5d0a9" />
            <circle cx="148" cy="188" r="9" fill="#f5d0a9" />

            {isMale ? (
              <>
                <path d="M80 196 H130 V226 C130 242, 120 252, 105 252 C90 252, 80 242, 80 226 Z" fill={pants} />
                <rect x="84" y="226" width="18" height="44" rx="9" fill={pants} />
                <rect x="108" y="226" width="18" height="44" rx="9" fill={pants} />
              </>
            ) : (
              <>
                <path d="M74 196 C86 222, 124 222, 136 196 L148 252 C130 270, 80 270, 62 252 Z" fill={pants} />
                <rect x="90" y="236" width="16" height="40" rx="8" fill={pants} opacity="0.75" />
                <rect x="104" y="236" width="16" height="40" rx="8" fill={pants} opacity="0.75" />
              </>
            )}

            <rect x="90" y="248" width="16" height="30" rx="8" fill="#f5d0a9" />
            <rect x="104" y="248" width="16" height="30" rx="8" fill="#f5d0a9" />
            <path d="M84 278 H110 V288 H84 Z" fill={shoe} opacity="0.9" />
            <path d="M100 278 H126 V288 H100 Z" fill={shoe} opacity="0.9" />

            <circle cx="170" cy="40" r="10" fill={accent} opacity="0.9" />
            <circle cx="40" cy="44" r="6" fill={accent} opacity="0.35" />
            <circle cx="172" cy="246" r="6" fill={accent} opacity="0.22" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default function StudentDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  const [exams, setExams] = useState<StudentExam[]>([])
  const [loadingExams, setLoadingExams] = useState(true)

  useEffect(() => {
    if (!id) return
    const unsub = listenStudent(id, (s) => {
      setStudent(s)
      setLoading(false)
    })
    return () => unsub()
  }, [id])

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

  if (!id) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">O'quvchi</h1>
        <p className="mt-1 text-sm text-slate-600">Student ID topilmadi.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="text-sm text-slate-600">Loading...</div>
  }

  if (!student) {
    return (
      <div className="grid gap-4">
        <div>
          <h1 className="text-2xl font-semibold">O'quvchi topilmadi</h1>
          <p className="mt-1 text-sm text-slate-600">Bu student o‘chirilgan yoki mavjud emas.</p>
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
          <p className="mt-1 text-sm text-slate-600">O'quvchi profili</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            className="w-fit rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            to={`/students/${id}/exam`}
          >
            Tekshiruv
          </Link>
          <Link
            className="w-fit rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
            to="/students"
          >
            Orqaga
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="shrink-0">
            {student.photoUrl ? (
              <img
                src={student.photoUrl}
                alt={fullName}
                className="h-28 w-28 rounded-xl border border-slate-200 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
                No image
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="grid gap-4 md:grid-cols-3">
              {fieldLabel('Email', student.email ?? '-')}
              {fieldLabel('Sinfi', student.className ?? '-')}
              {fieldLabel('Yosh', Number.isFinite(student.age) ? String(student.age) : '-')}

              {fieldLabel('Jinsi', (student.gender ?? '').trim() || '-')}

              {fieldLabel("Tug'ilgan sana", student.birthDate ?? '-')}
            </div>
          </div>

          <GenderIllustration gender={student.gender} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-base font-semibold">Tekshiruvlar ro'yxati</div>
        {loadingExams ? (
          <div className="mt-3 text-sm text-slate-600">Loading...</div>
        ) : exams.length === 0 ? (
          <div className="mt-3 text-sm text-slate-600">Hali tekshiruvlar yo‘q.</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500">
                  <th className="border-b border-slate-200 pb-2">Sana</th>
                  <th className="border-b border-slate-200 pb-2">Hamshira</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr
                    key={exam.id}
                    className="cursor-pointer text-sm text-slate-900 hover:bg-slate-50"
                    onClick={() => navigate(`/students/${id}/exams/${exam.id}`)}
                  >
                    <td className="border-b border-slate-100 py-2 pr-4">{formatExamDate(exam)}</td>
                    <td className="border-b border-slate-100 py-2">{formatExamNurse(exam)}</td>
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
