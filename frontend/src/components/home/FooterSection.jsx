import { Link } from 'react-router-dom'

export default function FooterSection() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div>
          <div className="footer-brand-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>SentinelAI</span>
          </div>
          <p className="footer-brand-desc">
            AI-powered cyber threat intelligence engine detecting phishing, scam emails, visual impersonation, and malicious QR codes in real-time.
          </p>
        </div>

        <div>
          <h4 className="footer-column-title">Security Modules</h4>
          <ul className="footer-links">
            <li><Link to="/screenshot" className="footer-link">Screenshot Scanner</Link></li>
            <li><Link to="/url" className="footer-link">URL Scanner</Link></li>
            <li><Link to="/email" className="footer-link">Email Scanner</Link></li>
            <li><Link to="/qr" className="footer-link">QR Code Scanner</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-column-title">Resources</h4>
          <ul className="footer-links">
            <li><Link to="/assistant" className="footer-link">AI Assistant</Link></li>
            <li><Link to="/history" className="footer-link">Threat History</Link></li>
            <li><Link to="/about" className="footer-link">About SentinelAI</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-column-title">System Status</h4>
          <ul className="footer-links">
            <li><span style={{ color: '#00e5a0' }}>● All Engines Operational</span></li>
            <li><span style={{ color: 'var(--text-muted)' }}>Engine: Google Gemini 2.5</span></li>
            <li><span style={{ color: 'var(--text-muted)' }}>Response Time: &lt; 2.0s</span></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div>© {new Date().getFullYear()} SentinelAI Threat Intelligence Engine. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="badge-pill">v3.1.0 Production</span>
          <span className="badge-pill">National AI Hackathon Edition</span>
        </div>
      </div>
    </footer>
  )
}
