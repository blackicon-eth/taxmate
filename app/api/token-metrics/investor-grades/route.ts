import ky from "ky";
import { env } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";
import { calculatePortfolioAllocations, calculateRebalancing } from "@/lib/token-metrics/utils";
import {
  CurrentAllocations,
  TMInvestorGradeResponse,
  TargetPercentages,
  TokenAllocation,
  TokenPrices,
} from "@/lib/token-metrics/types";

const actualAllocationsAmounts: CurrentAllocations = {
  ETH: 5.4,
  BTC: 0.67,
  UNI: 22.76,
  USDC: 5000,
};

const tokenPrices: TokenPrices = {
  ETH: 1770.69, // Current price of ETH in USD
  BTC: 81982.0, // Current price of BTC in USD
  UNI: 5.7, // Current price of UNI in USD
  USDC: 1.0, // Current price of USDC in USD
};

export async function GET(request: NextRequest) {
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
    console.log(desiredAllocations);

    const rebalancing: TokenAllocation = calculateRebalancing(
      actualAllocationsAmounts,
      desiredAllocations,
      tokenPrices
    );
    console.log(rebalancing);

    // Calculate the total amount to rebalance by multiplying the amount by the price
    const rebalanceAmount = Object.values(rebalancing).reduce((acc, curr) => {
      return acc + curr.amount * tokenPrices[curr.tokenSymbol];
    }, 0);
    console.log("rebalanceAmount", rebalanceAmount);

    return NextResponse.json(desiredAllocations, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch data from Token Metrics" }, { status: 500 });
  }
}
