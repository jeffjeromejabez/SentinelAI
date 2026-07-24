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

const SUSPICIOUS_KEYWORDS = [
  'OTP', 'PIN', 'Password', 'Aadhaar', 'Aadhar', 'PAN', 'CVV', 'UPI',
  'AnyDesk', 'TeamViewer', 'QuickSupport', 'Urgent', 'Urgently', 'Immediately',
  'Blocked', 'Suspended', 'Claim Prize', 'Lottery', 'Refund', 'Customs', 'Police',
  'CBI', 'SBI', 'HDFC', 'ICICI', 'KBC', 'USDT', 'Binance', 'Registration Fee',
  'Processing Fee', 'Penalty', 'Arrest', 'FIR', 'KYC', 'AnyDesk'
]

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

function getDetectedBadges(result) {
  const feats = result.details?.extractedFeatures || {}
  const text = (result.details?.conversationText || result.explanation || '').toLowerCase()
  const badges = []

  if (feats.otp_mentions > 0 || text.includes('otp')) badges.push({ text: '🔑 OTP Request', color: '#ff4757' })
  if (feats.upi > 0 || text.includes('upi')) badges.push({ text: '💳 UPI Mention', color: '#a855f7' })
  if (feats.lottery_words > 0 || text.includes('lottery') || text.includes('prize') || text.includes('kbc')) badges.push({ text: '🎰 Lottery Scam', color: '#ffd166' })
  if (feats.crypto > 0 || text.includes('crypto') || text.includes('usdt') || text.includes('binance')) badges.push({ text: '🪙 Crypto Scheme', color: '#00d4ff' })
  if (feats.links > 0 || feats.suspicious_domains > 0 || feats.shortened_urls > 0 || text.includes('http')) badges.push({ text: '🌐 Suspicious URL', color: '#ff9f43' })
  if (feats.authority > 0 || feats.bank_impersonation || feats.police_impersonation || feats.govt_impersonation) badges.push({ text: '🛡️ Authority Impersonation', color: '#ff4757' })
  if (feats.fear > 0 || feats.threats > 0 || text.includes('blocked') || text.includes('arrest')) badges.push({ text: '⚠️ Fear Tactics', color: '#ff9f43' })
  if (feats.requests_aadhaar || feats.requests_pan || feats.requests_id_proof || text.includes('aadhaar') || text.includes('pan card')) badges.push({ text: '🪪 Identity Theft', color: '#a855f7' })
  if (feats.urgency > 0 || text.includes('urgent') || text.includes('immediately')) badges.push({ text: '⏳ Urgency', color: '#ffd166' })
  if (feats.repeated_payment_requests || feats.payment_req_matches || text.includes('fee') || text.includes('transfer')) badges.push({ text: '💰 Payment Request', color: '#ff4757' })
  if (feats.requests_screen_sharing || feats.remote_access > 0 || text.includes('anydesk') || text.includes('teamviewer')) badges.push({ text: '📱 Remote Access App', color: '#ff4757' })
  if (feats.refund > 0 || text.includes('refund')) badges.push({ text: '🔄 Refund Scam', color: '#2979ff' })

  if (badges.length === 0) {
    if (result.threatScore > 60) {
      badges.push({ text: '⚠️ High Risk Cues', color: '#ff4757' })
    } else {
      badges.push({ text: '🟢 Verified Safe Cues', color: '#00e5a0' })
    }
  }

  return badges
}

function HighlightedText({ text }) {
  if (!text) return null

  // Escape regex special chars
  const pattern = new RegExp(`\\b(${SUSPICIOUS_KEYWORDS.join('|')})\\b`, 'gi')
  const parts = text.split(pattern)

  return (
    <div style={{
      fontFamily: 'monospace',
      fontSize: '0.88rem',
      lineHeight: '1.6',
      color: '#cbd5e1',
      whiteSpace: 'pre-wrap',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      padding: '14px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 71, 87, 0.25)',
      maxHeight: '260px',
      overflowY: 'auto'
    }}>
      {parts.map((part, i) => {
        const isMatch = SUSPICIOUS_KEYWORDS.some(k => k.toLowerCase() === part.toLowerCase())
        if (isMatch) {
          return (
            <mark key={i} style={{
              backgroundColor: 'rgba(255, 71, 87, 0.22)',
              color: '#ff6b81',
              border: '1px solid rgba(255, 71, 87, 0.5)',
              borderRadius: '4px',
              padding: '1px 5px',
              fontWeight: 600,
              boxShadow: '0 0 6px rgba(255, 71, 87, 0.3)'
            }}>
              {part}
            </mark>
          )
        }
        return part
      })}
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
  const extractedFeatures = result.details?.extractedFeatures || {}
  const decodedPayload = result.details?.decodedPayload || result.details?.url
  const conversationText = result.details?.conversationText || (result.scanType === 'conversation' ? result.details?.conversationPreview : null)
  const badges = getDetectedBadges(result)

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

        {/* TASK 3: AI Detected Indicators Section */}
        <div className="page-panel" style={{ marginBottom: '20px', borderColor: 'rgba(0, 212, 255, 0.3)' }}>
          <h3>AI Detected Indicators</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
            {badges.map((badge, idx) => (
              <span key={idx} style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                backgroundColor: `${badge.color}15`,
                color: badge.color,
                border: `1px solid ${badge.color}45`,
                boxShadow: `0 0 10px ${badge.color}30`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {badge.text}
              </span>
            ))}
          </div>
        </div>

        {/* TASK 4: Conversation Highlighting Section */}
        {conversationText && (
          <div className="page-panel" style={{ marginBottom: '20px', borderColor: 'rgba(255, 71, 87, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0 }}>Analyzed Conversation (Suspicious Phrases Highlighted)</h3>
              <span style={{ fontSize: '0.78rem', color: '#ff6b81', fontWeight: 600 }}>
                ● Suspicious Cues Highlighted
              </span>
            </div>
            <HighlightedText text={conversationText} />
          </div>
        )}

        {decodedPayload && (
          <div className="page-panel" style={{ marginBottom: '20px', borderColor: 'rgba(0, 229, 160, 0.3)' }}>
            <h3>Target Content / Decoded Payload</h3>
            <p style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#7be0ff', wordBreak: 'break-all' }}>
              {decodedPayload}
            </p>
          </div>
        )}

        {/* TASK 5: Scan Statistics Card */}
        {extractedFeatures && (extractedFeatures.messages !== undefined || extractedFeatures.conversation_length !== undefined) && (
          <div className="page-panel" style={{ marginBottom: '20px', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
            <h3>Scan Statistics & Metrics</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              marginTop: '12px'
            }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Length</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>{extractedFeatures.conversation_length || result.details?.conversationLength || 0} chars</span>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Messages</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#00d4ff' }}>{extractedFeatures.messages || 1}</span>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>URLs</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2979ff' }}>{extractedFeatures.links || 0}</span>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Phone Numbers</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#a855f7' }}>{extractedFeatures.phones || 0}</span>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Emails</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#7be0ff' }}>{extractedFeatures.emails || 0}</span>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Money Mentions</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffd166' }}>{extractedFeatures.upi + (extractedFeatures.bank_account_mentions || 0)}</span>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Authority Mentions</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ff9f43' }}>{extractedFeatures.authority || 0}</span>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Urgency Score</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ff4757' }}>{extractedFeatures.urgency || 0}</span>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Total Indicators</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ff4757' }}>{extractedFeatures.total_suspicious_indicators || extractedFeatures.heuristic_signals?.length || 0}</span>
              </div>
            </div>
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
