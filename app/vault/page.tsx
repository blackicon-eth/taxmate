"use client";

import { AnimatedButton } from "@/components/custom-ui/animated-button";
import { Input } from "@/components/shadcn-ui/input";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCountUp } from "@/hooks/use-count-up";
import { mockVaultDonutChartData, USDC_ADDRESS, VAULT_ADDRESS } from "@/lib/constants";
import { LineChart } from "@/components/tremor-charts/line-chart";
import { DonutChart } from "@/components/tremor-charts/donut-chart";
import { BrianModal, BrianButton } from "@/components/providers/brian-button-provider";
import ky from "ky";
import { toast } from "sonner";
import { LineChartData, VaultDistribution } from "@/lib/tremor-charts/types";
import { TargetPercentages } from "@/lib/token-metrics/types";
import { useRegisteredUser } from "@/components/providers/user-provider";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import { CsvDownloadModal } from "@/components/custom-ui/csv-download-modal";
import { CsvDownloadButton } from "@/components/custom-ui/csv-download-button";
import { env } from "@/lib/env";
import { vaultAbi } from "@/lib/abi/vault";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { erc20Abi } from "@/lib/abi/erc20";
import { Transaction } from "@/lib/db/schemas/db.schema";

export default function VaultPage() {
  const { userTransactions, userMovements, refetchMovements } = useRegisteredUser();
  const [lineChartData, setLineChartData] = useState<LineChartData[]>([]);
  const [minValue, setMinValue] = useState<number>(0);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [amount, setAmount] = useState("");
  const [vaultDistribution, setVaultDistribution] =
    useState<VaultDistribution[]>(mockVaultDonutChartData);
  const { authenticated } = usePrivy();
  const router = useRouter();

  const [deposited, setDeposited] = useState<number>(0);
  const [earned, setEarned] = useState<number>(0);

  const totalDeposited = useCountUp(deposited, 1500);
  const totalEarned = useCountUp(earned, 1500);
  const currentAPY = useCountUp(2.44, 1500);

  const currentVAULTBalance = useCountUp(0, 1500);

  useEffect(() => {
    if (!authenticated) {
      router.push("/");
    }
  }, [authenticated]);

  useEffect(() => {
    if (userTransactions.vault) {
      // Get the last snapshot
      const lastSnapshot: Transaction | undefined =
        userTransactions.vault?.[userTransactions.vault.length - 1];

      // The deposited amount is the last snapshot minus some eventual movements happened today
      const today = new Date();
      today.setHours(today.getHours() - 3); // UTC+0
      const todayMovements = userMovements.vault?.filter((movement) => {
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
      const currentDeposited = lastSnapshot?.amountUSD ?? 0 - todayMovementsSum;

      setLineChartData(
        userTransactions.vault.map((transaction, index) => {
          if (index === userTransactions.vault!.length - 1) {
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
        userMovements.vault?.reduce((acc, movement) => {
          if (movement.isBuy) {
            return acc + movement.amount;
          }
          return acc - movement.amount;
        }, 0) ?? 0;

      const firstSnapshot = userTransactions.vault?.[0];

      // The earned amount is the last snapshot minus the movements sum minus the first snapshot
      setEarned(
        (lastSnapshot?.amountUSD ?? 0) -
          (firstSnapshot?.amountUSD ?? 0) -
          allMovementsSum +
          todayMovementsSum
      );

      setMinValue(Math.min(...userTransactions.vault.map((transaction) => transaction.amountUSD)));
    }
  }, [userTransactions]);

  const createMovement = async (amount: number, isBuy: boolean) => {
    try {
      await ky.post("/api/movements/vault", {
        body: JSON.stringify({ amount, isBuy }),
      });
      refetchMovements();
    } catch (error) {
      console.error("Error creating movement:", error);
    }
  };

  const {
    data: depositTxHash,
    isPending: isDepositPending,
    error: depositError,
    isSuccess: isDepositSuccess,
    writeContract: writeDepositContract,
  } = useWriteContract();

  const {
    data: approvalTxHash,
    isPending: isApprovalPending,
    error: approvalError,
    writeContract: writeApprovalContract,
  } = useWriteContract();

  const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } =
    useWaitForTransactionReceipt({ hash: approvalTxHash });

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

  useEffect(() => {
    if (isApprovalConfirmed) {
      // Convert amount to USDC base units (6 decimals)
      const amountInUSDC = parseFloat(amount || "0") * 1_000_000;

      // Check for valid number and handle edge cases
      if (isNaN(amountInUSDC) || amountInUSDC <= 0) {
        toast.error("Invalid amount");
        return;
      }

      // Round to handle potential floating point issues and convert to BigInt
      const amountInUSDCBigInt = BigInt(Math.floor(amountInUSDC));

      writeDepositContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: vaultAbi,
        functionName: "deposit",
        args: [amountInUSDCBigInt],
      });
    }
  }, [isApprovalConfirmed]);

  const handleDeposit = async () => {
    try {
      // Convert amount to USDC base units (6 decimals)
      const amountInUSDC = parseFloat(amount || "0") * 1_000_000;

      // Check for valid number and handle edge cases
      if (isNaN(amountInUSDC) || amountInUSDC <= 0) {
        toast.error("Invalid amount");
        return;
      }

      // Round to handle potential floating point issues and convert to BigInt
      const amountInUSDCBigInt = BigInt(Math.floor(amountInUSDC));

      writeApprovalContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [VAULT_ADDRESS as `0x${string}`, amountInUSDCBigInt],
      });
    } catch (error) {
      toast.error("Failed to deposit");
    }
  };

  const handleRebalance = async () => {
    setIsRebalancing(true);
    try {
      const tokenIds = "3375,3306";
      const response = await ky
        .get<TargetPercentages>(`/api/token-metrics/investor-grades?tokenIds=${tokenIds}`)
        .json();
      console.log(response);
      setVaultDistribution(
        Object.entries(response).map(([token, amount]) => ({
          name: token,
          amount: amount,
        }))
      );
    } catch (error) {
      toast.error("Failed to rebalance");
    } finally {
      setIsRebalancing(false);
    }
  };

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
        <div className="flex justify-between items-center w-full">
          <h1 className="text-3xl font-bold">Deposit, forget and start earning. Simple as that.</h1>
          {userTransactions.vault ? (
            <CsvDownloadModal transactions={userTransactions.vault}>
              <CsvDownloadButton label="Vault Report" />
            </CsvDownloadModal>
          ) : (
            <Skeleton className="w-[146px] h-[36px]" />
          )}
        </div>
        <div className="flex justify-between items-start gap-5 p-4 h-full">
          {/* AAVE Card */}
          <div className="flex flex-col justify-between gap-2 bg-card p-5 rounded-lg w-1/4 h-[80%]">
            <div className="flex flex-col gap-4">
              <div className="flex justify-start items-center gap-3.5">
                <img src="/images/tm-logo.webp" alt="aave-logo" className="size-14" />
                <h2 className="text-2xl font-bold">
                  <a
                    className="text-primary underline"
                    href="https://app.tokenmetrics.com/en/ratings"
                    target="_blank"
                  >
                    Token Metrics
                  </a>
                  <br />
                  Advanced Vault
                </h2>
              </div>
              <p className="text-sm text-secondary">
                Deposit your cash on our advanced investment Vault and start earning. <br />
                The Vault is rebalanced daily following Token Metrics recommendations and insights.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full text-center">
              <p className="text-3xl text-secondary font-semibold">Deposited Amount</p>
              <p className="text-4xl text-primary font-bold">${currentVAULTBalance}</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center gap-2 px-0.5">
                <Input placeholder="Amount" value={amount} onChange={handleAmountChange} />
                <button className="hover:underline cursor-pointer">Max</button>
              </div>
              <div className="flex gap-2">
                <AnimatedButton onClick={handleDeposit} className="w-full h-[38px] text-sm">
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

            {/* Charts */}
            <div className="flex justify-between items-center size-full">
              <div className="flex flex-col w-1/2 h-full justify-end items-center gap-4">
                <DonutChart
                  className="h-[60%] w-full"
                  data={vaultDistribution}
                  variant="pie"
                  category="name"
                  value="amount"
                  valueFormatter={(number: number) =>
                    `${Intl.NumberFormat("us").format(number).toString()}%`
                  }
                />
                <div className="flex flex-col justify-center items-center gap-1">
                  <p className="text-xl font-bold">Vault Distribution</p>
                  <AnimatedButton
                    onClick={handleRebalance}
                    className="w-[122px] h-[38px] text-sm"
                    disabled={isRebalancing}
                    loaderSize={20}
                  >
                    {isRebalancing ? "Rebalancing..." : "Rebalance"}
                  </AnimatedButton>
                </div>
              </div>
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
                    onValueChange={(v: any) => console.log(v)}
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
      </div>

      <BrianModal>
        <BrianButton className="absolute bottom-3 right-5" />
      </BrianModal>
    </motion.div>
  );
}
