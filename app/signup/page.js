"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Nav from "../components/Nav";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/authErrors";
import { usernameToEmail, isValidUsername } from "@/lib/username";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [kvkkConsent, setKvkkConsent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isValidUsername(username)) {
      setError("Kullanıcı adı en az 3 karakter olmalı, sadece harf/rakam/._- içerebilir.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor, tekrar kontrol eder misin?");
      return;
    }
    if (!kvkkConsent) {
      setError("Devam etmek için KVKK Aydınlatma Metni'ni onaylamalısın.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: usernameToEmail(username),
      password,
      options: {
        data: {
          username: username.trim(),
          kvkk_consent: true,
          kvkk_consent_at: new Date().toISOString(),
        },
      },
    });

    setLoading(false);
    if (error) {
      const friendly = translateAuthError(error.message);
      setError(
        friendly === "Bu e-posta adresiyle zaten bir hesap var. Giriş yapmayı dener misin?"
          ? "Bu kullanıcı adı zaten alınmış. Giriş yapmayı dener misin?"
          : friendly
      );
      return;
    }

    router.push("/onboarding");
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Kullanıcı Adı</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
                placeholder="örn. deren123"
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
            <div>
              <label className="block text-sm font-medium mb-1.5">Şifre Tekrar</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
                placeholder="şifreni tekrar yaz"
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