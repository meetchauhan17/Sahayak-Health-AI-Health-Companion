"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  ArrowLeft,
  Plus,
  X,
  MessageSquare,
  Trash2,
  Clock,
  ChevronDown,
  Heart,
} from "lucide-react";

import {
  FamilyMember,
  getFamilyMembers,
  addFamilyMember,
  removeFamilyMember,
} from "@/lib/family";
import { getHistory } from "@/lib/history";

const RELATIONS = [
  "Mother",
  "Father",
  "Spouse",
  "Son",
  "Daughter",
  "Grandparent",
  "Sibling",
  "Other",
];

const RELATION_COLORS: Record<string, string> = {
  Mother: "bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800",
  Father: "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Spouse: "bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  Son: "bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  Daughter: "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  Grandparent: "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  Sibling: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  Other: "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
};

function RelationBadge({ relation }: { relation: string }) {
  const cls =
    RELATION_COLORS[relation] ?? "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";
  return (
    <span
      className={`inline-block text-[11px] font-semibold border px-2 py-0.5 rounded-full ${cls}`}
    >
      {relation}
    </span>
  );
}

// ─── Add Member Modal ──────────────────────────────────────────────────────

interface AddMemberModalProps {
  onClose: () => void;
  onAdd: (member: Omit<FamilyMember, "id">) => void;
}

function AddMemberModal({ onClose, onAdd }: AddMemberModalProps) {
  const [name, setName] = useState("");
  const [relation, setRelation] = useState(RELATIONS[0]);
  const [age, setAge] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const parsedAge = parseInt(age, 10);

    if (!trimmedName) return setError("Name is required.");
    if (!parsedAge || parsedAge < 1 || parsedAge > 120)
      return setError("Please enter a valid age (1–120).");

    onAdd({ name: trimmedName, relation, age: parsedAge });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Add Family Member
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="e.g. Priya"
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
            />
          </div>

          {/* Relation */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Relation
            </label>
            <div className="relative">
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full appearance-none border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition pr-8"
              >
                {RELATIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Age
            </label>
            <input
              type="number"
              min={1}
              max={120}
              value={age}
              onChange={(e) => { setAge(e.target.value); setError(""); }}
              placeholder="e.g. 58"
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold text-sm py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Family Member Card ────────────────────────────────────────────────────

function MemberCard({
  member,
  checkInCount,
  onRemove,
}: {
  member: FamilyMember;
  checkInCount: number;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-3">
      <div className="space-y-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-bold text-sm">
                {member.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{member.name}</p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">{member.age} years old</p>
            </div>
          </div>
          <button
            onClick={() => onRemove(member.id)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-950/60 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            title="Remove member"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Relation badge & Check-in link */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <RelationBadge relation={member.relation} />
          {checkInCount > 0 ? (
            <Link
              href={`/history?for=${member.id}`}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              <Clock className="w-3 h-3 text-teal-500 dark:text-teal-400" />
              {checkInCount} check-in{checkInCount !== 1 ? "s" : ""}
            </Link>
          ) : (
            <span className="text-[11px] text-gray-400 dark:text-slate-500">No check-ins yet</span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <Link
          href={`/chat?for=${member.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold text-xs px-3 py-2 rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all text-center"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Check Symptoms
        </Link>
        <Link
          href={`/history?for=${member.id}`}
          className="flex-shrink-0 inline-flex items-center justify-center gap-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
          title="View History"
        >
          <Clock className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [checkInCounts, setCheckInCounts] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    const m = getFamilyMembers();
    setMembers(m);

    // Count history entries per family member
    const counts: Record<string, number> = {};
    for (const member of m) {
      counts[member.id] = getHistory(member.id).length;
    }
    setCheckInCounts(counts);
  }, []);

  const handleAdd = (memberData: Omit<FamilyMember, "id">) => {
    const newMember = addFamilyMember(memberData);
    setMembers((prev) => [...prev, newMember]);
    setCheckInCounts((prev) => ({ ...prev, [newMember.id]: 0 }));
  };

  const handleRemove = (id: string) => {
    if (
      window.confirm(
        "Remove this family member? Their health history will remain in the history log."
      )
    ) {
      removeFamilyMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-8 transition-colors overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <Heart className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              Family Health
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Track symptoms and health for your whole family
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Member grid */}
      {members.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center shadow-xs">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
            No family members added yet
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 max-w-xs mx-auto mt-1 mb-5">
            Add family members to track their symptoms and health history
            separately from yours.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add First Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              checkInCount={checkInCounts[member.id] ?? 0}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {/* Footer note */}
      <p className="text-[11px] text-gray-400 dark:text-slate-500 text-center mt-8">
        Each family member&apos;s symptom history is saved separately and
        filterable from the{" "}
        <Link href="/history" className="underline text-teal-600 dark:text-teal-400">
          History
        </Link>{" "}
        page.
      </p>

      {/* Modal */}
      {showModal && (
        <AddMemberModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}
    </main>
  );
}
