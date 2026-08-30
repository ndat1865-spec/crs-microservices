import { useEffect, useState, type FormEvent } from 'react'
import type { Course, CourseFormValues } from '../types/course'
import { emptyCourseForm } from '../types/course'

interface CourseFormProps {
  editingCourse: Course | null
  onSubmit: (values: CourseFormValues) => Promise<void>
  onCancel: () => void
  submitting: boolean
  serverError: string | null
}

export default function CourseForm({ editingCourse, onSubmit, onCancel, submitting, serverError }: CourseFormProps) {
  const [values, setValues] = useState<CourseFormValues>(emptyCourseForm)
  const [clientErrors, setClientErrors] = useState<Partial<CourseFormValues>>({})

  useEffect(() => {
    // Prop changes intentionally reset this reusable add/edit form.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues(editingCourse ? {
      tenMonHoc: editingCourse.tenMonHoc,
      soTinChi: String(editingCourse.soTinChi),
      soChoToiDa: String(editingCourse.soChoToiDa),
    } : emptyCourseForm)
    setClientErrors({})
  }, [editingCourse])

  const validate = () => {
    const errors: Partial<CourseFormValues> = {}
    if (!values.tenMonHoc.trim()) errors.tenMonHoc = 'Tên môn học không được để trống'
    const credits = Number(values.soTinChi)
    if (!values.soTinChi || !Number.isInteger(credits) || credits <= 0) errors.soTinChi = 'Số tín chỉ phải là số nguyên lớn hơn 0'
    const capacity = Number(values.soChoToiDa)
    if (!values.soChoToiDa || !Number.isInteger(capacity) || capacity <= 0) errors.soChoToiDa = 'Số chỗ tối đa phải là số nguyên lớn hơn 0'
    setClientErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (validate()) await onSubmit(values)
  }

  return (
    <form className="course-form" onSubmit={handleSubmit} noValidate>
      <h2>{editingCourse ? 'Sửa môn học' : 'Thêm môn học mới'}</h2>
      <label>Tên môn học<input value={values.tenMonHoc} onChange={(e) => setValues({ ...values, tenMonHoc: e.target.value })} /></label>
      {clientErrors.tenMonHoc && <p className="field-error">{clientErrors.tenMonHoc}</p>}
      <label>Số tín chỉ<input type="number" min="1" step="1" value={values.soTinChi} onChange={(e) => setValues({ ...values, soTinChi: e.target.value })} /></label>
      {clientErrors.soTinChi && <p className="field-error">{clientErrors.soTinChi}</p>}
      <label>Số chỗ tối đa<input type="number" min="1" step="1" value={values.soChoToiDa} onChange={(e) => setValues({ ...values, soChoToiDa: e.target.value })} /></label>
      {clientErrors.soChoToiDa && <p className="field-error">{clientErrors.soChoToiDa}</p>}
      {serverError && <p className="field-error" role="alert">{serverError}</p>}
      <div className="button-row">
        <button type="submit" disabled={submitting}>{submitting ? 'Đang lưu...' : editingCourse ? 'Cập nhật' : 'Thêm mới'}</button>
        {editingCourse && <button type="button" className="button-secondary" onClick={onCancel}>Hủy</button>}
      </div>
    </form>
  )
}
