"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Nav() {
  const [user, setUser] = useState(undefined);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-line bg-cream/90 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-lg text-basil-900 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber" />
          NutriAI
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-ink-soft">
          <Link href="/onboarding" className="hover:text-basil-700 transition-colors">Profilim</Link>
          <Link href="/chat" className="hover:text-basil-700 transition-colors">Sohbet</Link>
          <Link href="/dashboard" className="hover:text-basil-700 transition-colors">Panel</Link>

          {user === undefined && <span className="w-24" />}

          {user === null && (
            <Link
              href="/login"
              className="px-4 py-2 rounded-full bg-basil-600 text-white hover:bg-basil-700 transition-colors"
            >
              Giriş Yap
            </Link>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full border border-line hover:border-basil-600 transition-colors"
            >
              Çıkış Yap
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}