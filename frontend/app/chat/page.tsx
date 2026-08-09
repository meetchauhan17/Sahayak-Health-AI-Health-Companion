"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Send, Activity, ChevronDown, Mic, FileText, RefreshCw, Users, Copy, Check, PlusCircle } from "lucide-react";
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
  isError?: boolean;
}

type Language = "English" | "हिंदी" | "ગુજરાતી";

const LANGUAGES: Language[] = ["English", "हिंदी", "ગુજરાતી"];

// ─── Symptom Chips — no emojis ──────────────────────────────────────────────

interface Chip {
  label: string;
  message: string;
}

const SYMPTOM_CHIPS: Chip[] = [
  { label: "Fever",           message: "I have had a fever since yesterday, what should I do?" },
  { label: "Cold",            message: "I have a runny nose, sneezing and a sore throat. Could this be a cold?" },
  { label: "Headache",        message: "I have been having a persistent headache for a few hours. What could cause this?" },
  { label: "Stomach Pain",    message: "I am experiencing stomach pain and cramping. What should I do?" },
  { label: "Breathing Issue", message: "I am having difficulty breathing and feel short of breath. Is this serious?" },
  { label: "Vomiting",        message: "I have been vomiting since this morning. What could be the reason and what should I do?" },
  { label: "Cut / Burn",      message: "I have a cut or burn on my skin. How should I treat it at home?" },
  { label: "Fatigue",         message: "I have been feeling extremely tired and fatigued for the past few days. What might be causing this?" },
];

