"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "../components/Nav";
import { createClient } from "@/lib/supabase/client";
import { calculateBMI, bmiCategory, estimateBodyFatPercent } from "@/lib/bodyComposition";

const GOALS = [
  { value: "lose", label: "Kilo Vermek" },
  { value: "maintain", label: "Kiloyu Korumak" },
  { value: "gain", label: "Kilo/Kas Almak" },
];

const ACTIVITY_LEVELS = [
  { value: "low", label: "Düşük (masa başı iş, az hareket)" },
  { value: "moderate", label: "Orta (haftada 2-3 gün egzersiz)" },
  { value: "high", label: "Yüksek (haftada 4+ gün egzersiz)" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    age: "",
    sex: "female",
    heightCm: "",
    weightKg: "",
    activityLevel: "moderate",
    goal: "maintain",
    restrictions: "",
    mealsPerDay: "3",
    snacksPerDay: "1",
    workoutDaysPerWeek: "3",
    fitnessLevel: "beginner",
    workoutLocation: "home",
    homeEquipment: "none",
    neckCm: "",
    waistCm: "",
    hipCm: "",
    fastingGlucose: "",
    hba1c: "",
    totalCholesterol: "",
    triglycerides: "",
    ironFerritin: "",
    b12: "",
    vitaminD: "",
  });
  const [showBloodFields, setShowBloodFields] = useState(false);
  const [showBodyFatFields, setShowBodyFatFields] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadExistingProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoadingProfile(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setForm({
          age: data.age?.toString() ?? "",
          sex: data.sex ?? "female",
          heightCm: data.height_cm?.toString() ?? "",
          weightKg: data.weight_kg?.toString() ?? "",
          activityLevel: data.activity_level ?? "moderate",
          goal: data.goal ?? "maintain",
          restrictions: data.restrictions ?? "",
          mealsPerDay: data.meals_per_day?.toString() ?? "3",
          snacksPerDay: data.snacks_per_day?.toString() ?? "1",
          workoutDaysPerWeek: data.workout_days_per_week?.toString() ?? "3",
          fitnessLevel: data.fitness_level ?? "beginner",
          workoutLocation: data.workout_location ?? "home",
          homeEquipment: data.home_equipment ?? "none",
          neckCm: data.neck_cm?.toString() ?? "",
          waistCm: data.waist_cm?.toString() ?? "",
          hipCm: data.hip_cm?.toString() ?? "",
          fastingGlucose: data.blood_values?.fastingGlucose?.toString() ?? "",
          hba1c: data.blood_values?.hba1c?.toString() ?? "",
          totalCholesterol: data.blood_values?.totalCholesterol?.toString() ?? "",
          triglycerides: data.blood_values?.triglycerides?.toString() ?? "",
          ironFerritin: data.blood_values?.ironFerritin?.toString() ?? "",
          b12: data.blood_values?.b12?.toString() ?? "",
          vitaminD: data.blood_values?.vitaminD?.toString() ?? "",
        });
        if (data.blood_values && Object.keys(data.blood_values).length > 0) {
          setShowBloodFields(true);
        }
        if (data.neck_cm || data.waist_cm) {
          setShowBodyFatFields(true);
        }
      }
      setLoadingProfile(false);
    }
    loadExistingProfile();
  }, []);

  const height = parseFloat(form.heightCm);
  const weight = parseFloat(form.weightKg);

  const bmi = useMemo(() => calculateBMI(height, weight), [height, weight]);
  const category = bmiCategory(bmi);

  const bodyFat = useMemo(
    () =>
      estimateBodyFatPercent({
        sex: form.sex,
        heightCm: height,
        neckCm: parseFloat(form.neckCm),
        waistCm: parseFloat(form.waistCm),
        hipCm: parseFloat(form.hipCm),
      }),
    [form.sex, height, form.neckCm, form.waistCm, form.hipCm]
  );

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Devam etmek için önce giriş yapmalısın.");
      setSaving(false);
      return;
    }

    const bloodValues = {};
    if (form.fastingGlucose) bloodValues.fastingGlucose = parseFloat(form.fastingGlucose);
    if (form.hba1c) bloodValues.hba1c = parseFloat(form.hba1c);
    if (form.totalCholesterol) bloodValues.totalCholesterol = parseFloat(form.totalCholesterol);
    if (form.triglycerides) bloodValues.triglycerides = parseFloat(form.triglycerides);
    if (form.ironFerritin) bloodValues.ironFerritin = parseFloat(form.ironFerritin);
    if (form.b12) bloodValues.b12 = parseFloat(form.b12);
    if (form.vitaminD) bloodValues.vitaminD = parseFloat(form.vitaminD);

    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id,
      age: parseInt(form.age, 10) || null,
      sex: form.sex,
      height_cm: height || null,
      weight_kg: weight || null,
      activity_level: form.activityLevel,
      goal: form.goal,
      restrictions: form.restrictions,
      meals_per_day: parseInt(form.mealsPerDay, 10) || 3,
      snacks_per_day: parseInt(form.snacksPerDay, 10) || 0,
      workout_days_per_week: parseInt(form.workoutDaysPerWeek, 10) || 3,
      fitness_level: form.fitnessLevel,
      workout_location: form.workoutLocation,
      home_equipment: form.workoutLocation === "home" ? form.homeEquipment : null,
      neck_cm: parseFloat(form.neckCm) || null,
      waist_cm: parseFloat(form.waistCm) || null,
      hip_cm: parseFloat(form.hipCm) || null,
      blood_values: Object.keys(bloodValues).length > 0 ? bloodValues : null,
      bmi,
      body_fat_percent: bodyFat,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);
    if (error) {
      setError("Kaydedilemedi: " + error.message);
      return;
    }
    setSaved(true);
    setTimeout(() => router.push("/dashboard"), 900);
  }

  return (
    <>
      <Nav />
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
        <h1 className="font-display text-3xl font-bold text-basil-900 mb-1">
          {loadingProfile ? "Profilin kontrol ediliyor…" : "Profilini oluştur"}
        </h1>
        <p className="text-ink-soft mb-8">
          Bu bilgiler yemek/spor önerilerini ve vücut kompozisyonu tahminini kişiselleştirmek için kullanılır.
        </p>

        {loadingProfile ? (
          <p className="text-ink-soft">Yükleniyor…</p>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Yaş</label>
              <input
                type="number" required min="10" max="100"
                value={form.age} onChange={(e) => update("age", e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Cinsiyet</label>
              <select
                value={form.sex} onChange={(e) => update("sex", e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
              >
                <option value="female">Kadın</option>
                <option value="male">Erkek</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Boy (cm)</label>
              <input
                type="number" required min="100" max="250"
                value={form.heightCm} onChange={(e) => update("heightCm", e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Kilo (kg)</label>
              <input
                type="number" required min="30" max="300"
                value={form.weightKg} onChange={(e) => update("weightKg", e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
              />
            </div>
          </section>

          {bmi && (
            <section className="rounded-2xl bg-basil-50 border border-basil-600/15 p-5">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-xs text-ink-soft mb-0.5">BMI (Vücut Kitle İndeksi)</p>
                  <p className="font-display text-2xl font-bold text-basil-900">
                    {bmi} <span className="text-sm font-medium text-ink-soft">— {category}</span>
                  </p>
                </div>
                {bodyFat && (
                  <div>
                    <p className="text-xs text-ink-soft mb-0.5">Tahmini Yağ Oranı</p>
                    <p className="font-display text-2xl font-bold text-basil-900">%{bodyFat}</p>
                  </div>
                )}
              </div>

              {!showBodyFatFields && !bodyFat && (
                <button
                  type="button"
                  onClick={() => setShowBodyFatFields(true)}
                  className="mt-3 text-sm font-medium text-basil-700 hover:underline"
                >
                  + Boyun/bel ölçüsü ekleyip yağ oranı tahmini gör
                </button>
              )}

              {showBodyFatFields && (
                <div className="mt-4 grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Boyun (cm)</label>
                    <input
                      type="number" value={form.neckCm} onChange={(e) => update("neckCm", e.target.value)}
                      className="w-full rounded-lg border border-line px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-basil-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Bel (cm)</label>
                    <input
                      type="number" value={form.waistCm} onChange={(e) => update("waistCm", e.target.value)}
                      className="w-full rounded-lg border border-line px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-basil-600"
                    />
                  </div>
                  {form.sex === "female" && (
                    <div>
                      <label className="block text-xs font-medium mb-1">Kalça (cm)</label>
                      <input
                        type="number" value={form.hipCm} onChange={(e) => update("hipCm", e.target.value)}
                        className="w-full rounded-lg border border-line px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-basil-600"
                      />
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-ink-soft mt-3">
                Bu değerler genel wellness amaçlıdır, tıbbi teşhis niteliği taşımaz.
              </p>
            </section>
          )}

          <section className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Aktivite Seviyesi</label>
              <select
                value={form.activityLevel} onChange={(e) => update("activityLevel", e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
              >
                {ACTIVITY_LEVELS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Hedef</label>
              <select
                value={form.goal} onChange={(e) => update("goal", e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
              >
                {GOALS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          </section>

          <section className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Günde Kaç Ana Öğün?</label>
              <select
                value={form.mealsPerDay} onChange={(e) => update("mealsPerDay", e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
              >
                <option value="2">2 öğün</option>
                <option value="3">3 öğün</option>
                <option value="4">4 öğün</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Günde Kaç Ara Öğün?</label>
              <select
                value={form.snacksPerDay} onChange={(e) => update("snacksPerDay", e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
              >
                {[0, 1, 2, 3].map((n) => (
                  <option key={n} value={n}>{n} ara öğün</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Haftada Kaç Gün Spor?</label>
              <select
                value={form.workoutDaysPerWeek} onChange={(e) => update("workoutDaysPerWeek", e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <option key={n} value={n}>{n} gün</option>
                ))}
              </select>
            </div>
          </section>

          <section className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Spor Seviyen</label>
              <select
                value={form.fitnessLevel} onChange={(e) => update("fitnessLevel", e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
              >
                <option value="beginner">Yeni Başlayan</option>
                <option value="intermediate">Orta Seviye</option>
                <option value="advanced">İleri Seviye</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Nerede Spor Yapmak İstersin?</label>
              <select
                value={form.workoutLocation} onChange={(e) => update("workoutLocation", e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
              >
                <option value="home">Evde</option>
                <option value="gym">Spor Salonunda</option>
              </select>
            </div>
          </section>

          {form.workoutLocation === "home" && (
            <section>
              <label className="block text-sm font-medium mb-1.5">Evde Ekipmanın Var mı?</label>
              <select
                value={form.homeEquipment} onChange={(e) => update("homeEquipment", e.target.value)}
                className="w-full sm:w-1/2 rounded-xl border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
              >
                <option value="none">Yok — sadece ekipmansız hareketler</option>
                <option value="weights">Var — dambıl/lastik bant gibi ağırlık ekipmanım var</option>
              </select>
            </section>
          )}

          <section className="rounded-2xl bg-basil-50 border border-basil-600/15 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display font-bold text-basil-900">Kan Değerleri (opsiyonel)</p>
                <p className="text-xs text-ink-soft mt-0.5">
                  e-Nabız'dan görebileceğin son tahlil sonuçların — dolu olanları öneri üretirken dikkate alırız.
                </p>
              </div>
              {!showBloodFields && (
                <button
                  type="button"
                  onClick={() => setShowBloodFields(true)}
                  className="text-sm font-medium text-basil-700 hover:underline shrink-0 ml-4"
                >
                  Ekle
                </button>
              )}
            </div>

            {showBloodFields && (
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Açlık Kan Şekeri (mg/dL)</label>
                  <input
                    type="number" value={form.fastingGlucose} onChange={(e) => update("fastingGlucose", e.target.value)}
                    className="w-full rounded-lg border border-line px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-basil-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">HbA1c (%)</label>
                  <input
                    type="number" step="0.1" value={form.hba1c} onChange={(e) => update("hba1c", e.target.value)}
                    className="w-full rounded-lg border border-line px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-basil-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Toplam Kolesterol (mg/dL)</label>
                  <input
                    type="number" value={form.totalCholesterol} onChange={(e) => update("totalCholesterol", e.target.value)}
                    className="w-full rounded-lg border border-line px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-basil-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Trigliserit (mg/dL)</label>
                  <input
                    type="number" value={form.triglycerides} onChange={(e) => update("triglycerides", e.target.value)}
                    className="w-full rounded-lg border border-line px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-basil-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Demir / Ferritin (ng/mL)</label>
                  <input
                    type="number" value={form.ironFerritin} onChange={(e) => update("ironFerritin", e.target.value)}
                    className="w-full rounded-lg border border-line px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-basil-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">B12 (pg/mL)</label>
                  <input
                    type="number" value={form.b12} onChange={(e) => update("b12", e.target.value)}
                    className="w-full rounded-lg border border-line px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-basil-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">D Vitamini (ng/mL)</label>
                  <input
                    type="number" value={form.vitaminD} onChange={(e) => update("vitaminD", e.target.value)}
                    className="w-full rounded-lg border border-line px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-basil-600"
                  />
                </div>
              </div>
            )}

            <p className="text-xs text-ink-soft mt-3">
              Bu bilgiler yalnızca senin açık rızanla, genel beslenme önerilerini zenginleştirmek için
              kullanılır — tıbbi teşhis veya tedavi amaçlı değildir.
            </p>
          </section>

          <section>
            <label className="block text-sm font-medium mb-1.5">
              Kısıtlama / Alerjiler <span className="text-ink-soft font-normal">(opsiyonel)</span>
            </label>
            <textarea
              value={form.restrictions} onChange={(e) => update("restrictions", e.target.value)}
              rows={3}
              placeholder="örn. laktoz intoleransı, fındık alerjisi, vejetaryen"
              className="w-full rounded-xl border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
            />
          </section>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-basil-600 text-white font-semibold hover:bg-basil-700 transition-colors disabled:opacity-60"
          >
            {saving ? "Kaydediliyor…" : saved ? "Kaydedildi ✓" : "Profili Kaydet"}
          </button>
        </form>
        )}
      </main>
    </>
  );
}