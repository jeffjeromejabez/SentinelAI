import { Link, useLocation } from 'react-router-dom'
import './PageShell.css'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/screenshot', label: 'Screenshot' },
  { to: '/url', label: 'URL' },
  { to: '/email', label: 'Email' },
  { to: '/conversation', label: 'Conversation' },
  { to: '/assistant', label: 'Assistant' },
  { to: '/history', label: 'History' },
]

export default function PageShell({ title, subtitle, children }) {
  const location = useLocation()

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                <path d="M8 1L1.5 3.5V9c0 4 2.8 7.5 6.5 8.5C11.7 16.5 14.5 13 14.5 9V3.5L8 1z" stroke="#00d4ff" strokeWidth="1.4" fill="rgba(0,212,255,0.12)" strokeLinejoin="round" />
                <path d="M5.5 9l1.8 1.8L10.5 7" stroke="#00d4ff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="brand-name">SentinelAI</span>
          </Link>

          <ul className="navbar-links">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className={`nav-link${location.pathname === item.to ? ' active' : ''}`}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="navbar-right">
            <span className="nav-status">
              <span className="status-dot" />
              Protected
            </span>
            <Link to="/assistant" className="nav-cta">Ask AI</Link>
          </div>
        </div>
      </nav>

      <main className="main-content page-shell-main">
        <section className="glass-container page-card">
          <header className="page-header">
            <div>
              <div className="upload-badge">
                <span className="badge-dot" />
                SentinelAI • {title}
              </div>
              <h1 className="upload-title">{title}</h1>
              <p className="upload-subtitle">{subtitle}</p>
            </div>
          </header>
          {children}
        </section>
      </main>
    </div>
  )
}
