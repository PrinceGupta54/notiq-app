// src/app/api/doubt/route.js

export async function POST(req) {
  try {
    const { messages, subject } = await req.json();

    const systemPrompt = `You are an expert academic study assistant for Indian university students${subject ? ` specializing in ${subject}` : ""}.

Your role:
- Answer doubts clearly and concisely
- Use simple language with examples where helpful
- For numerical problems, show step-by-step solutions
- For theory questions, give structured explanations
- Keep answers focused — don't over-explain
- If asked something outside academics, politely redirect to study topics

${subject ? `Current subject context: ${subject}` : "Help with any academic subject."}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://notiq-app-mu.vercel.app",
        "X-Title": "Notiq Doubt Chat",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 500 });
    }

    const reply = data.choices?.[0]?.message?.content
      || "Sorry, I couldn't generate a response. Please try again.";

    return Response.json({ reply });
  } catch (err) {
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}