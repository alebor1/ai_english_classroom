// src/lib/askAI.js
export async function askAI(sessionId, userMessage) {
  const r = await fetch('/functions/v1/generateLessonTurn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, userMessage })
  });
  if (!r.ok) throw new Error(await r.text());
  const { aiMessage } = await r.json();
  return aiMessage;
}
