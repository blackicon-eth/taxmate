"use client";

import { AnimatedButton } from "@/components/custom-ui/animated-button";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TestPage() {
  const { logout, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (!authenticated) {
      router.push("/");
    }
  }, [authenticated]);

  return (
    <div>
      <AnimatedButton className="bg-destructive" onClick={logout}>
        LOGOUT
      </AnimatedButton>
    </div>
  );
}
