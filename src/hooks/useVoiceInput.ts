"use client";

import { useCallback, useMemo, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
};

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

export function useVoiceInput(onText: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const supported = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }
    const speechWindow = window as SpeechWindow;
    return Boolean(speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition);
  }, []);

  const start = useCallback(() => {
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "ja-JP";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const result = event.results[0]?.[0]?.transcript;
      if (result) {
        onText(result);
      }
    };
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  }, [onText]);

  return { supported, listening, start };
}
