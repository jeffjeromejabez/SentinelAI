const FEATURES = [
  {
    title: 'AI Powered',
    desc: 'Driven by Google Gemini multimodal AI for advanced threat reasoning across text and images.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
  },
  {
    title: 'Real-Time Detection',
    desc: 'Sub-2-second scan execution for immediate verification before clicking links or submitting credentials.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    title: 'Evidence-Based Analysis',
    desc: 'Explanations directly cite specific domain names, TLDs, headers, and visual cues found.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    title: 'Threat Intelligence',
    desc: 'Detects brand impersonation, TLD abuse (.tk, .xyz), raw IP hosts, and domain entropy.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    title: 'Confidence Scoring',
    desc: 'Every threat assessment includes a quantified confidence metric reflecting evidence clarity.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
  {
    title: 'Privacy Focused',
    desc: 'Stateless serverless processing with zero tracking or data persistence beyond local storage.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
]

export default function WhyUsSection() {
  return (
    <section className="why-section">
      <div className="section-header">
        <span className="section-badge">ENTERPRISE CAPABILITIES</span>
        <h2 className="section-title">Why Choose SentinelAI</h2>
        <p className="section-subtitle">Built for high-accuracy threat detection with evidence-backed clarity.</p>
      </div>

      <div className="why-grid">
        {FEATURES.map((feat, i) => (
          <div key={i} className="why-card">
            <div className="why-icon">{feat.icon}</div>
            <h3 className="why-title">{feat.title}</h3>
            <p className="why-desc">{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
