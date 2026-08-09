"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/userProfile";

export default function OnboardingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Public routes that do not require an existing user profile
    const isExempt =
      pathname === "/" || pathname === "/welcome" || pathname === "/onboarding";

    const profile = getUserProfile();
    if (!profile && !isExempt) {
      router.replace("/onboarding");
    }
  }, [pathname, router]);

  return <>{children}</>;
}
