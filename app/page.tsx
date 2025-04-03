"use client";

import { AnimatedButton } from "@/components/custom-ui/animated-button";
import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
export default function Home() {
  const { login, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (authenticated) {
      router.push("/simple");
    }
  }, [authenticated]);

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col text-center items-center justify-center size-full gap-[58px] bg-radial from-primary/15 to-background"
    >
      <div className="flex flex-col items-center justify-center">
        <img src="/images/taxmate-logo-no-bg.png" alt="logo" className="w-[500px] h-auto" />
        <p className="text-6xl text-secondary font-bold leading-14">
          Don&apos;t Let Cash Sleep
          <br />
          Turn Surplus Into Yield
        </p>
      </div>
      <AnimatedButton onClick={login}>
        {authenticated ? <Check size={24} /> : "Login"}
      </AnimatedButton>
    </motion.div>
  );
}
