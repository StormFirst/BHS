import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listenStudentExam, type StudentExam } from '../lib/firebase'

type Field = {
  name: string
  note?: string
}

type Section = {
  title: string
  description?: string
  fields: Field[]
}

function sectionNoteKey(title: string) {
  return `${title}__izoh`
}

const sections: Section[] = [
  {
    title: "1) O'quvchi ma'lumotlari",
    fields: [
      { name: 'Allergiyalar', note: 'ha/yo‘q + izoh' },
      { name: 'Surunkali kasalliklar', note: 'matn' },
      { name: 'Hozir qabul qilayotgan dori-darmonlar' },
      { name: 'Emlash holati' },
    ],
  },
  {
    title: '2) Antropometrik o‘lchovlar',
    fields: [
      { name: 'Bo‘y (sm)' },
      { name: 'Vazn (kg)' },
      { name: 'BMI', note: 'avtomatik hisoblanadi' },
      { name: 'Ko‘krak aylana (sm)', note: 'ixtiyoriy' },
      { name: 'Oziqlanish holati', note: 'normal / ozg‘in / ortiqcha vazn' },
    ],
  },
  {
    title: '3) Hayotiy ko‘rsatkichlar (vital signs)',
    fields: [
      { name: 'Tana harorati' },
      { name: 'Yurak urishi (puls)' },
      { name: 'Qon bosimi', note: 'sistolik / diastolik' },
      { name: 'Nafas olish chastotasi' },
      { name: 'Kislorod to‘yinganligi (SpO2)' },
    ],
  },
  {
    title: '4) Ko‘rish tekshiruvi',
    fields: [
      { name: "O'ng ko‘z ko‘rish qobiliyati" },
      { name: 'Chap ko‘z ko‘rish qobiliyati' },
      { name: 'Ranglarni ajratish testi' },
      { name: 'Ko‘z bo‘yicha shikoyatlar' },
      { name: 'Ko‘zoynak taqadimi', note: 'ha/yo‘q' },
      { name: 'Shifokor xulosasi' },
    ],
  },
  {
    title: '5) Eshitish / LOR (ENT) tekshiruvi',
    fields: [
      { name: "O'ng quloq eshitishi" },
      { name: 'Chap quloq eshitishi' },
      { name: 'Quloq bo‘yicha shikoyatlar' },
      { name: 'Burun orqali nafas olish holati' },
      { name: 'Bodomcha (tonsillar) holati' },
      { name: 'Shifokor xulosasi' },
    ],
  },
  {
    title: '6) Stomatologik tekshiruv',
    fields: [
      { name: 'Karies holati', note: 'yo‘q / yengil / o‘rtacha / og‘ir' },
      { name: 'Zararlangan tishlar soni' },
      { name: 'Milklar holati' },
      { name: 'Og‘iz gigiyenasi holati' },
      { name: 'Davolash bo‘yicha tavsiya' },
    ],
  },
  {
    title: '9) Nevrologik / psixologik skrining',
    fields: [
      { name: 'Uyqu sifati' },
      { name: 'Tez-tez bosh og‘rishi' },
      { name: 'Diqqat yoki tez charchash muammolari' },
      { name: 'Shifokor izohlari' },
    ],
  },
  {
    title: '10) Laborator tahlillar (ixtiyoriy)',
    fields: [
      { name: 'Qon tahlili natijalari' },
      { name: 'Siydik tahlili natijalari' },
      { name: 'Qondagi glyukoza' },
      { name: 'Parazit tekshiruvi' },
      { name: 'Lab hisobotlarini yuklash', note: 'fayl upload' },
    ],
  },
  {
    title: '11) Yakuniy tibbiy xulosa',
    fields: [
      { name: 'Salomatlik guruhi', note: 'I / II / III' },
      { name: 'Jismoniy tarbiya guruhi', note: 'asosiy / tayyorlov / maxsus' },
      { name: 'Cheklovlar' },
      { name: 'Mutaxassisga yo‘llanmalar' },
      { name: 'Tekshiruv sanasi' },
      { name: 'Tibbiyot xodimi ismi' },
    ],
  },
]

export default function StudentExamDetailsPage() {
  const { id, examId } = useParams()
  const [exam, setExam] = useState<StudentExam | null>(null)
  const [loading, setLoading] = useState(true)

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const s of sections) {
      initial[s.title] = false
    }
    if (sections[0]) initial[sections[0].title] = true
    return initial
  })

  useEffect(() => {
    if (!id || !examId) return
    const unsub = listenStudentExam(id, examId, (x) => {
      setExam(x)
      setLoading(false)
    })
    return () => unsub()
  }, [id, examId])

  const header = useMemo(() => {
    if (!exam) return '-'
    const nurseName = (exam.nurseName ?? '').trim() || '-'
    return `Hamshira: ${nurseName}`
  }, [exam])

  function toggleSection(title: string) {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  if (!id || !examId) {
    return (
      <div className="grid gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tekshiruv</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Student ID yoki tekshiruv ID topilmadi.</p>
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
          <h1 className="text-2xl font-semibold">Tekshiruvni ko‘rish</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{header}</p>
        </div>

        <Link className="w-fit rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800" to={`/students/${id}`}>
          Orqaga
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-slate-600 dark:text-slate-300">Loading...</div>
      ) : !exam ? (
        <div className="text-sm text-slate-600 dark:text-slate-300">Tekshiruv topilmadi.</div>
      ) : (
        <div className="grid gap-4">
          {sections.map((section, idx) => (
            <div key={section.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 text-left"
                onClick={() => toggleSection(section.title)}
              >
                <div>
                  <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{`${idx + 1}) ${section.title.replace(/^\d+\)\s*/, '')}`}</div>
                  {section.description ? <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{section.description}</div> : null}
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-sm text-slate-500 dark:text-slate-400">{openSections[section.title] ? 'Yopish' : 'Ochish'}</div>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={[
                      'h-5 w-5 text-slate-500 transition-transform duration-200 dark:text-slate-400',
                      openSections[section.title] ? 'rotate-180' : 'rotate-0',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </button>

              <div
                className={[
                  'grid transition-all duration-300 ease-in-out',
                  openSections[section.title] ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0',
                ].join(' ')}
              >
                <div className="overflow-hidden">
                  <div className="grid gap-3">
                    {section.fields.map((f) => (
                      <div key={f.name} className="grid gap-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{f.name}</div>
                          {f.note ? <div className="text-xs text-slate-500 dark:text-slate-400">{f.note}</div> : <div />}
                        </div>
                        <div className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-100">
                          {(exam.answers?.[f.name] ?? '').trim() || '-'}
                        </div>
                      </div>
                    ))}

                    <div className="grid gap-1">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Izoh</div>
                      <div className="w-full whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-100">
                        {(exam.answers?.[sectionNoteKey(section.title)] ?? '').trim() || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
