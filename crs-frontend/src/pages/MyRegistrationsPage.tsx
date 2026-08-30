import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { getCourseById } from '../api/courseApi'
import { cancelRegistration, getMyRegistrations } from '../api/registrationApi'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'
import type { ApiErrorResponse } from '../types/apiError'
import type { Registration } from '../types/registration'

interface RegistrationRow extends Registration { courseName: string }

export default function MyRegistrationsPage() {
  const [rows, setRows] = useState<RegistrationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const { toast, showToast, clearToast } = useToast()

  const loadData = useCallback(async () => {
    setLoading(true); setLoadError(null)
    try {
      const response = await getMyRegistrations()
      const active = response.data.filter((registration) => registration.trangThai === 'DA_DANG_KY')
      const enriched = await Promise.all(active.map(async (registration) => {
        try { const course = await getCourseById(registration.courseId); return { ...registration, courseName: course.data.tenMonHoc } }
        catch { return { ...registration, courseName: `Môn học #${registration.courseId} (không tìm thấy thông tin)` } }
      }))
      setRows(enriched)
    } catch (error) {
      setLoadError(axios.isAxiosError<ApiErrorResponse>(error) && error.response?.data?.message ? error.response.data.message : 'Không tải được danh sách đăng ký.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    // Initial data loading is the external synchronization performed by this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData()
  }, [loadData])

  const handleCancel = async (row: RegistrationRow) => {
    if (!window.confirm(`Hủy đăng ký môn "${row.courseName}"?`)) return
    setCancellingId(row.id)
    try { await cancelRegistration(row.id); showToast(`Đã hủy đăng ký môn "${row.courseName}"`, 'success'); await loadData() }
    catch (error) {
      const message = axios.isAxiosError<ApiErrorResponse>(error) && error.response?.data?.message ? error.response.data.message : 'Hủy đăng ký không thành công.'
      showToast(message, 'error')
    } finally { setCancellingId(null) }
  }

  return <main className="app">
    <header className="app__header"><p className="app__eyebrow">STUDENT</p><h1>Môn học đã đăng ký</h1></header>
    {loading && <p className="status-message">Đang tải...</p>}
    {!loading && loadError && <div className="status-message status-message--error" role="alert"><p>{loadError}</p><button type="button" onClick={() => void loadData()}>Thử lại</button></div>}
    {!loading && !loadError && rows.length === 0 && <p className="status-message">Bạn chưa đăng ký môn học nào.</p>}
    {!loading && !loadError && rows.length > 0 && <div className="course-table-wrapper"><table className="course-table"><thead><tr><th>Tên môn học</th><th>Ngày đăng ký</th><th>Thao tác</th></tr></thead><tbody>
      {rows.map((row) => <tr key={row.id}><td>{row.courseName}</td><td>{new Date(row.ngayDangKy).toLocaleString('vi-VN')}</td><td><button type="button" onClick={() => handleCancel(row)} disabled={cancellingId === row.id}>{cancellingId === row.id ? 'Đang hủy...' : 'Hủy đăng ký'}</button></td></tr>)}
    </tbody></table></div>}
    {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
  </main>
}
