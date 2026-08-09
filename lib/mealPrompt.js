const GOAL_LABELS = { lose: "kilo vermek", maintain: "kiloyu korumak", gain: "kilo/kas almak" };
const ACTIVITY_LABELS = { low: "düşük", moderate: "orta", high: "yüksek" };

const CUISINE_STYLES = [
  "Ege/Akdeniz yöresi Türk yemekleri ağırlıklı (zeytinyağlılar, sebze ağırlıklı)",
  "Ev usulü Türk yemekleri ağırlıklı (çorba, sebze yemeği, et/tavuk yemeği tarzı)",
  "Karadeniz mutfağından esintili Türk yemekleri",
  "Hızlı hazırlanan pratik Türk ev yemekleri",
  "Kahvaltı kültürümüzden ilham alan, güne yayılmış lezzetler (yumurta, peynir, zeytin çeşitleri)",
  "Izgara ve fırın ağırlıklı geleneksel Türk mutfağı",
];

const SEASONAL_HINTS = {
  Kış: "lahana, pırasa, ıspanak, kereviz, turp, portakal, mandalina, ayva, nar",
  İlkbahar: "enginar, bakla, taze fasulye, kuşkonmaz, çilek, taze soğan, marul",
  Yaz: "domates, biber, patlıcan, kabak, salatalık, karpuz, kayısı, şeftali, üzüm",
  Sonbahar: "kabak, pazı, ayva, nar, elma, mantar, kestane",
};

function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if ([12, 1, 2].includes(month)) return "Kış";
  if ([3, 4, 5].includes(month)) return "İlkbahar";
  if ([6, 7, 8].includes(month)) return "Yaz";
  return "Sonbahar";
}

function buildProfileAndContextBlock(profile) {
  const season = getCurrentSeason();
  const seasonalProduce = SEASONAL_HINTS[season];
  const style = CUISINE_STYLES[Math.floor(Math.random() * CUISINE_STYLES.length)];
  const seed = Math.floor(Math.random() * 100000);

  const bv = profile.bloodValues || {};
  const bloodLines = [];
  if (bv.fastingGlucose) bloodLines.push(`Açlık kan şekeri: ${bv.fastingGlucose} mg/dL`);
  if (bv.hba1c) bloodLines.push(`HbA1c: %${bv.hba1c}`);
  if (bv.totalCholesterol) bloodLines.push(`Toplam kolesterol: ${bv.totalCholesterol} mg/dL`);
  if (bv.triglycerides) bloodLines.push(`Trigliserit: ${bv.triglycerides} mg/dL`);
  if (bv.ironFerritin) bloodLines.push(`Demir/Ferritin: ${bv.ironFerritin} ng/mL`);
  if (bv.b12) bloodLines.push(`B12: ${bv.b12} pg/mL`);
  if (bv.vitaminD) bloodLines.push(`D Vitamini: ${bv.vitaminD} ng/mL`);
  const bloodSection = bloodLines.length > 0
    ? `\nKan değerleri (kişi kendi rızasıyla girdi):\n${bloodLines.join("\n")}\nBu değerleri genel beslenme yönüyle dikkate al (kan şekeri/HbA1c yüksekse basit şeker
azalt; kolesterol/trigliserit yüksekse doymuş yağ azalt; demir/B12/D vitamini düşükse
o besin ögelerinden zengin seçenekleri öne çıkar). Tıbbi teşhis koyma.`
    : "";

  return `Profil:
- Yaş: ${profile.age ?? "belirtilmedi"}
- Cinsiyet: ${profile.sex === "male" ? "erkek" : "kadın"}
- Hedef: ${GOAL_LABELS[profile.goal] ?? profile.goal ?? "belirtilmedi"}
- Aktivite seviyesi: ${ACTIVITY_LABELS[profile.activityLevel] ?? profile.activityLevel ?? "belirtilmedi"}
- Kısıtlama/alerjiler: ${profile.restrictions?.trim() || "yok"}
${bloodSection}
Mutfak tercihi: Türk mutfağı ağırlıklı olsun, yabancı/egzotik mutfaklara kayma.
Mevsim: Şu an ${season}. Mümkün olduğunca mevsimine uygun sebze/meyve kullan
(örnek: ${seasonalProduce}). Mevsim dışı ürün önerme.
Çeşitlilik notu (varyasyon kodu: ${seed}): Bu seferki liste için ${style} bir tarz kullan.
Klişe önerilerden kaçın, farklı ve ilham verici fikirler sun.`;
}

const JSON_FORMAT_INSTRUCTIONS = `
Yanıtı SADECE aşağıdaki JSON formatında ver, başka hiçbir metin ekleme:
{
  "meals": [
    {
      "slot": "Öğünün adı (örn. Kahvaltı, Öğle Yemeği, Akşam Yemeği, Ara Öğün 1)",
      "name": "Yemeğin kısa adı",
      "description": "Tek cümlelik kısa açıklama",
      "portion": "Somut porsiyon miktarı (örn. '1 kase (250ml)', '150g ızgara tavuk + 1 su bardağı pilav', '2 dilim tam buğday ekmeği + 1 yumurta')",
      "calories": sayı (kcal),
      "protein_g": sayı,
      "carbs_g": sayı,
      "fat_g": sayı
    }
  ]
}
Sayılar gerçekçi tahminler olsun (tam kesinlik gerekmiyor, mantıklı bir yaklaşık değer yeterli).
"portion" alanı MUTLAKA somut bir miktar/ölçü içermeli (gram, adet, su bardağı, kase vb.) —
"az miktarda" veya "yeterince" gibi belirsiz ifadeler kullanma.`;

