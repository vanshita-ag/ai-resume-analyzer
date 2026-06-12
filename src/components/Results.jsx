import ScoreRing from './ScoreRing'

const sectionLabels = {
  impact: 'Bullet Impact',
  skills: 'Skills',
  experience: 'Experience',
  formatting: 'Formatting'
}

function Tag({ text, color }) {
  const colors = {
    green: { bg: 'var(--green-bg)', text: 'var(--green)', border: 'rgba(52,211,153,0.2)' },
    red:   { bg: 'var(--red-bg)',   text: 'var(--red)',   border: 'rgba(248,113,113,0.2)' },
    purple:{ bg: 'var(--accent-glow)', text: 'var(--accent2)', border: 'rgba(124,111,247,0.2)' },
  }
  const c = colors[color] || colors.purple
  return (
    <span style={{
      display: 'inline-block', fontSize: 12, padding: '3px 10px',
      borderRadius: 20, background: c.bg, color: c.text,
      border: `1px solid ${c.border}`, margin: '3px 3px 3px 0'
    }}>
      {text}
    </span>
  )
}

function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '20px 24px', ...style
    }}>
      {children}
    </div>
  )
}

function SectionRow({ name, data }) {
  const score = data.score
  const color = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--yellow)' : 'var(--red)'
  return (
    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontWeight: 500, fontFamily: 'Space Grotesk, sans-serif' }}>{sectionLabels[name]}</span>
        <span style={{ color, fontWeight: 600, fontSize: 14 }}>{score}/100</span>
      </div>
      <div style={{ background: 'var(--surface2)', borderRadius: 4, height: 4, marginBottom: 10 }}>
        <div style={{ width: `${score}%`, height: 4, borderRadius: 4, background: color, transition: 'width 1s ease' }} />
      </div>
      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{data.feedback}</p>
      {data.fixes?.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggested rewrites</p>
          {data.fixes.map((fix, i) => (
            <div key={i} style={{ fontSize: 13, color: 'var(--accent2)', background: 'var(--accent-glow)', borderRadius: 8, padding: '8px 12px', marginBottom: 6, borderLeft: '2px solid var(--accent)' }}>
              {fix}
            </div>
          ))}
        </div>
      )}
      {data.missing?.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {data.missing.map((s, i) => <Tag key={i} text={s} color="red" />)}
        </div>
      )}
    </div>
  )
}

export default function Results({ data, onReset }) {
  const { ats_score, overall_summary, sections, keyword_matches, keyword_missing, top_improvements, verdict } = data

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h2 style={{ fontSize: 22 }}>Analysis complete</h2>
        <button onClick={onReset} style={{
          background: 'var(--surface2)', border: '1px solid var(--border2)',
          color: 'var(--text2)', padding: '8px 16px', borderRadius: 'var(--radius-sm)',
          cursor: 'pointer', fontSize: 13
        }}>
          ↩ Analyze another
        </button>
      </div>

      <Card style={{ display: 'flex', gap: 28, alignItems: 'center', marginBottom: 20 }}>
        <ScoreRing score={ats_score} size={90} label="ATS Score" />
        <div>
          <p style={{ fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Overall verdict</p>
          <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.6, marginBottom: 8 }}>{overall_summary}</p>
          <p style={{
            fontSize: 13, fontStyle: 'italic',
            color: ats_score >= 70 ? 'var(--green)' : 'var(--yellow)',
            borderLeft: `2px solid ${ats_score >= 70 ? 'var(--green)' : 'var(--yellow)'}`,
            paddingLeft: 10
          }}>
            {verdict}
          </p>
        </div>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 20, color: 'var(--text2)' }}>Section breakdown</h3>
        {Object.entries(sections).map(([key, val]) => (
          <SectionRow key={key} name={key} data={val} />
        ))}
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Top 3 things to fix</h3>
        {top_improvements.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
            <span style={{
              minWidth: 26, height: 26, borderRadius: '50%',
              background: 'var(--accent-glow)', border: '1px solid var(--accent)',
              color: 'var(--accent2)', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{i + 1}</span>
            <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{item}</p>
          </div>
        ))}
      </Card>

      {(keyword_matches?.length > 0 || keyword_missing?.length > 0) && (
        <Card>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Keyword analysis</h3>
          {keyword_matches?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Found in your resume ✓</p>
              {keyword_matches.map((k, i) => <Tag key={i} text={k} color="green" />)}
            </div>
          )}
          {keyword_missing?.length > 0 && (
            <div>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Missing keywords</p>
              {keyword_missing.map((k, i) => <Tag key={i} text={k} color="red" />)}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}