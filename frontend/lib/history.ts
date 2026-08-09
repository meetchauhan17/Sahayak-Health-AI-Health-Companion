export interface HistoryEntry {
  id?: string;
  date: string; // ISO string
  symptom_query: string;
  ai_response: string;
  severity: "green" | "yellow" | "red" | string;
  /** undefined = main user; set to FamilyMember.id for family check-ins */
  familyMemberId?: string;
}

export type CheckInItem = HistoryEntry;

const HISTORY_KEY = "sahayak_history";
const LEGACY_KEY = "sahayak_chat_history";

export function getHistory(familyMemberId?: string | null): HistoryEntry[] {
  if (typeof window === "undefined") return [];

  let entries: HistoryEntry[] = [];

  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      entries = JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to read sahayak_history from localStorage:", err);
  }

  // Merge legacy entries that predate the familyMemberId field
  try {
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const legacyList = JSON.parse(legacyRaw);
      const normalizedLegacy: HistoryEntry[] = legacyList.map((item: any) => ({
        id: item.id || crypto.randomUUID(),
        date: item.date || new Date().toISOString(),
        symptom_query: item.symptom_query || item.symptom || "Symptom check",
        ai_response: item.ai_response || item.advice || "No response recorded.",
        severity: item.severity || "yellow",
        familyMemberId: item.familyMemberId,
      }));

      const existingIds = new Set(entries.map((e) => e.id).filter(Boolean));
      for (const leg of normalizedLegacy) {
        if (!existingIds.has(leg.id)) {
          entries.push(leg);
        }
      }
    }
  } catch {
    // Ignore legacy parse errors
  }

  // Filter by familyMemberId if requested
  if (familyMemberId === undefined || familyMemberId === null) {
    // No filter — return everything
    return entries;
  }
  if (familyMemberId === "self") {
    // Main user: entries with no familyMemberId
    return entries.filter((e) => !e.familyMemberId);
  }
  // Specific family member
  return entries.filter((e) => e.familyMemberId === familyMemberId);
}

export function addHistoryEntry(
  entry: Omit<HistoryEntry, "id">
): HistoryEntry {
  const all = getHistory(); // get unfiltered
  const newEntry: HistoryEntry = {
    id: crypto.randomUUID(),
    ...entry,
  };

  const updated = [newEntry, ...all];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated.slice(0, 200)));
      // Keep legacy key in sync (main-user entries only)
      const legacyEntries = updated
        .filter((e) => !e.familyMemberId)
        .slice(0, 50);
      localStorage.setItem(LEGACY_KEY, JSON.stringify(legacyEntries));
    } catch (err) {
      console.error("Failed to save history entry to localStorage:", err);
    }
  }

  return newEntry;
}

export function clearHistory(familyMemberId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!familyMemberId) {
      // Clear everything
      localStorage.removeItem(HISTORY_KEY);
      localStorage.removeItem(LEGACY_KEY);
    } else {
      // Clear only entries for specific family member
      const all = getHistory();
      const remaining = all.filter(
        familyMemberId === "self"
          ? (e) => !!e.familyMemberId
          : (e) => e.familyMemberId !== familyMemberId
      );
      localStorage.setItem(HISTORY_KEY, JSON.stringify(remaining));
      // Refresh legacy
      const legacyEntries = remaining
        .filter((e) => !e.familyMemberId)
        .slice(0, 50);
      localStorage.setItem(LEGACY_KEY, JSON.stringify(legacyEntries));
    }
  } catch (err) {
    console.error("Failed to clear history:", err);
  }
}

// Backward compatibility helpers for Dashboard
export function getCheckIns(): HistoryEntry[] {
  return getHistory();
}

export function getRecentCheckIns(limit = 3): HistoryEntry[] {
  return getHistory().slice(0, limit);
}
