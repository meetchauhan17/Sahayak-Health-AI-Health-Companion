export interface StreakData {
  count: number;
  lastDate: string; // YYYY-MM-DD
}

const STREAK_KEY = "sahayak_streak";

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function getStreak(): StreakData {
  if (typeof window === "undefined") return { count: 0, lastDate: "" };

  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { count: 0, lastDate: "" };

    const data: StreakData = JSON.parse(raw);
    const today = getTodayString();

    if (!data.lastDate) return { count: 0, lastDate: "" };

    const last = new Date(data.lastDate);
    const curr = new Date(today);
    const diffDays = Math.floor(
      (curr.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If last check-in was yesterday or today, keep streak. If older than 1 day ago, reset to 0.
    if (diffDays > 1) {
      return { count: 0, lastDate: data.lastDate };
    }

    return data;
  } catch {
    return { count: 0, lastDate: "" };
  }
}

export function recordCheckIn(): StreakData {
  if (typeof window === "undefined") return { count: 1, lastDate: getTodayString() };

  const current = getStreak();
  const today = getTodayString();

  if (current.lastDate === today) {
    // Already checked in today
    return current;
  }

  let newCount = 1;
  if (current.lastDate) {
    const last = new Date(current.lastDate);
    const curr = new Date(today);
    const diffDays = Math.floor(
      (curr.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      newCount = current.count + 1;
    }
  }

  const updated: StreakData = { count: newCount, lastDate: today };
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save streak data:", err);
  }

  return updated;
}
