"use client";

import { AnimatedButton } from "@/components/custom-ui/animated-button";
import { Input } from "@/components/shadcn-ui/input";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCountUp } from "@/hooks/use-count-up";
import { mockVaultDonutChartData, mockVaultLineChartData } from "@/lib/constants";
import { LineChart } from "@/components/tremor-charts/line-chart";
import { DonutChart } from "@/components/tremor-charts/donut-chart";
import { BrianModal, BrianButton } from "@/components/providers/brian-button-provider";
export default function VaultPage() {
  const totalDeposited = useCountUp(240.01, 1500);
  const totalEarned = useCountUp(56.0, 1500);
  const currentAPY = useCountUp(12.3, 1500);
  const { authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (!authenticated) {
      router.push("/");
    }
  }, [authenticated]);

  return (
    <motion.div
      key="vault"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-3 w-full h-full relative"
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

            {/* Charts */}
            <div className="flex justify-between items-center size-full">
              <div className="flex flex-col w-1/2 h-full justify-end items-center gap-9">
                <DonutChart
                  className="h-[67%] w-full"
                  data={mockVaultDonutChartData}
                  variant="pie"
                  category="name"
                  value="amount"
                  valueFormatter={(number: number) =>
                    `${Intl.NumberFormat("us").format(number).toString()}%`
                  }
                />
                <p className="text-xl font-bold">Vault Distribution</p>
              </div>

              <LineChart
                className=""
                data={mockVaultLineChartData}
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
      </div>

      <BrianModal>
        <BrianButton className="absolute bottom-3 right-5" />
      </BrianModal>
    </motion.div>
  );
}
