import Link from "next/link";
import Nav from "./components/Nav";

function BalanceRing() {
  // Signature visual: a hand-tuned "balance ring" — three arcs representing
  // protein / carbs / fat, the recurring motif used across the app wherever
  // a goal or macro breakdown is shown.
  return (
    <svg viewBox="0 0 200 200" className="w-64 h-64 md:w-80 md:h-80">
      <circle cx="100" cy="100" r="86" fill="none" stroke="#DDE7E1" strokeWidth="14" />
      <circle
        cx="100" cy="100" r="86" fill="none" stroke="#2F6F5E" strokeWidth="14"
        strokeDasharray="540" strokeDashoffset="150" strokeLinecap="round"
        transform="rotate(-90 100 100)"
      />
      <circle
        cx="100" cy="100" r="86" fill="none" stroke="#E8A33D" strokeWidth="14"
        strokeDasharray="540" strokeDashoffset="430" strokeLinecap="round"
        transform="rotate(48 100 100)"
      />
      <text x="100" y="94" textAnchor="middle" className="font-display" fontSize="30" fontWeight="700" fill="#14322A">
        70%
      </text>
      <text x="100" y="118" textAnchor="middle" fontSize="12" fill="#5B6B63">
        günlük hedef
      </text>
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="inline-block px-3 py-1 rounded-full bg-basil-50 text-basil-700 text-xs font-semibold tracking-wide mb-5">
              BOY · KİLO · HEDEF → KİŞİSEL PLAN
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-basil-900 leading-tight mb-5">
              Vücuduna göre konuşan bir diyetisyen, cebinde.
            </h1>
            <p className="text-ink-soft text-lg leading-relaxed mb-8 max-w-md">
              Boy ve kilonu gir, isteğe bağlı ölçülerinle vücut yağ oranını tahmin et,
              hedefine uygun yemek ve spor listeni al, aklına takılanı sohbetle sor.
            </p>
            <div className="flex gap-3">
              <Link
                href="/signup"
                className="px-6 py-3 rounded-full bg-basil-600 text-white font-semibold hover:bg-basil-700 transition-colors"
              >
                Ücretsiz Başla
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 rounded-full border border-line text-ink font-semibold hover:border-basil-600 transition-colors"
              >
                Giriş Yap
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <BalanceRing />
          </div>
        </section>

        {/* Feature strip */}
        <section className="border-t border-line bg-basil-50/60">
          <div className="max-w-5xl mx-auto px-6 py-14 grid sm:grid-cols-3 gap-8">
            {[
              {
                title: "Vücut Kompozisyonu",
                body: "Boy/kilodan anlık BMI; ister bel-boyun ölçünü ekle, tahmini yağ oranını da gör.",
              },
              {
                title: "Yemek & Spor Listesi",
                body: "Hedefine göre AI'nin hazırladığı, kısıtlama ve alerjilerine duyarlı öneriler.",
              },
              {
                title: "Sohbet Et, Sor",
                body: "Beslenmeyle ilgili aklına takılan her şeyi profiline göre yanıtlayan bir sohbet arayüzü.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-cream rounded-2xl p-6 border border-line">
                <h3 className="font-display font-bold text-basil-900 mb-2">{f.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-line py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-soft">
          <p>NutriAI genel sağlık ve wellness amaçlı bir araçtır; tıbbi teşhis veya tedavi yerine geçmez.</p>
          <Link href="/gizlilik" className="text-basil-700 font-medium hover:underline">
            KVKK Aydınlatma Metni
          </Link>
        </div>
      </footer>
    </>
  );
}
