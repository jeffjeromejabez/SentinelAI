const STATS = [
  { value: '98.7%', label: 'Detection Accuracy' },
  { value: '< 2 sec', label: 'Average Scan Time' },
  { value: '4', label: 'Security Modules' },
  { value: '24/7', label: 'AI Protection' },
]

export default function StatsSection() {
  return (
    <section className="stats-section">
      <div className="stats-grid">
        {STATS.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-glow-bar" />
          </div>
        ))}
      </div>
    </section>
  )
}
