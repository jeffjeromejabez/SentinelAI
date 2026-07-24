import { useState, useEffect, useRef } from 'react'
import './ThreatMeter.css'

const STATUS_MESSAGES = [
  'Initializing AI Threat Engine...',
  'Extracting Features & Metadata...',
  'Scanning Target Headers & Domains...',
  'Detecting Social Engineering Tactics...',
  'Analyzing Intent & Credential Risks...',
  'Calculating Dynamic Threat Score...',
  'Generating Remediation Guidance...'
]

const COLOR_MAP = {
  safe: '#00e5a0',
  low: '#7be0ff',
  medium: '#ffd166',
  high: '#ff9f43',
  critical: '#ff4757',
  loading: '#00d4ff',
}

export default function ThreatMeter({ active, targetScore, onComplete }) {
  const [displayScore, setDisplayScore] = useState(0)
  const [statusIdx, setStatusIdx] = useState(0)
  const [statusOpacity, setStatusOpacity] = useState(1)
  
  const displayScoreRef = useRef(0)
  const animFrameRef = useRef(null)
  const statusTimerRef = useRef(null)
  const completedRef = useRef(false)

  displayScoreRef.current = displayScore

  // Rotating status message timer
  useEffect(() => {
    if (!active) return

    statusTimerRef.current = setInterval(() => {
      setStatusOpacity(0)
      setTimeout(() => {
        setStatusIdx((prev) => (prev + 1) % STATUS_MESSAGES.length)
        setStatusOpacity(1)
      }, 250)
    }, 1200)

    return () => {
      if (statusTimerRef.current) clearInterval(statusTimerRef.current)
    }
  }, [active])

  // Smooth score animation using requestAnimationFrame
  useEffect(() => {
    if (!active) return

    let lastTime = performance.now()

    const animate = (now) => {
      const delta = now - lastTime
      
      if (delta >= 40) { // Update roughly 25fps for natural feel
        lastTime = now

        const current = displayScoreRef.current

        if (targetScore === null || targetScore === undefined) {
          // Phase 1: Pending backend response -> animate 0% -> 70% max
          if (current < 70) {
            // Speed slows down as it approaches 70
            const step = current < 30 ? 3 : current < 50 ? 2 : 1
            const next = Math.min(70, current + step)
            setDisplayScore(next)
          }
        } else {
          // Phase 2: Backend response arrived -> animate from current score to targetScore
          const target = Math.max(0, Math.min(100, Math.round(targetScore)))

          if (current !== target) {
            const diff = target - current
            const step = Math.sign(diff) * Math.max(1, Math.min(6, Math.abs(Math.round(diff / 4))))
            const next = current + step

            if ((diff > 0 && next >= target) || (diff < 0 && next <= target)) {
              setDisplayScore(target)
            } else {
              setDisplayScore(next)
            }
          } else {
            // Reached target score! Hold briefly (~600ms) then call onComplete
            if (!completedRef.current) {
              completedRef.current = true
              setTimeout(() => {
                if (onComplete) onComplete()
              }, 600)
              return // Stop animation loop
            }
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [active, targetScore, onComplete])

  if (!active) return null

  // Calculate SVG Circle Parameters (Radius 76, Circumference ~ 477.5)
  const radius = 76
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (displayScore / 100) * circumference

  // Dynamic color selection
  let activeColor = COLOR_MAP.loading
  if (targetScore !== null && targetScore !== undefined && displayScore === targetScore) {
    if (targetScore <= 20) activeColor = COLOR_MAP.safe
    else if (targetScore <= 40) activeColor = COLOR_MAP.low
    else if (targetScore <= 60) activeColor = COLOR_MAP.medium
    else if (targetScore <= 80) activeColor = COLOR_MAP.high
    else activeColor = COLOR_MAP.critical
  }

  return (
    <div className="threat-meter-container">
      <div className="threat-meter-badge">
        <span className="threat-meter-pulse-dot" style={{ background: activeColor, boxShadow: `0 0 8px ${activeColor}` }} />
        <span>Live Threat Analysis Engine</span>
      </div>

      <div className="threat-meter-gauge-wrap">
        <div className="threat-meter-radar-sweep" />
        <svg className="threat-meter-svg" viewBox="0 0 190 190">
          <circle
            className="threat-meter-bg-circle"
            cx="95"
            cy="95"
            r={radius}
          />
          <circle
            className="threat-meter-progress-circle"
            cx="95"
            cy="95"
            r={radius}
            stroke={activeColor}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              filter: `drop-shadow(0 0 10px ${activeColor}88)`
            }}
          />
        </svg>

        <div className="threat-meter-inner-content">
          <span className="threat-meter-number" style={{ color: activeColor, textShadow: `0 0 15px ${activeColor}66` }}>
            {displayScore}%
          </span>
          <span className="threat-meter-sublabel">Threat Meter</span>
        </div>
      </div>

      <div className="threat-meter-status-msg" style={{ opacity: statusOpacity }}>
        <span>{STATUS_MESSAGES[statusIdx]}</span>
      </div>
    </div>
  )
}
