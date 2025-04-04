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
import { env } from "@/lib/env";
import { erc20Abi } from "@/lib/abi/erc20";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract} from "wagmi"; 

export default function SimplePage() {
  const { userTransactions } = useRegisteredUser();
  const [lineChartData, setLineChartData] = useState<LineChartData[]>([]);
  const [minValue, setMinValue] = useState<number>(0);
  const [startingAmount, setStartingAmount] = useState<number>(0);
  const [endingAmount, setEndingAmount] = useState<number>(0);

  const totalDeposited = useCountUp(startingAmount, 1500);
  const totalEarned = useCountUp(endingAmount - startingAmount, 1500);

export default function SimplePage() {
  const [amount, setAmount] = useState("");
  

  const totalDeposited = useCountUp(100.98, 1500);
  const totalEarned = useCountUp(15.56, 1500);
  const currentAPY = useCountUp(2.44, 1500);
  const { user, authenticated } = usePrivy();
  const router = useRouter();

  const { data: userDeposits } = useReadContract({
    address: env.NEXT_PUBLIC_ATOKEN_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [user.wallet.address as `0x${string}`],
  });

  const {
    data: depositTxHash,
    isPending: isDepositPending,
    error: depositError,
    writeContract: writeDepositContract,
  } = useWriteContract();

  const {
    data: approvalTxHash,
    isPending: isApprovalPending,
    error: approvalError,
    writeContract: writeApprovalContract,
  } = useWriteContract();

  const {
    data: withdrawTxHash,
    isPending: isWithdrawPending,
    error: withdrawError,
    writeContract: writeWithdrawContract,
  } = useWriteContract();

  const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({ hash: approvalTxHash })

  useEffect(() => {
    if (!authenticated) {
      router.push("/");
    }
  }, [authenticated]);

  useEffect(() => {
    if (userTransactions.aave) {
      setLineChartData(
        userTransactions.aave.map((transaction) => ({
          date: transaction.createdAt,
          earned: transaction.amountUSD,
        }))
      );
      setStartingAmount(userTransactions.aave?.[0]?.amountUSD ?? 0);
      setEndingAmount(userTransactions.aave?.[userTransactions.aave.length - 1]?.amountUSD ?? 0);

      setMinValue(Math.min(...userTransactions.aave.map((transaction) => transaction.amountUSD)));
    }
  }, [userTransactions]);
  useEffect(()=>{
    if(isApprovalConfirmed){
      console.log("Depositing...")
      
      // Convert amount to USDC base units (6 decimals)
      const amountInUSDC = parseFloat(amount) * 1_000_000;
      const amountInUSDCBigInt = BigInt(Math.floor(amountInUSDC));

      writeDepositContract({
        address: env.NEXT_PUBLIC_AAVE_POOL_ADDRESS as `0x${string}`,
        abi: aavePoolAbi,
        functionName: 'supply',
        args: [
          env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`,
          amountInUSDCBigInt,
          user.wallet.address as `0x${string}`,
          BigInt(1927),
        ],
      });
    }
  },[isApprovalConfirmed, amount, user?.wallet?.address, writeDepositContract])
  
  // Handle validation and formatting of input
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow numbers and at most one decimal point
    // Regex explanation: 
    // ^ - start of string
    // \d* - zero or more digits
    // (\\.\d*)? - optional group of decimal point followed by zero or more digits
    // $ - end of string
    if (value === '' || /^\d*(\.\d*)?$/.test(value)) {
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
        address: env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [env.NEXT_PUBLIC_AAVE_POOL_ADDRESS as `0x${string}`, amountInUSDCBigInt],
      });
    } catch (error) {
      console.error("Error depositing:", error);
    }
  }

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
        address: env.NEXT_PUBLIC_AAVE_POOL_ADDRESS as `0x${string}`,
        abi: aavePoolAbi,
        functionName: 'withdraw',
        args: [
          env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`,
          amountInUSDCBigInt,
          user.wallet.address as `0x${string}`,
        ],
      });

    } catch (error) {
      console.error("Error withdrawing:", error);
    }
  }

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
              <CsvDownloadButton label="Download CSV" />
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
            {lineChartData && lineChartData.length > 0 ? (
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
              <Skeleton className="h-[370px] w-full bg-card" />
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
