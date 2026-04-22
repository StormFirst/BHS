import { useState } from 'react'
import logo from '../assets/logo.png'

type Props = {
  onLoginWithEmail: (email: string, password: string) => Promise<void>
  onLoginWithGoogle?: () => Promise<void>
}

export default function LoginPage({
  onLoginWithEmail,
}: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEmailLogin() {
    setSubmitting(true)
    setError(null)
    try {
      await onLoginWithEmail(email, password)
      setPassword('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen w-full items-center p-6">
        <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
          <div className="h-1 w-full bg-emerald-600" />

          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <img src={logo} alt="Logo" className="h-16 w-16 object-contain" />
              </div>

              <h1 className="mt-4 text-lg font-semibold">Jizzax Prezident Maktabi</h1>
            </div>

            <form
              className="mt-6 grid gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                if (!email || !password || submitting) return
                void handleEmailLogin()
              }}
            >
              <div className="relative">
                <input
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 pr-10 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-400"
                  placeholder="Login / Xodim ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <input
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 pr-10 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-400"
                  placeholder="Parol"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  </svg>
                </div>
              </div>

              {error ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </div>
              ) : null}

              <button
                className="mt-2 rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
                type="submit"
                disabled={!email || !password || submitting}
              >
                {submitting ? 'Kirilmoqda...' : 'Kirish'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
