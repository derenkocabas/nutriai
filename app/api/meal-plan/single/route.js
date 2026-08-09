import { NextResponse } from "next/server";
import { generateWithGemini } from "@/lib/gemini";
import { buildSingleMealPrompt } from "@/lib/mealPrompt";

export async function POST(request) {
  const { profile, slot, existingMealNames, budget } = await request.json();

  if (!slot) {
    return NextResponse.json({ error: "slot bilgisi eksik." }, { status: 400 });
  }

  const prompt = buildSingleMealPrompt(profile || {}, slot, existingMealNames || [], budget || null);

  try {
    const text = await generateWithGemini(prompt, { temperature: 1.4, json: true });
    const parsed = JSON.parse(text);
    return NextResponse.json({ meal: parsed });
  } catch (err) {
    console.error("meal-plan/single hatası:", err);
    return NextResponse.json(
      { error: "Bu öğünü şu an değiştiremedik. Lütfen birazdan tekrar dene." },
      { status: 500 }
    );
  }
}