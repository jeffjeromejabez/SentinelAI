const STEPS = [
  {
    num: '01',
    title: 'Upload Input',
    desc: 'Submit URL, email text, screenshot, or chat conversation.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Feature Extraction',
    desc: 'Deterministic parsing of TLDs, headers & social engineering cues.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'AI Analysis',
    desc: 'Google Gemini multimodal threat reasoning engine.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Threat Score',
    desc: 'Calibrated 0-100 score & risk level classification.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    num: '05',
    title: 'Recommendations',
    desc: 'Evidence-backed breakdown & remediation guidance.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
]

export default function WorkflowSection() {
  return (
    <section className="workflow-section">
      <div className="section-header">
        <span className="section-badge">THREAT ANALYSIS ENGINE</span>
        <h2 className="section-title">How SentinelAI Works</h2>
        <p className="section-subtitle">Multi-stage pipeline combining deterministic feature extraction with Gemini AI reasoning.</p>
      </div>

      <div className="workflow-timeline">
        {STEPS.map((step, i) => (
          <div key={i} className="workflow-step">
            <div className="step-number">{step.num}</div>
            <div className="step-icon">{step.icon}</div>
            <h4 className="step-title">{step.title}</h4>
            <p className="step-desc">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
