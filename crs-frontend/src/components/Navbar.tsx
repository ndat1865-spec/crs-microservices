import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav className="navbar" aria-label="Điều hướng chính">
      <Link className="navbar__brand" to="/courses">CRS</Link>
      <Link to="/courses">Danh sách môn học</Link>
      {user?.role === 'ADMIN' && <Link to="/admin/courses">Quản trị môn học</Link>}
      {user?.role === 'STUDENT' && <>
        <Link to="/register-course">Đăng ký học phần</Link>
        <Link to="/my-registrations">Môn học đã đăng ký</Link>
      </>}
      <div className="navbar__account">
        {isAuthenticated ? <><span>Xin chào, {user?.username} ({user?.role})</span><button type="button" onClick={handleLogout}>Đăng xuất</button></> : <Link to="/login">Đăng nhập</Link>}
      </div>
    </nav>
  )
}
