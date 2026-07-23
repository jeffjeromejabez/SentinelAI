import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './UploadSection.css'

export default function UploadSection() {
  const navigate = useNavigate()
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [url, setUrl] = useState('')
  const inputRef = useRef()

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    setPreview(URL.createObjectURL(file))
  }

  function onInputChange(e) { handleFile(e.target.files[0]) }

  function onDrop(e) {
    e.preventDefault(); setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }
  function onDragOver(e)  { e.preventDefault(); setDragging(true) }
  function onDragLeave()  { setDragging(false) }

  function handleScan() {
    if (url.trim()) {
      navigate('/url', { state: { prefill: url.trim() } })
    } else if (preview) {
      navigate('/screenshot')
    }
  }

  function handleClear() {
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const canScan = !!preview || !!url.trim()

  return (
    <div className="upload-section">

      {/* ── Header ── */}
      <div className="upload-header">
        <div className="upload-badge">
          <span className="badge-dot" />
          AI-Powered Security
        </div>
        <h1 className="upload-title">
          Advanced <span className="gradient-text" data-text="Scam Detection">Scam Detection</span>
        </h1>
        <p className="upload-subtitle">
          Upload a screenshot or paste a URL to instantly detect phishing attempts,
          scam messages, and cyber threats using advanced AI analysis.
        </p>
      </div>

      {/* ── Drop zone ── */}
      <div
        className={`upload-zone${dragging ? ' dragging' : ''}${preview ? ' has-preview' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !preview && inputRef.current.click()}
      >
        {preview ? (
          <div className="preview-container">
            <img src={preview} alt="Screenshot preview" className="preview-img" />
            <div className="preview-overlay">
              <button className="preview-clear" onClick={e => { e.stopPropagation(); handleClear() }}>
                ✕ Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon-wrap">
              <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <rect x="3" y="3" width="18" height="14" rx="2"/>
                <path d="M8 21h8M12 17v4"/>
                <path d="M9 10l3-3 3 3M12 7v6"/>
              </svg>
            </div>
            <p className="upload-main-text">
              Drop screenshot here or <span className="upload-link">browse files</span>
            </p>
            <p className="upload-sub-text">Supports PNG, JPG, WEBP · Max 10 MB</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={onInputChange} hidden />
      </div>

      {/* ── URL row ── */}
      <div className="url-row">
        <div className="url-input-wrap">
          <svg className="url-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="10" cy="10" r="8"/>
            <path d="M2 10h16M10 2a14 14 0 010 16M10 2a14 14 0 000 16"/>
          </svg>
          <input
            className="url-input"
            type="url"
            placeholder="Or paste a URL to scan…"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
        </div>
      </div>

      {/* ── Scan button ── */}
      <button
        className="btn-scan"
        onClick={handleScan}
        disabled={!canScan}
      >
        <span className="scan-icon">⚡</span> Scan for Threats
      </button>

    </div>
  )
}
