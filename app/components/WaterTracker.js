"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function todayDateString() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export default function WaterTracker({ weightKg, savedGoalMl }) {
  const [amountMl, setAmountMl] = useState(0);
  const [goalMl, setGoalMl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");

  const defaultGoal = weightKg ? Math.round((weightKg * 33) / 250) * 250 : 2000;
  const effectiveGoal = goalMl ?? savedGoalMl ?? defaultGoal;
  const progress = Math.min(100, Math.round((amountMl / effectiveGoal) * 100));

  useEffect(() => {
    setGoalMl(savedGoalMl ?? null);
  }, [savedGoalMl]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("water_logs")
        .select("amount_ml")
        .eq("user_id", user.id)
        .eq("log_date", todayDateString())
        .maybeSingle();

      setAmountMl(data?.amount_ml ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  async function addWater(delta) {
    const newAmount = Math.max(0, amountMl + delta);
    setAmountMl(newAmount);
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    await supabase.from("water_logs").upsert({
      user_id: user.id,
      log_date: todayDateString(),
      amount_ml: newAmount,
    });
    setSaving(false);
  }

  async function saveGoal() {
    const liters = parseFloat(goalInput.replace(",", "."));
    if (!liters || liters <= 0) {
      setEditingGoal(false);
      return;
    }
    const newGoalMl = Math.round(liters * 1000);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("profiles").update({ water_goal_ml: newGoalMl }).eq("user_id", user.id);
    setGoalMl(newGoalMl);
    setEditingGoal(false);
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-line p-6">
        <p className="text-sm text-ink-soft">Yükleniyor…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-line p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="font-display font-bold text-basil-900">Su Tüketimi</p>
        {editingGoal ? (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              step="0.1"
              autoFocus
              placeholder="örn. 2.5"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveGoal()}
              className="w-16 rounded-lg border border-line px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-basil-600"
            />
            <span className="text-xs text-ink-soft">L</span>
            <button onClick={saveGoal} className="text-xs font-semibold text-basil-700 hover:underline">
              Kaydet
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setGoalInput((effectiveGoal / 1000).toString());
              setEditingGoal(true);
            }}
            className="text-xs text-ink-soft hover:text-basil-700 transition-colors"
          >
            {amountMl} / {effectiveGoal} ml <span className="underline ml-1">değiştir</span>
          </button>
        )}
      </div>

      <div className="w-full h-2.5 rounded-full bg-basil-50 overflow-hidden mb-4">
        <div
          className="h-full bg-basil-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => addWater(250)}
          disabled={saving}
          className="px-3 py-1.5 rounded-full bg-basil-50 text-basil-700 text-xs font-semibold hover:bg-basil-100 transition-colors disabled:opacity-60"
        >
          + 250 ml (bardak)
        </button>
        <button
          onClick={() => addWater(500)}
          disabled={saving}
          className="px-3 py-1.5 rounded-full bg-basil-50 text-basil-700 text-xs font-semibold hover:bg-basil-100 transition-colors disabled:opacity-60"
        >
          + 500 ml (şişe)
        </button>
        <button
          onClick={() => addWater(-250)}
          disabled={saving || amountMl === 0}
          className="px-3 py-1.5 rounded-full border border-line text-xs font-medium hover:border-basil-600 transition-colors disabled:opacity-40"
        >
          − 250 ml
        </button>
      </div>
    </div>
  );
}