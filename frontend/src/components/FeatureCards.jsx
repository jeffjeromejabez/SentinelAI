import './FeatureCards.css'

const CARDS = [
  {
    svg: (
      <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="9"/>
        <path d="M11 7v4l2.5 2.5" strokeLinecap="round"/>
        <path d="M7 11h1M15 11h1M11 7V6M11 16v1" strokeLinecap="round"/>
      </svg>
    ),
    iconColor: '#00d4ff',
    title: 'AI Detection',
    desc: 'Advanced machine learning models trained on millions of phishing samples for near-perfect accuracy.',
  },
  {
    svg: (
      <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M11 2l2.4 7.4H21l-6.2 4.5 2.4 7.4L11 17l-6.2 4.3 2.4-7.4L1 9.4h7.6L11 2z"/>
      </svg>
    ),
    iconColor: '#a855f7',
    title: 'Real-Time Analysis',
    desc: 'Instant threat assessment in under 2 seconds. No waiting, no delays — just immediate protection.',
  },
  {
    svg: (
      <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M11 2L3 5.5V11c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5.5L11 2z" strokeLinejoin="round"/>
        <path d="M8 11l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    iconColor: '#2979ff',
    title: 'Multi-Layer Defense',
    desc: 'Combines visual, textual, and URL analysis to catch sophisticated scams that evade basic filters.',
  },
  {
    svg: (
      <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="18" height="18" rx="3"/>
        <path d="M7 15V10M11 15V7M15 15v-4" strokeLinecap="round"/>
      </svg>
    ),
    iconColor: '#00e5a0',
    title: 'Confidence Scoring',
    desc: 'Every result comes with a detailed confidence score and breakdown so you understand the threat level.',
  },
]

export default function FeatureCards() {
  return (
    <div className="feature-cards">
      {CARDS.map((card, i) => (
        <div className="feature-card" key={i} style={{ '--card-accent': card.iconColor }}>
          <div className="card-icon-wrap" style={{ '--icon-color': card.iconColor }}>
            {card.svg}
          </div>
          <h3 className="card-title">{card.title}</h3>
          <p className="card-desc">{card.desc}</p>
          <div className="card-glow-line" />
        </div>
      ))}
    </div>
  )
}
