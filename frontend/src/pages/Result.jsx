import { Link, useLocation } from 'react-router-dom'
import PageShell from '../components/PageShell'
import { readHistory } from '../lib/history'

const RISK_COLOURS = {
  Safe: '#00e5a0',
  Low: '#7be0ff',
  Medium: '#ffd166',
  High: '#ff9f43',
  Critical: '#ff4757',
}

function ThreatMeter({ score }) {
  const pct = Math.max(0, Math.min(100, score || 0))
  const colour =
    pct <= 20 ? RISK_COLOURS.Safe :
    pct <= 40 ? RISK_COLOURS.Low :
    pct <= 60 ? RISK_COLOURS.Medium :
    pct <= 80 ? RISK_COLOURS.High :
    RISK_COLOURS.Critical

  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{
        height: '8px', borderRadius: '999px',
        background: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: colour,
          borderRadius: '999px',
          transition: 'width 0.6s ease',
          boxShadow: `0 0 8px ${colour}88`,
        }} />
      </div>
      <span style={{ fontSize: '0.8rem', color: colour, marginTop: '4px', display: 'block' }}>
        {pct}%
      </span>
    </div>
  )
}

export default function Result() {
  const location = useLocation()
  const result = location.state || readHistory()[0]

  if (!result) {
    return (
      <PageShell title="Threat Report" subtitle="No result is available yet. Run a scan to view your report.">
        <div className="alert">Start a scan from one of the scanner pages to generate a threat report.</div>
      </PageShell>
    )
  }

  const riskColour = RISK_COLOURS[result.riskLevel] || 'var(--text-primary)'
  const extractedFeatures = result.details?.extractedFeatures
  const decodedPayload = result.details?.decodedPayload || result.details?.url

  return (
    <PageShell title="Threat Report" subtitle="Professional threat analysis with clear risk, confidence, and remediation details.">
      <div className="result-preview">
        <div className="result-metrics">
          <div className="metric-card">
            <span className="metric-label">Threat Score</span>
            <span className="metric-value" style={{ color: riskColour }}>{result.threatScore ?? '—'}/100</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Risk Level</span>
            <span className="metric-value" style={{ color: riskColour }}>{result.riskLevel ?? '—'}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Confidence Score</span>
            <span className="metric-value">{result.confidenceScore ?? '—'}%</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Threat Meter</span>
            <ThreatMeter score={result.threatMeter ?? result.threatScore} />
          </div>
        </div>

        {decodedPayload && (
          <div className="page-panel" style={{ marginBottom: '20px', borderColor: 'rgba(0, 229, 160, 0.3)' }}>
            <h3>Target Content / Decoded Payload</h3>
            <p style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#7be0ff', wordBreak: 'break-all' }}>
              {decodedPayload}
            </p>
          </div>
        )}

        <div className="page-grid">
          <div className="page-panel">
            <h3>Detected Threats</h3>
            <ul className="list-stack">
              {(result.detectedThreats?.length ? result.detectedThreats : ['No specific threats identified']).map((threat, i) => (
                <li key={i}>{threat}</li>
              ))}
            </ul>
          </div>
          <div className="page-panel">
            <h3>Explanation</h3>
            <p>{result.explanation || 'No explanation available.'}</p>
          </div>
        </div>

        {extractedFeatures && extractedFeatures.heuristic_signals && (
          <div className="page-panel" style={{ marginBottom: '20px' }}>
            <h3>Extracted Security Signals & Evidence</h3>
            <ul className="list-stack">
              {extractedFeatures.heuristic_signals.map((sig, i) => (
                <li key={i} style={{ color: '#7be0ff' }}>{sig}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="page-grid">
          <div className="page-panel">
            <h3>Recommendations</h3>
            <ul className="list-stack">
              {(result.recommendations?.length ? result.recommendations : ['No specific recommendations.']).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="page-panel">
            <h3>Scan Details</h3>
            <ul className="list-stack">
              <li>Scan Type: {result.scanType ?? '—'}</li>
              <li>Timestamp: {result.scanTimestamp ?? '—'}</li>
              <li>Summary: {result.summary ?? '—'}</li>
            </ul>
          </div>
        </div>

        <div className="inline-actions">
          <Link className="btn-primary" to="/history">View History</Link>
          <Link className="btn-secondary" to="/assistant">Ask the AI Assistant</Link>
        </div>
      </div>
    </PageShell>
  )
}
