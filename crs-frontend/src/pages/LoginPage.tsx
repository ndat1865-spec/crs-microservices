import axios from 'axios'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginApi } from '../api/authApi'
import { useAuth } from '../context/AuthContext'
import type { ApiErrorResponse } from '../types/apiError'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); setError(null); setSubmitting(true)
    try { const response = await loginApi({ username, password }); login(response.data); navigate('/courses') }
    catch (reason) {
      setError(axios.isAxiosError<ApiErrorResponse>(reason) && reason.response?.data?.message ? reason.response.data.message : 'Đăng nhập thất bại, vui lòng thử lại.')
    } finally { setSubmitting(false) }
  }

  return <main className="login-page"><form className="login-card" onSubmit={handleSubmit}>
    <p className="app__eyebrow">CRS</p><h1>Đăng nhập</h1>
    <label>Tên đăng nhập<input autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required /></label>
    <label>Mật khẩu<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
    {error && <p className="field-error" role="alert">{error}</p>}
    <button type="submit" disabled={submitting}>{submitting ? 'Đang xử lý...' : 'Đăng nhập'}</button>
  </form></main>
}
