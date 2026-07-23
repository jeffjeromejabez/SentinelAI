import { useEffect, useRef, useState } from 'react'
import PageShell from '../components/PageShell'

const API = import.meta.env.VITE_API_URL

/** Minimal markdown renderer: bold, inline code, bullet lists, numbered lists */
function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Bullet list item
    if (/^[\-\*] /.test(line)) {
      const items = []
      while (i < lines.length && /^[\-\*] /.test(lines[i])) {
        items.push(lines[i].replace(/^[\-\*] /, ''))
        i++
      }
      elements.push(
        <ul key={i} style={{ paddingLeft: '18px', margin: '6px 0' }}>
          {items.map((item, j) => <li key={j} style={{ marginBottom: '3px' }}>{inlineFormat(item)}</li>)}
        </ul>
      )
      continue
    }

    // Numbered list item
    if (/^\d+\.\s/.test(line)) {
      const items = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      elements.push(
        <ol key={i} style={{ paddingLeft: '18px', margin: '6px 0' }}>
          {items.map((item, j) => <li key={j} style={{ marginBottom: '3px' }}>{inlineFormat(item)}</li>)}
        </ol>
      )
      continue
    }

    // Empty line = paragraph break
    if (line.trim() === '') {
      elements.push(<br key={i} />)
      i++
      continue
    }

    elements.push(<p key={i} style={{ margin: '4px 0', lineHeight: '1.6' }}>{inlineFormat(line)}</p>)
    i++
  }

  return elements
}

function inlineFormat(text) {
  // Split on **bold**, *italic*, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} style={{ background: 'rgba(0,212,255,0.12)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.88em' }}>{part.slice(1, -1)}</code>
    }
    return part
  })
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm SentinelAI. Ask me anything about phishing, suspicious URLs, scam emails, or cybersecurity best practices." },
  ])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend() {
    const message = draft.trim()
    if (!message || loading) return

    const updatedMessages = [...messages, { role: 'user', content: message }]
    setMessages(updatedMessages)
    setDraft('')
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          // Exclude the initial greeting (index 0) from history sent to backend
          history: messages.slice(1),
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Server error ${response.status}`)
      }

      const payload = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: payload.reply }])
    } catch (chatError) {
      setError(chatError.message || 'The AI assistant could not respond.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <PageShell title="AI Assistant" subtitle="Ask anything about cybersecurity, phishing, scam detection, or threat analysis.">
      <div className="chat-box">
        <div className="chat-log">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.role}`}>
              <div className="chat-text">{renderMarkdown(msg.content)}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-bubble assistant">
              <span className="chat-thinking">Thinking…</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && <div className="alert error">{error}</div>}

        <div className="inline-actions">
          <input
            className="form-input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about a suspicious email, link, or threat…"
            disabled={loading}
          />
          <button
            className="btn-primary"
            onClick={handleSend}
            disabled={loading || !draft.trim()}
          >
            {loading ? 'Thinking…' : 'Send'}
          </button>
        </div>
      </div>
    </PageShell>
  )
}
