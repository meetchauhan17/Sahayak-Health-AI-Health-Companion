"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  MessageSquare,
  ArrowLeft,
  Trash2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Users,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import {
  getHistory,
  addHistoryEntry,
  clearHistory as clearStorageHistory,
  HistoryEntry,
} from "@/lib/history";
import { getFamilyMembers, FamilyMember } from "@/lib/family";
import SeverityBadge from "@/components/SeverityBadge";

// Map severity string to numeric values for Recharts (green=1, yellow=2, red=3)
function mapSeverityToValue(sev: string): number {
  const norm = (sev || "").toLowerCase().trim();
  if (norm === "green" || norm === "low" || norm === "self-care") return 1;
  if (norm === "red" || norm === "high" || norm === "emergency") return 3;
  return 2;
}

function mapValueToSeverityLabel(val: number): string {
  if (val === 1) return "Self-Care";
  if (val === 2) return "See Doctor";
  if (val === 3) return "Emergency";
  return "";
}

function formatDate(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoStr;
  }
}

export default function HistoryPage() {
  const [allHistory, setAllHistory] = useState<HistoryEntry[]>([]);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  // "self" = main user; a member id = filter that member; "" = all
  const [filterBy, setFilterBy] = useState<string>("self");

  useEffect(() => {
    setAllHistory(getHistory()); // unfiltered
    setFamilyMembers(getFamilyMembers());
  }, []);

  // Compute the displayed history based on the filter
  const history =
    filterBy === ""
      ? allHistory
      : filterBy === "self"
      ? allHistory.filter((e) => !e.familyMemberId)
      : allHistory.filter((e) => e.familyMemberId === filterBy);

  const handleClearHistory = () => {
    if (
      window.confirm(
        filterBy === ""
          ? "Clear ALL health history? This cannot be undone."
          : filterBy === "self"
          ? "Clear your own health history? Family members' history is kept."
          : `Clear history for ${familyMembers.find((m) => m.id === filterBy)?.name ?? "this member"}? This cannot be undone.`
      )
    ) {
      clearStorageHistory(filterBy === "" ? null : filterBy);
      setAllHistory(getHistory());
      setExpandedIds({});
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Recharts data — chronological order (oldest → newest)
  const chartData = [...history].reverse().map((item) => ({
    date: formatDate(item.date),
    severityVal: mapSeverityToValue(item.severity),
    symptom: item.symptom_query,
  }));

  // Label for the currently selected filter
  const filterLabel =
    filterBy === ""
      ? "Everyone"
      : filterBy === "self"
      ? "Myself"
      : familyMembers.find((m) => m.id === filterBy)?.name ?? "Family Member";

  return (
    <main className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
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
              Health History
            </h1>
            <p className="text-xs text-gray-500">
              Track past symptom consultations and health trends
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3.5 py-2 rounded-xl transition-all active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* ── Family Filter Dropdown ── */}
      <div className="bg-white border border-gray-200/80 rounded-2xl px-4 py-3 mb-4 shadow-xs flex items-center gap-3 flex-wrap">
        <Users className="w-4 h-4 text-teal-600 flex-shrink-0" />
        <span className="text-xs font-semibold text-gray-700">
          Show history for:
        </span>
        <div className="relative">
          <select
            value={filterBy}
            onChange={(e) => { setFilterBy(e.target.value); setExpandedIds({}); }}
            className="appearance-none text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded-xl pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
          >
            <option value="self">Myself</option>
            {familyMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.relation})
              </option>
            ))}
            <option value="">Everyone</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-teal-600 pointer-events-none" />
        </div>
        <span className="text-[11px] text-gray-400">
          {history.length} {history.length === 1 ? "entry" : "entries"} for{" "}
          <strong>{filterLabel}</strong>
        </span>
      </div>

      {/* ── Severity Trend Chart ── */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 mb-6 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            Severity Trend — {filterLabel}
          </h2>
          {history.length >= 3 && (
            <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
              {history.length} Check-ins
            </span>
          )}
        </div>

        {history.length >= 3 ? (
          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  stroke="#cbd5e1"
                />
                <YAxis
                  domain={[1, 3]}
                  ticks={[1, 2, 3]}
                  tickFormatter={mapValueToSeverityLabel}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  stroke="#cbd5e1"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-gray-900 text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1">
                          <p className="font-bold text-teal-300">{d.date}</p>
                          <p className="text-gray-200 truncate max-w-xs">
                            {d.symptom}
                          </p>
                          <p className="font-semibold text-amber-300">
                            Severity: {mapValueToSeverityLabel(d.severityVal)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="severityVal"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#0d9488", strokeWidth: 2, stroke: "#ffffff" }}
                  activeDot={{ r: 6, fill: "#06b6d4" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-6 px-4 text-center bg-gray-50/80 rounded-xl border border-dashed border-gray-200 text-gray-500">
            <Sparkles className="w-5 h-5 text-teal-500 mx-auto mb-1.5" />
            <p className="text-xs font-medium text-gray-700">
              Check in a few more times to see your health trend
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Requires 3+ entries to render the severity chart.
            </p>
          </div>
        )}
      </div>

      {/* ── Timeline ── */}
      {history.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-xs">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">
            No History for {filterLabel}
          </h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1 mb-4">
            {filterBy !== "self" && filterBy !== ""
              ? `Perform a symptom check for ${filterLabel} to record their history.`
              : "Perform symptom checks in the Chat assistant to track health trends here."}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href={
                filterBy !== "self" && filterBy !== ""
                  ? `/chat?for=${filterBy}`
                  : "/chat"
              }
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs hover:shadow-md active:scale-95 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              {filterBy !== "self" && filterBy !== ""
                ? `Check Symptoms for ${filterLabel}`
                : "Start Symptom Check"}
            </Link>

            {/* Demo seed button — only show for "self" with 0 entries */}
            {(filterBy === "self" || filterBy === "") && (
              <button
                type="button"
                onClick={() => {
                  const sampleEntries: HistoryEntry[] = [
                    {
                      id: "demo_1",
                      date: new Date(Date.now() - 86400000 * 2).toISOString(),
                      symptom_query: "I have a mild runny nose and cold",
                      ai_response:
                        "Rest, drink warm fluids like ginger tea or broth, and take over-the-counter decongestants if needed.",
                      severity: "green",
                    },
                    {
                      id: "demo_2",
                      date: new Date(Date.now() - 86400000).toISOString(),
                      symptom_query: "Persistent headache and mild nausea for 2 days",
                      ai_response:
                        "Stay hydrated, rest in a dark room, and consider seeing a doctor if symptoms do not improve within 24 hours.",
                      severity: "yellow",
                    },
                    {
                      id: "demo_3",
                      date: new Date().toISOString(),
                      symptom_query: "Sudden severe chest tightness and breathlessness",
                      ai_response:
                        "Emergency: Seek immediate medical attention or call emergency medical services immediately.",
                      severity: "red",
                    },
                  ];
                  sampleEntries.forEach((entry) => addHistoryEntry(entry));
                  setAllHistory(getHistory());
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 px-4 py-2.5 rounded-xl transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Load Sample Entries
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
            Timeline — {filterLabel} ({history.length}{" "}
            {history.length === 1 ? "Entry" : "Entries"})
          </h2>

          {history.map((item, index) => {
            const entryId = item.id || `hist_${index}`;
            const isExpanded = !!expandedIds[entryId];
            // Show the family member name if viewing "Everyone"
            const memberName =
              filterBy === "" && item.familyMemberId
                ? familyMembers.find((m) => m.id === item.familyMemberId)?.name
                : null;

            return (
              <div
                key={entryId}
                className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => toggleExpand(entryId)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-medium text-gray-400">
                        {formatDate(item.date)}
                      </span>
                      {memberName && (
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-full">
                          {memberName}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 leading-snug truncate">
                      {item.symptom_query}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <SeverityBadge severity={item.severity} />
                    <button
                      type="button"
                      aria-label="Toggle details"
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-teal-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                      AI Health Assistant Guidance:
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 whitespace-pre-wrap">
                      {item.ai_response || "No detailed advice text saved."}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
