"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function FavoritesCard() {
  const [meals, setMeals] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: mealData } = await supabase
      .from("favorite_meals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: workoutData } = await supabase
      .from("favorite_workouts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setMeals(mealData || []);
    setWorkouts(workoutData || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function removeMeal(id) {
    const supabase = createClient();
    await supabase.from("favorite_meals").delete().eq("id", id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }

  async function removeWorkout(id) {
    const supabase = createClient();
    await supabase.from("favorite_workouts").delete().eq("id", id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-line p-6 sm:col-span-2">
        <p className="text-sm text-ink-soft">Yükleniyor…</p>
      </div>
    );
  }

  if (meals.length === 0 && workouts.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-line p-6 sm:col-span-2">
        <p className="font-display font-bold text-basil-900 mb-1">Favorilerim</p>
        <p className="text-sm text-ink-soft">
          Beğendiğin yemek veya spor önerilerini ☆ ikonuyla favorilere ekleyebilirsin, burada listelenecekler.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-line p-6 sm:col-span-2">
      <p className="font-display font-bold text-basil-900 mb-3">Favorilerim</p>

      {meals.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-basil-700 uppercase tracking-wide mb-2">Yemekler</p>
          <div className="space-y-2">
            {meals.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl border border-line px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-ink-soft">
                    {m.calories} kcal · P{m.protein_g}g · K{m.carbs_g}g · Y{m.fat_g}g
                  </p>
                </div>
                <button
                  onClick={() => removeMeal(m.id)}
                  className="text-xs text-ink-soft hover:text-red-600 transition-colors shrink-0 ml-2"
                >
                  Kaldır
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {workouts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-basil-700 uppercase tracking-wide mb-2">Spor Programları</p>
          <div className="space-y-2">
            {workouts.map((w) => (
              <div key={w.id} className="rounded-xl border border-line px-3 py-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{w.title}</p>
                  <button
                    onClick={() => removeWorkout(w.id)}
                    className="text-xs text-ink-soft hover:text-red-600 transition-colors shrink-0 ml-2"
                  >
                    Kaldır
                  </button>
                </div>
                <p className="text-xs text-ink-soft mt-1 whitespace-pre-line line-clamp-3">{w.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}