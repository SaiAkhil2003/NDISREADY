"use client";

import { CircleAlert, Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type VoiceRecorderProps = {
  value: string;
  onChange: (value: string) => void;
  onTranscriptReady: (text: string) => void;
  disabled?: boolean;
};

type BrowserSpeechRecognitionAlternative = {
  transcript: string;
};

type BrowserSpeechRecognitionResult = ArrayLike<BrowserSpeechRecognitionAlternative> & {
  isFinal: boolean;
};

type BrowserSpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<BrowserSpeechRecognitionResult>;
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function VoiceRecorder({
  value,
  onChange,
  onTranscriptReady,
  disabled = false,
}: VoiceRecorderProps) {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const baseTranscriptRef = useRef("");
  const finalTranscriptRef = useRef("");
  const shouldEmitTranscriptRef = useRef(false);

  const [hasSpeechRecognition, setHasSpeechRecognition] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState("");

  useEffect(() => {
    setHasSpeechRecognition(Boolean(getRecognitionConstructor()));
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  function startRecording() {
    const Recognition = getRecognitionConstructor();

    if (!Recognition || disabled) {
      setHasSpeechRecognition(false);
      return;
    }

    recognitionRef.current?.stop();

    const recognition = new Recognition();
    baseTranscriptRef.current = value.trim();
    finalTranscriptRef.current = "";
    shouldEmitTranscriptRef.current = false;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-AU";

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript?.trim() ?? "";

        if (!transcript) {
          continue;
        }

        if (result.isFinal) {
          finalTranscriptRef.current = appendTranscript(finalTranscriptRef.current, transcript);
          shouldEmitTranscriptRef.current = true;
          continue;
        }

        interimTranscript = appendTranscript(interimTranscript, transcript);
      }

      onChange(
        buildTranscriptValue({
          baseTranscript: baseTranscriptRef.current,
          finalTranscript: finalTranscriptRef.current,
          interimTranscript,
        }),
      );
    };

    recognition.onerror = (event) => {
      setSpeechError(getSpeechErrorMessage(event.error));
      setIsRecording(false);
    };

    recognition.onend = () => {
      const finalTranscript = buildTranscriptValue({
        baseTranscript: baseTranscriptRef.current,
        finalTranscript: finalTranscriptRef.current,
        interimTranscript: "",
      });

      recognitionRef.current = null;
      setIsRecording(false);
      onChange(finalTranscript);

      if (shouldEmitTranscriptRef.current && finalTranscript.trim()) {
        onTranscriptReady(finalTranscript.trim());
      }
    };

    setSpeechError("");
    setIsRecording(true);
    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopRecording() {
    recognitionRef.current?.stop();
  }

  if (hasSpeechRecognition === false) {
    return (
      <Card className="dashboard-surface">
        <CardHeader>
          <CardTitle>Support details</CardTitle>
          <CardDescription>
            Speech recognition is not available in this browser, so manual entry is being used.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            rows={10}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="field-textarea min-h-[120px] w-full"
            placeholder="Type the shift details, participant progress, incidents, or follow-up actions."
          />
          <p className="text-base leading-7 text-slate-500">
            When you are ready, generate a draft note from the typed transcript below.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dashboard-surface">
      <CardHeader>
        <CardTitle>Voice capture</CardTitle>
        <CardDescription>
          Record a progress update with the browser Speech API or edit the transcript manually.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <Button
            type="button"
            size="lg"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            className={cn(
              "mx-auto size-16 rounded-full p-0",
              isRecording ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700",
            )}
          >
            {isRecording ? <Square className="size-6" /> : <Mic className="size-6" />}
          </Button>
          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-900">
              {isRecording ? "Stop recording" : "Start recording"}
            </p>
            <p className="text-base text-slate-500">
              {isRecording ? "Recording in progress" : "Tap the button and speak clearly"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="flex items-center justify-center gap-3 md:justify-start">
            <div
              className={cn(
                "flex items-end gap-1 text-blue-600 transition-opacity",
                isRecording ? "opacity-100" : "opacity-40",
              )}
            >
              <span className="h-3 w-1.5 rounded-full bg-current animate-pulse" />
              <span className="h-5 w-1.5 rounded-full bg-current animate-pulse [animation-delay:120ms]" />
              <span className="h-4 w-1.5 rounded-full bg-current animate-pulse [animation-delay:240ms]" />
            </div>
            <p className="text-base font-medium text-slate-700">
              {isRecording ? "Recording..." : "Recorder ready"}
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            {isRecording ? "Live transcript" : "Browser native"}
          </p>
        </div>

        <Textarea
          rows={10}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Transcript appears here while recording. You can also type or correct the text manually."
          className="min-h-[120px] w-full"
        />

        {speechError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-base text-rose-950">
            <div className="flex flex-col gap-3 md:flex-row md:items-start">
              <CircleAlert className="mt-0.5 size-5 shrink-0" />
              <p>{speechError}</p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function appendTranscript(currentValue: string, nextValue: string) {
  return [currentValue.trim(), nextValue.trim()].filter(Boolean).join(" ").trim();
}

function buildTranscriptValue(input: {
  baseTranscript: string;
  finalTranscript: string;
  interimTranscript: string;
}) {
  const capturedTranscript = [input.finalTranscript, input.interimTranscript]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" ")
    .trim();

  if (!input.baseTranscript.trim()) {
    return capturedTranscript;
  }

  if (!capturedTranscript) {
    return input.baseTranscript.trim();
  }

  return `${input.baseTranscript.trim()}\n${capturedTranscript}`;
}

function getRecognitionConstructor() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function getSpeechErrorMessage(error: string | undefined) {
  switch (error) {
    case "audio-capture":
      return "No microphone was detected. Check browser permissions and the device input.";
    case "not-allowed":
      return "Microphone access was blocked. Allow microphone access and try recording again.";
    case "no-speech":
      return "No speech was detected. Try again and speak clearly after recording starts.";
    default:
      return "Speech recognition stopped unexpectedly. You can keep typing in the transcript box.";
  }
}
