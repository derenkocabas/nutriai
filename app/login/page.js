"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Nav from "../components/Nav";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/authErrors";
import { usernameToEmail } from "@/lib/username";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    });

    setLoading(false);
    if (error) {
      setError(translateAuthError(error.message));
      return;
    }
    router.push("/dashboard");
  }

  return (
    <>
      <Nav />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold text-basil-900 mb-1">Tekrar hoş geldin</h1>
          <p className="text-sm text-ink-soft mb-8">Hesabına giriş yap, kaldığın yerden devam et.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Kullanıcı Adı</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
                placeholder="kullanıcı adın"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Şifre</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-full bg-basil-600 text-white font-semibold hover:bg-basil-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
            </button>
          </form>

          <p className="text-sm text-ink-soft mt-6 text-center">
            Hesabın yok mu?{" "}
            <Link href="/signup" className="text-basil-700 font-medium hover:underline">
              Kayıt ol
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}