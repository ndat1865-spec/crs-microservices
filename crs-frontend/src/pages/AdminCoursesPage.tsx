import axios from 'axios'
import { useState } from 'react'
import { createCourse, deleteCourse, updateCourse } from '../api/courseApi'
import { useCourses } from '../api/useCourses'
import CourseForm from '../components/CourseForm'
import CourseList from '../components/CourseList'
import Pagination from '../components/Pagination'
import SearchBox from '../components/SearchBox'
import type { ApiErrorResponse } from '../types/apiError'
import type { Course, CourseFormValues } from '../types/course'

function errorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data
    if (data?.message) return data.message
    const fieldError = data && Object.values(data).find((value) => typeof value === 'string')
    if (fieldError) return fieldError
  }
  return 'Đã xảy ra lỗi, vui lòng thử lại.'
}

export default function AdminCoursesPage() {
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formVersion, setFormVersion] = useState(0)
  const { courses, totalPages, state, errorMessage: loadError, refetch } = useCourses(keyword, page)

  const handleSubmit = async (values: CourseFormValues) => {
    setSubmitting(true); setFormError(null)
    try {
      if (editingCourse) await updateCourse(editingCourse.id, values)
      else await createCourse(values)
      setEditingCourse(null)
      setFormVersion((version) => version + 1)
      refetch()
    } catch (error) { setFormError(errorMessage(error)) }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (course: Course) => {
    if (!window.confirm(`Xóa môn học "${course.tenMonHoc}"?`)) return
    try { await deleteCourse(course.id); refetch() }
    catch (error) { window.alert(errorMessage(error)) }
  }

  return <main className="app">
    <header className="app__header"><p className="app__eyebrow">ADMIN</p><h1>Quản trị môn học</h1></header>
    <CourseForm key={`${editingCourse?.id ?? 'new'}-${formVersion}`} editingCourse={editingCourse} onSubmit={handleSubmit} onCancel={() => setEditingCourse(null)} submitting={submitting} serverError={formError} />
    <SearchBox onSearch={(value) => { setKeyword(value); setPage(0) }} />
    <section className="course-list"><CourseList courses={courses} state={state} errorMessage={loadError} onRetry={refetch} onEdit={setEditingCourse} onDelete={handleDelete} /></section>
    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
  </main>
}
