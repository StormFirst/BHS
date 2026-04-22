import { Link, useParams } from 'react-router-dom'

export default function StudentExtraLessonsPage() {
  const { id } = useParams()

  if (!id) {
    return (
      <div className="grid gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Qo'shimcha darslar</h1>
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
          <h1 className="text-2xl font-semibold">Qo'shimcha darslar</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            O'quvchi ID: <span className="font-medium">{id}</span>
          </p>
        </div>

        <Link className="w-fit rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800" to={`/students/${id}`}>
          Orqaga
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
        <div className="text-base font-semibold">Bu bo‘limda nimalar bo‘lishi mumkin</div>
        <div className="mt-3 grid gap-3 text-sm text-slate-700 dark:text-slate-200 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
            <div className="font-medium">Fan va daraja</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Fan nomi (matematika, ingliz tili...), daraja (beginner/advanced), maqsad.
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
            <div className="font-medium">Ustoz / markaz</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Ustoz ismi, aloqa, joylashuv, to'lov turi (ixtiyoriy).
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
            <div className="font-medium">Jadval</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Haftalik jadval, dars vaqti, davomiyligi, guruh/individual.
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
            <div className="font-medium">Progress</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Kirish testi, oraliq natijalar, uy vazifalari, baholash va izohlar.
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
        <div className="text-base font-semibold">Ma’lumotlar</div>
        <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">Hali ma’lumotlar kiritilmagan.</div>
      </div>
    </div>
  )
}
