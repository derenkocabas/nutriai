// Body composition helpers.
// IMPORTANT: height + weight alone only ever produce BMI, which is a general
// wellness indicator, not a diagnostic measurement. Body-fat % additionally
// needs neck/waist/(hip) circumference — we use the well-known US Navy method.
// Everything here is explicitly an ESTIMATE, and the UI must label it as such.

export function calculateBMI(heightCm, weightKg) {
  if (!heightCm || !weightKg) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

export function bmiCategory(bmi) {
  if (bmi == null) return null;
  if (bmi < 18.5) return 'Zayıf';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Fazla Kilolu';
  return 'Obez';
}

// US Navy method — needs circumferences in cm, height in cm.
export function estimateBodyFatPercent({ sex, heightCm, neckCm, waistCm, hipCm }) {
  if (!heightCm || !neckCm || !waistCm) return null;
  if (sex === 'female' && !hipCm) return null;

  let bodyFat;
  if (sex === 'male') {
    bodyFat =
      495 /
        (1.0324 -
          0.19077 * Math.log10(waistCm - neckCm) +
          0.15456 * Math.log10(heightCm)) -
      450;
  } else {
    bodyFat =
      495 /
        (1.29579 -
          0.35004 * Math.log10(waistCm + hipCm - neckCm) +
          0.221 * Math.log10(heightCm)) -
      450;
  }

  if (!isFinite(bodyFat) || bodyFat <= 0 || bodyFat > 70) return null;
  return Math.round(bodyFat * 10) / 10;
}

// --- Bazal metabolizma (BMR), günlük enerji ihtiyacı (TDEE) ve
// kalori/protein hedefleri. Mifflin-St Jeor formülü kullanılıyor —
// klinik ortamlarda bile en güvenilir bulunan pratik BMR formülüdür.

export function calculateBMR({ sex, age, heightCm, weightKg }) {
  if (!age || !heightCm || !weightKg) return null;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = sex === 'male' ? base + 5 : base - 161;
  return Math.round(bmr);
}

const ACTIVITY_MULTIPLIERS = { low: 1.375, moderate: 1.55, high: 1.725 };

export function calculateTDEE(bmr, activityLevel) {
  if (!bmr) return null;
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.375;
  return Math.round(bmr * multiplier);
}

// Hedefe göre günlük kalori hedefi: kilo verme için makul bir açık (~500 kcal),
// kilo alma için makul bir fazla (~300 kcal), koruma için TDEE'nin kendisi.
export function calculateCalorieGoal(tdee, goal) {
  if (!tdee) return null;
  if (goal === 'lose') return Math.max(1200, tdee - 500);
  if (goal === 'gain') return tdee + 300;
  return tdee;
}

// Günlük protein hedefi: kilogram başına, hedefe göre değişen genel kabul
// görmüş aralıklar (kilo alma/kas yapma için daha yüksek).
export function calculateProteinGoal(weightKg, goal) {
  if (!weightKg) return null;
  const perKg = goal === 'gain' ? 2.0 : goal === 'lose' ? 1.8 : 1.4;
  return Math.round(weightKg * perKg);
}