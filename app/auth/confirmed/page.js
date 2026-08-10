"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "../../components/Nav";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmedPage() {
  const [checking, setChecking] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSignedIn(!!user);
      setChecking(false);
    }
    check();
  }, []);

  return (
    <>
      <Nav />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-basil-50 flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-basil-900 mb-2">
            E-postan onaylandı!
          </h1>
          <p className="text-sm text-ink-soft mb-8">
            {checking
              ? "Kontrol ediliyor…"
              : signedIn
              ? "Hesabın hazır, hemen profilini oluşturabilirsin."
              : "Hesabın artık aktif. Giriş yaparak devam edebilirsin."}
          </p>

          {!checking && (
            <Link
              href={signedIn ? "/onboarding" : "/login"}
              className="inline-block px-6 py-3 rounded-full bg-basil-600 text-white font-semibold hover:bg-basil-700 transition-colors"
            >
              {signedIn ? "Profili Oluştur" : "Giriş Yap"}
            </Link>
          )}
        </div>
      </main>
    </>
  );
}