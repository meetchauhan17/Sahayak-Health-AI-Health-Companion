"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Send, Heart, ChevronDown, Mic, FileText, X, RefreshCw, Users, Copy, Check, PlusCircle } from "lucide-react";
import SeverityBadge from "@/components/SeverityBadge";
import HospitalFinder from "@/components/HospitalFinder";
import HealthSummary, { type HealthSummaryData } from "@/components/HealthSummary";
import { getUserProfile, saveUserProfile } from "@/lib/userProfile";
import { recordCheckIn } from "@/lib/streak";
import { addHistoryEntry } from "@/lib/history";
import { getFamilyMembers, FamilyMember } from "@/lib/family";

// Allow TypeScript to see webkitSpeechRecognition on window
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// ─── Types ─────────────────────────────────────────────────────────────────

type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
  severity?: string;
  isError?: boolean;   // true for network/server error bubbles
}

type Language = "English" | "हिंदी" | "ગુજરાતી";

const LANGUAGES: Language[] = ["English", "हिंदी", "ગુજરાતી"];

// ─── Symptom Chips ──────────────────────────────────────────────────────────

interface Chip {
  emoji: string;
  label: string;
  message: string;
}

const SYMPTOM_CHIPS: Chip[] = [
  { emoji: "🤒", label: "Fever",          message: "I have had a fever since yesterday, what should I do?" },
  { emoji: "🤧", label: "Cold",           message: "I have a runny nose, sneezing and a sore throat. Could this be a cold?" },
  { emoji: "🤕", label: "Headache",       message: "I have been having a persistent headache for a few hours. What could cause this?" },
  { emoji: "🤢", label: "Stomach Pain",   message: "I am experiencing stomach pain and cramping. What should I do?" },
  { emoji: "😮‍💨", label: "Breathing Issue", message: "I am having difficulty breathing and feel short of breath. Is this serious?" },
  { emoji: "🤮", label: "Vomiting",       message: "I have been vomiting since this morning. What could be the reason and what should I do?" },
  { emoji: "🩹", label: "Cut/Burn",       message: "I have a cut or burn on my skin. How should I treat it at home?" },
  { emoji: "😴", label: "Fatigue",        message: "I have been feeling extremely tired and fatigued for the past few days. What might be causing this?" },
];

