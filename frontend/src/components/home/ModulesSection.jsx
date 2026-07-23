import { useNavigate } from 'react-router-dom'

const MODULES = [
  {
    path: '/screenshot',
    title: 'Screenshot Scanner',
    tag: 'VISUAL INFERENCE',
    desc: 'Upload screenshots of login forms, suspect webpages, or popups to analyze visual brand spoofing and credential harvesting.',
    color: '#00d4ff',
    glow: 'rgba(0, 212, 255, 0.35)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
  },
  {
    path: '/url',
    title: 'URL Scanner',
    tag: 'DOMAINS & HEURISTICS',
    desc: 'Inspect web links for abuse TLDs, domain entropy, protocol risk, typosquatting lookalikes, and deceptive redirect chains.',
    color: '#2979ff',
    glow: 'rgba(41, 121, 255, 0.35)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
  },
  {
    path: '/email',
    title: 'Email Scanner',
    tag: 'HEADER & TEXT ANALYSIS',
    desc: 'Paste suspicious emails to detect From/Reply-To domain mismatches, urgency pressure phrases, and credential phishing links.',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.35)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
  {
    path: '/qr',
    title: 'QR Code Scanner',
    tag: 'BARCODE DECODER',
    desc: 'Decode QR code matrices deterministically to inspect destination links, Wi-Fi configs, and payment triggers before opening.',
    color: '#00e5a0',
    glow: 'rgba(0, 229, 160, 0.35)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
]

export default function ModulesSection() {
  const navigate = useNavigate()

  return (
    <section id="scanners" className="modules-section">
      <div className="section-header">
        <span className="section-badge">SECURITY MODULES</span>
        <h2 className="section-title">Comprehensive Threat Scanner Suite</h2>
        <p className="section-subtitle">Select a dedicated module to run targeted cybersecurity analysis.</p>
      </div>

      <div className="modules-grid">
        {MODULES.map((mod, i) => (
          <div
            key={i}
            className="module-card"
            style={{
              '--accent-color': mod.color,
              '--accent-glow': mod.glow,
              '--accent-bg': `${mod.color}15`,
              '--accent-border': `${mod.color}35`,
            }}
          >
            <div>
              <div className="module-header">
                <div className="module-icon-box">{mod.icon}</div>
                <span className="module-tag">{mod.tag}</span>
              </div>
              <h3 className="module-title">{mod.title}</h3>
              <p className="module-desc">{mod.desc}</p>
            </div>

            <button className="btn-module" onClick={() => navigate(mod.path)}>
              <span>Open Scanner</span>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4.166 10h11.668M10 4.166L15.833 10 10 15.833" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
