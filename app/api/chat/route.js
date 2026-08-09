import { NextResponse } from "next/server";
import { generateWithGemini } from "@/lib/gemini";

const GOAL_LABELS = { lose: "kilo vermek", maintain: "kiloyu korumak", gain: "kilo/kas almak" };
const ACTIVITY_LABELS = { low: "düşük", moderate: "orta", high: "yüksek" };

export async function POST(request) {
  const { messages, profile } = await request.json();

  const profileSummary = `
- Yaş: ${profile?.age ?? "belirtilmedi"}
- Cinsiyet: ${profile?.sex === "male" ? "erkek" : "kadın"}
- Hedef: ${GOAL_LABELS[profile?.goal] ?? profile?.goal ?? "belirtilmedi"}
- Aktivite seviyesi: ${ACTIVITY_LABELS[profile?.activityLevel] ?? profile?.activityLevel ?? "belirtilmedi"}
- Kısıtlama/alerjiler: ${profile?.restrictions?.trim() || "yok"}
- BMI: ${profile?.bmi ?? "belirtilmedi"}`;

  const historyText = (messages || [])
    .map((m) => `${m.role === "user" ? "Kullanıcı" : "Asistan"}: ${m.content}`)
    .join("\n");

  const prompt = `Sen NutriAI adlı uygulamanın beslenme/wellness asistanısın. Aşağıdaki kullanıcıyla
sohbet ediyorsun. Ton: samimi ama profesyonel, kısa ve net cevaplar ver.

Kullanıcı profili:
${profileSummary}

KURALLAR (kesinlikle uy):
- Tıbbi teşhis koyma, ilaç/takviye dozu önerme.
- Kullanıcının kısıtlama/alerjilerine asla aykırı öneri verme.
- Yeme bozukluğu belirtisi (aşırı kısıtlama, aşırı kalori sayma takıntısı vb.) sezersen,
  bunu pekiştirme, nazikçe bir uzmana danışmayı öner.
- Bu bir genel wellness aracıdır, tıbbi tedavi yerine geçmez — gerektiğinde bunu hatırlat.
- Türkçe yanıt ver, kısa ve öz ol (birkaç cümle veya birkaç madde, uzun deneme yazma).

Sohbet geçmişi:
${historyText}

Asistan olarak, kullanıcının son mesajına yanıt ver:`;

  try {
    const text = await generateWithGemini(prompt);
    return NextResponse.json({ result: text });
  } catch (err) {
    console.error("chat hatası:", err);
    return NextResponse.json(
      { error: "Şu anda yanıt veremedik. Lütfen birazdan tekrar dene." },
      { status: 500 }
    );
  }
}