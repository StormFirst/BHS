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

export default function StudentExamPage() {
  const { id } = useParams()

  const [nurses, setNurses] = useState<Nurse[]>([])
  const [loadingNurses, setLoadingNurses] = useState(true)
  const [selectedNurseId, setSelectedNurseId] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = listenNurses((items) => {
      setNurses(items)
      setLoadingNurses(false)
    })
    return () => unsub()
  }, [])

  const allFieldNames = useMemo(() => {
    const names: string[] = []
    for (const section of sections) {
      for (const f of section.fields) names.push(f.name)
      names.push(sectionNoteKey(section.title))
    }
    return names
  }, [])

  function setFieldValue(name: string, value: string) {
    setAnswers((prev) => ({ ...prev, [name]: value }))
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
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
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

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
        <div className="grid gap-4">
          <div className="text-base font-semibold">Tekshiruvni saqlash</div>

          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Qaysi hamshira tomonidan tekshiruv qilindi</div>
            {loadingNurses ? (
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Yuklanmoqda...</div>
            ) : nurses.length === 0 ? (
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Hamshiralar topilmadi.</div>
            ) : (
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {nurses.map((n) => {
                  const label = `${(n.firstName ?? '').trim()} ${(n.lastName ?? '').trim()}`.trim() || 'Hamshira'
                  const code = (n.nurseId ?? '').trim()
                  const selected = selectedNurseId === n.id
                  return (
                    <button
                      key={n.id}
                      type="button"
                      disabled={saving}
                      onClick={() => setSelectedNurseId(n.id)}
                      className={[
                        'group w-full rounded-xl border p-4 text-left shadow-sm transition',
                        'bg-white hover:bg-slate-50 border-slate-200',
                        'dark:bg-slate-950/30 dark:hover:bg-slate-900/30 dark:border-slate-800',
                        selected
                          ? 'ring-2 ring-indigo-500 border-indigo-200 dark:border-indigo-500/40'
                          : 'ring-0',
                        saving ? 'opacity-60' : '',
                      ].join(' ')}
                      aria-pressed={selected}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {code ? `${code} - ${label}` : label}
                          </div>
                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tekshiruvni saqlash uchun tanlang</div>
                        </div>

                        <div
                          className={[
                            'mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border',
                            selected
                              ? 'border-indigo-500 bg-indigo-500 text-white'
                              : 'border-slate-300 bg-white text-transparent dark:border-slate-700 dark:bg-slate-950/30',
                          ].join(' ')}
                          aria-hidden="true"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                            <path
                              fillRule="evenodd"
                              d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.55a1 1 0 0 1-1.42 0L3.29 9.724a1 1 0 1 1 1.42-1.4l3.37 3.42 6.79-6.84a1 1 0 0 1 1.414-.01Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {error ? <div className="text-sm text-red-600 dark:text-red-300">{error}</div> : null}

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

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section, idx) => (
          <div key={section.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex flex-col gap-1">
              <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{`${idx + 1}) ${section.title.replace(/^\d+\)\s*/, '')}`}</div>
              {section.description ? <div className="text-sm text-slate-600 dark:text-slate-300">{section.description}</div> : null}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {section.fields.map((f) => (
                <div key={f.name} className="grid gap-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{f.name}</div>
                    {f.note ? <div className="text-xs text-slate-500 dark:text-slate-400">{f.note}</div> : <div />}
                  </div>
                  <input
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:focus:border-indigo-400"
                    value={answers[f.name] ?? ''}
                    onChange={(e) => setFieldValue(f.name, e.target.value)}
                    disabled={saving}
                  />
                </div>
              ))}

              <div className="grid gap-1 md:col-span-2">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Izoh</div>
                <textarea
                  className="min-h-24 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:focus:border-indigo-400"
                  value={answers[sectionNoteKey(section.title)] ?? ''}
                  onChange={(e) => setFieldValue(sectionNoteKey(section.title), e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
