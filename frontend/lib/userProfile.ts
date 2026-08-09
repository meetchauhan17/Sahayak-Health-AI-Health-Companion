export interface UserProfile {
  name: string;
  age: string;
  gender?: string;
  language: "English" | "हिंदी" | "ગુજરાતી";
}

const STORAGE_KEY = "sahayak_user_profile";

export function getUserProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Failed to read user profile from localStorage:", err);
    return null;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error("Failed to save user profile to localStorage:", err);
  }
}

export function clearUserProfile(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear user profile from localStorage:", err);
  }
}
