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
  Activity,
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
  Mother: "bg-emerald-500 text-white",
  Father: "bg-blue-500 text-white",
  Spouse: "bg-amber-500 text-white",
  Son: "bg-blue-500 text-white",
  Daughter: "bg-emerald-500 text-white",
  Grandparent: "bg-amber-500 text-white",
  Sibling: "bg-blue-500 text-white",
  Other: "bg-gray-200 text-gray-700",
};

function RelationBadge({ relation }: { relation: string }) {
  const cls = RELATION_COLORS[relation] ?? "bg-gray-200 text-gray-700";
  return (
    <span
      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${cls}`}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white border-2 border-gray-100 rounded-lg w-full max-w-sm p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Add Family Member
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="e.g. Priya"
              className="w-full border-2 border-gray-100 bg-gray-50 text-gray-900 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Relation
            </label>
            <div className="relative">
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full appearance-none border-2 border-gray-100 bg-gray-50 text-gray-900 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all pr-8 font-medium"
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

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Age
            </label>
            <input
              type="number"
              min={1}
              max={120}
              value={age}
              onChange={(e) => { setAge(e.target.value); setError(""); }}
              placeholder="e.g. 58"
              className="w-full border-2 border-gray-100 bg-gray-50 text-gray-900 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 font-bold">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 font-bold text-sm py-2.5 rounded-md hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white font-bold text-sm py-2.5 rounded-md hover:bg-blue-600 transition-all hover:scale-105"
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
    <div className="bg-white border-2 border-gray-100 rounded-lg p-5 flex flex-col justify-between gap-4 hover:scale-[1.02] transition-all duration-200">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-blue-500 text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-base font-extrabold text-gray-900">{member.name}</p>
              <p className="text-xs text-gray-500 font-medium">{member.age} years old</p>
            </div>
          </div>
          <button
            onClick={() => onRemove(member.id)}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            title="Remove member"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <RelationBadge relation={member.relation} />
          {checkInCount > 0 ? (
            <Link
              href={`/history?for=${member.id}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
            >
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              {checkInCount} check-in{checkInCount !== 1 ? "s" : ""}
            </Link>
          ) : (
            <span className="text-xs text-gray-400 font-medium">No check-ins yet</span>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Link
          href={`/chat?for=${member.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs px-3 py-2.5 rounded-md transition-all duration-200 hover:scale-105 text-center"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Check Symptoms
        </Link>
        <Link
          href={`/history?for=${member.id}`}
          className="flex-shrink-0 inline-flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-2.5 rounded-md transition-all"
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
  const [mounted, setMounted] = useState(false);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [checkInCounts, setCheckInCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setMounted(true);
    const m = getFamilyMembers();
    setMembers(m);

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

  if (!mounted) {
    return <main className="min-h-screen bg-gray-100" />;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-500" />
              Family Health
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Track symptoms and health for your whole family
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-md transition-all duration-200 hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Member grid */}
      {members.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border-2 border-gray-100">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">
            No family members added yet
          </h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1 mb-6 font-medium">
            Add family members to track their symptoms and health history separately from yours.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm px-6 py-3 rounded-md transition-all duration-200 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Add First Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
