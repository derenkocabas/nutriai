"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "../components/Nav";
import AiSuggestionCard from "../components/AiSuggestionCard";
import MealPlanCard from "../components/MealPlanCard";
import GoalsCard from "../components/GoalsCard";
import HistoryCard from "../components/HistoryCard";
import FavoritesCard from "../components/FavoritesCard";
import WaterTracker from "../components/WaterTracker";
import { createClient } from "@/lib/supabase/client";
import {
  bmiCategory,
  calculateBMR,
  calculateTDEE,
  calculateCalorieGoal,
  calculateProteinGoal,
} from "@/lib/bodyComposition";

const GOAL_LABELS = { lose: "Kilo Vermek", maintain: "Kiloyu Korumak", gain: "Kilo/Kas Almak" };
const ACTIVITY_LABELS = { low: "Düşük", moderate: "Orta", high: "Yüksek" };

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(true);
  const [mealTotals, setMealTotals] = useState({ calories: 0, protein: 0 });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSignedIn(false);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfile(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <Nav />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <h1 className="font-display text-3xl font-bold text-basil-900 mb-1">Panelim</h1>
        <p className="text-ink-soft mb-8">Profilin ve önerilerin burada toplanacak.</p>

        {loading && <p className="text-ink-soft">Yükleniyor…</p>}

        {!loading && !signedIn && (
          <div className="rounded-2xl border border-line bg-white p-6">
            <p className="mb-4">Paneli görmek için önce giriş yapmalısın.</p>
            <Link href="/login" className="px-5 py-2.5 rounded-full bg-basil-600 text-white font-semibold">
              Giriş Yap
            </Link>
          </div>
        )}

        {!loading && signedIn && !profile && (
          <div className="rounded-2xl border border-line bg-white p-6">
            <p className="mb-4">Henüz bir profil oluşturmadın.</p>
            <Link href="/onboarding" className="px-5 py-2.5 rounded-full bg-basil-600 text-white font-semibold">
              Profili Oluştur
            </Link>
          </div>
        )}

        {!loading && profile && (() => {
          const mealProfile = {
            age: profile.age,
            sex: profile.sex,
            goal: profile.goal,
            activityLevel: profile.activity_level,
            restrictions: profile.restrictions,
            mealsPerDay: profile.meals_per_day,
            snacksPerDay: profile.snacks_per_day,
            bloodValues: profile.blood_values,
            calorieGoal: calculateCalorieGoal(
              calculateTDEE(
                calculateBMR({
                  sex: profile.sex,
                  age: profile.age,
                  heightCm: profile.height_cm,
                  weightKg: profile.weight_kg,
                }),
                profile.activity_level
              ),
              profile.goal
            ),
            proteinGoal: calculateProteinGoal(profile.weight_kg, profile.goal),
          };

          return (
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-basil-50 border border-basil-600/15 p-6">
              <p className="text-xs text-ink-soft mb-1">BMI</p>
              <p className="font-display text-3xl font-bold text-basil-900">
                {profile.bmi} <span className="text-sm font-medium text-ink-soft">— {bmiCategory(profile.bmi)}</span>
              </p>
              {profile.body_fat_percent && (
                <p className="text-sm text-ink-soft mt-2">Tahmini yağ oranı: %{profile.body_fat_percent}</p>
              )}
            </div>

            <div className="rounded-2xl bg-white border border-line p-6">
              <p className="text-xs text-ink-soft mb-1">Hedef</p>
              <p className="font-display text-xl font-bold text-basil-900">{GOAL_LABELS[profile.goal] || profile.goal}</p>
              <p className="text-sm text-ink-soft mt-2">Aktivite: {ACTIVITY_LABELS[profile.activity_level] || profile.activity_level}</p>
            </div>

            <WaterTracker weightKg={profile.weight_kg} savedGoalMl={profile.water_goal_ml} />

            <GoalsCard profile={profile} consumed={mealTotals} />

            <MealPlanCard
              onTotalsChange={setMealTotals}
              profile={mealProfile}
            />

            <AiSuggestionCard
              title="Spor Listesi"
              endpoint="/api/workout-plan"
              buttonLabel="Spor Listesi Oluştur"
              allowFavorite
              persistField="workout_text"
              profile={{
                age: profile.age,
                sex: profile.sex,
                goal: profile.goal,
                activityLevel: profile.activity_level,
                workoutDaysPerWeek: profile.workout_days_per_week,
                fitnessLevel: profile.fitness_level,
                workoutLocation: profile.workout_location,
                homeEquipment: profile.home_equipment,
              }}
            />

            <HistoryCard mealProfile={mealProfile} />

            <FavoritesCard />
          </div>
          );
        })()}
      </main>
    </>
  );
}