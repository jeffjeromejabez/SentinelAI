import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/PageShell'
import ThreatMeter from '../components/ThreatMeter'
import { saveScanResult } from '../lib/history'

const LOADING_STAGES = [
  '🔍 Parsing conversation log...',
  '🧠 Extracting linguistic & metadata features...',
  '🛡 Detecting social engineering & coercion tactics...',
  '⚠️ Calculating dynamic calibrated threat score...',
  '✨ Generating evidence-backed AI recommendations...'
]

const SAMPLE_CONVERSATIONS = [
  {
    label: '🟢 Safe Chat',
    text: `[10:14 AM] Rahul: Hey Alex, are we still meeting for lunch at 1 PM?
[10:15 AM] Alex: Yeah! Let's meet at the cafe near the office.
[10:16 AM] Rahul: Great, see you there. I'll bring the project notes.`
  },
  {
    label: '🚨 Bank OTP Scam',
    text: `[02:30 PM] SBI Customer Care: URGENT NOTICE: Your State Bank account 4982 has been temporarily blocked due to pending KYC verification.
[02:31 PM] User: Oh no, how can I unblock it?
[02:31 PM] SBI Customer Care: We are sending an OTP to your registered phone number right now. Share the 6-digit OTP immediately to avoid permanent account deactivation.
[02:32 PM] SBI Customer Care: Do not delay, account termination in 10 minutes!`
  },
  {
    label: '🏛️ Income Tax Refund Scam',
    text: `[09:40 AM] Income Tax Dept: Alert: Your tax refund of Rs. 15,450 has been approved by IT Department.
[09:41 AM] User: How do I receive the refund?
[09:42 AM] Income Tax Dept: Click http://incometax-refund-gov.tk/login to update your bank account details and submit your PAN card number and NetBanking password. Refund will be credited in 2 hours.`
  },
  {
    label: '⚡ Electricity Disconnection Scam',
    text: `[04:15 PM] State Electricity Board: Dear Consumer, your electricity line will be disconnected tonight at 9:30 PM because your previous month bill was not updated.
[04:16 PM] User: I already paid my bill yesterday!
[04:17 PM] State Electricity Board: System shows pending status. Call Electricity Officer Verma immediately on +919876543210. Pay Rs. 10 update fee on UPI id electricitypay@ybl or power supply will be cut off.`
  },
  {
    label: '📦 FedEx / Customs Scam',
    text: `[11:05 AM] FedEx Customs Department: Alert: Your package (Tracking #FX-89421) has been impounded by Mumbai Customs.
[11:06 AM] User: I didn't send any package.
[11:07 AM] FedEx Customs Department: The parcel contains 5 illegal passports and synthetic narcotics under your Aadhaar number. A police complaint (FIR #409) is being filed against you.
[11:08 AM] FedEx Customs Department: Connect immediately with Officer Sharma. Pay an online clearance penalty of 14,999 INR via UPI to clear your name before arrest.`
  },
  {
    label: '🔑 KYC Verification Scam',
    text: `[01:10 PM] Paytm Customer Desk: Dear user, your Paytm Wallet KYC has expired. Your wallet will be blocked within 24 hours.
[01:11 PM] User: How can I update KYC online?
[01:12 PM] Paytm Customer Desk: Install QuickSupport app from Play Store and share the 9 digit code with our verification team. Keep your Aadhaar card and PAN card ready for verification.`
  },
  {
    label: '🎰 Lottery Scam',
    text: `[09:12 AM] KBC Lucky Draw: CONGRATULATIONS! Your mobile number has won 25,000,000 INR in the KBC All India WhatsApp Lucky Draw!
[09:13 AM] User: Is this real? How do I claim?
[09:14 AM] KBC Lucky Draw: Yes, contact KBC Manager Rana Pratap on WhatsApp at +919876543210.
[09:15 AM] KBC Lucky Draw: You just need to deposit a registration & tax fee of 5,500 INR to UPI ID kbcwin@ybl to release your prize check.`
  },
  {
    label: '👔 Fake CEO Email Scam',
    text: `From: ceo-office@company-exec.net
To: finance@ourcompany.com
Subject: Urgent Confidential Wire Transfer

Hi Mark,
I am currently in an urgent board meeting with investors and cannot take calls.
Please initiate an urgent wire transfer of $18,500 to our new supplier account right away.
Account No: 9876543210
Routing: 021000021
Keep this strictly confidential until I return.`
  },
  {
    label: '🤲 Charity Donation Scam',
    text: `[05:20 PM] Global Disaster Relief: Emergency Appeal: 500 children are stranded without food after the flood.
[05:21 PM] User: How can I donate?
[05:22 PM] Global Disaster Relief: Transfer your donation directly to emergency relief UPI ID disasterhelp@paytm or send Google Pay. Every $50 saves a child. Send screenshot of payment immediately.`
  },
  {
    label: '💼 Fake Internship / Job Scam',
    text: `[04:20 PM] HR Recruiting: Hello! We selected your resume for a Work-From-Home Part-Time Data Entry job. Earn 3,000 to 8,000 INR daily by completing simple YouTube video liking tasks.
[04:21 PM] User: What are the requirements?
[04:22 PM] HR Recruiting: No experience needed. Join our Telegram group t.me/task_rewards_99.
[04:23 PM] HR Recruiting: First pay a refundable registration fee of 1,200 INR to activate your task account.`
  },
  {
    label: '📈 Crypto Investment Scam',
    text: `[06:45 PM] Crypto VIP Analyst: Exclusive Opportunity: Our AI trading bot guarantees 500% profit within 24 hours on Binance USDT!
[06:46 PM] User: How does it work?
[06:47 PM] Crypto VIP Analyst: Send 200 USDT to wallet address 0x71C7656EC7ab88b098defB751B7401B5f6d8976F.
[06:48 PM] Crypto VIP Analyst: Over 10,000 members are making $5,000 daily. Hurry, spot closing in 15 minutes!`
  },
  {
    label: '❤️ Romance Scam',
    text: `[08:10 PM] David: My love, I miss you so much. I have bought a flight ticket to come meet you next week.
[08:12 PM] User: Can't wait to see you!
[08:14 PM] David: Honey, an urgent problem happened at Heathrow airport customs. They locked my wallet and card.
[08:15 PM] David: Please send $800 right now to my friend's PayPal or Western Union so I can clear customs and board the flight.`
  },
  {
    label: '🔄 Refund Scam',
    text: `[01:15 PM] Amazon Refund Support: Sir, we accidentally refunded 45,000 INR to your bank account instead of 4,500 INR.
[01:16 PM] User: Wait, let me check.
[01:17 PM] Amazon Refund Support: Please do not open netbanking! Download AnyDesk app immediately and give us the 9-digit code so our technician can revert the extra 40,500 INR.
[01:18 PM] Amazon Refund Support: If you refuse, our company will file a legal recovery case against your bank account.`
  },
  {
    label: '🛒 Marketplace Scam',
    text: `[02:15 PM] OLX Seller: I am selling my iPhone 14 Pro for only Rs. 28,000 because I am transferring out of state today.
[02:16 PM] User: Is it working fine? Can I inspect it?
[02:17 PM] OLX Seller: Yes 100% genuine. Pay Rs. 2,000 advance booking fee to my GPay right now to hold it. 5 other buyers are waiting!`
  },
  {
    label: '💳 UPI Request Scam',
    text: `[03:40 PM] OLX Buyer: Hi, I want to buy your laptop listed on OLX. I am paying the full amount 22,000 INR right now via Google Pay.
[03:41 PM] User: Sure, let me know once sent.
[03:42 PM] OLX Buyer: I have sent a UPI payment request to your Google Pay. Click 'PAY' and enter your 6-digit UPI PIN to receive the money in your bank account.`
  }
]

