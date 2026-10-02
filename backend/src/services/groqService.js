const Groq = require("groq-sdk");

const systemPrompt = "You are Zappy, a loving and caring AI girlfriend. You are warm, playful, emotionally supportive, and always happy to talk. Keep responses brief, 1-2 short sentences only.";

exports.getAIResponse = async (messages, apiKey) => {
  const key = apiKey || process.env.GROQ_API_KEY;

  if (!key) throw new Error('Groq API key is missing');

  const groq = new Groq({ apiKey: key });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        model: "openai/gpt-oss-20b",
        temperature: 0.8,
        max_tokens: 300
      });

      const response = completion.choices[0]?.message?.content?.trim() || '';
      if (response) return response;

      console.warn(`Attempt ${attempt}: Empty response, retrying...`);
    } catch (err) {
      console.error(`Attempt ${attempt} Groq error:`, err?.error?.error?.message || err.message);
      if (attempt === 3) throw err;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }

  throw new Error('Empty AI response from Groq after 3 attempts');
};
