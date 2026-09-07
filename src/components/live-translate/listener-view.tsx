"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type Caption = { id: string; source_text: string; translated_text: string; created_at: string };

export function ListenerView({
  sessionId,
  targetLang,
  initialCaptions,
  sessionActive,
}: {
  sessionId: string;
  targetLang: string;
  initialCaptions: Caption[];
  sessionActive: boolean;
}) {
  const [captions, setCaptions] = useState<Caption[]>(initialCaptions);
  const [audioOn, setAudioOn] = useState(false);
  const audioOnRef = useRef(audioOn);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Must not depend on `window` during the initial render — that would
  // differ between server (no window) and client, causing a hydration
  // mismatch. Detect after mount instead.
  const [speechSupported, setSpeechSupported] = useState(false);
  // Read via refs (not the reactive state) inside the realtime effect below
  // so toggling audio on/off, or speech-support resolving after mount,
  // never tears down and recreates the subscription — that would risk
  // missing captions broadcast during the brief reconnect window.
  const speechSupportedRef = useRef(speechSupported);

  useEffect(() => {
    const supported = "speechSynthesis" in window;
    setSpeechSupported(supported);
    speechSupportedRef.current = supported;
  }, []);

  useEffect(() => {
    audioOnRef.current = audioOn;
  }, [audioOn]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`translation_captions:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "translation_captions",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const caption = payload.new as Caption;
          setCaptions((prev) => [...prev, caption]);
          if (audioOnRef.current && speechSupportedRef.current) {
            const utterance = new SpeechSynthesisUtterance(caption.translated_text);
            utterance.lang = targetLang;
            window.speechSynthesis.speak(utterance);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, targetLang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [captions]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {speechSupported ? (
          <Button
            variant={audioOn ? "outline" : "default"}
            onClick={() => {
              if (!audioOn) window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
              setAudioOn((v) => !v);
            }}
          >
            {audioOn ? "🔊 已開啟語音（點擊關閉）" : "🔇 開啟語音朗讀"}
          </Button>
        ) : (
          <p className="text-muted-foreground text-sm">此瀏覽器不支援語音朗讀，僅顯示字幕。</p>
        )}
        {sessionActive ? (
          <span className="text-sm text-green-700">● 場次進行中</span>
        ) : (
          <span className="text-muted-foreground text-sm">場次已結束</span>
        )}
      </div>

      <div className="space-y-2">
        {captions.length === 0 && (
          <p className="text-muted-foreground text-sm">等待講者開始…</p>
        )}
        {captions.map((c) => (
          <div key={c.id} className="rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">{c.source_text}</p>
            <p className="text-lg font-medium">{c.translated_text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