export default function ConversationScanner() {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [targetScore, setTargetScore] = useState(null)
  const [pendingPayload, setPendingPayload] = useState(null)
  const [previewSummary, setPreviewSummary] = useState(null)
  const [error, setError] = useState('')

  async function handlePaste() {
    try {
      const clipboardText = await navigator.clipboard.readText()
      if (clipboardText) {
        setText(clipboardText)
        setError('')
      }
    } catch {
      setError('Unable to read clipboard. Please paste manually.')
    }
  }

  function validateInput(rawText) {
    const trimmed = rawText.trim()
    if (!trimmed) {
      return 'Please paste a conversation log to analyze.'
    }
    if (trimmed.length > 30000) {
      return 'Conversation exceeds maximum limit of 30,000 characters.'
    }
    if (!/[a-zA-Z0-9]/.test(trimmed)) {
      return 'Conversation must contain readable text or numbers (not only emojis or symbols).'
    }
    return null
  }

  async function handleScan() {
    if (loading || previewSummary) return

    const validationError = validateInput(text)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setTargetScore(null)
    setPendingPayload(null)
    setError('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/scan/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Analysis failed (${response.status})`)
      }

      const payload = await response.json()
      
      if (payload.details) {
        payload.details.conversationText = text.trim()
      }

      const feats = payload.details?.extractedFeatures || {}
      const summaryBadges = []

      if (feats.links > 0) summaryBadges.push(`URLs Found: ${feats.links}`)
      if (feats.otp_mentions > 0) summaryBadges.push(`OTP Mentions: ${feats.otp_mentions}`)
      if (feats.bank_impersonation) summaryBadges.push('Bank Impersonation')
      if (feats.urgency > 0) summaryBadges.push('Urgency Language')
      if (feats.requests_aadhaar || feats.requests_pan) summaryBadges.push('Govt ID Request')
      if (feats.suspicious_domains > 0 || feats.shortened_urls > 0) summaryBadges.push('Suspicious Links')
      if (feats.upi > 0) summaryBadges.push('UPI Payment Request')
      if (feats.requests_screen_sharing) summaryBadges.push('Remote App Request')

      if (summaryBadges.length === 0) {
        summaryBadges.push('Zero Fraud Indicators')
      }

      saveScanResult({
        id: payload.id,
        scanType: payload.scanType,
        threatScore: payload.threatScore,
        riskLevel: payload.riskLevel,
        confidenceScore: payload.confidenceScore,
        detectedThreats: payload.detectedThreats,
        explanation: payload.explanation,
        recommendations: payload.recommendations,
        threatMeter: payload.threatMeter,
        scanTimestamp: payload.scanTimestamp,
        summary: payload.summary,
        details: payload.details,
      })

      setPendingPayload({ payload, summaryBadges })
      setTargetScore(payload.threatScore)

    } catch (scanError) {
      setError(scanError.message || 'Unable to analyze the conversation right now.')
      setLoading(false)
    }
  }

  function handleMeterComplete() {
    if (pendingPayload) {
      const { payload, summaryBadges } = pendingPayload
      setLoading(false)
      setPreviewSummary({ badges: summaryBadges, payload })

      setTimeout(() => {
        navigate('/result', { state: payload })
      }, 1200)
    } else {
      setLoading(false)
    }
  }

  return (
    <PageShell
      title="Scam Conversation Analyzer"
      subtitle="Paste a chat or messaging conversation copied from WhatsApp, Telegram, Instagram, SMS, Discord, Email, or Messenger to detect scam, phishing, and extortion behavior."
    >
      <div className="page-grid">
        <div className="page-panel" style={{ position: 'relative' }}>
          
          {/* Feature Summary Overlay */}
          {previewSummary && (
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '24px',
              textAlign: 'center',
              border: '1px solid #00d4ff',
              boxShadow: '0 0 30px rgba(0, 212, 255, 0.25)',
              animation: 'fadeIn 0.3s ease'
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '12px', color: '#00e5a0' }}>
                ✓
              </div>
              <h3 style={{ color: '#00d4ff', marginBottom: '8px', fontSize: '1.2rem' }}>
                Features Extracted & Analyzed
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>
                Routing to Threat Intelligence Dashboard...
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {previewSummary.badges.map((b, i) => (
                  <span key={i} style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    backgroundColor: 'rgba(0, 212, 255, 0.12)',
                    color: '#00d4ff',
                    border: '1px solid rgba(0, 212, 255, 0.35)',
                    boxShadow: '0 0 8px rgba(0, 212, 255, 0.2)'
                  }}>
                    ✓ {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <ThreatMeter
              active={loading}
              targetScore={targetScore}
              onComplete={handleMeterComplete}
            />
          ) : (
            <div className="scan-form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                  CONVERSATION LOG
                </label>
                <span style={{ fontSize: '0.8rem', color: text.length > 30000 ? '#ff4757' : '#64748b', fontFamily: 'monospace' }}>
                  {text.length} / 30,000 chars
                </span>
              </div>

              <textarea
                className="form-textarea"
                rows={8}
                value={text}
                disabled={loading || Boolean(previewSummary)}
                onChange={(e) => {
                  setText(e.target.value)
                  if (error) setError('')
                }}
                placeholder="Paste a WhatsApp, Telegram, SMS, Email or social media conversation here..."
                style={{
                  width: '100%',
                  minHeight: '190px',
                  padding: '14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  border: error ? '1px solid #ff4757' : '1px solid rgba(0, 212, 255, 0.25)',
                  color: '#f8fafc',
                  fontSize: '0.92rem',
                  lineHeight: '1.5',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />

              <div className="inline-actions" style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                <button
                  className="btn-primary"
                  onClick={handleScan}
                  disabled={loading || Boolean(previewSummary) || !text.trim()}
                  style={{ flex: 1, minWidth: '180px' }}
                >
                  Analyze Conversation
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  disabled={loading || Boolean(previewSummary)}
                  onClick={handlePaste}
                  title="Paste text from your clipboard"
                >
                  📋 Paste
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  disabled={loading || Boolean(previewSummary)}
                  onClick={() => { setText(''); setError('') }}
                >
                  Clear
                </button>
              </div>

              {error ? <div className="alert error" style={{ marginTop: '12px' }}>{error}</div> : null}

              {/* Quick Test Samples Library */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '10px', fontWeight: 600 }}>
                  ⚡ QUICK TEST SAMPLES LIBRARY (15 PRESETS)
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                  {SAMPLE_CONVERSATIONS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={loading || Boolean(previewSummary)}
                      onClick={() => { setText(sample.text); setError(''); }}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(0, 212, 255, 0.2)',
                        background: 'rgba(0, 212, 255, 0.06)',
                        color: '#00d4ff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontWeight: 500
                      }}
                      onMouseOver={(e) => {
                        if (!loading) {
                          e.currentTarget.style.background = 'rgba(0, 212, 255, 0.15)'
                          e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.4)'
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!loading) {
                          e.currentTarget.style.background = 'rgba(0, 212, 255, 0.06)'
                          e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.2)'
                        }
                      }}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="page-panel">
          <h3>Signals Analyzed</h3>
          <ul className="list-stack">
            <li>Social Engineering & Fear / Urgency Tactics</li>
            <li>Authority & Organization Impersonation (Police, Customs, Banks)</li>
            <li>OTP, PIN, Password & Aadhaar / PAN Theft Triggers</li>
            <li>UPI IDs, Bank Transfers & Fake Fee Payments</li>
            <li>Lottery, Crypto, Job & Romance Scam Patterns</li>
            <li>Remote Control Apps (AnyDesk, TeamViewer) & Malicious Links</li>
          </ul>
        </div>
      </div>
    </PageShell>
  )
}
