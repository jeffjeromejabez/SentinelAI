import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="brand-icon">
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
              <path d="M8 1L1.5 3.5V9c0 4 2.8 7.5 6.5 8.5C11.7 16.5 14.5 13 14.5 9V3.5L8 1z"
                stroke="#00d4ff" strokeWidth="1.4" fill="rgba(0,212,255,0.12)" strokeLinejoin="round"/>
              <path d="M5.5 9l1.8 1.8L10.5 7" stroke="#00d4ff" strokeWidth="1.4"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="brand-name">SentinelAI</span>
        </div>

        <ul className="navbar-links">
          <li><a href="#" className="nav-link active">Home</a></li>
          <li><a href="#" className="nav-link">Features</a></li>
          <li><a href="#" className="nav-link">About</a></li>
          <li><a href="#" className="nav-link">Contact</a></li>
        </ul>

        <div className="navbar-right">
          <span className="nav-status">
            <span className="status-dot" />
            Protected
          </span>
          <button className="nav-cta">Get Started</button>
        </div>
      </div>
    </nav>
  )
}
