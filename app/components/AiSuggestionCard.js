"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function todayDateString() {
  return new Date().toISOString().split("T")[0];
}

export default function AiSuggestionCard({ title, endpoint, profile, buttonLabel, allowFavorite, persistField }) {
  const [result, setResult] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(!!persistField);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    if (!persistField) return;
    async function loadExisting() {
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
        .select(persistField)
        .eq("user_id", user.id)
        .eq("log_date", todayDateString())
        .maybeSingle();

      if (data && data[persistField]) {
        setResult(data[persistField]);
      }
      setLoadingInitial(false);
    }
    loadExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir şeyler ters gitti.");
      setResult(data.result);
      setFavorited(false);

      if (persistField) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("daily_summary").upsert({
            user_id: user.id,
            log_date: todayDateString(),
            [persistField]: data.result,
          });
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveFavorite() {
    setFavorited(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("favorite_workouts").insert({
      user_id: user.id,
      title: `${title} — ${new Date().toLocaleDateString("tr-TR")}`,
      content: result,
    });
  }

  return (
    <div className="rounded-2xl bg-white border border-line p-6 sm:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <p className="font-display font-bold text-basil-900">{title}</p>
        {!loadingInitial && !result && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-full bg-basil-600 text-white font-medium hover:bg-basil-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Oluşturuluyor…" : buttonLabel}
          </button>
        )}
        {result && (
          <div className="flex gap-1.5">
            {allowFavorite && (
              <button
                onClick={saveFavorite}
                disabled={favorited}
                className="text-xs px-3 py-1.5 rounded-full border border-line hover:border-amber transition-colors disabled:opacity-60"
              >
                {favorited ? "★ Eklendi" : "☆ Favorile"}
              </button>
            )}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-line hover:border-basil-600 transition-colors disabled:opacity-60"
            >
              {loading ? "Yenileniyor…" : "Yeniden Oluştur"}
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      {loadingInitial && <p className="text-sm text-ink-soft">Yükleniyor…</p>}

      {!loadingInitial && !result && !error && (
        <p className="text-sm text-ink-soft">
          Hazır olduğunda, profiline göre AI önerisi almak için butona tıkla.
        </p>
      )}

      {result && (
        <div className="text-sm text-ink whitespace-pre-line leading-relaxed mt-2">{result}</div>
      )}
    </div>
  );
}