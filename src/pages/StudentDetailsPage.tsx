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
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
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
              {fieldLabel('Bo‘y (sm)', Number.isFinite(student.heightCm) ? String(student.heightCm) : '-')}
              {fieldLabel('Vazn (kg)', Number.isFinite(student.weightKg) ? String(student.weightKg) : '-')}

              {fieldLabel('Ko‘rish (o‘ng/chap)', student.vision ?? '-')}
              {fieldLabel('Gemoglobin (g/L)', Number.isFinite(student.hemoglobinGL) ? String(student.hemoglobinGL) : '-')}
            </div>

            <div className="mt-5">
              <div className="text-xs font-medium text-slate-500">Kasallik tarixi (oxirgi 3 oy)</div>
              <div className="mt-1 whitespace-pre-wrap text-sm text-slate-900">
                {(student.diseaseHistory3m ?? '').trim() || '-'}
              </div>
            </div>
          </div>
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
