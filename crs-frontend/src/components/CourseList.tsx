import type { LoadState } from '../api/useCourses'
import type { Course } from '../types/course'

interface CourseListProps {
  courses: Course[]
  state: LoadState
  errorMessage: string
  onRetry: () => void
  onEdit?: (course: Course) => void
  onDelete?: (course: Course) => void
  onRegister?: (course: Course) => void
  registeringId?: number | null
}

export default function CourseList({
  courses,
  state,
  errorMessage,
  onRetry,
  onEdit,
  onDelete,
  onRegister,
  registeringId,
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

  const showActions = !!onEdit || !!onDelete || !!onRegister

  return (
    <div className="course-table-wrapper">
      <table className="course-table">
        <thead>
          <tr>
            <th scope="col">Tên môn học</th>
            <th scope="col">Số tín chỉ</th>
            <th scope="col">Số chỗ còn lại</th>
            {showActions && <th scope="col">Thao tác</th>}
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
              {showActions && <td className="course-table__actions">
                {onEdit && <button type="button" onClick={() => onEdit(course)}>Sửa</button>}
                {onDelete && <button type="button" className="button-danger" onClick={() => onDelete(course)}>Xóa</button>}
                {onRegister && <button type="button" onClick={() => onRegister(course)} disabled={course.soChoConLai === 0 || registeringId === course.id}>
                  {registeringId === course.id ? 'Đang đăng ký...' : course.soChoConLai === 0 ? 'Hết chỗ' : 'Đăng ký'}
                </button>}
              </td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
