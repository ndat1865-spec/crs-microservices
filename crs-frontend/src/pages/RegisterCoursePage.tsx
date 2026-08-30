import axios from 'axios'
import { useState } from 'react'
import { registerCourse } from '../api/registrationApi'
import { useCourses } from '../api/useCourses'
import CourseList from '../components/CourseList'
import Pagination from '../components/Pagination'
import SearchBox from '../components/SearchBox'
import Toast from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import type { ApiErrorResponse } from '../types/apiError'
import type { Course } from '../types/course'

export default function RegisterCoursePage() {
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)
  const [registeringId, setRegisteringId] = useState<number | null>(null)
  const { user } = useAuth()
  const { toast, showToast, clearToast } = useToast()
  const { courses, totalPages, state, errorMessage, refetch } = useCourses(keyword, page)

  const handleRegister = async (course: Course) => {
    if (!user) return
    setRegisteringId(course.id)
    try {
      await registerCourse({ studentId: user.id, courseId: course.id })
      showToast(`Đăng ký thành công môn "${course.tenMonHoc}"`, 'success')
      refetch()
    } catch (error) {
      const message = axios.isAxiosError<ApiErrorResponse>(error) && error.response?.data?.message
        ? error.response.data.message : 'Đăng ký không thành công, vui lòng thử lại.'
      showToast(message, 'error')
    } finally { setRegisteringId(null) }
  }

  return <main className="app">
    <header className="app__header"><p className="app__eyebrow">STUDENT</p><h1>Đăng ký học phần</h1></header>
    <SearchBox onSearch={(value) => { setKeyword(value); setPage(0) }} />
    <section className="course-list"><CourseList courses={courses} state={state} errorMessage={errorMessage} onRetry={refetch} onRegister={handleRegister} registeringId={registeringId} /></section>
    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
  </main>
}