export function buildMealPrompt(profile) {
  const meals = profile.mealsPerDay || 3;
  const snacks = profile.snacksPerDay ?? 1;
  const context = buildProfileAndContextBlock(profile);

  const targetLine = (profile.calorieGoal || profile.proteinGoal)
    ? `\nGÜNLÜK HEDEF (ÖNEMLİ): Bu kişinin hesaplanmış günlük hedefi ~${profile.calorieGoal ?? "?"} kcal
ve ~${profile.proteinGoal ?? "?"}g protein. Oluşturacağın ${meals + snacks} öğenin kalori ve
protein toplamı, bu hedeflere olabildiğince yakın olmalı (yaklaşık %10 sapma kabul edilebilir,
büyük fark olmasın). Öğünlere makul şekilde dağıt (örn. ana öğünler daha yüksek kalorili,
ara öğünler daha düşük).`
    : "";

  return `Sen bir diyetisyen asistanısın. Aşağıdaki kişiye günlük bir yemek listesi öner:
tam olarak ${meals} ana öğün ve ${snacks} ara öğün olacak şekilde — toplam ${meals + snacks}
öğe olmalı, bu sayıya kesinlikle uy.

${context}
${targetLine}

Kurallar:
- Kısıtlama/alerjileri kesinlikle ihlal etme.
- Ana öğünlere uygun isimler ver: 3 ana öğün varsa Kahvaltı/Öğle Yemeği/Akşam Yemeği;
  2 ana öğün varsa ilk öğünü "Brunch (Geç Kahvaltı)" olarak adlandır (kahvaltı unsurları
  taşıyan, geç saatte yenen bir öğün — sıradan öğle yemeği değil), ikincisini Akşam Yemeği
  yap; 4 ana öğün varsa Kahvaltı/Öğle Yemeği/Akşam Yemeği/Gece Öğünü gibi mantıklı bir sıralama kullan.
  Ara öğünleri "Ara Öğün 1", "Ara Öğün 2" diye adlandır.
- Sonunda genel bir wellness önerisi olduğunu, tıbbi tavsiye yerine geçmediğini unutma (ama bunu
  ayrı bir alanda değil, sadece kendi bilgin olarak tut — JSON formatına ekleme).
- Türkçe yanıt ver.
${JSON_FORMAT_INSTRUCTIONS}`;
}

export function buildEstimatePrompt(description) {
  return `Sen bir diyetisyen asistanısın. Kullanıcı, planladığı öğün yerine aşağıdaki şeyi yediğini
belirtti. Bu açıklamaya göre kalori ve makro besin (protein/karbonhidrat/yağ) tahmini yap.

Kullanıcının yediği: "${description}"

Kurallar:
- Açıklama belirsizse (örn. "bir şeyler yedim" gibi) makul, ortalama bir tahmin yap, hata verme.
- Türkçe yanıt ver.

Yanıtı SADECE aşağıdaki JSON formatında ver, başka hiçbir metin ekleme:
{
  "name": "Yediği şeyin kısa, düzenlenmiş adı",
  "calories": sayı (kcal),
  "protein_g": sayı,
  "carbs_g": sayı,
  "fat_g": sayı
}`;
}

export function buildSingleMealPrompt(profile, slot, existingMealNames = [], budget = null) {
  const context = buildProfileAndContextBlock(profile);
  const avoidList = existingMealNames.length > 0
    ? `\nBu öğünler zaten listede var, bunlarla veya birbirine çok benzer fikirlerle çakışma: ${existingMealNames.join(", ")}.`
    : "";
  const budgetLine = budget && (budget.calories || budget.protein)
    ? `\nBu öğün için hedef bütçe: ~${budget.calories ?? "?"} kcal, ~${budget.protein ?? "?"}g protein
(diğer öğünlerin toplamı düşülerek hesaplandı). Önerini bu bütçeye olabildiğince yakın tut
(yaklaşık %15 sapma kabul edilebilir).`
    : "";

  return `Sen bir diyetisyen asistanısın. Aşağıdaki kişi için SADECE "${slot}" öğününe yeni bir
alternatif öner (diğer öğünlere dokunma, sadece bu tek öğün için tek bir öneri üret).

${context}
${avoidList}
${budgetLine}

Kurallar:
- Kısıtlama/alerjileri kesinlikle ihlal etme.
- Türkçe yanıt ver.

Yanıtı SADECE aşağıdaki JSON formatında ver, başka hiçbir metin ekleme:
{
  "slot": "${slot}",
  "name": "Yemeğin kısa adı",
  "description": "Tek cümlelik kısa açıklama",
  "portion": "Somut porsiyon miktarı (örn. '1 kase (250ml)', '150g ızgara tavuk + 1 su bardağı pilav')",
  "calories": sayı (kcal),
  "protein_g": sayı,
  "carbs_g": sayı,
  "fat_g": sayı
}`;
}