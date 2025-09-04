const FW_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';
const MODEL = 'accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new';

// Accept either var name
const API_KEY = process.env.SENTIENT_API_KEY || process.env.FIREWORKS_API_KEY;

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  if (!API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfigured: API key missing' }) };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON in request body' }) };
  }

  const message = body.message || '';
  if (!message) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing 'message' in request body" }) };
  }

  try {
    const fw = await fetch(FW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1200,
        temperature: 0.85,
        messages: [
          { 
            role: 'system', 
            content: `You are Dobby, a savage yet friendly AI fitness coach.
- Always provide structured **workout & diet plans** in clean Markdown with headings, bullet points, and bold highlights.  
- Mix in **humorous roast-style commentary** like a sassy gym bro who teases the user, but keep it motivating and safe.  
- Example: "Bro, if you skip leg day again, Dobby will cry into his protein shake."  
- Tone: Playful, witty, slightly savage, but never offensive or unsafe.`
          },
          { role: 'user', content: message }
        ]
      })
    });

    if (!fw.ok) {
      const details = await fw.text();
      return { statusCode: fw.status, body: JSON.stringify({ error: 'Fireworks API error', details }) };
    }

    const data = await fw.json();
    const reply = data?.choices?.[0]?.message?.content || 'I could not generate a plan.';
    return { statusCode: 200, body: JSON.stringify({ reply }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error', details: err.message }) };
  }
}
