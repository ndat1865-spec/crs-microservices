import axios from 'axios'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { createApiKey, getApiKeys, revokeApiKey } from '../api/apiKeyApi'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'
import type { ApiErrorResponse } from '../types/apiError'
import type { ApiKey } from '../types/apiKey'

const AVAILABLE_SCOPES = [
  { value: 'courses:read', label: 'Xem danh sách môn học' },
  { value: 'courses:read-detail', label: 'Xem chi tiết môn học' },
] as const

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error) && error.response?.data?.message) {
    return error.response.data.message
  }
  return fallback
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [ownerName, setOwnerName] = useState('')
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['courses:read'])
  const [validDays, setValidDays] = useState('30')
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast, showToast, clearToast } = useToast()

  const loadKeys = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getApiKeys()
      setKeys(response.data)
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Không tải được danh sách API Key.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadKeys()
  }, [loadKeys])

  const toggleScope = (scope: string) => {
    setSelectedScopes((current) => current.includes(scope)
      ? current.filter((item) => item !== scope)
      : [...current, scope])
  }

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setNewKeyValue(null)
    if (selectedScopes.length === 0) {
      setError('Hãy chọn ít nhất một quyền truy cập.')
      return
    }

    setSubmitting(true)
    try {
      const response = await createApiKey({
        ownerName: ownerName.trim(),
        scopes: selectedScopes.join(','),
        validDays: validDays ? Number(validDays) : undefined,
      })
      setNewKeyValue(response.data.keyValue)
      setOwnerName('')
      showToast('Đã cấp API Key mới.', 'success')
      await loadKeys()
    } catch (createError) {
      setError(getErrorMessage(createError, 'Cấp API Key không thành công.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = async () => {
    if (!newKeyValue) return
    try {
      await navigator.clipboard.writeText(newKeyValue)
      showToast('Đã sao chép API Key.', 'success')
    } catch {
      showToast('Không thể sao chép tự động. Hãy chọn và sao chép key thủ công.', 'error')
    }
  }

  const handleRevoke = async (key: ApiKey) => {
    if (!window.confirm(`Thu hồi API Key của "${key.ownerName}"?`)) return
    try {
      await revokeApiKey(key.id)
      showToast('Đã thu hồi API Key.', 'success')
      await loadKeys()
    } catch (revokeError) {
      showToast(getErrorMessage(revokeError, 'Thu hồi API Key không thành công.'), 'error')
    }
  }

  return <main className="app api-keys-page">
    <header className="app__header">
      <p className="app__eyebrow">ADMIN</p>
      <h1>Quản lý API Key</h1>
      <p>Cấp quyền truy cập cho đối tác và thu hồi key mà không cần khởi động lại hệ thống.</p>
    </header>

    <form className="api-key-form" onSubmit={handleCreate}>
      <div className="api-key-form__heading">
        <div><h2>Cấp API Key mới</h2><p>Key chỉ được hiển thị một lần ngay sau khi tạo.</p></div>
      </div>

      <label className="api-key-form__field">
        Tên đối tác
        <input value={ownerName} onChange={(event) => setOwnerName(event.target.value)} required maxLength={255} placeholder="Ví dụ: Công ty ABC Edu" />
      </label>

      <fieldset className="scope-picker">
        <legend>Quyền truy cập</legend>
        {AVAILABLE_SCOPES.map((scope) => <label key={scope.value}>
          <input type="checkbox" checked={selectedScopes.includes(scope.value)} onChange={() => toggleScope(scope.value)} />
          <span><code>{scope.value}</code><small>{scope.label}</small></span>
        </label>)}
      </fieldset>

      <label className="api-key-form__field">
        Hiệu lực (ngày)
        <input type="number" min="1" step="1" value={validDays} onChange={(event) => setValidDays(event.target.value)} placeholder="Để trống nếu không giới hạn" />
        <small>Để trống nếu key không có ngày hết hạn.</small>
      </label>

      {error && <p className="field-error" role="alert">{error}</p>}
      <div><button type="submit" disabled={submitting}>{submitting ? 'Đang cấp…' : 'Cấp API Key'}</button></div>
    </form>

    {newKeyValue && <section className="new-api-key" aria-live="polite">
      <div>
        <strong>API Key vừa tạo</strong>
        <p>Hãy lưu lại ngay. Giá trị này sẽ không xuất hiện trong danh sách bên dưới.</p>
      </div>
      <code>{newKeyValue}</code>
      <button type="button" className="button-secondary" onClick={handleCopy}>Sao chép</button>
    </section>}

    <section className="api-key-list" aria-labelledby="api-key-list-title">
      <div className="api-key-list__heading">
        <div><h2 id="api-key-list-title">API Key đã cấp</h2><p>{keys.length} key trong hệ thống</p></div>
        <button type="button" className="button-secondary" onClick={() => void loadKeys()} disabled={loading}>Làm mới</button>
      </div>

      {loading ? <p className="status-message">Đang tải danh sách…</p> : error ? <div className="status-message status-message--error"><p>{error}</p><button type="button" onClick={() => void loadKeys()}>Thử lại</button></div> : keys.length === 0 ? <p className="status-message">Chưa có API Key nào.</p> : <div className="course-table-wrapper">
        <table className="course-table api-key-table">
          <thead><tr><th>Đối tác</th><th>Scopes</th><th>Trạng thái</th><th>Ngày tạo</th><th>Hết hạn</th><th>Thao tác</th></tr></thead>
          <tbody>{keys.map((key) => <tr key={key.id}>
            <td><strong>{key.ownerName}</strong></td>
            <td>{key.scopes.split(',').map((scope) => <code key={scope}>{scope}</code>)}</td>
            <td><span className={`api-key-status api-key-status--${key.status.toLowerCase()}`}>{key.status}</span></td>
            <td>{new Date(key.createdAt).toLocaleDateString('vi-VN')}</td>
            <td>{key.expiresAt ? new Date(key.expiresAt).toLocaleDateString('vi-VN') : 'Không giới hạn'}</td>
            <td>{key.status === 'ACTIVE' ? <button type="button" className="button-danger" onClick={() => void handleRevoke(key)}>Thu hồi</button> : '—'}</td>
          </tr>)}</tbody>
        </table>
      </div>}
    </section>

    {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
  </main>
}
