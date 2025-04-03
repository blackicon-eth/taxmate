"use client";

import { AnimatedButton } from "@/components/custom-ui/animated-button";
import { Input } from "@/components/shadcn-ui/input";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LineChart } from "@/components/tremor-charts/line-chart";
import { useCountUp } from "@/hooks/use-count-up";
import { mockSimpleLineChartData } from "@/lib/constants";

export default function SimplePage() {
  const totalDeposited = useCountUp(100.98, 1500);
  const totalEarned = useCountUp(15.56, 1500);
  const currentAPY = useCountUp(6.5, 1500);
  const { authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (!authenticated) {
      router.push("/");
    }
  }, [authenticated]);

  return (
    <motion.div
      key="simple"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-3 w-full h-full"
    >
      <div className="flex flex-col gap-7 h-full">
        <h1 className="text-3xl font-bold">Deposit, forget and start earning. Simple as that.</h1>
        <div className="flex justify-between items-start gap-5 p-4 h-full">
          {/* AAVE Card */}
          <div className="flex flex-col justify-between gap-2 bg-card p-5 rounded-lg w-1/4 h-[70%]">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold">
                Deposit your cash on{" "}
                <span className="text-primary underline">
                  <Link href="https://aave.com" target="_blank">
                    AAVE
                  </Link>
                </span>{" "}
                and start earning
              </h2>
              <p className="text-sm text-secondary">Withdraw whenever you want</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center gap-2 px-0.5">
                <Input placeholder="Amount" />
                <button className="hover:underline cursor-pointer">Max</button>
              </div>
              <div className="flex gap-2">
                <AnimatedButton onClick={() => {}} className="w-full h-[38px] text-sm">
                  DEPOSIT
                </AnimatedButton>
                <AnimatedButton
                  onClick={() => {}}
                  className="w-full h-[38px] text-sm bg-secondary text-black"
                >
                  WITHDRAW
                </AnimatedButton>
              </div>
            </div>
          </div>

          {/* Data section */}
          <div className="flex flex-col justify-between items-center w-3/4 px-12 gap-10 h-[70%]">
            {/* Data section */}
            <div className="flex justify-between items-center w-full px-10">
              <div className="flex flex-col justify-center items-center gap-1">
                <h1 className="text-lg font-bold">TOTAL Deposited</h1>
                <p className="text-3xl text-primary font-bold">${totalDeposited}</p>
              </div>

              <div className="flex flex-col justify-center items-center gap-1">
                <h1 className="text-lg font-bold">TOTAL Earned</h1>
                <p className="text-3xl text-primary font-bold">${totalEarned}</p>
              </div>

              <div className="flex flex-col justify-center items-center gap-1">
                <h1 className="text-lg font-bold">Current APY %</h1>
                <p className="text-3xl text-primary font-bold">{currentAPY}%</p>
              </div>
            </div>

            {/* Chart */}
            <LineChart
              className="h-80"
              data={mockSimpleLineChartData}
              index="date"
              categories={["Earned"]}
              valueFormatter={(number: number) =>
                `$${Intl.NumberFormat("us").format(number).toString()}`
              }
              onValueChange={(v: any) => console.log(v)}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
