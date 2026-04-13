import { useState } from 'react'

type Props = {
  onLoginWithEmail: (email: string, password: string) => Promise<void>
  onLoginWithGoogle: () => Promise<void>
}

export default function LoginPage({
  onLoginWithEmail,
  onLoginWithGoogle,
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

  async function handleGoogleLogin() {
    setSubmitting(true)
    setError(null)
    try {
      await onLoginWithGoogle()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center p-6">
        <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
          <h1 className="text-2xl font-semibold">Login</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Email/Password yoki Google orqali kirish.
          </p>

          <div className="mt-5 grid gap-3">
            <input
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
              onClick={handleEmailLogin}
              disabled={!email || !password || submitting}
            >
              Login
            </button>

            <div className="my-1 h-px bg-slate-200 dark:bg-slate-800" />

            <button
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
              onClick={handleGoogleLogin}
              disabled={submitting}
            >
              Continue with Google
            </button>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Firebase Console → Authentication → Sign-in method ichida Email/Password va Google yoqilgan bo‘lishi kerak.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
