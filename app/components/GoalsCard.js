"use client";

import {
  calculateBMR,
  calculateTDEE,
  calculateCalorieGoal,
  calculateProteinGoal,
} from "@/lib/bodyComposition";

function ProgressBar({ value, goal, colorClass }) {
  const pct = goal ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  return (
    <div className="w-full h-2 rounded-full bg-basil-50 overflow-hidden">
      <div className={`h-full ${colorClass} transition-all duration-300`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function GoalsCard({ profile, consumed }) {
  const bmr = calculateBMR({
    sex: profile.sex,
    age: profile.age,
    heightCm: profile.height_cm,
    weightKg: profile.weight_kg,
  });
  const tdee = calculateTDEE(bmr, profile.activity_level);
  const calorieGoal = calculateCalorieGoal(tdee, profile.goal);
  const proteinGoal = calculateProteinGoal(profile.weight_kg, profile.goal);

  if (!bmr) {
    return (
      <div className="rounded-2xl bg-white border border-line p-6 sm:col-span-2">
        <p className="font-display font-bold text-basil-900 mb-1">Hedefler</p>
        <p className="text-sm text-ink-soft">
          Kalori/protein hedeflerini hesaplayabilmemiz için profilinde yaş, boy ve kilo bilgisinin dolu olması gerekiyor.
        </p>
      </div>
    );
  }

  const consumedCalories = consumed?.calories ?? 0;
  const consumedProtein = consumed?.protein ?? 0;

  return (
    <div className="rounded-2xl bg-white border border-line p-6 sm:col-span-2">
      <div className="flex items-center justify-between mb-1">
        <p className="font-display font-bold text-basil-900">Hedefler</p>
        <p className="text-xs text-ink-soft">Bazal metabolizma: {bmr} kcal</p>
      </div>
      <p className="text-xs text-ink-soft mb-4">
        Günlük enerji ihtiyacın (TDEE): ~{tdee} kcal — hedefine göre ayarlanmış öneriler aşağıda.
      </p>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-medium">Kalori</p>
            <p className="text-xs text-ink-soft">
              {consumedCalories} / {calorieGoal} kcal
            </p>
          </div>
          <ProgressBar value={consumedCalories} goal={calorieGoal} colorClass="bg-basil-600" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-medium">Protein</p>
            <p className="text-xs text-ink-soft">
              {consumedProtein}g / {proteinGoal}g
            </p>
          </div>
          <ProgressBar value={consumedProtein} goal={proteinGoal} colorClass="bg-amber" />
        </div>
      </div>

      <p className="text-xs text-ink-soft mt-4">
        Değerler; boy, kilo, yaş, cinsiyet, aktivite seviyesi ve hedefine göre hesaplanan genel
        tahminlerdir (Mifflin-St Jeor formülü). Tıbbi kesinlik taşımaz. "Kalori/Protein" satırları,
        oluşturduğun günlük yemek listesinin toplamını gösterir.
      </p>
    </div>
  );
}