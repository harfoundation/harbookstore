"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addTranslationCaption, endTranslationSession } from "@/lib/actions/live-translate";
import { languageLabel } from "@/lib/translation/languages";

// The Web Speech API (SpeechRecognition) isn't in TypeScript's standard DOM
// lib — it's a long-standing Chrome/Edge-only feature, never fully
// standardized. Declaring just the shape this component actually uses
// rather than fighting for full ambient types.
type SpeechRecognitionResultLike = { transcript: string };
type SpeechRecognitionResultListLike = {
  length: number;
  [index: number]: { isFinal: boolean; [index: number]: SpeechRecognitionResultLike };
};
type SpeechRecognitionEventLike = { resultIndex: number; results: SpeechRecognitionResultListLike };
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionLike)
    | null;
}

type CaptionLine = { id: string; sourceText: string; translatedText: string };

export function SpeakerPanel({
  sessionId,
  sourceLang,
  targetLang,
}: {
  sessionId: string;
  sourceLang: string;
  targetLang: string;
}) {
  const router = useRouter();
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [lines, setLines] = useState<CaptionLine[]>([]);
  const [ending, setEnding] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const listeningRef = useRef(false);

  useEffect(() => {
    setSupported(getSpeechRecognitionCtor() !== null);
  }, []);

  function start() {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = sourceLang;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          void (async () => {
            const res = await addTranslationCaption(sessionId, transcript);
            if (!res.success) {
              toast.error(res.error);
              return;
            }
            setLines((prev) => [
              ...prev,
              { id: crypto.randomUUID(), sourceText: transcript, translatedText: res.translatedText },
            ]);
          })();
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      toast.error(`語音辨識錯誤：${event.error}`);
    };

    // Chrome stops recognition after a pause even in continuous mode —
    // restart automatically while the speaker hasn't explicitly stopped.
    recognition.onend = () => {
      if (listeningRef.current) recognition.start();
    };

    recognitionRef.current = recognition;
    listeningRef.current = true;
    setListening(true);
    recognition.start();
  }

  function stop() {
    listeningRef.current = false;
    setListening(false);
    setInterimText("");
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }

  useEffect(() => stop, []);

  if (!supported) {
    return (
      <p className="text-destructive text-sm">
        此瀏覽器不支援語音辨識功能，請使用電腦版 Chrome 或 Edge 開啟此頁面。
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={listening ? stop : start} variant={listening ? "outline" : "default"}>
          {listening ? "停止收音" : "開始收音"}
        </Button>
        <Button
          variant="outline"
          disabled={ending}
          onClick={async () => {
            setEnding(true);
            stop();
            const result = await endTranslationSession(sessionId);
            setEnding(false);
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            toast.success("已結束場次");
            router.push("/admin/live-translate");
          }}
        >
          {ending ? "結束中…" : "結束場次"}
        </Button>
        {listening && (
          <span className="text-sm text-green-700">
            ● 收音中（{languageLabel(sourceLang)} → {languageLabel(targetLang)}）
          </span>
        )}
      </div>

      {interimText && (
        <p className="text-muted-foreground rounded border border-dashed p-2 text-sm italic">
          {interimText}…
        </p>
      )}

      <div className="max-h-[60vh] space-y-2 overflow-y-auto">
        {lines
          .slice()
          .reverse()
          .map((line) => (
            <div key={line.id} className="rounded-lg border p-3 text-sm">
              <p className="text-muted-foreground">{line.sourceText}</p>
              <p className="font-medium">{line.translatedText}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
