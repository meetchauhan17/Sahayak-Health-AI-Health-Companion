export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
}

const FAMILY_KEY = "sahayak_family";

export function getFamilyMembers(): FamilyMember[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAMILY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addFamilyMember(
  member: Omit<FamilyMember, "id">
): FamilyMember {
  const current = getFamilyMembers();
  const newMember: FamilyMember = {
    id: crypto.randomUUID(),
    ...member,
  };
  const updated = [...current, newMember];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(FAMILY_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save family member:", err);
    }
  }
  return newMember;
}

export function removeFamilyMember(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getFamilyMembers();
    localStorage.setItem(
      FAMILY_KEY,
      JSON.stringify(current.filter((m) => m.id !== id))
    );
  } catch (err) {
    console.error("Failed to remove family member:", err);
  }
}
