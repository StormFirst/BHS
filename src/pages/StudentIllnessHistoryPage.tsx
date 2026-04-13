import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  addStudentIllnessRecord,
  listenNurses,
  listenStudentIllnessRecords,
  type Nurse,
  type StudentIllnessRecord,
  type StudentIllnessRecordInput,
} from '../lib/firebase'

function inputClassName(disabled?: boolean) {
  return [
    'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:focus:border-indigo-400',
    disabled ? 'opacity-60' : '',
  ].join(' ')
}

export default function StudentIllnessHistoryPage() {
  const { id } = useParams()

  const [items, setItems] = useState<StudentIllnessRecord[]>([])
  const [loading, setLoading] = useState(true)

  const [nurses, setNurses] = useState<Nurse[]>([])
  const [loadingNurses, setLoadingNurses] = useState(true)

  const [selectedNurseId, setSelectedNurseId] = useState('')
  const [diseaseName, setDiseaseName] = useState('')
  const [visitDate, setVisitDate] = useState('')
  const [treatment, setTreatment] = useState('')
  const [details, setDetails] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = listenNurses((x: Nurse[]) => {
      setNurses(x)
      setLoadingNurses(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!id) return
    const unsub = listenStudentIllnessRecords(id, (x: StudentIllnessRecord[]) => {
      setItems(x)
      setLoading(false)
    })
    return () => unsub()
  }, [id])

  const nurseOptions = useMemo(() => {
    return nurses.map((n) => {
      const name = `${(n.firstName ?? '').trim()} ${(n.lastName ?? '').trim()}`.trim() || 'Hamshira'
      const code = (n.nurseId ?? '').trim()
      const label = code ? `${code} - ${name}` : name
      return { id: n.id, label, name }
    })
  }, [nurses])

  function formatCreatedAt(item: StudentIllnessRecord) {
    if (!item.createdAt) return '-'
    return item.createdAt.toDate().toLocaleString()
  }

  async function handleSave() {
    if (!id) return
    setSaving(true)
    setError(null)
    try {
      if (!selectedNurseId.trim()) throw new Error('Kim tekshirganligini tanlang')
      if (!diseaseName.trim()) throw new Error('Kasallik nomi majburiy')
      if (!visitDate) throw new Error('Sana majburiy')

      const nurse = nurses.find((n) => n.id === selectedNurseId) ?? null
      const nurseName = nurse ? `${nurse.firstName ?? ''} ${nurse.lastName ?? ''}`.trim() : ''
      if (!nurseName) throw new Error('Hamshira topilmadi')

      const payload: StudentIllnessRecordInput = {
        nurseId: nurse?.id ?? null,
        nurseName,
        diseaseName: diseaseName.trim(),
        visitDate,
        treatment: treatment.trim() ? treatment.trim() : null,
        details: details.trim() ? details.trim() : null,
      }

      await addStudentIllnessRecord(id, payload)

      setSelectedNurseId('')
      setDiseaseName('')
      setVisitDate('')
      setTreatment('')
      setDetails('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Saqlashda xatolik')
    } finally {
      setSaving(false)
    }
  }

  if (!id) {
    return (
      <div className="grid gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Kasallik tarixi</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Student ID topilmadi.</p>
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
          <h1 className="text-2xl font-semibold">Kasallik tarixi</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            O'quvchi ID: <span className="font-medium">{id}</span>
          </p>
        </div>

        <Link className="w-fit rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800" to={`/students/${id}`}>
          Orqaga
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
        <div className="grid gap-4">
          <div className="text-base font-semibold">Yangi yozuv qo'shish</div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Kim tekshirgan</div>
              <select
                className={inputClassName(saving || loadingNurses)}
                value={selectedNurseId}
                onChange={(e) => setSelectedNurseId(e.target.value)}
                disabled={saving || loadingNurses}
              >
                <option value="">{loadingNurses ? 'Yuklanmoqda...' : 'Tanlang'}</option>
                {nurseOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Sana</div>
              <input
                className={inputClassName(saving)}
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Nima kasalligi</div>
              <input
                className={inputClassName(saving)}
                value={diseaseName}
                onChange={(e) => setDiseaseName(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Davolash uchun nima qilingan</div>
              <textarea
                className={[inputClassName(saving), 'min-h-[96px] resize-y'].join(' ')}
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Qanday davolanganligi (izoh)</div>
              <textarea
                className={[inputClassName(saving), 'min-h-[96px] resize-y'].join(' ')}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <div className="flex items-center gap-2">
            <button
              className="w-fit rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
              onClick={() => void handleSave()}
              disabled={saving}
              type="button"
            >
              {saving ? 'Saqlanmoqda...' : "Yozuvni saqlash"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
        <div className="text-base font-semibold">Ro'yxat</div>

        {loading ? (
          <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">Loading...</div>
        ) : items.length === 0 ? (
          <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">Hali yozuvlar yo'q.</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                  <th className="border-b border-slate-200 pb-2 dark:border-slate-800">Sana</th>
                  <th className="border-b border-slate-200 pb-2 dark:border-slate-800">Kim tekshirgan</th>
                  <th className="border-b border-slate-200 pb-2 dark:border-slate-800">Kasallik</th>
                  <th className="border-b border-slate-200 pb-2 dark:border-slate-800">Kiritilgan</th>
                </tr>
              </thead>
              <tbody>
                {items.map((x) => (
                  <tr key={x.id} className="align-top text-sm text-slate-900 dark:text-slate-100">
                    <td className="border-b border-slate-100 py-2 pr-4 dark:border-slate-800/70">{x.visitDate ?? '-'}</td>
                    <td className="border-b border-slate-100 py-2 pr-4 dark:border-slate-800/70">{(x.nurseName ?? '').trim() || '-'}</td>
                    <td className="border-b border-slate-100 py-2 pr-4 dark:border-slate-800/70">{(x.diseaseName ?? '').trim() || '-'}</td>
                    <td className="border-b border-slate-100 py-2 dark:border-slate-800/70">{formatCreatedAt(x)}</td>
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
