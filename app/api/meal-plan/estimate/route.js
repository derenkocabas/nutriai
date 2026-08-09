import { NextResponse } from "next/server";
import { generateWithGemini } from "@/lib/gemini";
import { buildEstimatePrompt } from "@/lib/mealPrompt";

export async function POST(request) {
  const { description } = await request.json();

  if (!description || !description.trim()) {
    return NextResponse.json({ error: "Açıklama boş olamaz." }, { status: 400 });
  }

  const prompt = buildEstimatePrompt(description.trim());

  try {
    const text = await generateWithGemini(prompt, { temperature: 0.7, json: true });
    const parsed = JSON.parse(text);
    return NextResponse.json({ estimate: parsed });
  } catch (err) {
    console.error("meal-plan/estimate hatası:", err);
    return NextResponse.json(
      { error: "Bu tahmini şu an hesaplayamadık. Lütfen birazdan tekrar dene." },
      { status: 500 }
    );
  }
}