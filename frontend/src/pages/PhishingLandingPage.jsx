import { useEffect, useRef, useState } from 'react'
import config from '../phishingConfig.json'
import {  recordEvent } from '../lib/api'
import EducationModal from '../components/EducationModal'
import { validateField } from '../lib/validation'
import '../styles/PhishingLandingPage.css'

const fields = [
  { id: 'student', label: '학번', placeholder: '20xxxxxx', type: 'text' },
  { id: 'name', label: '이름', placeholder: '홍길동', type: 'text' },
  { id: 'birthDate', label: '생년월일', placeholder: 'YYYY.MM.DD', type: 'text', inputMode: 'numeric', maxLength: 10 },
  { id: 'phone', label: '연락처', placeholder: '010-0000-0000', type: 'tel', inputMode: 'numeric', maxLength: 13 },
]

export default function PhishingLandingPage() {
  const [open, setOpen] = useState(false)
  const [reported, setReported] = useState(false)
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState({})
  const form = useRef(null)

  useEffect(() => {
    void recordEvent('PAGE_VIEW')
  }, [])

  function handleBirthDateInput(event) {
    const input = event.currentTarget
    const digits = input.value.replace(/\D/g, '').slice(0, 8)
    input.value = [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)]
      .filter(Boolean)
      .join('.')
  }

  function handlePhoneInput(event) {
    const input = event.currentTarget
    const digits = input.value.replace(/\D/g, '').slice(0, 11)
    input.value = [digits.slice(0, 3), digits.slice(3, 7), digits.slice(7, 11)]
      .filter(Boolean)
      .join('-')
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    for (const { id } of fields) {
      const message = validateField(id, form.current.elements.namedItem(id).value)
      if (message) nextErrors[id] = message
    }
    setErrors(nextErrors)
    const firstInvalid = Object.keys(nextErrors)[0]
    if (firstInvalid) {
      form.current.elements.namedItem(firstInvalid).focus()
      return
    }
    event.currentTarget.reset()
    void recordEvent('FORM_SUBMIT')
    setOpen(true)
  }

  function handleReport() {
    form.current.reset()
    setErrors({})
    void recordEvent('REPORT') 
    setReported(true)
    setOpen(true)
  }

  return (
    <main className="landing">
      <header>
        <span className="badge">✣ 마감임박</span>
        <p className="school">{config.school}</p>
        <h1>시험 기간엔 역시<br />당충전이 필요하니까</h1>
        <p className="subtitle">선착순 300명 · 재학생 간식 쿠폰 증정</p>
      </header>

      <form ref={form} className="application" autoComplete="off" noValidate onSubmit={handleSubmit}>
        <h2>중간고사 간식행사 사전 신청</h2>
        {fields.map(({ id, label, placeholder, type, inputMode, maxLength }) => (
          <div key={id}>
            <label htmlFor={id}>{label}</label>
            <input
              id={id}
              type={type}
              placeholder={placeholder}
              autoComplete="off"
              inputMode={inputMode}
              maxLength={maxLength}
              required
              aria-invalid={Boolean(errors[id])}
              aria-describedby={errors[id] ? `${id}-error` : undefined}
              onInput={event => {
                if (id === 'birthDate') handleBirthDateInput(event)
                if (id === 'phone') handlePhoneInput(event)
                if (Object.hasOwn(errors, id)) {
                  const message = validateField(id, event.currentTarget.value)
                  setErrors(previous => ({ ...previous, [id]: message }))
                }
              }}
            />
            {errors[id] && <p id={`${id}-error`} className="field-error" role="alert">{errors[id]}</p>}
          </div>
        ))}
        <button className="apply" type="submit">신청하고 쿠폰 받기 ›</button>
        <p className="form-note">입력한 개인정보는 저장되지 않으며 어떠한 용도로도 이용되지 않습니다.</p>
      </form>

      <button className="report" onClick={handleReport}>
        이 사이트가 의심되나요? 신고하기
      </button>

      {open && (
        <EducationModal
          close={() => setOpen(false)}
          reported={reported}
          consent={consent}
          setConsent={setConsent}
        />
      )}
    </main>
  )
}

