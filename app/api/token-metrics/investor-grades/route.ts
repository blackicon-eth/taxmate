import ky from "ky";
import { env } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";
import {
  calculatePortfolioAllocations,
  calculateRebalancing,
  getWBTCPrice,
  getWETHPrice,
} from "@/lib/token-metrics/utils";
import {
  CurrentAllocations,
  TMInvestorGradeResponse,
  TargetPercentages,
  TokenAllocation,
  TokenPrices,
} from "@/lib/token-metrics/types";
import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { erc20Abi } from "@/lib/abi/erc20";
import { USDC_ADDRESS, WETH_ADDRESS, VAULT_ADDRESS, WBTC_ADDRESS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const client = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  });

  // Fetch token balances
  const wethBalance = await client.readContract({
    address: WETH_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [VAULT_ADDRESS],
  });

  const wbtcBalance = await client.readContract({
    address: WBTC_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [VAULT_ADDRESS],
  });

  const usdcBalance = await client.readContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [VAULT_ADDRESS],
  });

  // Fetch token prices from API
  const wethPrice = await getWETHPrice();
  const wbtcPrice = await getWBTCPrice();

  // Set up token prices from API data
  const tokenPrices: TokenPrices = {
    ETH: wethPrice,
    BTC: wbtcPrice,
    USDC: 1.0,
  };

  // Calculate total portfolio value in USD
  const totalPortfolioValue =
    (Number(wethBalance) / 1e18) * wethPrice +
    (Number(wbtcBalance) / 1e18) * wbtcPrice +
    Number(usdcBalance) / 1e6;

  // Calculate actual token amounts (in their native units with correct decimals)
  const currentAllocationsAmounts: CurrentAllocations = {
    ETH: Number(wethBalance) / 1e18,
    BTC: Number(wbtcBalance) / 1e18,
    USDC: Number(usdcBalance) / 1e6,
  };

  // Calculate USD values for each token
  const usdValues = {
    ETH: currentAllocationsAmounts.ETH * wethPrice,
    BTC: currentAllocationsAmounts.BTC * wbtcPrice,
    USDC: currentAllocationsAmounts.USDC,
  };

  const totalUsdValue = usdValues.ETH + usdValues.BTC + usdValues.USDC;

  // Calculate percentages for display with higher precision for small amounts
  const currentAllocationPercentages = {
    ETH: (usdValues.ETH / totalUsdValue) * 100,
    BTC: (usdValues.BTC / totalUsdValue) * 100,
    USDC: (usdValues.USDC / totalUsdValue) * 100,
  };

  console.log("=== Current Portfolio ===");
  console.log("Balances:", currentAllocationsAmounts);
  console.log("USD Values:", usdValues);
  console.log("Current %:", currentAllocationPercentages);

  const { searchParams } = new URL(request.url);

  // Get the token ids
  const tokenIds = searchParams.get("tokenIds");

  if (!tokenIds || tokenIds.length === 0) {
    return new Response(JSON.stringify({ error: "Token IDs are required" }), {
      status: 400,
    });
  }

  // Start date
  const startDate = "2024-01-01";

  // Get the end date
  const date = new Date();
  const endDate = date.toISOString().split("T")[0];

  // Get the number of tokens to fetch
  const limit = tokenIds ? tokenIds.split(",").length : 3;

  // Create a wallet client using the private key from environment variables
  const account = privateKeyToAccount(env.PVK as `0x${string}`);
  const walletClient = createWalletClient({
    account,
    chain: arbitrumSepolia,
    transport: http(),
  });

  console.log("Using account:", account.address);

  // Example of a contract write transaction
  async function executeRebalance(
    tokensToSwap: string[],
    zeroToOne: boolean[],
    amountIn: string[]
  ) {
    console.log("Executing rebalance...");
    try {
      // Assume you have a vault contract ABI with a rebalance function
      const vaultAbi = [
        {
          inputs: [
            { internalType: "address[]", name: "tokens_to_swap", type: "address[]" },
            { internalType: "bool[]", name: "zero_to_one", type: "bool[]" },
            { internalType: "uint256[]", name: "amount_in", type: "uint256[]" },
          ],
          name: "rebalance",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ];

      // Convert string amounts to BigInt
      const amountInBigInt = amountIn.map((amount) => BigInt(amount));

      // Execute the contract write transaction
      const hash = await walletClient.writeContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: vaultAbi,
        functionName: "rebalance",
        args: [tokensToSwap as `0x${string}`[], zeroToOne, amountInBigInt],
        gas: BigInt(8000000),
      });

      console.log("Transaction submitted:", hash);
      return hash;
    } catch (error) {
      console.error("Error executing rebalance:", error);
      throw error;
    }
  }

  try {
    const response = await ky
      .get<TMInvestorGradeResponse>(
        `${env.NEXT_PUBLIC_TOKEN_METRICS_ENDPOINT}/investor-grades?token_id=${encodeURIComponent(
          tokenIds
        )}&startDate=${startDate}&endDate=${endDate}&limit=${limit}&page=0`,
        {
          headers: {
            accept: "application/json",
            api_key: env.TOKEN_METRICS_API_KEY,
          },
        }
      )
      .json();

    const desiredAllocations: TargetPercentages = calculatePortfolioAllocations(response.data);
    console.log("=== Target Allocations ===");
    console.log("Target %:", desiredAllocations);

    const rebalancing: TokenAllocation = calculateRebalancing(
      currentAllocationsAmounts,
      desiredAllocations,
      tokenPrices
    );

    // Format data for rebalance function parameters
    const tokensToSwap: string[] = [];
    const zeroToOne: boolean[] = [];
    const amountIn: string[] = [];

    // Filter out USDC as a token to swap and any zero-amount transactions
    // We only want to swap ETH<>USDC and BTC<>USDC based on contract implementation
    Object.entries(rebalancing).forEach(([tokenSymbol, adjustment]) => {
      // Skip USDC entries - we don't swap USDC directly, it's the base pair
      if (tokenSymbol === "USDC") {
        return;
      }

      // Use a much lower threshold since BTC now has 18 decimals
      const minAmount = 1e-15; // Very small amount to filter out true zeros
      if (adjustment.amount < minAmount) {
        console.log(`Skipping near-zero amount for ${tokenSymbol}: ${adjustment.amount}`);
        return;
      }

      tokensToSwap.push(tokenSymbol === "ETH" ? WETH_ADDRESS : WBTC_ADDRESS);

      // In the smart contract:
      // true = token -> USDC (selling token)
      // false = USDC -> token (buying token)
      const isZeroToOne = adjustment.action === "0"; // 0 = sell, 1 = buy
      zeroToOne.push(isZeroToOne);

      let amountInWei;

      if (isZeroToOne) {
        // SELLING token: amount is in token units
        // Convert token amount to wei
        amountInWei = BigInt(Math.floor(adjustment.amount * 10 ** 18));
      } else {
        // BUYING token: amount should be in USDC
        // Calculate the USD value needed
        const usdValueNeeded = adjustment.amount * tokenPrices[tokenSymbol];
        // Convert USD value to USDC with 6 decimals
        amountInWei = BigInt(Math.floor(usdValueNeeded * 10 ** 6));
      }

      // Ensure no zero amounts
      if (amountInWei === BigInt(0)) {
        amountInWei = BigInt(1);
      }

      amountIn.push(amountInWei.toString());
    });

    // Calculate human-readable amounts for display
    const humanReadableAmounts = [];
    for (let i = 0; i < tokensToSwap.length; i++) {
      let tokenSymbol = "Unknown";
      if (tokensToSwap[i] === WETH_ADDRESS) tokenSymbol = "ETH";
      else if (tokensToSwap[i] === WBTC_ADDRESS) tokenSymbol = "BTC";

      const action = zeroToOne[i] ? "Sell" : "Buy";

      let amount;
      if (zeroToOne[i]) {
        // For selling: amount is in token units (18 decimals)
        amount = (Number(amountIn[i]) / 10 ** 18).toFixed(18);
      } else {
        // For buying: amount is in USDC (6 decimals)
        const usdcAmount = (Number(amountIn[i]) / 10 ** 6).toFixed(6);
        // Add the equivalent token amount for reference
        const tokenAmount = Number(usdcAmount) / tokenPrices[tokenSymbol];
        amount = `${usdcAmount} USDC (≈ ${tokenAmount.toFixed(18)} ${tokenSymbol})`;
      }

      humanReadableAmounts.push({
        token: tokenSymbol,
        action,
        amount,
      });
    }

    // Make sure we log the full adjustment info for debugging
    console.log("Raw Adjustments:", rebalancing);

    console.log("=== Rebalance Parameters ===");
    console.log(
      "tokens_to_swap:",
      tokensToSwap.map((addr) =>
        addr === WETH_ADDRESS ? "ETH" : addr === WBTC_ADDRESS ? "BTC" : addr
      )
    );
    console.log("zero_to_one:", zeroToOne);
    console.log("amount_in (wei):", amountIn);
    console.log("=== Human Readable Amounts ===");
    console.log(humanReadableAmounts);

    // Check if we should execute rebalancing directly
    // You could add a query parameter to control this
    const shouldExecuteRebalance = request.url.includes("execute=true");
    let transactionHash = null;

    try {
      transactionHash = await executeRebalance(tokensToSwap, zeroToOne, amountIn);
    } catch (error) {
      console.error("Failed to execute rebalance:", error);
    }

    // Return both desired allocations and current token amounts
    return NextResponse.json(
      {
        desiredAllocations,
        currentAllocationAmounts: currentAllocationsAmounts,
        currentAllocationPercentages,
        rebalance: {
          tokens_to_swap: tokensToSwap,
          zero_to_one: zeroToOne,
          amount_in: amountIn,
        },
        humanReadable: humanReadableAmounts,
        execution: shouldExecuteRebalance
          ? {
              status: transactionHash ? "success" : "failed",
              transactionHash,
            }
          : {
              status: "not_executed",
            },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch data from Token Metrics" }, { status: 500 });
  }
}
