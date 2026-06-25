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

    const geminiMessages = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: geminiMessages,
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 500 });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response. Please try again.";

    return Response.json({ reply });
  } catch (err) {
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}