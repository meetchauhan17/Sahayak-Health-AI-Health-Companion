"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  Download,
  Search,
  X,
  Activity,
} from "lucide-react";
import dynamic from "next/dynamic";

import {
  getHistory,
  deleteHistoryEntry,
  clearHistory as clearStorageHistory,
  addHistoryEntry,
  HistoryEntry,
} from "@/lib/history";
import { getFamilyMembers, FamilyMember } from "@/lib/family";
import { getUserProfile } from "@/lib/userProfile";
import { generateHealthPDF } from "@/lib/generatePDF";
import SeverityBadge from "@/components/SeverityBadge";

const SeverityChart = dynamic(() => import("@/components/SeverityChart"), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full flex items-center justify-center text-xs text-gray-400 font-semibold">
      Loading chart...
    </div>
  ),
});

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
    if (isNaN(d.getTime())) return isoStr;
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

function HistoryInner() {
  const searchParams = useSearchParams();
  const forMemberId = searchParams.get("for");

  const [mounted, setMounted] = useState(false);
  const [allHistory, setAllHistory] = useState<HistoryEntry[]>([]);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<string>("self");

  useEffect(() => {
    setMounted(true);
    setAllHistory(getHistory());
    setFamilyMembers(getFamilyMembers());

    if (forMemberId) {
      setFilterBy(forMemberId);
    }
  }, [forMemberId]);

  const history = useMemo(() => {
    let list =
      filterBy === ""
        ? allHistory
        : filterBy === "self"
        ? allHistory.filter((e) => !e.familyMemberId)
        : allHistory.filter((e) => e.familyMemberId === filterBy);

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.symptom_query.toLowerCase().includes(q) ||
          e.ai_response.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allHistory, filterBy, searchQuery]);

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

  const handleDeleteSingle = (e: React.MouseEvent, id?: string) => {
    e.stopPropagation();
    if (!id) return;
    if (window.confirm("Remove this entry from your health history?")) {
      deleteHistoryEntry(id);
      setAllHistory(getHistory());
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const profile = getUserProfile();
      const currentMember = familyMembers.find((m) => m.id === filterBy);
      await generateHealthPDF({
        patient: currentMember
          ? { name: currentMember.name, age: currentMember.age, relation: currentMember.relation }
          : { name: profile?.name, age: profile?.age },
        history,
        filename: `sahayak-history-${filterLabel.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const chartData = [...history].reverse().map((item) => ({
    date: formatDate(item.date),
    severityVal: mapSeverityToValue(item.severity),
    symptom: item.symptom_query,
  }));

  const filterLabel =
    filterBy === ""
      ? "Everyone"
      : filterBy === "self"
      ? "Myself"
      : familyMembers.find((m) => m.id === filterBy)?.name ?? "Family Member";

  if (!mounted) {
    return <main className="min-h-screen bg-gray-100" />;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-8 animate-fade-up">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-500" />
              Health History
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Track past symptom consultations and health trends
            </p>
          </div>
        </div>

        {allHistory.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading || history.length === 0}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-md transition-all duration-200 hover:scale-105 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? "Generating..." : "PDF Report"}</span>
            </button>
            <button
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition-all duration-200 hover:scale-105"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Family Filter & Search Bar ── */}
      <div className="space-y-3 mb-6">
        <div className="bg-white border-2 border-gray-100 rounded-lg px-4 py-3.5 flex items-center gap-4 flex-wrap justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Show history for:
            </span>
            <div className="relative">
              <select
                value={filterBy}
                onChange={(e) => { setFilterBy(e.target.value); setExpandedIds({}); }}
                className="appearance-none text-xs font-bold text-blue-600 bg-gray-100 border border-gray-200 rounded-md pl-3 pr-8 py-2 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
              >
                <option value="self">Myself</option>
                {familyMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relation})
                  </option>
                ))}
                <option value="">Everyone</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symptoms or advice..."
              className="w-full pl-8 pr-8 py-2 text-xs bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:border-blue-500 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Severity Trend Chart ── */}
      <div className="bg-white border-2 border-gray-100 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            Severity Trend — {filterLabel}
          </h2>
          {history.length >= 3 && (
            <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-md">
              {history.length} Check-ins
            </span>
          )}
        </div>

        {history.length >= 3 ? (
          <SeverityChart data={chartData} valueToLabel={mapValueToSeverityLabel} />
        ) : (
          <div className="py-8 px-4 text-center bg-gray-100 rounded-md">
            <Sparkles className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-700">
              Check in a few more times to see your health trend
            </p>
            <p className="text-[11px] text-gray-400 mt-1 font-medium">
              Requires 3+ entries to render the severity chart.
            </p>
          </div>
        )}
      </div>

      {/* ── Timeline ── */}
      {history.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border-2 border-gray-100">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">No History found</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1 mb-6 font-medium">
            {searchQuery
              ? `No symptom entries match "${searchQuery}".`
              : "Perform symptom checks in the Chat assistant to track health trends here."}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href={filterBy !== "self" && filterBy !== "" ? `/chat?for=${filterBy}` : "/chat"}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs px-5 py-3 rounded-md transition-all duration-200 hover:scale-105"
            >
              <MessageSquare className="w-4 h-4" />
              Start Symptom Check
            </Link>
            {(filterBy === "self" || filterBy === "") && !searchQuery && (
              <button
                type="button"
                onClick={() => {
                  const sampleEntries: HistoryEntry[] = [
                    {
                      id: "demo_1",
                      date: new Date(Date.now() - 86400000 * 2).toISOString(),
                      symptom_query: "I have a mild runny nose and cold",
                      ai_response: "Rest, drink warm fluids, and take over-the-counter decongestants if needed.",
                      severity: "green",
                    },
                    {
                      id: "demo_2",
                      date: new Date(Date.now() - 86400000).toISOString(),
                      symptom_query: "Persistent headache and mild nausea for 2 days",
                      ai_response: "Stay hydrated and consider seeing a doctor if symptoms do not improve.",
                      severity: "yellow",
                    },
                    {
                      id: "demo_3",
                      date: new Date().toISOString(),
                      symptom_query: "Sudden severe chest tightness and breathlessness",
                      ai_response: "Emergency: Seek immediate medical attention or call 108 immediately.",
                      severity: "red",
                    },
                  ];
                  sampleEntries.forEach((entry) => addHistoryEntry(entry));
                  setAllHistory(getHistory());
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-5 py-3 rounded-md transition-all duration-200"
              >
                Load Sample Entries
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
            Timeline — {filterLabel} ({history.length} {history.length === 1 ? "Entry" : "Entries"})
          </h2>

          {history.map((item, index) => {
            const entryId = item.id || `hist_${index}`;
            const isExpanded = !!expandedIds[entryId];
            const memberName =
              filterBy === "" && item.familyMemberId
                ? familyMembers.find((m) => m.id === item.familyMemberId)?.name
                : null;

            return (
              <div
                key={entryId}
                className="bg-white border-2 border-gray-100 rounded-lg p-5 hover:scale-[1.01] transition-all duration-200 cursor-pointer"
                onClick={() => toggleExpand(entryId)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-gray-400">
                        {formatDate(item.date)}
                      </span>
                      {memberName && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                          {memberName}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gray-900 leading-snug truncate pr-6 sm:pr-0">
                      {item.symptom_query}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <SeverityBadge severity={item.severity} />
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSingle(e, item.id)}
                      title="Delete entry"
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Toggle details"
                      className="text-gray-400 hover:text-gray-600 p-1.5"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-blue-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t-2 border-gray-100">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-blue-500" />
                      AI Guidance:
                    </p>
                    <p className="text-xs text-gray-800 leading-relaxed bg-gray-100 p-4 rounded-md whitespace-pre-wrap font-medium">
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

export default function HistoryPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-100" />}>
      <HistoryInner />
    </Suspense>
  );
}
