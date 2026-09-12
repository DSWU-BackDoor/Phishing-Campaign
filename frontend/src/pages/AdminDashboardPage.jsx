import { useEffect, useState } from 'react'
import config from '../phishingConfig.json'
import { getStats, emptyStats, apiMode } from '../lib/api'
import '../styles/AdminDashboardPage.css'

const sources = [
  ['everytime', '에브리타임'],
  ['qr', '포스터 QR'],
  ['instagram', '인스타그램'],
  ['direct', '직접 방문'],
]

export default function AdminDashboardPage() {
  const [data, setData] = useState(emptyStats)
  const [error, setError] = useState('')
  const [auto, setAuto] = useState(true)
  const [updated, setUpdated] = useState(() => new Date().toLocaleTimeString('ko-KR'))

  useEffect(() => {
    let active = true

    async function refresh() {
      try {
        const next = await getStats()
        if (active) {
          setData(next)
          setUpdated(new Date().toLocaleTimeString('ko-KR'))
          setError('')
        }
      } catch {
        if (active) setError('통계를 불러오지 못했습니다. API 연결을 확인하세요.')
      }
    }

    void refresh()
    const timer = auto ? setInterval(refresh, 5000) : null
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [auto])

  const total = data.visits
  const percent = total ? data.submits / total * 100 : 0
  const reportedPercent = total ? (data.submits + data.reports) / total * 100 : 0
  const maximum = Math.max(1, ...Object.values(data.sources))
  const donutBackground = total
    ? `conic-gradient(#fa7089 0% ${percent}%, #20c9df ${percent}% ${reportedPercent}%, #27334d ${reportedPercent}% 100%)`
    : '#27334d'
  const metrics = [
    ['총 방문 세션', data.visits, '◎'],
    ['피싱 낚임 (제출)', data.submits, '♧'],
    ['피싱 신고', data.reports, '⚑'],
    ['2차 훈련 동의', data.trainingEmailCount, '✉'],
  ]

  return (
    <main className="dashboard">
      <div className="dashboard-inner">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">{config.school} · {config.campaignId}</p>
            <h1>모의 피싱 훈련 관제 대시보드</h1>
          </div>
          <div className="refresh">
            <span>업데이트 {updated}</span>
            <button onClick={() => setAuto(!auto)}>
              ↻ 자동 새로고침 {auto ? '켜짐 (5초)' : '꺼짐'} ●
            </button>
          </div>
        </header>

        <p className="mode-note">
          {apiMode ? '실시간 데이터' : 'LOCAL MOCK DATA· 현재 브라우저의 세션별 기록'}
        </p>
        {error && <p role="alert" className="error">{error}</p>}

        <section className="metrics">
          {metrics.map(([label, value, icon]) => (
            <article className="metric" key={label}>
              <div>{label}<span>{icon}</span></div>
              <strong>{value}</strong>
            </article>
          ))}
        </section>

        <div className="charts">
          <section className="chart-card">
            <h2>낚임률 / 신고율</h2>
            <p className="muted">방문 세션 대비 비율 · 신고 시 신고로 분류</p>
            <div
              className="donut"
              role="img"
              aria-label={`제출 ${data.submits}건, 신고 ${data.reports}건`}
              style={{ background: donutBackground }}
            >
              <div>{!total && <span>아직 기록이 없어요</span>}</div>
            </div>
            <div className="legend">
              <span><i className="pink-dot" />피싱 낚임</span>
              <span><i className="cyan-dot" />신고</span>
              <span><i className="neutral-dot" />무반응</span>
            </div>
          </section>

          <section className="chart-card">
            <h2>유입 경로별 참여 현황</h2>
            <p className="muted">에타 · 포스터 QR · 인스타그램 · 직접 방문</p>
            <div className="bar-chart">
              {sources.map(([source, label]) => (
                <div className="bar-column" key={source}>
                  <div className="bar-space">
                    <div className="bar" style={{ height: `${data.sources[source] / maximum * 90}%` }}>
                      <span>{data.sources[source]}</span>
                    </div>
                  </div>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}


