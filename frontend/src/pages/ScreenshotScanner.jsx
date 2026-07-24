import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/PageShell'
import ThreatMeter from '../components/ThreatMeter'
import { saveScanResult } from '../lib/history'

export default function ScreenshotScanner() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [targetScore, setTargetScore] = useState(null)
  const [pendingPayload, setPendingPayload] = useState(null)
  const [error, setError] = useState('')

  const acceptedTypes = useMemo(() => ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'], [])

  function handleFileSelection(selectedFile) {
    if (!selectedFile) return
    if (!acceptedTypes.includes(selectedFile.type)) {
      setError('Please upload a PNG, JPG, JPEG, or WEBP image.')
      return
    }
    const nextPreview = URL.createObjectURL(selectedFile)
    setFile(selectedFile)
    setPreview(nextPreview)
    setError('')
  }

  async function readFileAsBase64(selectedFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result
        if (typeof result === 'string') {
          const parts = result.split(',')
          resolve({ data: parts[1] || '', mimeType: selectedFile.type || 'image/png' })
        } else {
          reject(new Error('Unable to read the selected image.'))
        }
      }
      reader.onerror = () => reject(new Error('Unable to read the selected image.'))
      reader.readAsDataURL(selectedFile)
    })
  }

  async function handleScan() {
    if (!file) {
      setError('Please upload an image before scanning.')
      return
    }
    setLoading(true)
    setTargetScore(null)
    setPendingPayload(null)
    setError('')
    try {
      const imagePayload = await readFileAsBase64(file)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/scan/screenshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_name: file.name, image_data: imagePayload.data, mime_type: imagePayload.mimeType }),
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
      setError(scanError.message || 'Unable to scan the screenshot right now.')
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
    <PageShell title="Screenshot Scanner" subtitle="Upload a screenshot and let SentinelAI assess it for phishing cues and visual impersonation patterns.">
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
              <label className="upload-zone has-preview" htmlFor="screenshot-file" style={{ cursor: 'pointer', padding: '16px' }}>
                {preview ? <img src={preview} alt="Uploaded preview" className="preview-image" /> : <div className="upload-placeholder"><p className="upload-main-text">Choose a screenshot to analyze</p><p className="upload-sub-text">PNG, JPG, JPEG, WEBP</p></div>}
              </label>
              <input id="screenshot-file" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" onChange={(event) => handleFileSelection(event.target.files?.[0])} hidden />
              <div className="inline-actions">
                <button className="btn-primary" onClick={handleScan} disabled={loading || !file}>
                  Scan Screenshot
                </button>
                <button className="btn-secondary" onClick={() => { setFile(null); setPreview(''); setError('') }}>
                  Clear
                </button>
              </div>
              {error ? <div className="alert error">{error}</div> : null}
            </div>
          )}
        </div>

        <div className="page-panel">
          <h3>What this scan checks</h3>
          <ul className="list-stack">
            <li>Visual phishing cues and suspicious branding</li>
            <li>OCR text and embedded prompts</li>
            <li>Threat scoring and confidence estimation</li>
          </ul>
        </div>
      </div>
    </PageShell>
  )
}