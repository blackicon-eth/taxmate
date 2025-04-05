"use client";

import { AnimatedButton } from "@/components/custom-ui/animated-button";
import { Input } from "@/components/shadcn-ui/input";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LineChart } from "@/components/tremor-charts/line-chart";
import { useCountUp } from "@/hooks/use-count-up";
import { BrianButton, BrianModal } from "@/components/providers/brian-button-provider";
import { useRegisteredUser } from "@/components/providers/user-provider";
import { LineChartData } from "@/lib/tremor-charts/types";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import { CsvDownloadModal } from "@/components/custom-ui/csv-download-modal";
import { CsvDownloadButton } from "@/components/custom-ui/csv-download-button";
import { aavePoolAbi } from "@/lib/abi/aave-pool";
import { erc20Abi } from "@/lib/abi/erc20";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { AAVE_POOL_ADDRESS, AAVE_CONTRACT_ADDRESS, USDC_ADDRESS } from "@/lib/constants";
import ky from "ky";
import { Transaction } from "@/lib/db/schemas/db.schema";

export default function SimplePage() {
  const { userTransactions, userMovements, refetchMovements } = useRegisteredUser();
  const [lineChartData, setLineChartData] = useState<LineChartData[]>([]);
  const [minValue, setMinValue] = useState<number>(0);
  const [amount, setAmount] = useState("");
  const { user, authenticated } = usePrivy();
  const router = useRouter();

  const [deposited, setDeposited] = useState<number>(0);
  const [earned, setEarned] = useState<number>(0);

  const totalDeposited = useCountUp(deposited, 1500);
  const totalEarned = useCountUp(earned, 1500);
  const currentAPY = useCountUp(2.44, 1500);

  const { data: userBalance, refetch: refetchUserBalance } = useReadContract({
    address: AAVE_CONTRACT_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [user?.wallet?.address as `0x${string}`],
  });

  const currentAAVEBalance = useCountUp(userBalance ? Number(userBalance) / 1_000_000 : 0, 1500);

  const { data: depositTxHash, writeContract: writeDepositContract } = useWriteContract();

  const { data: approvalTxHash, writeContract: writeApprovalContract } = useWriteContract();

  const { data: withdrawTxHash, writeContract: writeWithdrawContract } = useWriteContract();

  const { isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({ hash: approvalTxHash });
  const { isSuccess: isWithdrawConfirmed } = useWaitForTransactionReceipt({ hash: withdrawTxHash });
  const { isSuccess: isDepositConfirmed } = useWaitForTransactionReceipt({ hash: depositTxHash });

  useEffect(() => {
    if (!authenticated) {
      router.push("/");
    }
  }, [authenticated]);

  useEffect(() => {
    if (userTransactions.aave) {
      // Get the last snapshot
      const lastSnapshot: Transaction | undefined =
        userTransactions.aave?.[userTransactions.aave.length - 1];

      // The deposited amount is the last snapshot minus some eventual movements happened today
      const today = new Date();
      today.setHours(today.getHours() - 3); // UTC+0
      const todayMovements = userMovements.aave?.filter((movement) => {
        const movementDate = new Date(movement.createdAt);
        return movementDate.toDateString() === today.toDateString();
      });
      const todayMovementsSum =
        todayMovements?.reduce((acc, movement) => {
          if (movement.isBuy) {
            return acc + movement.amount;
          }
          return acc - movement.amount;
        }, 0) ?? 0;
      const currentDeposited = lastSnapshot ? lastSnapshot.amountUSD + todayMovementsSum : 0;

      setLineChartData(
        userTransactions.aave.map((transaction, index) => {
          if (index === userTransactions.aave!.length - 1) {
            return {
              date: transaction.createdAt,
              earned: currentDeposited,
            };
          }
          return {
            date: transaction.createdAt,
            earned: transaction.amountUSD,
          };
        })
      );

      setDeposited(currentDeposited);

      const allMovementsSum =
        userMovements.aave?.reduce((acc, movement) => {
          if (movement.isBuy) {
            return acc + movement.amount;
          }
          return acc - movement.amount;
        }, 0) ?? 0;

      const firstSnapshot = userTransactions.aave?.[0];

      // The earned amount is the last snapshot minus the movements sum minus the first snapshot
      setEarned(
        (lastSnapshot?.amountUSD ?? 0) -
          (firstSnapshot?.amountUSD ?? 0) -
          allMovementsSum +
          todayMovementsSum
      );

      setMinValue(Math.min(...userTransactions.aave.map((transaction) => transaction.amountUSD)));
    }
  }, [userTransactions, userMovements]);

  const createMovement = async (amount: number, isBuy: boolean) => {
    try {
      await ky.post("/api/movements/aave", {
        body: JSON.stringify({ amount, isBuy }),
      });
      refetchMovements();
    } catch (error) {
      console.error("Error creating movement:", error);
    }
  };

  useEffect(() => {
    if (isApprovalConfirmed) {
      console.log("Depositing...");

      // Convert amount to USDC base units (6 decimals)
      const amountInUSDC = parseFloat(amount) * 1_000_000;
      const amountInUSDCBigInt = BigInt(Math.floor(amountInUSDC));

      writeDepositContract({
        address: AAVE_POOL_ADDRESS as `0x${string}`,
        abi: aavePoolAbi,
        functionName: "supply",
        args: [
          USDC_ADDRESS as `0x${string}`,
          amountInUSDCBigInt,
          user?.wallet?.address as `0x${string}`,
          1927,
        ],
      });
    }
  }, [isApprovalConfirmed, amount, user?.wallet?.address, writeDepositContract]);

  // Handle validation and formatting of input
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Only allow numbers and at most one decimal point
    // Regex explanation:
    // ^ - start of string
    // \d* - zero or more digits
    // (\\.\d*)? - optional group of decimal point followed by zero or more digits
    // $ - end of string
    if (value === "" || /^\d*(\.\d*)?$/.test(value)) {
      setAmount(value);
    }
  };

  const handleDeposit = async () => {
    try {
      // Convert amount to USDC base units (6 decimals)
      const amountInUSDC = parseFloat(amount || "0") * 1_000_000;

      // Check for valid number and handle edge cases
      if (isNaN(amountInUSDC) || amountInUSDC <= 0) {
        console.error("Invalid amount");
        return;
      }

      // Round to handle potential floating point issues and convert to BigInt
      const amountInUSDCBigInt = BigInt(Math.floor(amountInUSDC));

      console.log("Approving...", amountInUSDCBigInt.toString());

      writeApprovalContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [AAVE_POOL_ADDRESS as `0x${string}`, amountInUSDCBigInt],
      });
    } catch (error) {
      console.error("Error depositing:", error);
    }
  };

  const handleWithdraw = async () => {
    try {
      // Convert amount to USDC base units (6 decimals)
      const amountInUSDC = parseFloat(amount || "0") * 1_000_000;

      // Check for valid number and handle edge cases
      if (isNaN(amountInUSDC) || amountInUSDC <= 0) {
        console.error("Invalid amount");
        return;
      }

      // Round to handle potential floating point issues and convert to BigInt
      const amountInUSDCBigInt = BigInt(Math.floor(amountInUSDC));

      writeWithdrawContract({
        address: AAVE_POOL_ADDRESS as `0x${string}`,
        abi: aavePoolAbi,
        functionName: "withdraw",
        args: [
          USDC_ADDRESS as `0x${string}`,
          amountInUSDCBigInt,
          user?.wallet?.address as `0x${string}`,
        ],
      });
    } catch (error) {
      console.error("Error withdrawing:", error);
    }
  };

  // A useEffect to handle the withdraw success
  useEffect(() => {
    if (isWithdrawConfirmed) {
      createMovement(parseFloat(amount), false);
      refetchUserBalance();
    }
  }, [isWithdrawConfirmed]);

  // A useEffect to handle the deposit success
  useEffect(() => {
    if (isDepositConfirmed) {
      createMovement(parseFloat(amount), true);
      refetchUserBalance();
    }
  }, [isDepositConfirmed]);

  return (
    <motion.div
      key="simple"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex relative flex-col gap-3 w-full h-full"
    >
      <div className="flex flex-col gap-7 h-full">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-3xl font-bold">Deposit, forget and start earning. Simple as that.</h1>
          {userTransactions.aave ? (
            <CsvDownloadModal transactions={userTransactions.aave}>
              <CsvDownloadButton label="Simple Earn Report" />
            </CsvDownloadModal>
          ) : (
            <Skeleton className="w-[146px] h-[36px]" />
          )}
        </div>
        <div className="flex justify-between items-start gap-5 p-4 h-full">
          {/* AAVE Card */}
          <div className="flex flex-col justify-between gap-2 bg-card p-6 rounded-lg w-1/4 h-[80%]">
            <div className="flex flex-col gap-4">
              <div className="flex justify-start items-center gap-3.5">
                <img src="/images/aave-logo.webp" alt="aave-logo" className="size-14" />
                <h2 className="text-2xl font-bold">
                  <a className="text-primary underline" href="https://aave.com" target="_blank">
                    AAVE
                  </a>{" "}
                  Pool <br /> Deposit and Forget
                </h2>
              </div>
              <p className="text-sm text-secondary">
                Deposit your cash on AAVE and start earning simply. Withdraw whenever you want
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full text-center">
              <p className="text-3xl text-secondary font-semibold">Deposited Amount</p>
              <p className="text-4xl text-primary font-bold">${currentAAVEBalance.toFixed(2)}</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center gap-2 px-0.5">
                <Input placeholder="Amount" value={amount} onChange={handleAmountChange} />
                <button
                  className="hover:underline cursor-pointer"
                  onClick={() =>
                    setAmount(
                      userBalance ? (Number(userBalance) / 1_000_000).toFixed(2).toString() : ""
                    )
                  }
                >
                  Max
                </button>
              </div>
              <div className="flex gap-2">
                <AnimatedButton onClick={handleDeposit} className="w-full h-[38px] text-sm">
                  DEPOSIT
                </AnimatedButton>
                <AnimatedButton
                  onClick={handleWithdraw}
                  className="w-full h-[38px] text-sm bg-secondary text-black"
                >
                  WITHDRAW
                </AnimatedButton>
              </div>
            </div>
          </div>

          {/* Data section */}
          <div className="flex flex-col justify-between items-center w-3/4 px-12 gap-10 h-[80%]">
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
            {!lineChartData ? (
              <Skeleton className="h-[370px] w-full bg-card" />
            ) : lineChartData && lineChartData.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="size-full"
              >
                <LineChart
                  className="h-[380px]"
                  data={lineChartData}
                  index="date"
                  categories={["earned"]}
                  valueFormatter={(number: number) =>
                    `$${Intl.NumberFormat("us").format(number).toString()}`
                  }
                  minValue={minValue * 0.9999}
                />
              </motion.div>
            ) : (
              <div className="flex justify-center items-center text-3xl text-white size-full text-center">
                No data to show yet
              </div>
            )}
          </div>
        </div>
      </div>

      <BrianModal>
        <BrianButton className="absolute bottom-3 right-5" />
      </BrianModal>
    </motion.div>
  );
}