function SymptomChips({ onChipClick, disabled }: { onChipClick: (msg: string) => void; disabled: boolean }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {SYMPTOM_CHIPS.map((chip) => (
        <button
          key={chip.label}
          onClick={() => onChipClick(chip.message)}
          disabled={disabled}
          className="flex-shrink-0 text-xs font-semibold text-gray-600 bg-gray-100 rounded-md px-3 py-1.5 hover:bg-blue-500 hover:text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

// ─── Typing Indicator ───────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center">
        <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>
      <div className="bg-gray-100 rounded-md px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

// ─── Error Bubble ────────────────────────────────────────────────────────────

function ErrorBubble({ message, onRetry }: { message: Message; onRetry: () => void }) {
  return (
    <div className="flex items-end gap-2.5 mb-4 flex-row animate-msg-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-red-500 flex items-center justify-center">
        <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>
      <div className="max-w-[75%] sm:max-w-[65%] px-4 py-3 text-sm leading-relaxed bg-red-50 border-2 border-red-500 rounded-md">
        <p className="text-red-700 mb-3">{message.content}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-md px-3 py-1.5 transition-all duration-200 hover:scale-105"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      </div>
    </div>
  );
}

// ─── Chat Bubble ─────────────────────────────────────────────────────────────

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
        className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold ${
          isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
        }`}
      >
        {isUser ? (
          "U"
        ) : (
          <Activity className="w-4 h-4 text-gray-600" strokeWidth={2.5} />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`relative group max-w-[75%] sm:max-w-[65%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap rounded-md ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        {message.content}

        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 p-1 rounded-md bg-white hover:bg-gray-200 text-gray-500"
            title="Copy response"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        )}

        {!isUser && message.severity && (
          <div className="mt-3">
            <SeverityBadge severity={message.severity} />
          </div>
        )}
        {!isUser && message.severity &&
          ["yellow", "red", "medium", "high"].includes(message.severity.toLowerCase()) && (
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
        className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md px-3 py-2 hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {language}
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-36 bg-white border-2 border-gray-100 rounded-md z-50 overflow-hidden">
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
              className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                lang === language
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
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

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const profile = getUserProfile();
    if (profile?.name) {
      setUserName(`, ${profile.name}`);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center px-6 py-16 select-none">
      <div className="w-16 h-16 rounded-md bg-blue-500 flex items-center justify-center mb-6">
        <Activity className="w-8 h-8 text-white" strokeWidth={2.5} />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Hello{userName}! How can I help you today?
      </h2>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
        Describe your symptoms or ask a health question. I&apos;ll assist you in your preferred language.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {[
          "I have a headache and fever",
          "मुझे सिरदर्द है",
          "મને માથાનો દુખાવો છે",
        ].map((hint) => (
          <span
            key={hint}
            className="text-xs bg-gray-100 text-gray-600 rounded-md px-3 py-1.5 font-medium"
          >
            {hint}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function ChatInner() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<Language>("English");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const forMemberId = searchParams.get("for");
  const [forMember, setForMember] = useState<FamilyMember | null>(null);

  useEffect(() => {
    const profile = getUserProfile();
    if (profile?.language) {
      setLanguage(profile.language);
    }
    if (forMemberId) {
      const members = getFamilyMembers();
      const found = members.find((m) => m.id === forMemberId) ?? null;
      setForMember(found);
    }
  }, [forMemberId]);

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://sahayak-health-ai-health-companion-production.up.railway.app").replace(/\/+$/, "");

  const [summaryData, setSummaryData]       = useState<HealthSummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError]     = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastFailedQueryRef = useRef<string>("");

  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isListening, setIsListening]             = useState(false);
  const [voiceError, setVoiceError]               = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" &&
        (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      setIsSpeechSupported(true);
    }
  }, []);

  const speechLocale = useCallback(() => {
    if (language === "हिंदी")   return "hi-IN";
    if (language === "ગુજરાતી") return "gu-IN";
    return "en-IN";
  }, [language]);

  const toggleVoice = useCallback(() => {
    if (!isSpeechSupported) return;
    setVoiceError(null);

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
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.style.height =
          Math.min(inputRef.current.scrollHeight, 120) + "px";
        inputRef.current.focus();
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech") {
        // Silent
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

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendWithText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_BASE}/api/chat`,
        { message: trimmed, language },
        { timeout: 15000 },
      );

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response ?? data.message ?? JSON.stringify(data),
        severity: data.severity,
      };

      setMessages((prev) => [...prev, aiMsg]);
      lastFailedQueryRef.current = "";

      try {
        recordCheckIn();
        addHistoryEntry({
          date: new Date().toISOString(),
          symptom_query: trimmed,
          ai_response: data.response ?? data.message ?? "",
          severity: data.severity || "yellow",
          familyMemberId: forMember?.id,
        });
      } catch (err) {
        console.error("Failed to record check-in history:", err);
      }
    } catch (err) {
      console.warn("Backend API unreachable, utilizing client-side medical triage fallback:", err);

      const isRed = /chest|pain|breath|seizure|bleed|छाती|સાતી/i.test(trimmed);
      const isYellow = /fever|cough|headache|stomach|vomit|बुखार|सिरदर्द|તાવ|દુખાવો/i.test(trimmed);

      const fallbackSeverity = isRed ? "red" : isYellow ? "yellow" : "green";
      let fallbackText = "Please ensure adequate rest, hydration, and monitor your symptoms closely. Consult a doctor if you feel unwell.";

      if (language === "हिंदी") {
        fallbackText = isRed
          ? "यह एक गंभीर स्थिति हो सकती है। कृपया तुरंत 108 एम्बुलेंस या निकटतम अस्पताल से संपर्क करें।"
          : "कृपया पर्याप्त आराम करें और तरल पदार्थ पिएं। यदि लक्षण बने रहते हैं तो डॉक्टर से सलाह लें।";
      } else if (language === "ગુજરાતી") {
        fallbackText = isRed
          ? "આ એક કટોકટીની સ્થિતિ હોઈ શકે છે. કૃપા કરીને તાત્કાલિક 108 અથવા નજીકની હોસ્પિટલનો સંપર્ક કરો."
          : "કૃપા કરીને પૂરતો આરામ કરો અને પાણી પીઓ. જો લક્ષણો ચાલુ રહે તો ડૉક્ટરની સલાહ લો.";
      }

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: fallbackText,
        severity: fallbackSeverity,
      };

      setMessages((prev) => [...prev, aiMsg]);
      lastFailedQueryRef.current = "";

      try {
        recordCheckIn();
        addHistoryEntry({
          date: new Date().toISOString(),
          symptom_query: trimmed,
          ai_response: fallbackText,
          severity: fallbackSeverity,
          familyMemberId: forMember?.id,
        });
      } catch (e) {
        console.error("Failed to save fallback history:", e);
      }
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const retryLastQuery = () => {
    const query = lastFailedQueryRef.current;
    if (!query) return;
    setMessages((prev) => prev.filter((m) => !m.isError));
    sendWithText(query);
  };

  const sendMessage = () => sendWithText(input);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const canSend = input.trim().length > 0 && !loading;

  const fetchSummary = async () => {
    if (messages.length < 3 || summaryLoading) return;
    setSummaryLoading(true);
    setSummaryError(null);
    setSummaryData(null);
    try {
      const payload = messages.map((m) => ({ role: m.role, content: m.content }));
      const { data } = await axios.post(
        `${API_BASE}/api/summary`,
        { conversation: payload },
        { timeout: 15000 }
      );
      const normalized: HealthSummaryData = {
        primary_symptom: data.primary_symptom || data.symptoms_discussed || "Symptom evaluation",
        possible_causes: data.possible_causes || data.advice_given || "General health consultation",
        recommended_action: data.recommended_action || data.recommendation || "Consult a healthcare professional for diagnosis.",
        severity: data.severity || data.overall_severity || "yellow",
      };
      setSummaryData(normalized);
    } catch (err) {
      console.warn("Backend summary API unreachable, generating client-side summary:", err);
      const userQueries = messages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join("; ");
      const assistantReplies = messages
        .filter((m) => m.role === "assistant" && !m.isError)
        .map((m) => m.content)
        .join(" ");

      const isRed = /chest|pain|breath|seizure|bleed|emergency|108/i.test(userQueries + assistantReplies);
      const isYellow = /fever|cough|headache|stomach|vomit|doctor/i.test(userQueries + assistantReplies);
      const fallbackSev = isRed ? "red" : isYellow ? "yellow" : "green";

      setSummaryData({
        primary_symptom: userQueries || "Symptoms discussed in consultation",
        possible_causes: "Common health symptoms evaluated during chat session.",
        recommended_action: isRed
          ? "Seek immediate medical attention or call emergency services (108)."
          : isYellow
          ? "Consult a qualified medical practitioner if symptoms persist."
          : "Ensure adequate rest, hydration, and monitor your condition.",
        severity: fallbackSev,
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen bg-white">
      {/* ── Sub Header ── */}
      <header className="flex-shrink-0 bg-white border-b-2 border-gray-100 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
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
                className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-all duration-200 hover:scale-105"
                title="Start a new chat session"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                New Chat
              </button>
            )}
            <LanguageSelector language={language} onChange={setLanguage} />
          </div>
        </div>

        {/* Family member banner */}
        {forMember && (
          <div className="bg-blue-500 px-4 py-2">
            <div className="max-w-3xl mx-auto flex items-center gap-2 text-xs font-semibold text-white">
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              Checking symptoms for{" "}
              <span className="font-bold">{forMember.name}</span>
              <span className="text-blue-100">({forMember.relation}, {forMember.age} yrs)</span>
              <span className="ml-auto text-[10px] font-medium text-blue-200">
                History saved separately
              </span>
            </div>
          </div>
        )}
      </header>

      {/* ── Messages ── */}
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col min-h-full">
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

          {summaryLoading && (
            <div className="flex items-center gap-2 text-sm text-blue-500 py-4 justify-center font-semibold">
              <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Generating summary...
            </div>
          )}
          {summaryError && (
            <p className="text-center text-xs text-red-500 py-2 font-semibold">{summaryError}</p>
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
      <footer className="flex-shrink-0 bg-white border-t-2 border-gray-100">
        <div className="max-w-3xl mx-auto px-4 pt-3 pb-1">
          {/* Summary button */}
          {messages.length >= 3 && (
            <div className="flex justify-end mb-2">
              <button
                onClick={fetchSummary}
                disabled={summaryLoading || loading}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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

          {/* Symptom chips */}
          <SymptomChips onChipClick={sendWithText} disabled={loading} />
        </div>

        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-end gap-2 bg-gray-100 rounded-md px-4 py-2 focus-within:bg-white focus-within:border-2 focus-within:border-blue-500 transition-all duration-200">
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
              className="flex-1 resize-none bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none leading-relaxed max-h-[120px] overflow-y-auto font-medium"
              disabled={loading}
              autoFocus
            />

            {/* Mic button */}
            {isSpeechSupported && (
              <button
                type="button"
                onClick={toggleVoice}
                disabled={loading}
                aria-label={isListening ? "Stop recording" : "Start voice input"}
                className={`flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-105 ${
                  loading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed hover:scale-100"
                    : isListening
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={sendMessage}
              disabled={!canSend}
              aria-label="Send message"
              className={`flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200 ${
                canSend
                  ? "bg-blue-500 hover:bg-blue-600 text-white hover:scale-105"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {voiceError && (
            <p className="text-center text-xs text-red-500 mt-2 font-semibold">{voiceError}</p>
          )}

          <p className="text-center text-xs text-gray-400 mt-2">
            Press{" "}
            <kbd className="font-mono bg-gray-100 rounded px-1 text-[10px] text-gray-600">
              Enter
            </kbd>{" "}
            to send · Shift+Enter for new line
          </p>
        </div>

        {/* Emergency disclaimer */}
        <div className="border-t-2 border-gray-100 bg-gray-50 px-4 py-2">
          <p className="text-center text-[10px] text-gray-400 leading-relaxed max-w-2xl mx-auto">
            This is an AI assistant for general guidance only and is{" "}
            <strong className="text-gray-500">not</strong> a substitute for professional medical advice.
            In an emergency, call your local emergency number immediately.
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
