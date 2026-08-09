import { NextResponse } from "next/server";
import { generateWithGemini } from "@/lib/gemini";
import { buildMealPrompt } from "@/lib/mealPrompt";

export async function POST(request) {
  const profile = await request.json();
  const prompt = buildMealPrompt(profile);

  try {
    const text = await generateWithGemini(prompt, { temperature: 1.3, json: true });
    const parsed = JSON.parse(text);
    return NextResponse.json({ meals: parsed.meals || [] });
  } catch (err) {
    console.error("meal-plan hatası:", err);
    return NextResponse.json(
      { error: "Şu anda bir yemek listesi oluşturamadık. Lütfen birazdan tekrar dene." },
      { status: 500 }
    );
  }
}