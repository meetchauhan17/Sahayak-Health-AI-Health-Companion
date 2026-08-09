export interface CheckInItem {
  id: string;
  date: string; // ISO or formatted date
  symptom: string;
  severity: "green" | "yellow" | "red" | string;
  advice?: string;
}

const HISTORY_KEY = "sahayak_chat_history";

export function getCheckIns(): CheckInItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCheckIn(item: Omit<CheckInItem, "id" | "date">): CheckInItem {
  const history = getCheckIns();
  const newItem: CheckInItem = {
    id: crypto.randomUUID(),
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    ...item,
  };

  const updated = [newItem, ...history];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated.slice(0, 50))); // Keep last 50
    } catch (err) {
      console.error("Failed to save check-in history:", err);
    }
  }

  return newItem;
}

export function getRecentCheckIns(limit = 3): CheckInItem[] {
  return getCheckIns().slice(0, limit);
}
