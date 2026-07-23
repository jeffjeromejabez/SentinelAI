import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PageShell from '../components/PageShell'
import { saveScanResult } from '../lib/history'

export default function URLScanner() {
  const navigate = useNavigate()
  const location = useLocation()
  const [url, setUrl] = useState(location.state?.prefill || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleScan() {
    if (!/^https?:\/\//i.test(url.trim())) {
      setError('Please enter a valid URL starting with http:// or https://.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/scan/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Scan failed (${response.status})`)
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
      setError(scanError.message || 'Unable to scan the provided URL.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell title="URL Scanner" subtitle="Validate a link before you click and review the threat assessment in a structured report.">
      <div className="page-grid">
        <div className="page-panel">
          <div className="scan-form">
            <input className="form-input" type="url" value={url} placeholder="https://example.com" onChange={(event) => setUrl(event.target.value)} />
            <div className="inline-actions">
              <button className="btn-primary" onClick={handleScan} disabled={loading || !url.trim()}>
                {loading ? 'Scanning…' : 'Scan URL'}
              </button>
              <button className="btn-secondary" onClick={() => { setUrl(''); setError('') }}>
                Clear
              </button>
            </div>
            {error ? <div className="alert error">{error}</div> : null}
          </div>
        </div>
        <div className="page-panel">
          <h3>Heuristics used</h3>
          <ul className="list-stack">
            <li>Domain and link reputation indicators</li>
            <li>Urgency or credential-harvesting phrasing</li>
            <li>Known phishing structure and suspicious redirects</li>
          </ul>
        </div>
      </div>
    </PageShell>
  )
}