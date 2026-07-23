import PageShell from '../components/PageShell'

export default function About() {
  return (
    <PageShell title="About SentinelAI" subtitle="A practical AI security platform that helps users review suspicious content across screenshots, URLs, emails, and QR codes.">
      <div className="page-grid">
        <div className="page-panel">
          <h3>What it does</h3>
          <p>SentinelAI combines lightweight heuristics, OCR-inspired inspection, and AI-guided interpretation to help people assess phishing risk quickly and clearly.</p>
        </div>
        <div className="page-panel">
          <h3>How it helps</h3>
          <p>Users can upload content, review the threat report, save results to history, and ask the assistant for plain-English guidance before acting.</p>
        </div>
      </div>
    </PageShell>
  )
}
