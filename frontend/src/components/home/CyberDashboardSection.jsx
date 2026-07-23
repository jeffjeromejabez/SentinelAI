export default function CyberDashboardSection() {
  return (
    <section className="cyber-dashboard-section">
      <div className="section-header">
        <span className="section-badge">CYBER INTELLIGENCE DASHBOARD</span>
        <h2 className="section-title">Recent Threat Statistics</h2>
        <p className="section-subtitle">Real-time threat telemetry and category breakdown visualizer.</p>
      </div>

      <div className="cyber-dashboard">
        <div className="dashboard-status-bar">
          <div className="status-indicator">
            <span className="status-dot" />
            <span>SYSTEM STATUS: ACTIVE & PROTECTING</span>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Threat Intelligence DB v3.1.0 • Sub-2s Latency
          </span>
        </div>

        <div className="dashboard-metrics-row">
          <div className="metric-panel">
            <div className="metric-panel-title">
              <span>Scan Categories Distribution</span>
              <span style={{ color: 'var(--neon)', fontSize: '0.8rem' }}>LIVE TELEMETRY</span>
            </div>
            <div className="bar-stack">
              <div className="bar-item">
                <div className="bar-info">
                  <span>URL Phishing Scans</span>
                  <span>38%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: '38%', background: '#00d4ff' }} />
                </div>
              </div>
              <div className="bar-item">
                <div className="bar-info">
                  <span>Email Social Engineering</span>
                  <span>27%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: '27%', background: '#2979ff' }} />
                </div>
              </div>
              <div className="bar-item">
                <div className="bar-info">
                  <span>Credential Screenshot Scans</span>
                  <span>22%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: '22%', background: '#a855f7' }} />
                </div>
              </div>
              <div className="bar-item">
                <div className="bar-info">
                  <span>QR Barcode Exploits</span>
                  <span>13%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: '13%', background: '#00e5a0' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="metric-panel">
            <div className="metric-panel-title">
              <span>Severity Breakdown</span>
              <span style={{ color: '#ff4757', fontSize: '0.8rem' }}>DETECTION ENGINE</span>
            </div>
            <div className="bar-stack">
              <div className="bar-item">
                <div className="bar-info">
                  <span>Critical Risk (Impersonation / Malware)</span>
                  <span>24%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: '24%', background: '#ff4757' }} />
                </div>
              </div>
              <div className="bar-item">
                <div className="bar-info">
                  <span>High Risk (Abuse TLDs / Domain Mismatches)</span>
                  <span>31%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: '31%', background: '#ff9f43' }} />
                </div>
              </div>
              <div className="bar-item">
                <div className="bar-info">
                  <span>Medium Risk (Shortened / Obfuscated Links)</span>
                  <span>28%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: '28%', background: '#ffd166' }} />
                </div>
              </div>
              <div className="bar-item">
                <div className="bar-info">
                  <span>Safe / Verified Legitimate</span>
                  <span>17%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: '17%', background: '#00e5a0' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
