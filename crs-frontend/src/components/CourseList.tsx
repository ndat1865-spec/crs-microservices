import type { LoadState } from '../api/useCourses'
import type { Course } from '../types/course'

interface CourseListProps {
  courses: Course[]
  state: LoadState
  errorMessage: string
  onRetry: () => void
}

export default function CourseList({
  courses,
  state,
  errorMessage,
  onRetry,
}: CourseListProps) {
  if (state === 'loading') {
    return <p className="status-message">Đang tải danh sách môn học...</p>
  }

  if (state === 'error') {
    return (
      <div className="status-message status-message--error" role="alert">
        <p>{errorMessage}</p>
        <button type="button" onClick={onRetry}>
          Thử lại
        </button>
      </div>
    )
  }

  if (state === 'empty') {
    return <p className="status-message">Không tìm thấy môn học nào phù hợp.</p>
  }

  return (
    <div className="course-table-wrapper">
      <table className="course-table">
        <thead>
          <tr>
            <th scope="col">Tên môn học</th>
            <th scope="col">Số tín chỉ</th>
            <th scope="col">Số chỗ còn lại</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>{course.tenMonHoc}</td>
              <td>{course.soTinChi}</td>
              <td className={course.soChoConLai === 0 ? 'course-table__full' : undefined}>
                {course.soChoConLai} / {course.soChoToiDa}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
