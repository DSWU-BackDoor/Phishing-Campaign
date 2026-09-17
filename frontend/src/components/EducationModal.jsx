import { useEffect, useRef, useState } from 'react'

import config from '../phishingConfig.json'
import { submitFeedback, submitTrainingEmail } from '../lib/api'
import FeedbackForm from './FeedbackForm'

import '../styles/EducationModal.css'

const signals = [
  [
    '↗',
    '주최 기관 확인',
    '이벤트를 진행하는 기관이나 업체가 실제로 존재하고 신뢰할 수 있는 곳인지 확인하세요. 출처가 불분명한 이벤트는 주의해야 합니다.',
  ],
  [
    '⚿',
    '비정상적 정보 요구',
    '간식행사 신청에 생년월일이 필요한지 확인하세요. 목적에 비해 과도한 개인정보를 요구한다면 의심해 보세요.',
  ],
]

export default function EducationModal({
  close,
  reported,
  consent,
  setConsent,
}) {
  const ref = useRef(null)

  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [feedbackError, setFeedbackError] = useState('')
  const saving = useRef(false)

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

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  function handleConsent(event) {
    const checked = event.target.checked

    setConsent(checked)

    if (!checked) {
      setEmail('')
      setEmailError('')
      setSubmitted(false)
    }
  }

  async function handleConfirm() {
    if (saving.current) return
    const trimmedEmail = email.trim()
    if (consent && !submitted && !isValidEmail(trimmedEmail)) {
      setEmailError(trimmedEmail ? '올바른 이메일 형식이 아닙니다.' : '이메일을 입력해주세요.')
      ref.current.querySelector('#training-email')?.focus()
      return
    }

    saving.current = true
    setSubmitting(true)
    setEmailError('')
    setFeedbackError('')
    try {
      if (consent && !submitted) {
        try {
          await submitTrainingEmail(trimmedEmail)
          setSubmitted(true)
        } catch {
          setEmailError('신청 중 오류가 발생했습니다. 다시 시도해주세요.')
          return
        }
      }
      if (!reported && feedback.trim()) {
        try {
          await submitFeedback(feedback)
        } catch {
          setFeedbackError('후기를 저장하지 못했어요. 작성한 내용은 유지되니 다시 시도해주세요.')
          return
        }
      }
      close()
    } finally {
      saving.current = false
      setSubmitting(false)
    }
  }

  return (
    <dialog
      className="education"
      ref={ref}
      onCancel={event => {
        if (saving.current) event.preventDefault()
        else close()
      }}
      aria-labelledby="education-title"
    >
      <div
        className="education-scroll"
        tabIndex={0}
        role="region"
        aria-label="피싱 예방 교육 안내"
      >
        <button
          className="close"
          onClick={close}
          disabled={submitting}
          aria-label="닫기"
        >
          ×
        </button>

        <span className="siren">
          🚨
        </span>

        <h2 id="education-title">
          {reported
            ? '잘 발견하셨어요!'
            : '피싱에 낚이셨습니다!'}
        </h2>

        <p className="muted">
          교내 모의 훈련 안내
        </p>

        <div className="privacy">
          {!reported && (
            <>
              방금 입력하신 개인정보는 서버로 전송되지 않습니다.
              <br />
            </>
          )}

          이 사이트는 피싱 예방 및 보안 교육을 목적으로 BackDoor에서 제작한 모의 사이트입니다.
        </div>

        <p className="section-label">
          놓치지 말아야 했던 신호 2가지
        </p>

        {signals.map(([icon, title, body]) => (
          <article
            className="signal"
            key={title}
          >
            <span className="signal-icon">
              {icon}
            </span>

            <div>
              <h3>
                <b>⚑</b> {title}
              </h3>

              <p>
                {body}
              </p>
            </div>
          </article>
        ))}

        <section className="ticket">
          <h3>
            🎟 현장 부스 리워드 인증
          </h3>

          <p>
            {config.boothDate} 현장 부스에서 아래 코드를 제시하면 간식을 드려요.
          </p>

          <div className="ticket-code">
            {config.ticketCode}
          </div>

          <small>
            실제 티켓 발급 연동 예정
          </small>
        </section>

        {!reported && (
          <FeedbackForm
            content={feedback}
            onChange={value => { setFeedback(value); setFeedbackError('') }}
            submitting={submitting}
            error={feedbackError}
          />
        )}

        <label className="consent">
          <input
            type="checkbox"
            checked={consent}
            disabled={submitting || submitted}
            onChange={handleConsent}
          />

          <span>
            <strong>
              [선택] 더 정교한 모의 훈련, 받아보실래요?
            </strong>

            <span className="muted">
              동의하신 경우에만 이메일을 수집하여 2차 모의 훈련에 사용합니다.
              훈련 종료 후 이메일은 파기합니다.
            </span>
          </span>
        </label>

        {consent && (
          <section className="training-signup">
            <label htmlFor="training-email">
              2차 훈련 수신 이메일
            </label>

            <input
              id="training-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)

                if (emailError) {
                  setEmailError('')
                }
              }}
              placeholder="example@duksung.ac.kr"
              autoComplete="email"
              disabled={submitted || submitting}
              aria-invalid={Boolean(emailError)}
              aria-describedby={
                emailError
                  ? 'training-email-error'
                  : undefined
              }
            />

            {emailError && (
              <p
                id="training-email-error"
                className="email-error"
                role="alert"
              >
                {emailError}
              </p>
            )}

            {submitted && (
              <p className="signup-success">2차 모의 훈련 신청이 완료되었습니다.</p>
            )}
          </section>
        )}

        <button
          className="understood"
          onClick={handleConfirm}
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? '저장 중...' : '훈련 마치기'}
        </button>
      </div>
    </dialog>
  )
}
