import { useEffect } from 'react'
import config from '../trainingResultConfig.json'
import { recordEvent } from '../lib/api'
import '../styles/TrainingResultPage.css'

const checklistIcons = ['📧', '🔍', '🔑', '📎', '👤']

export default function TrainingResultPage() {
  useEffect(() => {
    // 2차 훈련 이메일 링크를 눌러 이 페이지에 도달한 것 자체가 하나의 이벤트.
    // 평문 정보는 전혀 전송하지 않고, 익명 카운트만 기록한다.
    void recordEvent('TRAINING_PAGE_VIEW')
  }, [])

  const {
    school,
    hero,
    whatIsPhishing,
    howItWorks,
    checklist,
    ifCompromised,
    closing,
  } = config

  return (
    <main className="training-result">
      <header className="training-result__hero">
        <p className="training-result__badge">🛡️ {hero.eyebrow}</p>
        <h1 className="training-result__title">🚨 {hero.title}</h1>
        <p className="training-result__intro">{hero.intro}</p>
      </header>

      <div className="training-result__body">
        <section className="training-result__section">
          <h2 className="training-result__section-title">
            {whatIsPhishing.title}
          </h2>
          <p className="training-result__section-body">
            {whatIsPhishing.body}
          </p>
        </section>

        <section className="training-result__section">
          <h2 className="training-result__section-title">
            {howItWorks.title}
          </h2>
          <p className="training-result__section-subtitle">
            {howItWorks.subtitle}
          </p>

          <div className="training-result__tracks">
            {howItWorks.tracks.map((track) => (
              <article className="training-result__track" key={track.tag}>
                <div className="training-result__track-header">
                  <span className="training-result__track-tag">
                    {track.tag}
                  </span>
                  <h3 className="training-result__track-title">
                    {track.title}
                  </h3>
                </div>
                <ol className="training-result__track-steps">
                  {track.steps.map((step, i) => (
                    <li className="training-result__track-step" key={i}>
                      <span className="training-result__step-number">
                        {i + 1}
                      </span>
                      <p className="training-result__step-text">{step}</p>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>

          <aside className="training-result__insight">
            <span>💡</span>
            <p>{howItWorks.keyInsight}</p>
          </aside>
        </section>

        <section className="training-result__section">
          <h2 className="training-result__section-title">
            {checklist.title}
          </h2>
          <ul className="training-result__checklist">
            {checklist.items.map((item, i) => (
              <li className="training-result__checklist-item" key={item.title}>
                <div className="training-result__checklist-icon">
                  {checklistIcons[i % checklistIcons.length]}
                </div>
                <div>
                  <h3 className="training-result__checklist-title">
                    {item.title}
                  </h3>
                  <p className="training-result__checklist-body">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="training-result__locknote">
            <span>🔒</span>
            <p>{checklist.lockNote}</p>
          </div>
        </section>

        <section className="training-result__recovery">
          <div className="training-result__recovery-header">
            <span>🛟</span>
            <h2>{ifCompromised.title}</h2>
          </div>
          <p className="training-result__recovery-intro">
            {ifCompromised.intro}
          </p>
          <ol className="training-result__recovery-steps">
            {ifCompromised.steps.map((step, i) => (
              <li className="training-result__recovery-step" key={i}>
                <span className="training-result__recovery-number">
                  {i + 1}
                </span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="training-result__closing">
          <p>{closing}</p>
        </section>

        <footer className="training-result__footer">
          {school.name} {school.securityContact} · 교내 보안 인식 개선 모의 훈련
          <br />
          본 페이지는 훈련 목적으로 제작되었으며, 어떠한 개인정보도 수집하지
          않습니다.
        </footer>
      </div>
    </main>
  )
}
