import { useEffect, useRef } from 'react'
import '../styles/AdminAuthForm.css'

export default function AdminAuthForm({ adminKey, onChange, onSubmit, error, submitting }) {
  const ref = useRef(null)

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
        <input
          id="admin-key"
          type="password"
          value={adminKey}
          onChange={event => onChange(event.target.value)}
          autoComplete="off"
          required
          disabled={submitting}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'admin-auth-error' : undefined}
        />
        {error && <p id="admin-auth-error" className="admin-auth-error" role="alert">{error}</p>}
        <button type="submit" disabled={submitting || !adminKey.trim()}>
          {submitting ? '인증 중...' : '인증하기'}
        </button>
        <p id="admin-auth-note">관리자 전용 페이지입니다.</p>
      </form>
    </dialog>
  )
}
