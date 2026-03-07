import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  addStudentExam,
  listenNurses,
  type Nurse,
  type StudentExamInput,
} from '../lib/firebase'

type Field = {
  name: string
  note?: string
}

type Section = {
  title: string
  description?: string
  fields: Field[]
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
    title: '7) Umumiy jismoniy ko‘rik',
    fields: [
      { name: 'Shikoyatlar' },
      { name: 'Teri holati' },
      { name: 'Limfa tugunlari' },
      { name: 'O‘pka auskultatsiyasi' },
      { name: 'Yurak auskultatsiyasi' },
      { name: 'Qorin bo‘shlig‘i tekshiruvi' },
      { name: 'Shifokor izohlari' },
      { name: 'Yo‘llanma kerakmi', note: 'ha/yo‘q' },
    ],
  },
  {
    title: '8) Qomat va tayanch-harakat apparati tekshiruvi',
    fields: [
      { name: 'Skolioz belgilari' },
      { name: 'Qomat turi' },
      { name: 'Yassi oyoqlik' },
      { name: 'Tavsiyalar' },
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

export default function StudentExamPage() {
  const { id } = useParams()

  const [nurses, setNurses] = useState<Nurse[]>([])
  const [loadingNurses, setLoadingNurses] = useState(true)
  const [selectedNurseId, setSelectedNurseId] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = listenNurses((items) => {
      setNurses(items)
      setLoadingNurses(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    setOpenSections((prev) => {
      if (Object.keys(prev).length > 0) return prev
      const initial: Record<string, boolean> = {}
      for (const s of sections) {
        initial[s.title] = false
      }
      if (sections[0]) initial[sections[0].title] = true
      return initial
    })
  }, [])

  const allFieldNames = useMemo(() => {
    const names: string[] = []
    for (const section of sections) {
      for (const f of section.fields) names.push(f.name)
    }
    return names
  }, [])

  function setFieldValue(name: string, value: string) {
    setAnswers((prev) => ({ ...prev, [name]: value }))
  }

  function toggleSection(title: string) {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  async function handleSave() {
    if (!id) return
    setSaving(true)
    setError(null)
    try {
      if (!selectedNurseId.trim()) throw new Error('Hamshiradan tanlang')
      const nurse = nurses.find((n) => n.id === selectedNurseId) ?? null
      const nurseName = nurse ? `${nurse.firstName ?? ''} ${nurse.lastName ?? ''}`.trim() : ''
      if (!nurseName) throw new Error('Hamshira topilmadi')

      const cleanAnswers: Record<string, string> = {}
      for (const name of allFieldNames) {
        cleanAnswers[name] = (answers[name] ?? '').trim()
      }

      const payload: StudentExamInput = {
        nurseId: nurse?.id ?? null,
        nurseName,
        answers: cleanAnswers,
      }

      await addStudentExam(id, payload)
      setSelectedNurseId('')
      setAnswers({})
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Saqlashda xatolik')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tibbiy tekshiruv</h1>
          <p className="mt-1 text-sm text-slate-600">
            O'quvchi ID: <span className="font-medium">{id ?? '-'}</span>
          </p>
        </div>

        <Link
          className="w-fit rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
          to={id ? `/students/${id}` : '/students'}
        >
          Orqaga
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4">
          <div className="text-base font-semibold">Tekshiruvni saqlash</div>

          <div>
            <div className="text-sm font-medium">Qaysi hamshira tomonidan tekshiruv qilindi</div>
            <select
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
              value={selectedNurseId}
              onChange={(e) => setSelectedNurseId(e.target.value)}
              disabled={saving || loadingNurses}
            >
              <option value="">{loadingNurses ? 'Yuklanmoqda...' : 'Tanlang'}</option>
              {nurses.map((n) => {
                const label = `${(n.firstName ?? '').trim()} ${(n.lastName ?? '').trim()}`.trim() || 'Hamshira'
                const nurseId = (n.nurseId ?? '').trim()
                return (
                  <option key={n.id} value={n.id}>
                    {nurseId ? `${nurseId} - ${label}` : label}
                  </option>
                )
              })}
            </select>
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <div className="flex items-center gap-2">
            <button
              className="w-fit rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
              onClick={handleSave}
              disabled={saving || !id}
              type="button"
            >
              {saving ? 'Saqlanmoqda...' : 'Tekshiruvni saqlash'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {sections.map((section) => (
          <div key={section.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 text-left"
              onClick={() => toggleSection(section.title)}
            >
              <div>
                <div className="text-base font-semibold">{section.title}</div>
                {section.description ? (
                  <div className="mt-1 text-sm text-slate-600">{section.description}</div>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <div className="text-sm text-slate-500">{openSections[section.title] ? 'Yopish' : 'Ochish'}</div>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={[
                    'h-5 w-5 text-slate-500 transition-transform duration-200',
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
                openSections[section.title]
                  ? 'grid-rows-[1fr] opacity-100 mt-4'
                  : 'grid-rows-[0fr] opacity-0 mt-0',
              ].join(' ')}
            >
              <div className="overflow-hidden">
                <div className="grid gap-3">
                  {section.fields.map((f) => (
                    <div key={f.name} className="grid gap-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-sm font-medium text-slate-900">{f.name}</div>
                        {f.note ? <div className="text-xs text-slate-500">{f.note}</div> : <div />}
                      </div>
                      <input
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
                        value={answers[f.name] ?? ''}
                        onChange={(e) => setFieldValue(f.name, e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
