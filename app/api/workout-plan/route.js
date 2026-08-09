import { NextResponse } from "next/server";
import { generateWithGemini } from "@/lib/gemini";

const GOAL_LABELS = { lose: "kilo vermek", maintain: "kiloyu korumak", gain: "kilo/kas almak" };
const ACTIVITY_LABELS = { low: "düşük", moderate: "orta", high: "yüksek" };
const FITNESS_LABELS = { beginner: "yeni başlayan", intermediate: "orta seviye", advanced: "ileri seviye" };
const LOCATION_LABELS = { home: "evde", gym: "spor salonunda" };

const HOME_NO_EQUIPMENT_STYLES = [
  "tamamen ekipmansız vücut ağırlığı egzersizleri",
  "yürüyüş/kardiyo ve zemin egzersizleri karışımı",
  "esneklik/mobilite ve ekipmansız hafif kuvvet karışımı",
  "fonksiyonel hareketler ağırlıklı (squat, plank, lunge çeşitleri, tamamen vücut ağırlığıyla)",
];

const HOME_WITH_EQUIPMENT_STYLES = [
  "dambıl/lastik bant ağırlıklı ev antrenmanı",
  "vücut ağırlığı + hafif ağırlık ekipmanı karışımı",
  "lastik bantla direnç antrenmanı ağırlıklı",
  "dambılla kuvvet + vücut ağırlığıyla kardiyo karışımı",
];

const GYM_STYLES = [
  "serbest ağırlık (dambıl/halter) ağırlıklı",
  "makine ağırlıklı, başlangıç dostu bir program",
  "kombine kardiyo + kuvvet antrenmanı",
  "vücut bölgesine göre bölünmüş (push/pull/leg tarzı) bir program",
  "fonksiyonel + serbest ağırlık karışımı",
];

export async function POST(request) {
  const profile = await request.json();
  const days = profile.workoutDaysPerWeek ?? 3;
  const location = profile.workoutLocation || "home";
  const fitnessLevel = profile.fitnessLevel || "beginner";
  const homeEquipment = profile.homeEquipment || "none";

  let styles = GYM_STYLES;
  if (location === "home") {
    styles = homeEquipment === "weights" ? HOME_WITH_EQUIPMENT_STYLES : HOME_NO_EQUIPMENT_STYLES;
  }
  const style = styles[Math.floor(Math.random() * styles.length)];
  const seed = Math.floor(Math.random() * 100000);

  let equipmentLine = "";
  if (location === "home") {
    equipmentLine =
      homeEquipment === "weights"
        ? "Kişinin evde dambıl/lastik bant gibi hafif ağırlık ekipmanı var — bunları kullanan hareketler önerebilirsin, ama spor salonuna özgü makineler önerme."
        : "Kişinin evde HİÇ ekipmanı yok — kesinlikle sadece vücut ağırlığıyla yapılabilecek hareketler öner, dambıl/bant/ekipman gerektiren hiçbir hareket önerme.";
  } else {
    equipmentLine = "Spor salonunda bulunan ekipmanları (dambıl, makine, halter vb.) rahatça kullanabilir; evde yapılamayacak hareketleri de önerebilirsin.";
  }

  const prompt = `Sen bir spor/egzersiz asistanısın. Aşağıdaki kişiye haftalık bir egzersiz
listesi öner (hangi gün ne yapılacağı, kısaca, hareket isimleri + set/tekrar bilgisiyle).
Kişi haftada tam olarak ${days} gün spor yapmak istiyor — bu sayıya kesinlikle uy.
${days === 0 ? "Eğer 0 gün istiyorsa, egzersiz yerine günlük yürüyüş/hareket önerileri ver, yapılandırılmış bir antrenman programı zorlama." : `Diğer ${7 - days} günü dinlenme günü olarak belirt.`}

Profil:
- Yaş: ${profile.age ?? "belirtilmedi"}
- Cinsiyet: ${profile.sex === "male" ? "erkek" : "kadın"}
- Hedef: ${GOAL_LABELS[profile.goal] ?? profile.goal ?? "belirtilmedi"}
- Aktivite seviyesi (genel günlük hareketlilik): ${ACTIVITY_LABELS[profile.activityLevel] ?? profile.activityLevel ?? "belirtilmedi"}
- Spor deneyim seviyesi: ${FITNESS_LABELS[fitnessLevel]}
- Spor yapacağı yer: ${LOCATION_LABELS[location]}
- Tercih edilen spor günü sayısı (haftalık): ${days}

ÖNEMLİ (ekipman): ${equipmentLine}

Seviye uyumu: Kişi "${FITNESS_LABELS[fitnessLevel]}" seviyesinde.
${fitnessLevel === "beginner" ? "Temel, düşük riskli hareketler seç; ağır yük/karmaşık teknik gerektiren hareketlerden kaçın; set/tekrar sayılarını mütevazı tut." : ""}
${fitnessLevel === "intermediate" ? "Temel hareketlerin üzerine biraz daha çeşitlilik ve yoğunluk ekleyebilirsin." : ""}
${fitnessLevel === "advanced" ? "Daha yoğun, çeşitli ve zorlayıcı bir program kurabilirsin; karmaşık hareketlerden çekinme." : ""}

Çeşitlilik notu (varyasyon kodu: ${seed}): Bu seferki program için ${style} bir yaklaşım kullan.
Klişe/basmakalıp önerilerden (her seferinde aynı 3 hareket) kaçın, farklı ve ilham verici
hareket fikirleri sun — ama seviyeye, mekana, ekipman durumuna ve hedefe sadık kal.

Kurallar:
- Kısa ve maddeler halinde yaz, uzun açıklama ekleme.
- Sonunda tek cümlelik bir not ekle: bunun genel bir öneri olduğunu, ağrı/rahatsızlık
  durumunda bir uzmana danışılması gerektiğini belirt.
- Türkçe yanıt ver.`;

  try {
    const text = await generateWithGemini(prompt, { temperature: 1.3 });
    return NextResponse.json({ result: text });
  } catch (err) {
    console.error("workout-plan hatası:", err);
    return NextResponse.json(
      { error: "Şu anda bir spor listesi oluşturamadık. Lütfen birazdan tekrar dene." },
      { status: 500 }
    );
  }
}