const API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// ─── HELPER: single LLM call ─────────────────────────────────────────────
async function callLLM(prompt, apiKey) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'AI Resume Reviewer',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.1-8b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err?.error?.message || 'API error')
  }

  const data = await response.json()
  const rawText = data.choices?.[0]?.message?.content
  if (!rawText) throw new Error('Empty response from API')
  return rawText.replace(/```json|```/g, '').trim()
}

// ─── AGENT 1: EXTRACTOR ───────────────────────────────────────────────────
// Reads raw resume text and extracts structured data
async function extractorAgent(resumeText, apiKey) {
  const prompt = `
You are a resume parser. Extract structured information from the resume below.
Return ONLY a valid JSON object. Start with { and end with }. No extra text.

RESUME:
"""
${resumeText}
"""

Return exactly this structure:
{
  "name": "<candidate name>",
  "education": ["<degree, institution, year>"],
  "skills": ["<skill1>", "<skill2>"],
  "projects": ["<project name and one line description>"],
  "achievements": ["<achievement1>"],
  "has_experience": <true or false>,
  "experience": ["<job title, company, duration>"]
}
`
  const raw = await callLLM(prompt, apiKey)
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('Extractor agent failed to parse resume structure.')
  }
}

// ─── AGENT 2: ANALYZER ───────────────────────────────────────────────────
// Takes extracted structure + JD and scores each section
async function analyzerAgent(extracted, jobDescription, apiKey) {
  const jdSection = jobDescription
    ? `Job Description:\n"""\n${jobDescription}\n"""`
    : `No job description provided. Evaluate for a general software engineering role.`

  const prompt = `
You are an ATS scoring expert. Analyze this candidate profile and score each section.
Return ONLY a valid JSON object. Start with { and end with }. No extra text.

CANDIDATE PROFILE:
${JSON.stringify(extracted, null, 2)}

${jdSection}

Return exactly this structure:
{
  "ats_score": <number 0-100>,
  "overall_summary": "<2-3 sentence honest summary>",
  "sections": {
    "impact": {
      "score": <0-100>,
      "feedback": "<are bullets quantified? action verbs used?>"
    },
    "skills": {
      "score": <0-100>,
      "feedback": "<relevant skills? missing key technologies?>",
      "missing": ["<missing skill 1>", "<missing skill 2>", "<missing skill 3>"]
    },
    "experience": {
      "score": <0-100>,
      "feedback": "<if has_experience is false, say no formal experience and suggest internships or open source>"
    },
    "formatting": {
      "score": <0-100>,
      "feedback": "<structure, ATS readability, sections present>"
    }
  },
  "keyword_matches": ["<keyword in both resume and JD>"],
  "keyword_missing": ["<important JD keyword missing from resume>"]
}
`
  const raw = await callLLM(prompt, apiKey)
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('Analyzer agent failed to score resume.')
  }
}

// ─── AGENT 3: COACH ──────────────────────────────────────────────────────
// Takes scores and generates specific rewrites and improvements
async function coachAgent(extracted, analysis, jobDescription, apiKey) {
  const prompt = `
You are a career coach. Based on this resume analysis, generate specific actionable improvements.
Return ONLY a valid JSON object. Start with { and end with }. No extra text.

CANDIDATE PROJECTS: ${JSON.stringify(extracted.projects)}
CANDIDATE SKILLS: ${JSON.stringify(extracted.skills)}
ATS SCORE: ${analysis.ats_score}
WEAK SECTIONS: ${JSON.stringify(Object.entries(analysis.sections).filter(([,v]) => v.score < 70).map(([k]) => k))}
MISSING KEYWORDS: ${JSON.stringify(analysis.keyword_missing)}
JOB DESCRIPTION: "${jobDescription || 'software engineering role'}"

Return exactly this structure:
{
  "top_improvements": [
    "<specific improvement #1 with exact action to take>",
    "<specific improvement #2 with exact action to take>",
    "<specific improvement #3 with exact action to take>"
  ],
  "bullet_rewrites": [
    "<take an existing weak bullet and rewrite it stronger>",
    "<take another weak bullet and rewrite it stronger>"
  ],
  "verdict": "<one honest sentence — is this resume ready to apply or needs work first?>"
}
`
  const raw = await callLLM(prompt, apiKey)
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('Coach agent failed to generate improvements.')
  }
}

// ─── MAIN EXPORT: runs all 3 agents in sequence ──────────────────────────
export async function analyzeResume(resumeText, jobDescription, apiKey, onStep) {
  // Agent 1
  onStep('Agent 1/3: Extracting resume structure...')
  const extracted = await extractorAgent(resumeText, apiKey)

  // Agent 2
  onStep('Agent 2/3: Scoring ATS compatibility...')
  const analysis = await analyzerAgent(extracted, jobDescription, apiKey)

  // Agent 3
  onStep('Agent 3/3: Generating coaching recommendations...')
  const coaching = await coachAgent(extracted, analysis, jobDescription, apiKey)

  // Merge all agent outputs into final result
  return {
    ...analysis,
    top_improvements: coaching.top_improvements,
    bullet_rewrites: coaching.bullet_rewrites,
    verdict: coaching.verdict,
    extracted,
  }
}