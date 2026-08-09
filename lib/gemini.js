const MODEL = "gemini-flash-latest";

export async function generateWithGemini(prompt, { temperature = 1.0, json = false } = {}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your-gemini-key-here" || apiKey === "placeholder") {
    throw new Error(
      "GEMINI_API_KEY tanımlı değil. .env.local dosyana gerçek anahtarını eklediğinden emin ol."
    );
  }

  const generationConfig = { temperature };
  if (json) generationConfig.responseMimeType = "application/json";

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig,
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API hatası (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini boş bir yanıt döndürdü.");
  }
  return text;
}