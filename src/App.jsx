import { useState, useRef } from 'react'
import { extractTextFromPDF } from './utils/pdfExtractor'
import { analyzeResume } from './utils/gemini'
import Results from './components/Results'

export default function App() {
  const [file, setFile] = useState(null)
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '')
  const [jobDescription, setJobDescription] = useState('')
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState('idle')
  const [loadingStep, setLoadingStep] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef()

  function handleFile(f) {
    if (!f) return
    if (f.type !== 'application/pdf') return setError('Please upload a PDF file.')
    if (f.size > 5 * 1024 * 1024) return setError('File too large. Max 5MB.')
    setError('')
    setFile(f)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  async function handleAnalyze() {
    if (!file) return setError('Please upload your resume.')
    if (!apiKey.trim()) return setError('Please enter your API key.')
    setStatus('loading')
    setError('')
    try {
      const resumeText = await extractTextFromPDF(file)
      if (!resumeText || resumeText.length < 50) throw new Error('Could not extract text. Make sure it is not a scanned image.')
      const analysis = await analyzeResume(resumeText, jobDescription, apiKey.trim(), (msg) => setLoadingStep(msg))
      setResult(analysis)
      setStatus('done')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      setStatus('error')
    }
  }

  // ── LOADING ──
  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 44, height: 44, border: '3px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text2)', fontSize: 15 }}>{loadingStep || 'Starting agents...'}</p>
        <p style={{ color: 'var(--text3)', fontSize: 13 }}>This usually takes 20–30 seconds</p>
      </div>
    )
  }

  // ── RESULTS ──
  if (status === 'done' && result) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <nav style={{ padding: '18px 32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18 }}>📄 ResumeAI</span>
          <span style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)', color: 'var(--accent2)', fontSize: 11, padding: '2px 8px', borderRadius: 20 }}>3-Agent Pipeline</span>
        </nav>
        <div style={{ paddingTop: 32 }}>
          <Results data={result} onReset={() => { setStatus('idle'); setResult(null); setFile(null) }} />
        </div>
      </div>
    )
  }

  // ── LANDING ──
  return (
    <div style={{ background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>

      {/* bg glows */}
      <div style={{ position: 'fixed', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,111,247,0.18) 0%, transparent 70%)', top: -200, left: -150, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', top: 50, right: -120, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)', bottom: 100, left: '30%', pointerEvents: 'none', zIndex: 0 }} />

      {/* nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', borderBottom: '1px solid rgba(255,255,255,0.06)', zIndex: 100, background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)' }}>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: '-0.02em' }}>📄 ResumeAI</span>
        <span style={{ background: 'rgba(124,111,247,0.2)', border: '1px solid rgba(124,111,247,0.5)', color: '#a78bfa', fontSize: 11, padding: '3px 12px', borderRadius: 20, fontWeight: 500 }}>3-Agent Pipeline</span>
      </nav>

      {/* ── SECTION 1: HERO ── */}
      <section className="hero-section" style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', padding: '0 72px', paddingTop: 65, position: 'relative', zIndex: 1, maxWidth: 1400, margin: '0 auto' }}>

        {/* left — big text */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(124,111,247,0.1)', border: '1px solid rgba(124,111,247,0.3)', color: '#a78bfa', fontSize: 12, padding: '5px 16px', borderRadius: 20, marginBottom: 28, fontWeight: 500, width: 'fit-content' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', animation: 'pulse 2s infinite', display: 'inline-block', flexShrink: 0 }} />
            Powered by Agentic AI
          </div>
<br></br>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 62, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 24, background: 'linear-gradient(135deg, #ffffff 35%, #a78bfa 65%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Know exactly what's holding your resume back
          </h1>

          <p style={{ fontSize: 22, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 40, maxWidth: 640 }}>
            Upload your PDF. 3 AI agents analyze your resume, score ATS compatibility, and generate rewrites — in seconds.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { n: 1, title: 'Extractor Agent', desc: 'Parses your resume structure and extracts all key data' },
              { n: 2, title: 'Analyzer Agent', desc: 'Scores ATS compatibility across 4 dimensions' },
              { n: 3, title: 'Coach Agent', desc: 'Generates role-specific rewrites and improvements' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(124,111,247,0.15)', border: '1px solid rgba(124,111,247,0.4)', color: '#a78bfa', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{s.n}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 56, display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
            <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, transparent, rgba(124,111,247,0.5))' }} />
            scroll down to analyze your resume
          </div>
        </div>

        {/* right — robot */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ animation: 'float 2s ease-in-out infinite', filter: 'drop-shadow(0 0 60px rgba(124,111,247,0.4))' }}>
            <svg width="480" height="640" viewBox="0 0 180 260" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="90" y1="10" x2="90" y2="35" stroke="rgba(167,139,250,0.6)" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="90" cy="8" r="5" fill="#a78bfa" opacity="0.9"/>
              <circle cx="90" cy="8" r="12" fill="#a78bfa" opacity="0.15"/>
              <rect x="48" y="35" width="84" height="70" rx="18" fill="rgba(124,111,247,0.15)" stroke="rgba(124,111,247,0.5)" strokeWidth="1.5"/>
              <rect x="55" y="42" width="30" height="8" rx="4" fill="rgba(255,255,255,0.06)"/>
              <rect x="62" y="55" width="20" height="18" rx="5" fill="rgba(124,111,247,0.3)" stroke="rgba(167,139,250,0.6)" strokeWidth="1"/>
              <rect x="98" y="55" width="20" height="18" rx="5" fill="rgba(124,111,247,0.3)" stroke="rgba(167,139,250,0.6)" strokeWidth="1"/>
              <rect x="66" y="59" width="12" height="10" rx="3" fill="#a78bfa" opacity="0.85"/>
              <rect x="102" y="59" width="12" height="10" rx="3" fill="#a78bfa" opacity="0.85"/>
              <circle cx="72" cy="64" r="3" fill="white" opacity="0.9"/>
              <circle cx="108" cy="64" r="3" fill="white" opacity="0.9"/>
              <rect x="68" y="85" width="44" height="10" rx="5" fill="rgba(124,111,247,0.2)" stroke="rgba(167,139,250,0.4)" strokeWidth="1"/>
              <circle cx="76" cy="90" r="2.5" fill="#a78bfa" opacity="0.9"/>
              <circle cx="84" cy="90" r="2.5" fill="#ec4899" opacity="0.9"/>
              <circle cx="92" cy="90" r="2.5" fill="#a78bfa" opacity="0.9"/>
              <circle cx="100" cy="90" r="2.5" fill="#ec4899" opacity="0.9"/>
              <rect x="80" y="105" width="20" height="14" rx="4" fill="rgba(124,111,247,0.2)" stroke="rgba(124,111,247,0.3)" strokeWidth="1"/>
              <rect x="38" y="119" width="104" height="90" rx="20" fill="rgba(124,111,247,0.12)" stroke="rgba(124,111,247,0.4)" strokeWidth="1.5"/>
              <rect x="54" y="132" width="72" height="50" rx="10" fill="rgba(0,0,0,0.2)" stroke="rgba(124,111,247,0.25)" strokeWidth="1"/>
              <rect x="60" y="138" width="60" height="38" rx="6" fill="rgba(124,111,247,0.08)"/>
              <rect x="66" y="145" width="35" height="2.5" rx="1.5" fill="rgba(167,139,250,0.6)"/>
              <rect x="66" y="151" width="28" height="2.5" rx="1.5" fill="rgba(167,139,250,0.4)"/>
              <rect x="66" y="157" width="32" height="2.5" rx="1.5" fill="rgba(167,139,250,0.4)"/>
              <rect x="66" y="163" width="20" height="2.5" rx="1.5" fill="rgba(236,72,153,0.6)"/>
              <circle cx="106" cy="153" r="10" fill="rgba(124,111,247,0.3)" stroke="rgba(167,139,250,0.5)" strokeWidth="1"/>
              <text x="106" y="157" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="700" fontFamily="Space Grotesk, sans-serif">82</text>
              <rect x="12" y="122" width="28" height="60" rx="14" fill="rgba(124,111,247,0.12)" stroke="rgba(124,111,247,0.35)" strokeWidth="1.5"/>
              <ellipse cx="26" cy="188" rx="13" ry="10" fill="rgba(124,111,247,0.15)" stroke="rgba(124,111,247,0.35)" strokeWidth="1"/>
              <circle cx="20" cy="185" r="3" fill="rgba(124,111,247,0.4)"/>
              <circle cx="26" cy="183" r="3" fill="rgba(124,111,247,0.4)"/>
              <circle cx="32" cy="185" r="3" fill="rgba(124,111,247,0.4)"/>
              <rect x="140" y="122" width="28" height="60" rx="14" fill="rgba(124,111,247,0.12)" stroke="rgba(124,111,247,0.35)" strokeWidth="1.5"/>
              <ellipse cx="154" cy="188" rx="13" ry="10" fill="rgba(124,111,247,0.15)" stroke="rgba(124,111,247,0.35)" strokeWidth="1"/>
              <circle cx="148" cy="185" r="3" fill="rgba(124,111,247,0.4)"/>
              <circle cx="154" cy="183" r="3" fill="rgba(124,111,247,0.4)"/>
              <circle cx="160" cy="185" r="3" fill="rgba(124,111,247,0.4)"/>
              <rect x="56" y="209" width="28" height="42" rx="12" fill="rgba(124,111,247,0.12)" stroke="rgba(124,111,247,0.35)" strokeWidth="1.5"/>
              <rect x="96" y="209" width="28" height="42" rx="12" fill="rgba(124,111,247,0.12)" stroke="rgba(124,111,247,0.35)" strokeWidth="1.5"/>
              <ellipse cx="70" cy="253" rx="18" ry="7" fill="rgba(124,111,247,0.2)" stroke="rgba(124,111,247,0.4)" strokeWidth="1"/>
              <ellipse cx="110" cy="253" rx="18" ry="7" fill="rgba(124,111,247,0.2)" stroke="rgba(124,111,247,0.4)" strokeWidth="1"/>
              <circle cx="46" cy="140" r="4" fill="rgba(236,72,153,0.5)"/>
              <circle cx="134" cy="140" r="4" fill="rgba(34,211,238,0.5)"/>
              <circle cx="25" cy="45" r="3" fill="#ec4899" opacity="0.4"/>
              <circle cx="15" cy="80" r="2" fill="#a78bfa" opacity="0.35"/>
              <circle cx="160" cy="40" r="3" fill="#a78bfa" opacity="0.4"/>
              <circle cx="168" cy="75" r="2" fill="#ec4899" opacity="0.35"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: UPLOAD ── */}
      <section className="upload-section"  style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', padding: '80px 72px', position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.05)', maxWidth: 1400, margin: '0 auto' }}>

        {/* left — CTA text */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: 72,  }}>
          <p style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Step 1 of 1 — it's that simple</p>

          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 64, fontWeight: 700, lineHeight: 1.0, letterSpacing: '-0.04em', marginBottom: 28, background: 'linear-gradient(135deg, #ffffff 20%, #a78bfa 55%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            READY?<br/>LET'S TEST IT.
          </h2>

          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, marginBottom: 40, maxWidth: 360 }}>
            Upload your resume, paste a job description, and watch 3 AI agents tear through it in real time.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { label: 'ATS Score', val: '0–100', color: '#a78bfa' },
              { label: 'Section Analysis', val: '4 dimensions', color: '#ec4899' },
              { label: 'Keyword Gaps', val: 'vs your JD', color: '#22d3ee' },
              { label: 'Bullet Rewrites', val: 'role-specific', color: '#34d399' },
            ].map(s => (
              <div
      key={s.label}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {/* Left column */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: s.color,
            flexShrink: 0,
          }}
        />
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: s.color, fontFamily: 'Space Grotesk, sans-serif', marginLeft : 8}}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* right — form */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32, backdropFilter: 'blur(12px)' }}>

            <div
              style={{ border: `1.5px dashed ${dragging ? 'rgba(124,111,247,0.8)' : 'rgba(124,111,247,0.4)'}`, borderRadius: 16, padding: '36px 20px', textAlign: 'center', background: dragging ? 'rgba(124,111,247,0.1)' : 'rgba(124,111,247,0.04)', marginBottom: 20, cursor: 'pointer', transition: 'all 0.2s' }}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
              {file
                ? <p style={{ color: '#a78bfa', fontWeight: 600, fontSize: 15 }}>{file.name}</p>
                : <>
                  <p style={{ color: '#fff', fontWeight: 500, fontSize: 15, marginBottom: 5 }}>Drop your resume here</p>
                  <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 13 }}>or click to browse — PDF only, max 5MB</p>
                </>
              }
              <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', marginBottom: 7, display: 'block', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>API Key</label>
              <input type="password" placeholder="sk-or-v1-..." value={apiKey} autoComplete="new-password" onChange={e => setApiKey(e.target.value)}
                style={{ width: '100%', padding: '12px 15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11, color: 'rgba(255,255,255,0.7)', fontSize: 14, fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', marginBottom: 7, display: 'block', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Job description <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <textarea placeholder="Paste job description for role-specific feedback..." value={jobDescription} onChange={e => setJobDescription(e.target.value)}
                style={{ width: '100%', padding: '12px 15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11, color: 'rgba(255,255,255,0.7)', fontSize: 14, fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', outline: 'none', resize: 'vertical', minHeight: 100 }} />
            </div>

            {error && <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, color: 'var(--red)', padding: '12px 16px', fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <button onClick={handleAnalyze} disabled={!file || !apiKey}
              style={{ width: '100%', padding: 15, background: (!file || !apiKey) ? 'rgba(124,111,247,0.3)' : 'linear-gradient(135deg, #7c6ff7 0%, #a855f7 50%, #ec4899 100%)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 16, fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif', cursor: (!file || !apiKey) ? 'not-allowed' : 'pointer', letterSpacing: '-0.01em' }}>
              Analyze my resume →
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.18)', marginTop: 14 }}>🔒 Your resume is never stored. API calls go directly to the AI.</p>
          </div>
        </div>

      </section>

    </div>
  )
}