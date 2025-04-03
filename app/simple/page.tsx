"use client";

import { AnimatedButton } from "@/components/custom-ui/animated-button";
import { Input } from "@/components/shadcn-ui/input";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LineChart } from "@/components/custom-ui/line-chart";

const chartdata = [
  {
    date: "Fed 01",
    Earned: 0,
  },
  {
    date: "Feb 15",
    Earned: 5,
  },
  {
    date: "Mar 01",
    Earned: 9,
  },
  {
    date: "Apr 15",
    Earned: 13,
  },
  {
    date: "May 01",
    Earned: 19,
  },
  {
    date: "Jun 15",
    Earned: 25,
  },
  {
    date: "Jul 01",
    Earned: 29,
  },
  {
    date: "Aug 15",
    Earned: 38,
  },
  {
    date: "Sep 01",
    Earned: 44,
  },
  {
    date: "Oct 01",
    Earned: 45,
  },
  {
    date: "Nov 01",
    Earned: 50,
  },
  {
    date: "Dec 01",
    Earned: 52,
  },
];

export default function SimplePage() {
  const { authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (!authenticated) {
      router.push("/");
    }
  }, [authenticated]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center gap-2 px-1">
                <Input placeholder="Amount" />
                <button className="hover:underline cursor-pointer">Max</button>
              </div>
              <div className="flex gap-2">
                <AnimatedButton onClick={() => {}} className="w-full h-[35px] text-sm">
                  DEPOSIT
                </AnimatedButton>
                <AnimatedButton
                  onClick={() => {}}
                  className="w-full h-[35px] text-sm bg-secondary text-black"
                >
                  WITHDRAW
                </AnimatedButton>
              </div>
            </div>
          </div>

          {/* Data section */}
          <div className="flex flex-col justify-between items-center w-3/4 px-16 gap-10 h-[70%]">
            {/* Data section */}
            <div className="flex justify-between items-center w-full px-10">
              <div className="flex flex-col justify-center items-center gap-1">
                <h1 className="text-lg font-bold">TOTAL Deposited</h1>
                <p className="text-3xl text-primary font-bold">$100.98</p>
              </div>

              <div className="flex flex-col justify-center items-center gap-1">
                <h1 className="text-lg font-bold">TOTAL Earned</h1>
                <p className="text-3xl text-primary font-bold">$15.56</p>
              </div>

              <div className="flex flex-col justify-center items-center gap-1">
                <h1 className="text-lg font-bold">Current APY %</h1>
                <p className="text-3xl text-primary font-bold">6.5%</p>
              </div>
            </div>

            {/* Chart */}
            <LineChart
              className="h-80"
              data={chartdata}
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
