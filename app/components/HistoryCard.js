"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import MealPlanCard from "./MealPlanCard";

function isoDate(d) {
  return d.toISOString().split("T")[0];
}

function lastNDates(n) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(isoDate(d));
  }
  return dates;
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

const DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export default function HistoryCard({ mealProfile }) {
  const [rows, setRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

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

      const dates = lastNDates(7);
      const { data } = await supabase
        .from("daily_summary")
        .select("log_date, calories, protein_g, meals")
        .eq("user_id", user.id)
        .in("log_date", dates);

      const byDate = {};
      (data || []).forEach((row) => {
        byDate[row.log_date] = row;
      });
      setRows(byDate);
      setLoading(false);

      const yesterday = isoDate(new Date(Date.now() - 86400000));
      if (byDate[yesterday]) {
        setSelectedDate(yesterday);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-line p-6 sm:col-span-2">
        <p className="text-sm text-ink-soft">Yükleniyor…</p>
      </div>
    );
  }

  const dates = lastNDates(7);
  const maxCalories = Math.max(500, ...dates.map((d) => rows[d]?.calories || 0));
  const today = isoDate(new Date());

  return (
    <div className="rounded-2xl bg-white border border-line p-6 sm:col-span-2">
      <p className="font-display font-bold text-basil-900 mb-1">Geçmiş</p>
      <p className="text-xs text-ink-soft mb-4">
        Son 7 günün kalori özetin — bir çubuğa tıklayarak o günün listesini görüp düzenleyebilirsin.
      </p>

      <div className="flex items-end justify-between gap-2 h-32 mb-2">
        {dates.map((date) => {
          const row = rows[date];
          const cal = row?.calories || 0;
          const heightPct = Math.max(4, Math.round((cal / maxCalories) * 100));
          const isToday = date === today;
          const isSelected = date === selectedDate;
          const mealNames = row?.meals?.map((m) => m.name).join(", ");
          const tooltip = row ? `${cal} kcal${mealNames ? `\n${mealNames}` : ""}` : "Kayıt yok";

          return (
            <button
              key={date}
              onClick={() => row && setSelectedDate(date)}
              disabled={!row}
              title={tooltip}
              className="flex-1 flex flex-col items-center justify-end h-full disabled:cursor-default"
            >
              <div
                className={`w-full rounded-t-md transition-all duration-300 ${
                  isSelected ? "ring-2 ring-basil-900" : ""
                } ${isToday ? "bg-amber" : row ? "bg-basil-600" : "bg-basil-50"}`}
                style={{ height: `${heightPct}%` }}
              />
            </button>
          );
        })}
      </div>
      <div className="flex justify-between gap-2 mb-4">
        {dates.map((date) => {
          const d = new Date(date);
          const dayIndex = (d.getDay() + 6) % 7;
          return (
            <p key={date} className="flex-1 text-center text-[10px] text-ink-soft">
              {DAY_LABELS[dayIndex]}
            </p>
          );
        })}
      </div>

      {selectedDate && (
        <div className="border-t border-line pt-4">
          <MealPlanCard
            date={selectedDate}
            title={`Yemek Listesi — ${formatDateLabel(selectedDate)}`}
            profile={mealProfile}
          />
        </div>
      )}
    </div>
  );
}