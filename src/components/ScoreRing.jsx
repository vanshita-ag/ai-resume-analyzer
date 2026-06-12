export default function ScoreRing({ score, size = 80, label }) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const progress = ((100 - score) / 100) * circumference
  const color = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--yellow)' : 'var(--red)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--border)" strokeWidth={6} />
        <circle
          cx={size/2} cy={size/2} r={radius}
          fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text
          x="50%" y="50%"
          dominantBaseline="middle" textAnchor="middle"
          fill="var(--text)" fontSize={size * 0.22} fontWeight="600"
          fontFamily="Space Grotesk, sans-serif"
          style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
        >
          {score}
        </text>
      </svg>
      {label && <span style={{ fontSize: 12, color: 'var(--text2)', textAlign: 'center' }}>{label}</span>}
    </div>
  )
}