"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Nav from "../components/Nav";
import { createClient } from "@/lib/supabase/client";

export default function ChatPage() {
  const [profile, setProfile] = useState(null);
  const [signedIn, setSignedIn] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSignedIn(false);
        setLoadingProfile(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setProfile(profileData);
      setLoadingProfile(false);

      const { data: convos } = await supabase
        .from("conversations")
        .select("id, title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setConversations(convos || []);

      if (convos && convos.length > 0) {
        selectConversation(convos[0].id);
      } else {
        setMessages([welcomeMessage]);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const welcomeMessage = {
    role: "assistant",
    content: "Merhaba! Beslenme ve spor hakkında aklına takılan her şeyi sorabilirsin. 🌿",
  };

  async function selectConversation(id) {
    setActiveId(id);
    setLoadingMessages(true);
    const { data } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    setMessages(data && data.length > 0 ? data : [welcomeMessage]);
    setLoadingMessages(false);
  }

  function startNewChat() {
    setActiveId(null);
    setMessages([welcomeMessage]);
  }

  async function ensureConversation(firstMessageText) {
    if (activeId) return activeId;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const title = firstMessageText.slice(0, 40) + (firstMessageText.length > 40 ? "…" : "");

    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title })
      .select()
      .single();

    if (error || !data) return null;

    setActiveId(data.id);
    setConversations((prev) => [{ id: data.id, title: data.title, created_at: data.created_at }, ...prev]);
    return data.id;
  }

  async function saveMessage(conversationId, role, content) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !conversationId) return;
    await supabase
      .from("chat_messages")
      .insert({ user_id: user.id, conversation_id: conversationId, role, content });
  }

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    const conversationId = await ensureConversation(text);
    saveMessage(conversationId, "user", text);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          profile: profile
            ? {
                age: profile.age,
                sex: profile.sex,
                goal: profile.goal,
                activityLevel: profile.activity_level,
                restrictions: profile.restrictions,
                bmi: profile.bmi,
              }
            : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir şeyler ters gitti.");

      setMessages((prev) => [...prev, { role: "assistant", content: data.result }]);
      saveMessage(conversationId, "assistant", data.result);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Üzgünüm, şu anda yanıt veremedim. Lütfen birazdan tekrar dener misin?" },
      ]);
    } finally {
      setSending(false);
    }
  }

  if (!loadingProfile && !signedIn) {
    return (
      <>
        <Nav />
        <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
          <div className="rounded-2xl border border-line bg-white p-6">
            <p className="mb-4">Sohbet edebilmek için önce giriş yapmalısın.</p>
            <Link href="/login" className="px-5 py-2.5 rounded-full bg-basil-600 text-white font-semibold">
              Giriş Yap
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex gap-5">
        <aside className="w-56 shrink-0 hidden sm:flex flex-col">
          <button
            onClick={startNewChat}
            className="mb-3 px-3 py-2 rounded-xl bg-basil-600 text-white text-sm font-semibold hover:bg-basil-700 transition-colors"
          >
            + Yeni Sohbet
          </button>
          <div className="flex-1 overflow-y-auto space-y-1">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => selectConversation(c.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${
                  activeId === c.id ? "bg-basil-50 text-basil-900 font-medium" : "text-ink-soft hover:bg-basil-50"
                }`}
              >
                {c.title}
              </button>
            ))}
            {conversations.length === 0 && (
              <p className="text-xs text-ink-soft px-3">Henüz sohbetin yok.</p>
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <h1 className="font-display text-2xl font-bold text-basil-900 mb-1">Sohbet</h1>
          <p className="text-ink-soft text-sm mb-4">Profiline göre kişiselleştirilmiş yanıtlar alırsın.</p>

          <button
            onClick={startNewChat}
            className="sm:hidden mb-3 self-start px-3 py-1.5 rounded-full border border-line text-xs font-medium"
          >
            + Yeni Sohbet
          </button>

          <div className="flex-1 rounded-2xl border border-line bg-white p-4 space-y-3 overflow-y-auto mb-4 min-h-[400px] max-h-[55vh]">
            {loadingMessages ? (
              <p className="text-sm text-ink-soft">Yükleniyor…</p>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                      m.role === "user" ? "bg-basil-600 text-white" : "bg-basil-50 text-ink"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-2.5 text-sm bg-basil-50 text-ink-soft">yazıyor…</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bir soru yaz…"
              className="flex-1 rounded-full border border-line px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-basil-600"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-6 py-2.5 rounded-full bg-basil-600 text-white font-semibold hover:bg-basil-700 transition-colors disabled:opacity-60"
            >
              Gönder
            </button>
          </form>

          <p className="text-xs text-ink-soft mt-3">
            NutriAI genel sağlık/wellness amaçlıdır, tıbbi teşhis veya tedavi yerine geçmez.
          </p>
        </div>
      </main>
    </>
  );
}