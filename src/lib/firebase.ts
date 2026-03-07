import { initializeApp } from 'firebase/app'
import {
  type User,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getFirestore,
  getDoc,
  getCountFromServer,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  limit,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore'
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export function listenAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

export async function registerWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider()
  return signInWithPopup(auth, provider)
}

export async function logout() {
  return signOut(auth)
}

export type DemoMessage = {
  id: string
  text: string
  uid: string
  email: string | null
  createdAt: Timestamp | null
}

export function listenMessages(callback: (msgs: DemoMessage[]) => void) {
  const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const msgs: DemoMessage[] = snap.docs.map((d) => {
      const data = d.data() as Omit<DemoMessage, 'id'>
      return { id: d.id, ...data }
    })
    callback(msgs)
  })
}

export async function addMessage(text: string, user: User) {
  return addDoc(collection(db, 'messages'), {
    text,
    uid: user.uid,
    email: user.email ?? null,
    createdAt: serverTimestamp(),
  })
}

export type LatestExam = {
  examId: string
  studentId: string
  nurseId: string | null
  nurseName: string
  createdAt: Timestamp | null
}

export function listenLatestExams(
  take: number,
  callback: (items: LatestExam[]) => void,
) {
  const q = query(collectionGroup(db, 'exams'), orderBy('createdAt', 'desc'), limit(take))
  return onSnapshot(q, (snap) => {
    const items: LatestExam[] = snap.docs.map((d) => {
      const data = d.data() as {
        nurseId?: string | null
        nurseName?: string
        createdAt?: Timestamp | null
      }
      const studentId = d.ref.parent.parent?.id ?? '-'
      return {
        examId: d.id,
        studentId,
        nurseId: data.nurseId ?? null,
        nurseName: data.nurseName ?? '-',
        createdAt: data.createdAt ?? null,
      }
    })
    callback(items)
  })
}

export async function getExamCount() {
  const snap = await getCountFromServer(collectionGroup(db, 'exams'))
  return snap.data().count
}

export async function uploadUserFile(file: File, user: User) {
  const fileRef = ref(storage, `uploads/${user.uid}/${Date.now()}_${file.name}`)
  await uploadBytes(fileRef, file)
  const url = await getDownloadURL(fileRef)
  return url
}

export type Student = {
  id: string
  firstName: string
  lastName: string
  gender: string
  age: number
  email: string
  className: string
  birthDate: string
  photoUrl: string | null
  heightCm: number
  weightKg: number
  vision: string
  hemoglobinGL: number
  diseaseHistory3m: string
  createdAt: Timestamp | null
  createdByUid: string
}

export type StudentInput = {
  firstName: string
  lastName: string
  gender: string
  age: number
  email: string
  className: string
  birthDate: string
  photoUrl: string | null
  heightCm: number
  weightKg: number
  vision: string
  hemoglobinGL: number
  diseaseHistory3m: string
}

export type StudentExam = {
  id: string
  nurseId: string | null
  nurseName: string
  answers: Record<string, string>
  createdAt: Timestamp | null
}

export type StudentExamInput = {
  nurseId: string | null
  nurseName: string
  answers: Record<string, string>
}

export function listenStudents(callback: (students: Student[]) => void) {
  const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const students: Student[] = snap.docs.map((d) => {
      const data = d.data() as Omit<Student, 'id'>
      return { id: d.id, ...data }
    })
    callback(students)
  })
}

export async function uploadStudentPhoto(file: File, user: User) {
  const fileRef = ref(storage, `students/${user.uid}/${Date.now()}_${file.name}`)
  await uploadBytes(fileRef, file)
  const url = await getDownloadURL(fileRef)
  return url
}

export async function addStudent(input: StudentInput, user: User) {
  return addDoc(collection(db, 'students'), {
    ...input,
    createdByUid: user.uid,
    createdAt: serverTimestamp(),
  })
}

export function listenStudentExams(
  studentId: string,
  callback: (exams: StudentExam[]) => void,
) {
  const q = query(collection(db, 'students', studentId, 'exams'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const exams: StudentExam[] = snap.docs.map((d) => {
      const data = d.data() as Omit<StudentExam, 'id'>
      return { id: d.id, ...data }
    })
    callback(exams)
  })
}

export function listenStudentExam(
  studentId: string,
  examId: string,
  callback: (exam: StudentExam | null) => void,
) {
  const refDoc = doc(db, 'students', studentId, 'exams', examId)
  return onSnapshot(refDoc, (snap) => {
    if (!snap.exists()) {
      callback(null)
      return
    }
    const data = snap.data() as Omit<StudentExam, 'id'>
    callback({ id: snap.id, ...data })
  })
}

export async function addStudentExam(studentId: string, input: StudentExamInput) {
  return addDoc(collection(db, 'students', studentId, 'exams'), {
    ...input,
    createdAt: serverTimestamp(),
  })
}

export function listenStudent(studentId: string, callback: (student: Student | null) => void) {
  const refDoc = doc(db, 'students', studentId)
  return onSnapshot(refDoc, (snap) => {
    if (!snap.exists()) {
      callback(null)
      return
    }
    const data = snap.data() as Omit<Student, 'id'>
    callback({ id: snap.id, ...data })
  })
}

export async function deleteStudent(studentId: string) {
  const refDoc = doc(db, 'students', studentId)
  return deleteDoc(refDoc)
}

export type Nurse = {
  id: string
  nurseId: string
  firstName: string
  lastName: string
  age: number
  createdAt: Timestamp | null
}

export type NurseInput = {
  firstName: string
  lastName: string
  age: number
}

export function listenNurses(callback: (nurses: Nurse[]) => void) {
  const q = query(collection(db, 'nurses'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const nurses: Nurse[] = snap.docs.map((d) => {
      const data = d.data() as Omit<Nurse, 'id'>
      return { id: d.id, ...data }
    })
    callback(nurses)
  })
}

export function listenNurse(nurseDocId: string, callback: (nurse: Nurse | null) => void) {
  const refDoc = doc(db, 'nurses', nurseDocId)
  return onSnapshot(refDoc, (snap) => {
    if (!snap.exists()) {
      callback(null)
      return
    }
    const data = snap.data() as Omit<Nurse, 'id'>
    callback({ id: snap.id, ...data })
  })
}

export async function updateNurse(nurseDocId: string, input: NurseInput) {
  const refDoc = doc(db, 'nurses', nurseDocId)
  return updateDoc(refDoc, {
    ...input,
  })
}

export async function deleteNurse(nurseDocId: string) {
  const refDoc = doc(db, 'nurses', nurseDocId)
  return deleteDoc(refDoc)
}

function generate4DigitId() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

export async function addNurse(input: NurseInput) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const nurseId = generate4DigitId()
    const refDoc = doc(db, 'nurses', nurseId)
    const existing = await getDoc(refDoc)
    if (existing.exists()) continue

    await setDoc(refDoc, {
      nurseId,
      ...input,
      createdAt: serverTimestamp(),
    })

    return nurseId
  }

  throw new Error('Nurse ID yaratib bo‘lmadi, qayta urinib ko‘ring')
}
