import { useEffect, useState } from 'react'
import { getCourses } from './api/courseApi'
import type { Course } from './types/course'
import './App.css'

function App() {
  const [courses, setCourses] = useState<Course[]>([])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { getCourses().then((res) => setCourses(res.data.content)).catch(() => setError('Không kết nối được Gateway hoặc course-service.')) }, [])
  return <main className="app"><h1>CRS - Danh sách môn học</h1>{error && <p className="error">{error}</p>}{!error && courses.map((c) => <article className="course" key={c.id}><h2>{c.tenMonHoc}</h2><p>{c.soTinChi} tín chỉ - còn {c.soChoConLai}/{c.soChoToiDa} chỗ</p></article>)}</main>
}
export default App
