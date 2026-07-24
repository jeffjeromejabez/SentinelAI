import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-glow-bg" />
      <span className="section-badge">SENTINELAI V3.1 • GOOGLE GEMINI ENGINE</span>
      <h1 className="hero-headline">AI-Powered Cyber Threat Detection</h1>
      <p className="hero-subheading">
        SentinelAI delivers real-time threat intelligence for URLs, scam emails, screenshots, and chat conversations using Google Gemini AI.
      </p>
      <div className="hero-actions">
        <Link to="/url" className="btn-hero-primary">
          <span>Start Scanning</span>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4.166 10h11.668M10 4.166L15.833 10 10 15.833" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <Link to="/history" className="btn-hero-secondary">
          <span>View History</span>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="6" height="6" rx="1"/>
            <rect x="11" y="3" width="6" height="6" rx="1"/>
            <rect x="3" y="11" width="6" height="6" rx="1"/>
            <rect x="11" y="11" width="6" height="6" rx="1"/>
          </svg>
        </Link>
      </div>
    </section>
  )
}
