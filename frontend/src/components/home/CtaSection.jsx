import { Link } from 'react-router-dom'

export default function CtaSection() {
  return (
    <section className="cta-section">
      <div className="cta-banner">
        <h2 className="cta-title">Start Protecting Yourself Today</h2>
        <p className="cta-desc">
          Inspect any suspicious web link, email message, login screenshot, or QR code before it compromises your security.
        </p>
        <Link to="/url" className="btn-hero-primary">
          <span>Launch Scanner</span>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4.166 10h11.668M10 4.166L15.833 10 10 15.833" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </section>
  )
}
