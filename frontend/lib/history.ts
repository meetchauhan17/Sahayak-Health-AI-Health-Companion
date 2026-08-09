export interface HistoryEntry {
  id?: string;
  date: string; // ISO string or formatted date
  symptom_query: string;
  ai_response: string;
  severity: "green" | "yellow" | "red" | string;
}

export type CheckInItem = HistoryEntry;

const HISTORY_KEY = "sahayak_history";
const LEGACY_KEY = "sahayak_chat_history";

export function getHistory(): HistoryEntry[] {
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

  // Fallback: merge legacy entries from sahayak_chat_history if present
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
      }));

      // Combine without duplicates (matching symptom_query and date)
      const existingQueries = new Set(entries.map((e) => `${e.symptom_query}_${e.date}`));
      for (const leg of normalizedLegacy) {
        const key = `${leg.symptom_query}_${leg.date}`;
        if (!existingQueries.has(key)) {
          entries.push(leg);
        }
      }
    }
  } catch {
    // Ignore legacy parse errors
  }

  return entries;
}

export function addHistoryEntry(
  entry: Omit<HistoryEntry, "id">
): HistoryEntry {
  const current = getHistory();
  const newEntry: HistoryEntry = {
    id: crypto.randomUUID(),
    ...entry,
  };

  const updated = [newEntry, ...current];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated.slice(0, 100)));
      // Also update legacy key so old components stay in sync
      localStorage.setItem(LEGACY_KEY, JSON.stringify(updated.slice(0, 50)));
    } catch (err) {
      console.error("Failed to save history entry to localStorage:", err);
    }
  }

  return newEntry;
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch (err) {
    console.error("Failed to clear history from localStorage:", err);
  }
}

// Backward compatibility helpers for Dashboard recent activity component
export function getCheckIns(): HistoryEntry[] {
  return getHistory();
}

export function getRecentCheckIns(limit = 3): HistoryEntry[] {
  return getHistory().slice(0, limit);
}
