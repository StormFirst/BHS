import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { User } from 'firebase/auth'
import {
  getExamCount,
  listenLatestExams,
  listenNurses,
  listenStudents,
  type LatestExam,
  type Nurse,
  type Student,
} from '../lib/firebase'

type Props = {
  user: User
}

export default function DashboardPage({ user }: Props) {
  const [students, setStudents] = useState<Student[]>([])
  const [nurses, setNurses] = useState<Nurse[]>([])
  const [latestExams, setLatestExams] = useState<LatestExam[]>([])
  const [examCount, setExamCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubs: Array<() => void> = []
    unsubs.push(
      listenStudents((items) => {
        setStudents(items)
        setLoading(false)
      }),
    )
    unsubs.push(
      listenNurses((items) => {
        setNurses(items)
        setLoading(false)
      }),
    )
    unsubs.push(
      listenLatestExams(5, (items) => {
        setLatestExams(items)
        setLoading(false)
      }),
    )

    void (async () => {
      try {
        const count = await getExamCount()
        setExamCount(count)
      } finally {
        setLoading(false)
      }
    })()

    return () => {
      for (const u of unsubs) u()
    }
  }, [])

  const displayName = useMemo(() => user.displayName ?? user.email ?? 'User', [user.displayName, user.email])

  function formatExamDate(exam: LatestExam) {
    if (!exam.createdAt) return '-'
    return exam.createdAt.toDate().toLocaleString()
  }

  function formatExamNurse(exam: LatestExam) {
    const name = (exam.nurseName ?? '').trim()
    const nurseId = (exam.nurseId ?? '').trim()
    if (nurseId && name) return `${nurseId} - ${name}`
    return name || '-'
  }

  const studentsCount = useMemo(() => {
    return students.filter((s) => ((s.firstName ?? '').trim() && (s.lastName ?? '').trim() ? true : false)).length
  }, [students])

  const nursesCount = useMemo(() => {
    return nurses.filter((n) => ((n.firstName ?? '').trim() && (n.lastName ?? '').trim() ? true : false)).length
  }, [nurses])

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Boshqaruv paneli</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-sm text-slate-600">
          Xush kelibsiz, <span className="font-medium text-slate-900">{displayName}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium text-slate-500">O'quvchilar</div>
          <div className="mt-2 text-3xl font-semibold">{loading ? '-' : studentsCount}</div>
          <div className="mt-3">
            <Link className="text-sm text-indigo-600 hover:text-indigo-500" to="/students">
              Ro'yxatga o'tish
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Hamshiralar</div>
          <div className="mt-2 text-3xl font-semibold">{loading ? '-' : nursesCount}</div>
          <div className="mt-3">
            <Link className="text-sm text-indigo-600 hover:text-indigo-500" to="/nurses">
              Ro'yxatga o'tish
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Tekshiruvlar</div>
          <div className="mt-2 text-3xl font-semibold">{loading ? '-' : examCount ?? '-'}</div>
          <div className="mt-1 text-xs text-slate-500">Jami tekshiruvlar soni</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-base font-semibold">Oxirgi tekshiruvlar</div>
            <div className="mt-1 text-sm text-slate-600">So'nggi 5 ta tekshiruv</div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-500">
                <th className="border-b border-slate-200 pb-2">Sana</th>
                <th className="border-b border-slate-200 pb-2">Hamshira</th>
                <th className="border-b border-slate-200 pb-2">O'quvchi</th>
              </tr>
            </thead>
            <tbody>
              {latestExams.map((e) => (
                <tr key={`${e.studentId}_${e.examId}`} className="text-sm text-slate-900">
                  <td className="border-b border-slate-100 py-2 pr-4">{formatExamDate(e)}</td>
                  <td className="border-b border-slate-100 py-2 pr-4">{formatExamNurse(e)}</td>
                  <td className="border-b border-slate-100 py-2">
                    <div className="flex items-center gap-2">
                      <Link className="text-indigo-600 hover:text-indigo-500" to={`/students/${e.studentId}`}>
                        {e.studentId}
                      </Link>
                      <Link
                        className="text-xs text-slate-500 hover:text-slate-700"
                        to={`/students/${e.studentId}/exams/${e.examId}`}
                      >
                        Ko'rish
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {latestExams.length === 0 ? (
                <tr>
                  <td className="py-3 text-sm text-slate-600" colSpan={3}>
                    Hali tekshiruvlar yo'q.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
