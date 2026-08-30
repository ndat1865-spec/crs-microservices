import { useCallback, useState } from 'react'
import { useCourses } from '../api/useCourses'
import CourseList from '../components/CourseList'
import Pagination from '../components/Pagination'
import SearchBox from '../components/SearchBox'

export default function CoursesPage() {
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)
  const { courses, totalPages, state, errorMessage, refetch } = useCourses(keyword, page)
  const handleSearch = useCallback((value: string) => { setKeyword(value); setPage(0) }, [])

  return <main className="app">
    <header className="app__header"><p className="app__eyebrow">CRS</p><h1>Danh sách môn học</h1><p>Tìm kiếm và xem số chỗ còn lại của các môn học đang mở.</p></header>
    <SearchBox onSearch={handleSearch} />
    <section className="course-list" aria-live="polite"><CourseList courses={courses} state={state} errorMessage={errorMessage} onRetry={refetch} /></section>
    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
  </main>
}