function SymptomChips({ onChipClick, disabled }: { onChipClick: (msg: string) => void; disabled: boolean }) {
  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
    >
      {SYMPTOM_CHIPS.map((chip) => (
        <button
          key={chip.label}
          onClick={() => onChipClick(chip.message)}
          disabled={disabled}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>{chip.emoji}</span>
          <span>{chip.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Typing Indicator ───────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950/80 flex items-center justify-center">
        <Heart className="w-4 h-4 text-teal-600 dark:text-teal-400" />
      </div>
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <span
            className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Error Bubble (with Retry) ──────────────────────────────────────────────

function ErrorBubble({
  message,
  onRetry,
}: {
  message: Message;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-end gap-2.5 mb-4 flex-row animate-msg-in">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/80 flex items-center justify-center shadow-sm">
        <Heart className="w-4 h-4 text-red-400" />
      </div>

      {/* Bubble */}
      <div className="max-w-[75%] sm:max-w-[65%] px-4 py-3 shadow-sm text-sm leading-relaxed bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl rounded-bl-sm">
        <p className="text-red-700 dark:text-red-300 mb-2">{message.content}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-300 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-700 rounded-full px-3 py-1 hover:bg-red-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      </div>
    </div>
  );
}

// ─── Chat Bubble ────────────────────────────────────────────────────────────

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex items-end gap-2.5 mb-4 animate-msg-in ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300"
        }`}
      >
        {isUser ? (
          "U"
        ) : (
          <Heart className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`relative group max-w-[75%] sm:max-w-[65%] px-4 py-3 shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-blue-500 text-white rounded-2xl rounded-br-sm"
            : "bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm"
        }`}
      >
        {message.content}

        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 rounded-md bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-500 dark:text-gray-300 text-[10px] flex items-center gap-1"
            title="Copy response"
          >
            {copied ? (
              <Check className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        )}

        {!isUser && message.severity && (
          <div className="mt-2.5">
            <SeverityBadge severity={message.severity} />
          </div>
        )}
        {!isUser && message.severity && ["yellow", "red", "medium", "high"].includes(message.severity.toLowerCase()) && (
          <HospitalFinder />
        )}
      </div>
    </div>
  );
}

// ─── Language Selector ──────────────────────────────────────────────────────

function LanguageSelector({
  language,
  onChange,
}: {
  language: Language;
  onChange: (lang: Language) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {language}
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                onChange(lang);
                const currentProfile = getUserProfile();
                if (currentProfile) {
                  saveUserProfile({ ...currentProfile, language: lang });
                }
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                lang === language
                  ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const profile = getUserProfile();
    if (profile?.name) {
      setUserName(`, ${profile.name}`);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center px-6 py-12 select-none">
      <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-950/80 flex items-center justify-center mb-4">
        <Heart className="w-8 h-8 text-teal-500 dark:text-teal-400" />
      </div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
        Hello{userName}! How can I help you today?
      </h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xs">
        Describe your symptoms or ask a health question. I&apos;ll do my best to
        assist you in your preferred language.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {[
          "I have a headache and fever",
          "मुझे सिरदर्द है",
          "મને માથાનો દુખાવો છે",
        ].map((hint) => (
          <span
            key={hint}
            className="text-xs bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 rounded-full px-3 py-1"
          >
            {hint}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

function ChatInner() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<Language>("English");
  const [loading, setLoading] = useState(false);

  // Family member context from ?for= query param
  const searchParams = useSearchParams();
  const forMemberId = searchParams.get("for");
  const [forMember, setForMember] = useState<FamilyMember | null>(null);

  useEffect(() => {
    const profile = getUserProfile();
    if (profile?.language) {
      setLanguage(profile.language);
    }
    // Resolve family member from ?for= param
    if (forMemberId) {
      const members = getFamilyMembers();
      const found = members.find((m) => m.id === forMemberId) ?? null;
      setForMember(found);
    }
  }, [forMemberId]);

  // Base URL for backend API — set NEXT_PUBLIC_API_URL in .env.local for production
  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  // ── Health Summary state ──────────────────────────────────────────────────
  const [summaryData, setSummaryData]       = useState<HealthSummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError]     = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // Stores the last query that failed so Retry can resend it
  const lastFailedQueryRef = useRef<string>("");

  // ── Voice input state ─────────────────────────────────────────────────────
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isListening, setIsListening]             = useState(false);
  const [voiceError, setVoiceError]               = useState<string | null>(null);

  // Detect Web Speech API support once on mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined" &&
        (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      setIsSpeechSupported(true);
    }
  }, []);

  // Map selected language → BCP-47 locale for speech recognition
  const speechLocale = useCallback(() => {
    if (language === "हिंदी")   return "hi-IN";
    if (language === "ગુજરાતી") return "gu-IN";
    return "en-IN";
  }, [language]);

  const toggleVoice = useCallback(() => {
    if (!isSpeechSupported) return;
    setVoiceError(null);

    // Stop if already listening
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang            = speechLocale();
    recognition.interimResults  = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
      // Resize textarea to fit new content
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.style.height =
          Math.min(inputRef.current.scrollHeight, 120) + "px";
        inputRef.current.focus();
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech") {
        // Silent — user just didn't speak
      } else if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setVoiceError("Microphone access denied. Please allow microphone permission.");
      } else {
        setVoiceError("Voice input unavailable");
      }
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSpeechSupported, isListening, speechLocale]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Core send logic – accepts an explicit text override so chips can
  // pass their message directly without a React state timing race.
  const sendWithText = async (text: string) => {
    const trimmed = text.trim();
    // Guard: block empty / whitespace-only messages and duplicate requests
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_BASE}/api/chat`,
        { message: trimmed, language },
        { timeout: 15000 },  // 15 s client-side timeout
      );

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response ?? data.message ?? JSON.stringify(data),
        severity: data.severity,
      };

      setMessages((prev) => [...prev, aiMsg]);
      lastFailedQueryRef.current = "";  // clear on success

      // Record daily streak and save to history
      try {
        recordCheckIn();
        addHistoryEntry({
          date: new Date().toISOString(),
          symptom_query: trimmed,
          ai_response: data.response ?? data.message ?? "",
          severity: data.severity || "yellow",
          // Tag with family member ID if checking for someone else
          familyMemberId: forMember?.id,
        });
      } catch (err) {
        console.error("Failed to record check-in history:", err);
      }
    } catch (err) {
      // Record which query failed so the Retry button can resend it
      lastFailedQueryRef.current = trimmed;

      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Something went wrong — please try again.",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
      console.error("Chat API error:", err);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Retry the last failed query
  const retryLastQuery = () => {
    const query = lastFailedQueryRef.current;
    if (!query) return;
    // Remove the last error bubble before resending
    setMessages((prev) => prev.filter((m) => !m.isError));
    sendWithText(query);
  };

  // Sends whatever is currently in the input box
  const sendMessage = () => sendWithText(input);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const canSend = input.trim().length > 0 && !loading;

  // ── Fetch conversation summary from /api/summary ─────────────────────────
  const fetchSummary = async () => {
    if (messages.length < 3 || summaryLoading) return;
    setSummaryLoading(true);
    setSummaryError(null);
    setSummaryData(null);
    try {
      const payload = messages.map((m) => ({ role: m.role, content: m.content }));
      const { data } = await axios.post(`${API_BASE}/api/summary`, {
        conversation: payload,
      });
      setSummaryData(data);
    } catch {
      setSummaryError("Could not generate summary. Please try again.");
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* ── Sub Header ── */}
      <header className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shadow-2xs z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Health Assistant
            </span>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={() => {
                  setMessages([]);
                  setSummaryData(null);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 bg-gray-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl transition-colors"
                title="Start a new chat session"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </button>
            )}
            {/* Language selector */}
            <LanguageSelector language={language} onChange={setLanguage} />
          </div>
        </div>

        {/* Family member banner */}
        {forMember && (
          <div className="bg-teal-50 dark:bg-teal-950/80 border-t border-teal-100 dark:border-teal-800/80 px-4 py-2">
            <div className="max-w-3xl mx-auto flex items-center gap-2 text-xs font-semibold text-teal-800 dark:text-teal-200">
              <Users className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
              Checking symptoms for{" "}
              <span className="font-bold">{forMember.name}</span>
              <span className="text-teal-600 dark:text-teal-400">({forMember.relation}, {forMember.age} yrs)</span>
              <span className="ml-auto text-[10px] font-normal text-teal-600 dark:text-teal-400">
                History saved separately
              </span>
            </div>
          </div>
        )}
      </header>

      {/* ── Messages ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-4 flex flex-col min-h-full">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {messages.map((msg) =>
                msg.isError ? (
                  <ErrorBubble key={msg.id} message={msg} onRetry={retryLastQuery} />
                ) : (
                  <ChatBubble key={msg.id} message={msg} />
                )
              )}
              {loading && <TypingIndicator />}
            </>
          )}

          {/* Health Summary card rendered inline above scroll anchor */}
          {summaryLoading && (
            <div className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 py-4 justify-center">
              <span className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              Generating summary…
            </div>
          )}
          {summaryError && (
            <p className="text-center text-xs text-red-500 py-2">{summaryError}</p>
          )}
          {summaryData && (
            <div className="mb-4">
              <HealthSummary
                summary={summaryData}
                onClose={() => setSummaryData(null)}
                familyMemberId={forMember?.id}
                familyMemberName={forMember?.name}
                familyMemberRelation={forMember?.relation}
              />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* ── Input Area ── */}
      <footer className="flex-shrink-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-1px_8px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto px-4 pt-3 pb-1">
          {/* Get Health Summary button — appears once 3+ messages exist */}
          {messages.length >= 3 && (
            <div className="flex justify-end mb-2">
              <button
                onClick={fetchSummary}
                disabled={summaryLoading || loading}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-1.5 rounded-full shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {summaryLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                {summaryLoading ? "Generating..." : "Get Health Summary"}
              </button>
            </div>
          )}

          {/* Symptom quick-select chips */}
          <SymptomChips onChipClick={sendWithText} disabled={loading} />
        </div>
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-end gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 dark:focus-within:ring-teal-900 transition-all">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                language === "हिंदी"
                  ? "अपना सवाल यहाँ लिखें..."
                  : language === "ગુજરાતી"
                    ? "તમારો પ્રશ્ન અહીં લખો..."
                    : "Describe your symptoms..."
              }
              className="flex-1 resize-none bg-transparent text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none leading-relaxed max-h-[120px] overflow-y-auto"
              disabled={loading}
              autoFocus
            />

            {/* Mic button — hidden if Web Speech API is not supported */}
            {isSpeechSupported && (
              <button
                type="button"
                onClick={toggleVoice}
                disabled={loading}
                aria-label={isListening ? "Stop recording" : "Start voice input"}
                className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  loading
                    ? "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed"
                    : isListening
                      ? "bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 hover:text-gray-700 dark:hover:text-white"
                }`}
              >
                {isListening ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            )}

            <button
              onClick={sendMessage}
              disabled={!canSend}
              aria-label="Send message"
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                canSend
                  ? "bg-teal-500 hover:bg-teal-600 text-white shadow-sm hover:shadow-md active:scale-95"
                  : "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Voice error feedback */}
          {voiceError && (
            <p className="text-center text-xs text-red-500 mt-1">{voiceError}</p>
          )}

          <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-1.5">
            Press{" "}
            <kbd className="font-mono bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded px-1 text-[10px] text-gray-600 dark:text-gray-300">
              Enter
            </kbd>{" "}
            to send · Shift+Enter for new line
          </p>
        </div>

        {/* ── Emergency disclaimer strip ── */}
        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-950 px-4 py-2">
          <p className="text-center text-[10px] text-gray-400 dark:text-slate-500 leading-relaxed max-w-2xl mx-auto">
            This is an AI assistant for general guidance only and is{" "}
            <strong className="text-gray-500 dark:text-slate-400">not</strong> a substitute for professional medical advice.
            {" "}In an emergency, call your local emergency number immediately.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <ChatInner />
    </Suspense>
  );
}
