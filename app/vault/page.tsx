"use client";

import { AnimatedButton } from "@/components/custom-ui/animated-button";
import { usePrivy } from "@privy-io/react-auth";

export default function TestPage() {
  const { logout } = usePrivy();
  return <div>Test Page</div>;
}
