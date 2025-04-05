"use client";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { DbUser, Movement, Transaction } from "@/lib/db/schemas/db.schema";
import { USDC_ADDRESS, VAULT_ADDRESS, WBTC_ADDRESS, WETH_ADDRESS } from "@/lib/constants";
import { useReadContract } from "wagmi";
import { vaultAbi } from "@/lib/abi/vault";
import { erc20Abi } from "@/lib/abi/erc20";
import { getWETHPrice } from "@/lib/token-metrics/utils";
import { getWBTCPrice } from "@/lib/token-metrics/utils";
import { formatUnits } from "viem";

const VaultDistributionProviderContext = createContext<
  | {
      vaultDistribution: {
        name: string;
        amount: number;
      }[];
    }
  | undefined
>(undefined);

interface VaultDistributionProviderProps {
  children: ReactNode;
}

export const useVaultDistribution = () => {
  const context = useContext(VaultDistributionProviderContext);
  if (!context) {
    throw new Error("useVaultDistribution must be used within a VaultDistributionProvider");
  }
  return context;
};

export const VaultDistributionProvider = ({ children }: VaultDistributionProviderProps) => {
  const [wethPrice, setWethPrice] = useState<number>(0);
  const [wbtcPrice, setWbtcPrice] = useState<number>(0);

  useEffect(() => {
    const fetchPrices = async () => {
      const wethPrice = await getWETHPrice();
      const wbtcPrice = await getWBTCPrice();
      setWethPrice(wethPrice);
      setWbtcPrice(wbtcPrice);
    };
    fetchPrices();
  }, []);

  const { data: WETHBalance } = useReadContract({
    address: WETH_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [VAULT_ADDRESS as `0x${string}`],
  });

  const { data: USDCBalance } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [VAULT_ADDRESS as `0x${string}`],
  });

  const { data: WBTCBalance } = useReadContract({
    address: WBTC_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [VAULT_ADDRESS as `0x${string}`],
  });

  // Convert BigInt balances to numbers with proper decimal handling
  const wethBalanceNum = WETHBalance ? parseFloat(formatUnits(WETHBalance, 18)) : 0;
  const usdcBalanceNum = USDCBalance ? parseFloat(formatUnits(USDCBalance, 6)) : 0;
  const wbtcBalanceNum = WBTCBalance ? parseFloat(formatUnits(WBTCBalance, 8)) : 0;

  console.log("Balances:", wethBalanceNum, usdcBalanceNum, wbtcBalanceNum);

  const totalBalance = useMemo(() => {
    return wethBalanceNum * wethPrice + usdcBalanceNum + wbtcBalanceNum * wbtcPrice;
  }, [wethBalanceNum, usdcBalanceNum, wbtcBalanceNum, wethPrice, wbtcPrice]);

  const vaultDistribution = [
    {
      name: "USDC",
      amount: totalBalance > 0 ? (usdcBalanceNum / totalBalance) * 100 : 0,
    },
    {
      name: "BTC",
      amount: totalBalance > 0 ? ((wbtcBalanceNum * wbtcPrice) / totalBalance) * 100 : 0,
    },
    {
      name: "ETH",
      amount: totalBalance > 0 ? ((wethBalanceNum * wethPrice) / totalBalance) * 100 : 0,
    },
  ];

  console.log(
    "Distribution percentages:",
    vaultDistribution.map((item) => `${item.name}: ${item.amount.toFixed(2)}%`).join(", ")
  );

  return (
    <VaultDistributionProviderContext.Provider value={{ vaultDistribution }}>
      {children}
    </VaultDistributionProviderContext.Provider>
  );
};
