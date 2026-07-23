import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/PageShell'
import { deleteScanResult, readHistory } from '../lib/history'

export default function History() {
  const [history, setHistory] = useState(readHistory())
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const visibleHistory = useMemo(() => {
    return history.filter((entry) => {
      const matchesQuery = `${entry.summary ?? ''} ${entry.scanType ?? ''} ${entry.riskLevel ?? ''}`.toLowerCase().includes(query.toLowerCase())
      const matchesFilter = filter === 'all' || (entry.riskLevel ?? '').toLowerCase() === filter
      return matchesQuery && matchesFilter
    })
  }, [history, query, filter])

  function handleDelete(id) {
    setHistory(deleteScanResult(id))
  }

  return (
    <PageShell title="Scan History" subtitle="Review prior assessments, filter by severity, and remove entries you no longer need.">
      <div className="scan-form">
        <div className="inline-actions">
          <input className="form-input" placeholder="Search history" value={query} onChange={(event) => setQuery(event.target.value)} />
          <select className="form-input" value={filter} onChange={(event) => setFilter(event.target.value)} style={{ maxWidth: '180px' }}>
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="safe">Safe</option>
          </select>
        </div>
        <div className="history-grid">
          {visibleHistory.length === 0 ? (
            <div className="alert">No matching scan history yet. Complete a scan to populate this list.</div>
          ) : (
            visibleHistory.map((entry) => (
              <div className="history-card" key={entry.id}>
                <div className="history-top">
                  <span className="history-chip">{entry.scanType}</span>
                  <button className="btn-ghost" onClick={() => handleDelete(entry.id)}>Delete</button>
                </div>
                <p><strong>{entry.summary}</strong></p>
                <p className="upload-subtitle">Risk: {entry.riskLevel} • Confidence: {entry.confidenceScore}%</p>
                <p className="upload-subtitle">{entry.scanTimestamp}</p>
                <div className="inline-actions" style={{ marginTop: '8px' }}>
                  <Link className="btn-secondary" to="/result" state={entry}>Open Report</Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageShell>
  )
}
