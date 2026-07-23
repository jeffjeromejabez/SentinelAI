import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/PageShell'
import { saveScanResult } from '../lib/history'

export default function EmailScanner() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleScan() {
    if (!email.trim()) {
      setError('Please enter an email message to analyze.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/scan/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Analysis failed (${response.status})`)
      }
      const payload = await response.json()
      saveScanResult({
        id: payload.id,
        scanType: payload.scanType,
        threatScore: payload.threatScore,
        riskLevel: payload.riskLevel,
        confidenceScore: payload.confidenceScore,
        detectedThreats: payload.detectedThreats,
        explanation: payload.explanation,
        recommendations: payload.recommendations,
        threatMeter: payload.threatMeter,
        scanTimestamp: payload.scanTimestamp,
        summary: payload.summary,
      })
      navigate('/result', { state: payload })
    } catch (scanError) {
      setError(scanError.message || 'Unable to analyze the email right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell title="Email Scanner" subtitle="Paste a suspicious message and SentinelAI will surface impersonation, phishing, and urgency indicators.">
      <div className="page-grid">
        <div className="page-panel">
          <div className="scan-form">
            <textarea className="form-textarea" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Paste email content here..." />
            <div className="inline-actions">
              <button className="btn-primary" onClick={handleScan} disabled={loading || !email.trim()}>
                {loading ? 'Analyzing…' : 'Analyze Email'}
              </button>
              <button className="btn-secondary" onClick={() => { setEmail(''); setError('') }}>
                Clear
              </button>
            </div>
            {error ? <div className="alert error">{error}</div> : null}
          </div>
        </div>
        <div className="page-panel">
          <h3>Signals reviewed</h3>
          <ul className="list-stack">
            <li>Urgency, fear, or reward-based language</li>
            <li>Suspicious links and impersonation cues</li>
            <li>Recommendation and reporting guidance</li>
          </ul>
        </div>
      </div>
    </PageShell>
  )
}
