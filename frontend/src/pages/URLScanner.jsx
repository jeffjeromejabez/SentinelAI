import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PageShell from '../components/PageShell'
import ThreatMeter from '../components/ThreatMeter'
import { saveScanResult } from '../lib/history'

export default function URLScanner() {
  const navigate = useNavigate()
  const location = useLocation()
  const [url, setUrl] = useState(location.state?.prefill || '')
  const [loading, setLoading] = useState(false)
  const [targetScore, setTargetScore] = useState(null)
  const [pendingPayload, setPendingPayload] = useState(null)
  const [error, setError] = useState('')

  async function handleScan() {
    let cleanUrl = url.trim()
    if (!cleanUrl) {
      setError('Please enter a target URL to scan.')
      return
    }
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`
      setUrl(cleanUrl)
    }

    setLoading(true)
    setTargetScore(null)
    setPendingPayload(null)
    setError('')
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
      const response = await fetch(`${apiUrl}/scan/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
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
      
      setPendingPayload(payload)
      setTargetScore(payload.threatScore)

    } catch (scanError) {
      console.error('URL Scan error:', scanError)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
      const isFetchErr = scanError instanceof TypeError && scanError.message.includes('fetch')
      setError(
        isFetchErr
          ? `Unable to connect to SentinelAI Backend. Please ensure backend server is running on ${apiUrl}.`
          : (scanError.message || 'Unable to scan the provided URL.')
      )
      setLoading(false)
    }
  }

  function handleMeterComplete() {
    if (pendingPayload) {
      navigate('/result', { state: pendingPayload })
    }
    setLoading(false)
  }

  return (
    <PageShell title="URL Scanner" subtitle="Validate a link before you click and review the threat assessment in a structured report.">
      <div className="page-grid">
        <div className="page-panel">
          {loading ? (
            <ThreatMeter
              active={loading}
              targetScore={targetScore}
              onComplete={handleMeterComplete}
            />
          ) : (
            <div className="scan-form">
              <input className="form-input" type="url" value={url} placeholder="https://example.com" onChange={(event) => setUrl(event.target.value)} />
              <div className="inline-actions">
                <button className="btn-primary" onClick={handleScan} disabled={loading || !url.trim()}>
                  Scan URL
                </button>
                <button className="btn-secondary" onClick={() => { setUrl(''); setError('') }}>
                  Clear
                </button>
              </div>
              {error ? <div className="alert error">{error}</div> : null}
            </div>
          )}
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