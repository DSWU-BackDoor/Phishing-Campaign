export default function FeedbackForm({ content, onChange, submitting, error }) {
  return (
    <section className="feedback-form">
      <label htmlFor="training-feedback">[선택] 이번 모의 훈련은 어떠셨나요?</label>
      <p id="feedback-help" className="muted">
        이번 훈련에서 느낀 점이나 도움이 되었던 점을 자유롭게 남겨주세요.
        소중한 후기는 더 나은 보안 캠페인을 준비하는 데 참고하겠습니다.
        <span className="feedback-privacy-note">
          ※ 이름, 학번, 연락처 등 개인정보는 작성하지 말아주세요.
        </span>
      </p>
      <textarea
        id="training-feedback"
        value={content}
        onChange={event => onChange(event.target.value)}
        maxLength={1000}
        rows={4}
        placeholder="예: 의심스러운 링크를 한 번 더 확인해야겠다고 느꼈어요."
        disabled={submitting}
        aria-invalid={Boolean(error)}
        aria-describedby={`feedback-help feedback-count${error ? ' feedback-error' : ''}`}
      />
      <p id="feedback-count" className="feedback-count">{content.length} / 1,000</p>
      {error && <p id="feedback-error" className="email-error" role="alert">{error}</p>}
    </section>
  )
}
