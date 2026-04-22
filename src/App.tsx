import { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { Navigate, Route, Routes } from 'react-router-dom'
import { listenAuth, loginWithEmail, loginWithGoogle, logout } from './lib/firebase'
import AppLayout from './layout/AppLayout'
import AddStudentPage from './pages/AddStudentPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import NursesPage from './pages/NursesPage'
import AddNursePage from './pages/AddNursePage'
import NurseDetailsPage from './pages/NurseDetailsPage'
import SettingsPage from './pages/SettingsPage'
import ClubsManagePage from './pages/ClubsManagePage'
import ClubDetailsManagePage from './pages/ClubDetailsManagePage'
import SubjectsManagePage from './pages/SubjectsManagePage'
import StudentDetailsPage from './pages/StudentDetailsPage'
import StudentAcademicActivityPage from './pages/StudentAcademicActivityPage'
import StudentClubsPage from './pages/StudentClubsPage'
import StudentExtraLessonsPage from './pages/StudentExtraLessonsPage'
import StudentExamPage from './pages/StudentExamPage'
import StudentExamDetailsPage from './pages/StudentExamDetailsPage'
import StudentIllnessHistoryPage from './pages/StudentIllnessHistoryPage'
import StudentPortfolioPage from './pages/StudentPortfolioPage'
import StudentsListPage from './pages/StudentsListPage'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsub = listenAuth((u) => {
      setUser(u)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [])

  async function handleLogin(email: string, password: string) {
    await loginWithEmail(email, password)
  }

  async function handleGoogle() {
    await loginWithGoogle()
  }

  async function handleLogout() {
    await logout()
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="flex min-h-screen w-full items-center justify-center p-6">
          <div className="text-sm text-slate-600 dark:text-slate-300">Loading auth...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <LoginPage
        onLoginWithEmail={handleLogin}
        onLoginWithGoogle={handleGoogle}
      />
    )
  }

  return (
    <Routes>
      <Route element={<AppLayout user={user} onLogout={handleLogout} />}>
        <Route index element={<DashboardPage user={user} />} />
        <Route path="students" element={<StudentsListPage />} />
        <Route path="students/new" element={<AddStudentPage user={user} />} />
        <Route path="students/:id" element={<StudentDetailsPage />} />
        <Route path="students/:id/academic-activity" element={<StudentAcademicActivityPage />} />
        <Route path="students/:id/clubs" element={<StudentClubsPage />} />
        <Route path="students/:id/extra-lessons" element={<StudentExtraLessonsPage />} />
        <Route path="students/:id/portfolio" element={<StudentPortfolioPage />} />
        <Route path="students/:id/exam" element={<StudentExamPage />} />
        <Route path="students/:id/exams/:examId" element={<StudentExamDetailsPage />} />
        <Route path="students/:id/illness-history" element={<StudentIllnessHistoryPage />} />
        <Route path="nurses" element={<NursesPage />} />
        <Route path="nurses/new" element={<AddNursePage />} />
        <Route path="nurses/:id" element={<NurseDetailsPage />} />
        <Route path="management/clubs" element={<ClubsManagePage />} />
        <Route path="management/clubs/:clubId" element={<ClubDetailsManagePage />} />
        <Route path="management/subjects" element={<SubjectsManagePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
