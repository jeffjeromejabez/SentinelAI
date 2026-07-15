import './CyberDecorations.css'

export default function CyberDecorations() {
  return (
    <div className="cyber-deco" aria-hidden="true">

      {/* Large outer ring */}
      <div className="deco-ring ring-outer" />
      <div className="deco-ring ring-mid" />
      <div className="deco-ring ring-inner" />

      {/* Centre shield */}
      <div className="deco-center">
        <svg viewBox="0 0 80 90" fill="none" className="deco-shield-svg">
          <path
            d="M40 5L8 18v26c0 18 14 34 32 40 18-6 32-22 32-40V18L40 5z"
            stroke="rgba(0,212,255,0.5)"
            strokeWidth="1.5"
            fill="rgba(0,212,255,0.06)"
          />
          <path
            d="M28 45l8 8 16-16"
            stroke="#00d4ff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Orbiting nodes */}
      <div className="deco-node node-1" />
      <div className="deco-node node-2" />
      <div className="deco-node node-3" />
      <div className="deco-node node-4" />

      {/* Scan line */}
      <div className="deco-scan" />

      {/* Corner brackets */}
      <div className="deco-bracket br-tl" />
      <div className="deco-bracket br-tr" />
      <div className="deco-bracket br-bl" />
      <div className="deco-bracket br-br" />

      {/* Data readout lines */}
      <div className="deco-readout">
        {['THREAT SCAN', 'AI MODEL v2.4', 'NEURAL NET', 'ACTIVE', '99.7% ACC'].map((t, i) => (
          <div className="readout-row" key={i} style={{ '--ri': i }}>
            <span className="readout-dot" />
            <span className="readout-text">{t}</span>
          </div>
        ))}
      </div>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div className="deco-particle" key={i} style={{ '--pi': i }} />
      ))}

    </div>
  )
}
