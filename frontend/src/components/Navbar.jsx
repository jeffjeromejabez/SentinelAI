import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const links = [
  { to: '/', label: 'Home' },
  { to: '/screenshot', label: 'Screenshot' },
  { to: '/url', label: 'URL' },
  { to: '/email', label: 'Email' },
  { to: '/conversation', label: 'Conversation' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
              <path d="M8 1L1.5 3.5V9c0 4 2.8 7.5 6.5 8.5C11.7 16.5 14.5 13 14.5 9V3.5L8 1z"
                stroke="#00d4ff" strokeWidth="1.4" fill="rgba(0,212,255,0.12)" strokeLinejoin="round"/>
              <path d="M5.5 9l1.8 1.8L10.5 7" stroke="#00d4ff" strokeWidth="1.4"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="brand-name">SentinelAI</span>
        </Link>

        <ul className="navbar-links">
          {links.map((link) => (
            <li key={link.to}><Link to={link.to} className={`nav-link${location.pathname === link.to ? ' active' : ''}`}>{link.label}</Link></li>
          ))}
        </ul>

        <div className="navbar-right">
          <span className="nav-status">
            <span className="status-dot" />
            Protected
          </span>
          <Link to="/assistant" className="nav-cta">Get Started</Link>
        </div>
      </div>
    </nav>
  )
}
