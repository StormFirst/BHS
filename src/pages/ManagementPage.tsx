import { Link } from 'react-router-dom'

export default function ManagementPage() {

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Boshqaruv</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Fanlar va to'garaklar boshqaruvi</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          to="/management/clubs"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40"
        >
          <div className="text-base font-semibold text-slate-900 dark:text-white">To'garaklar</div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Qo'shish / o'chirish</div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            O'quvchiga biriktirish: Student ichida "To'garaklar" bo'limida.
          </div>
        </Link>

        <Link
          to="/management/subjects"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40"
        >
          <div className="text-base font-semibold text-slate-900 dark:text-white">Fanlar</div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Qo'shish / o'chirish</div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">Fanlar o'quvchilarga biriktirilmaydi.</div>
        </Link>
      </div>
    </div>
  )
}
