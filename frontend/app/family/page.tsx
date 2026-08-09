"use client";

import Link from "next/link";
import { Users, ArrowLeft, Plus, Heart } from "lucide-react";

const DEMO_FAMILY = [
  { name: "Me (Primary)", relation: "Self", age: "28", language: "English" },
  { name: "Priya Patel", relation: "Spouse", age: "26", language: "English" },
  { name: "Aarav Patel", relation: "Child", age: "4", language: "English" },
];

export default function FamilyPage() {
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
              <Users className="w-6 h-6 text-teal-600" />
              Family Profiles
            </h1>
            <p className="text-xs text-gray-500">Manage health assistance for your family members</p>
          </div>
        </div>

        <button
          onClick={() => alert("Family member creation feature coming soon!")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-teal-500 hover:bg-teal-600 text-white px-3.5 py-2 rounded-xl shadow-xs active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Family Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {DEMO_FAMILY.map((member, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm">
                  {member.name[0]}
                </div>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
                  {member.relation}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">{member.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Age: {member.age} · {member.language}
              </p>
            </div>

            <Link
              href="/chat"
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-teal-50 text-gray-700 hover:text-teal-700 border border-gray-200 hover:border-teal-200 text-xs font-semibold py-2 rounded-xl transition-all"
            >
              <Heart className="w-3.5 h-3.5 text-teal-500" />
              <span>Start Check for {member.name.split(" ")[0]}</span>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
