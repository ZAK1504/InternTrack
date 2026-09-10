// Uses native fetch (no SDK needed) to call Groq API
// Models confirmed available for this Groq API key (from testGroq.js)
const MODELS_TO_TRY = [
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-20b',
  'groq/compound-mini',
];

const scoreApplication = async (resumeText, jobDescription) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error('AI Scoring Error: GROQ_API_KEY is not set in .env');
    return { score: null, summary: '', strengths: [], weaknesses: [], recommendation: 'Neutral', explanation: 'AI scoring unavailable (API key not set)' };
  }

  const prompt = `
You are an expert HR analyst helping a company screen job applicants.
Compare the following resume text to the job description and give a thorough assessment.

Job Description:
${jobDescription}

Resume Text:
${resumeText}

Return your response STRICTLY as a JSON object with exactly these fields:
- "score": an integer from 0 to 100 representing overall fit
- "summary": a 2-3 sentence overall summary of the candidate
- "strengths": an array of 2-4 short strings listing key strengths relevant to this role
- "weaknesses": an array of 1-3 short strings listing notable gaps or concerns
- "recommendation": one of "Highly Recommended", "Recommended", "Neutral", or "Not Recommended"
- "explanation": a detailed 3-5 sentence explanation justifying the score

Return ONLY the raw JSON. No markdown, no backticks, no explanation outside the JSON.
`;

  // Try each model in order until one works
  for (const model of MODELS_TO_TRY) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 1024
        })
      });

      const data = await response.json();

      // If model not found or no access, try the next one
      if (!response.ok) {
        console.warn(`AI: model "${model}" failed (${response.status}): ${data.error?.message}`);
        continue;
      }

      let text = data.choices[0].message.content.trim();
      // Strip any markdown fences the model might add
      text = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();

      const parsed = JSON.parse(text);
      console.log(`AI scoring succeeded with model: ${model}`);

      return {
        score: typeof parsed.score === 'number' ? parsed.score : null,
        summary: parsed.summary || '',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
        recommendation: parsed.recommendation || 'Neutral',
        explanation: parsed.explanation || ''
      };

    } catch (error) {
      console.warn(`AI: model "${model}" threw error: ${error.message}`);
      continue;
    }
  }

  // All models failed
  console.error('AI Scoring Error: All models failed. Check your Groq API key and run testGroq.js');
  return {
    score: null,
    summary: '',
    strengths: [],
    weaknesses: [],
    recommendation: 'Neutral',
    explanation: 'AI scoring failed or is unavailable at the moment.'
  };
};

module.exports = { scoreApplication };
