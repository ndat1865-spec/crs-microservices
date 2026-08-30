import { useEffect } from 'react'

export default function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3500)
    return () => window.clearTimeout(timer)
  }, [onClose])

  return <div className={`toast toast--${type}`} role="status">{message}<button type="button" onClick={onClose} aria-label="Đóng thông báo">×</button></div>
}
