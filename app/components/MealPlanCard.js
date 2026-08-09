"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function todayDateString() {
  return new Date().toISOString().split("T")[0];
}

export default function MealPlanCard({ profile, onTotalsChange, date, title }) {
  const targetDate = date || todayDateString();
  const isToday = targetDate === todayDateString();

  const [meals, setMeals] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [swappingIndex, setSwappingIndex] = useState(null);
  const [favoritedIndex, setFavoritedIndex] = useState(null);

  const [altOpenIndex, setAltOpenIndex] = useState(null);
  const [altText, setAltText] = useState("");
  const [altLoadingIndex, setAltLoadingIndex] = useState(null);
  const [altError, setAltError] = useState(null);

  const totalCalories = meals ? meals.filter((m) => !m.skipped).reduce((sum, m) => sum + (m.calories || 0), 0) : 0;
  const totalProtein = meals ? meals.filter((m) => !m.skipped).reduce((sum, m) => sum + (m.protein_g || 0), 0) : 0;

  useEffect(() => {
    async function loadExisting() {
      setLoadingInitial(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoadingInitial(false);
        return;
      }

      const { data } = await supabase
        .from("daily_summary")
        .select("meals")
        .eq("user_id", user.id)
        .eq("log_date", targetDate)
        .maybeSingle();

      if (data?.meals) {
        setMeals(data.meals);
      } else {
        setMeals(null);
      }
      setLoadingInitial(false);
    }
    loadExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  useEffect(() => {
    if (loadingInitial) return;

    if (onTotalsChange) {
      onTotalsChange({ calories: totalCalories, protein: totalProtein });
    }

    async function persist() {
      if (!meals || meals.length === 0) return;
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("daily_summary").upsert({
        user_id: user.id,
        log_date: targetDate,
        calories: totalCalories,
        protein_g: totalProtein,
        meals,
      });
    }
    persist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meals, loadingInitial]);

  function toggleSkipped(index) {
    setMeals((prev) => prev.map((m, i) => (i === index ? { ...m, skipped: !m.skipped } : m)));
  }

  async function saveFavorite(index) {
    const meal = meals[index];
    setFavoritedIndex(index);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("favorite_meals").insert({
        user_id: user.id,
        name: meal.name,
        description: meal.description,
        portion: meal.portion,
        calories: meal.calories,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fat_g: meal.fat_g,
      });
    } finally {
      setTimeout(() => setFavoritedIndex(null), 1500);
    }
  }

  async function generateAll() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir şeyler ters gitti.");
      setMeals(data.meals);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function swapMeal(index) {
    setSwappingIndex(index);
    setError(null);
    try {
      const otherMeals = meals.filter((_, i) => i !== index);
      const existingMealNames = otherMeals.map((m) => m.name);

      let budget = null;
      if (profile.calorieGoal || profile.proteinGoal) {
        const usedCalories = otherMeals.reduce((s, m) => s + (m.calories || 0), 0);
        const usedProtein = otherMeals.reduce((s, m) => s + (m.protein_g || 0), 0);
        budget = {
          calories: profile.calorieGoal ? Math.max(50, profile.calorieGoal - usedCalories) : null,
          protein: profile.proteinGoal ? Math.max(5, profile.proteinGoal - usedProtein) : null,
        };
      }

      const res = await fetch("/api/meal-plan/single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, slot: meals[index].slot, existingMealNames, budget }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir şeyler ters gitti.");

      setMeals((prev) => prev.map((m, i) => (i === index ? data.meal : m)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSwappingIndex(null);
    }
  }

  function openAltInput(index) {
    setAltOpenIndex(index);
    setAltText("");
    setAltError(null);
  }

  async function submitAlt(index) {
    if (!altText.trim()) return;
    setAltLoadingIndex(index);
    setAltError(null);
    try {
      const res = await fetch("/api/meal-plan/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: altText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir şeyler ters gitti.");

      const est = data.estimate;
      setMeals((prev) =>
        prev.map((m, i) =>
          i === index
            ? {
                slot: m.slot,
                name: est.name,
                description: "Plan dışı — gerçekte bunu yedin.",
                portion: est.portion,
                calories: est.calories,
                protein_g: est.protein_g,
                carbs_g: est.carbs_g,
                fat_g: est.fat_g,
                actual: true,
              }
            : m
        )
      );
      setAltOpenIndex(null);
    } catch (err) {
      setAltError(err.message);
    } finally {
      setAltLoadingIndex(null);
    }
  }

  const cardTitle = title || "Yemek Listesi";

  return (
    <div className="rounded-2xl bg-white border border-line p-6 sm:col-span-2">
      <div className="flex items-center justify-between mb-1">
        <p className="font-display font-bold text-basil-900">{cardTitle}</p>
        {!loadingInitial && !meals && isToday && (
          <button
            onClick={generateAll}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-full bg-basil-600 text-white font-medium hover:bg-basil-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Oluşturuluyor…" : "Yemek Listesi Oluştur"}
          </button>
        )}
        {meals && (
          <button
            onClick={generateAll}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-full border border-line hover:border-basil-600 transition-colors disabled:opacity-60"
          >
            {loading ? "Yenileniyor…" : "Tümünü Yeniden Oluştur"}
          </button>
        )}
      </div>

      {meals && (
        <p className="text-xs text-ink-soft mb-3">Toplam ~{totalCalories} kcal</p>
      )}

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      {loadingInitial && <p className="text-sm text-ink-soft mt-2">Yükleniyor…</p>}

      {!loadingInitial && !meals && !error && isToday && (
        <p className="text-sm text-ink-soft mt-2">
          Hazır olduğunda, profiline göre AI önerisi almak için butona tıkla.
        </p>
      )}

      {!loadingInitial && !meals && !error && !isToday && (
        <p className="text-sm text-ink-soft mt-2">Bu gün için kayıtlı bir liste yok.</p>
      )}

      {meals && (
        <div className="space-y-3 mt-2">
          {meals.map((meal, i) => (
            <div
              key={i}
              className={`rounded-xl border border-line p-4 transition-opacity ${
                meal.skipped ? "opacity-45" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-basil-700 uppercase tracking-wide">
                      {meal.slot}
                    </p>
                    {meal.actual && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber/20 text-amber-dark font-semibold">
                        Gerçek Kayıt
                      </span>
                    )}
                    {meal.skipped && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-line text-ink-soft font-semibold">
                        Yemedim
                      </span>
                    )}
                  </div>
                  <p className={`font-display font-bold text-ink mt-0.5 ${meal.skipped ? "line-through" : ""}`}>
                    {meal.name}
                  </p>
                  {meal.description && (
                    <p className="text-sm text-ink-soft mt-1">{meal.description}</p>
                  )}
                  {meal.portion && (
                    <p className="text-xs text-ink-soft mt-1.5 flex items-center gap-1">
                      <span className="font-semibold text-basil-700">Porsiyon:</span> {meal.portion}
                    </p>
                  )}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleSkipped(i)}
                    title={meal.skipped ? "Geri al" : "Yemedim"}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      meal.skipped
                        ? "border-basil-600 text-basil-700 bg-basil-50"
                        : "border-line hover:border-red-400 hover:text-red-600"
                    }`}
                  >
                    {meal.skipped ? "Geri Al" : "🗑 Yemedim"}
                  </button>
                  <button
                    onClick={() => saveFavorite(i)}
                    disabled={favoritedIndex === i}
                    title="Favorilere ekle"
                    className="text-xs px-2.5 py-1 rounded-full border border-line hover:border-amber transition-colors disabled:opacity-60"
                  >
                    {favoritedIndex === i ? "★ Eklendi" : "☆"}
                  </button>
                  <button
                    onClick={() => swapMeal(i)}
                    disabled={swappingIndex === i}
                    className="text-xs px-2.5 py-1 rounded-full border border-line hover:border-basil-600 transition-colors disabled:opacity-60"
                  >
                    {swappingIndex === i ? "…" : "Değiştir"}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {meal.calories != null && (
                  <span className="text-xs px-2 py-1 rounded-full bg-basil-50 text-basil-900 font-medium">
                    {meal.calories} kcal
                  </span>
                )}
                {meal.protein_g != null && (
                  <span className="text-xs px-2 py-1 rounded-full bg-amber/15 text-amber-dark font-medium">
                    Protein {meal.protein_g}g
                  </span>
                )}
                {meal.carbs_g != null && (
                  <span className="text-xs px-2 py-1 rounded-full bg-amber/15 text-amber-dark font-medium">
                    Karbonhidrat {meal.carbs_g}g
                  </span>
                )}
                {meal.fat_g != null && (
                  <span className="text-xs px-2 py-1 rounded-full bg-amber/15 text-amber-dark font-medium">
                    Yağ {meal.fat_g}g
                  </span>
                )}
              </div>

              {altOpenIndex === i ? (
                <div className="mt-3 pt-3 border-t border-line">
                  <label className="block text-xs font-medium mb-1.5">
                    Bunun yerine ne yedin?
                  </label>
                  <textarea
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    rows={2}
                    placeholder="örn. dışarıda 1 porsiyon adana kebap yedim, yanında ayran içtim"
                    className="w-full rounded-lg border border-line px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-basil-600"
                  />
                  {altError && <p className="text-xs text-red-600 mt-1">{altError}</p>}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => submitAlt(i)}
                      disabled={altLoadingIndex === i || !altText.trim()}
                      className="text-xs px-3 py-1.5 rounded-full bg-basil-600 text-white font-medium hover:bg-basil-700 transition-colors disabled:opacity-60"
                    >
                      {altLoadingIndex === i ? "Hesaplanıyor…" : "Hesapla ve Kaydet"}
                    </button>
                    <button
                      onClick={() => setAltOpenIndex(null)}
                      className="text-xs px-3 py-1.5 rounded-full border border-line hover:border-basil-600 transition-colors"
                    >
                      Vazgeç
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => openAltInput(i)}
                  className="mt-3 text-xs text-ink-soft hover:text-basil-700 transition-colors underline"
                >
                  Bunun yerine farklı bir şey mi yedin?
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-ink-soft mt-4">
        Kalori/makro değerleri genel tahminlerdir, tıbbi kesinlik taşımaz.
      </p>
    </div>
  );
}