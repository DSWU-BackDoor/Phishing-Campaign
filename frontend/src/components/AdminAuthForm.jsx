import { useEffect, useRef, useState } from 'react'
import '../styles/AdminAuthForm.css'

export default function AdminAuthForm({ adminKey, onChange, onSubmit, error, submitting }) {
  const ref = useRef(null)
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    dialog.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previous
    }
  }, [])

  return (
    <dialog
      ref={ref}
      className="admin-auth"
      aria-labelledby="admin-auth-title"
      aria-describedby="admin-auth-note"
      onCancel={event => event.preventDefault()}
    >
      <form onSubmit={onSubmit} aria-busy={submitting}>
        <h2 id="admin-auth-title">관리자 인증</h2>
        <label htmlFor="admin-key">관리자 키</label>
        <div className="admin-key-field">
          <input
            id="admin-key"
            type={showKey ? 'text' : 'password'}
            value={adminKey}
            onChange={event => onChange(event.target.value)}
            autoComplete="off"
            required
            disabled={submitting}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'admin-auth-error' : undefined}
          />
          <button
            type="button"
            className="admin-key-toggle"
            onClick={() => setShowKey(visible => !visible)}
            disabled={submitting}
            aria-label={showKey ? '관리자 키 숨기기' : '관리자 키 보기'}
            aria-controls="admin-key"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" focusable="false">
              {showKey ? (
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5Zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
              ) : (
                <path d="m2.27 1 20.73 20.73-1.27 1.27-4.18-4.18A11.8 11.8 0 0 1 12 20C7 20 2.73 16.89 1 12.5a13.4 13.4 0 0 1 4.32-5.68L1 2.27 2.27 1ZM12 7.5a5 5 0 0 0-1.78.33l2.12 2.12a3 3 0 0 1 2.21 2.21l2.12 2.12A5 5 0 0 0 12 7.5Zm0-2.5c5 0 9.27 3.11 11 7.5a13.6 13.6 0 0 1-3.8 5.27l-2.54-2.54A5 5 0 0 0 9.27 8.34L6.73 5.8A12.1 12.1 0 0 1 12 5ZM7.04 11.08a5 5 0 0 0 6.38 6.38l-1.69-1.69a3 3 0 0 1-3.5-3.5l-1.19-1.19Z" />
              )}
            </svg>
          </button>
        </div>
        {error && <p id="admin-auth-error" className="admin-auth-error" role="alert">{error}</p>}
        <button type="submit" disabled={submitting || !adminKey.trim()}>
          {submitting ? '인증 중...' : '인증하기'}
        </button>
        <p id="admin-auth-note">관리자 전용 페이지입니다.</p>
      </form>
    </dialog>
  )
}
