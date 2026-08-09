"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Nav from "../components/Nav";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [kvkkConsent, setKvkkConsent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!kvkkConsent) {
      setError("Devam etmek için KVKK Aydınlatma Metni'ni onaylamalısın.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          kvkk_consent: true,
          kvkk_consent_at: new Date().toISOString(),
        },
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message || "Kayıt oluşturulamadı, tekrar dene.");
      return;
    }
    setDone(true);
  }

  return (
    <>
      <Nav />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold text-basil-900 mb-1">Hesap oluştur</h1>
          <p className="text-sm text-ink-soft mb-8">
            30 saniyede kaydol, hemen profilini oluşturmaya başla.
          </p>

          {done ? (
            <div className="rounded-xl bg-basil-50 border border-basil-600/20 p-4 text-sm text-basil-900">
              Kaydın alındı. E-postana gelen onay bağlantısına tıkladıktan sonra{" "}
              <Link href="/login" className="underline font-medium">
                giriş yapabilirsin
              </Link>.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">E-posta</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
                  placeholder="sen@ornek.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Şifre</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
                  placeholder="en az 6 karakter"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <label className="flex items-start gap-2.5 text-xs text-ink-soft">
                <input
                  type="checkbox"
                  checked={kvkkConsent}
                  onChange={(e) => setKvkkConsent(e.target.checked)}
                  className="mt-0.5 accent-basil-600"
                />
                <span>
                  <Link href="/gizlilik" target="_blank" className="text-basil-700 font-medium hover:underline">
                    KVKK Aydınlatma Metni
                  </Link>
                  &apos;ni okudum, boy/kilo/sağlık bilgilerimin bu metinde belirtilen amaçlarla
                  işlenmesine açık rıza gösteriyorum.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-full bg-basil-600 text-white font-semibold hover:bg-basil-700 transition-colors disabled:opacity-60"
              >
                {loading ? "Oluşturuluyor…" : "Kayıt Ol"}
              </button>
            </form>
          )}

          <p className="text-sm text-ink-soft mt-6 text-center">
            Zaten hesabın var mı?{" "}
            <Link href="/login" className="text-basil-700 font-medium hover:underline">
              Giriş yap
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}