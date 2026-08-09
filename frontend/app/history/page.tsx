"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, MessageSquare, ArrowLeft, Trash2 } from "lucide-react";
import { getCheckIns, CheckInItem } from "@/lib/history";
import SeverityBadge from "@/components/SeverityBadge";

export default function HistoryPage() {
  const [history, setHistory] = useState<CheckInItem[]>([]);

  useEffect(() => {
    setHistory(getCheckIns());
  }, []);

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your symptom check history?")) {
      localStorage.removeItem("sahayak_chat_history");
      setHistory([]);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8 animate-fade-up max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Clock className="w-6 h-6 text-teal-600" />
              Symptom Check History
            </h1>
            <p className="text-xs text-gray-500">Your past AI health consultations and triage logs</p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-xs">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No History Recorded</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1 mb-4">
            Perform your first symptom check in the Chat assistant to view history logs here.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold text-xs px-5 py-2.5 rounded-full shadow-sm hover:shadow-md active:scale-95 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            Start Symptom Check
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400 font-medium">{item.date}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-snug">
                  {item.symptom}
                </p>
                {item.advice && (
                  <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 p-2 rounded-lg border border-gray-100 mt-1">
                    {item.advice}
                  </p>
                )}
              </div>

              <div className="flex-shrink-0 self-start sm:self-center">
                <SeverityBadge severity={item.severity} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
