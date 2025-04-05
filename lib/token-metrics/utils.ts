import {
  CurrentAllocations,
  TargetPercentages,
  TokenAllocation,
  TokenData,
  TokenPrices,
} from "./types";

/**
 * Calculates portfolio allocations for given tokens and USDC based on TM_INVESTOR_GRADE values.
 * @param tokens - Array of token data including name, symbol, and TM_INVESTOR_GRADE.
 * @returns An object with token symbols as keys and their respective allocation percentages.
 */
export function calculatePortfolioAllocations(tokens: TokenData[]): Record<string, number> {
  // Calculate the total TM_INVESTOR_GRADE sum
  const totalInvestorGrade = tokens.reduce((sum, token) => sum + token.TM_INVESTOR_GRADE, 0);

  // Calculate the average TM_INVESTOR_GRADE
  const averageInvestorGrade = totalInvestorGrade / tokens.length;

  // Determine the risky allocation as a percentage
  const riskyAllocationPercentage = averageInvestorGrade / 100;

  // Calculate allocations
  const allocations: Record<string, number> = {};

  tokens.forEach((token) => {
    // Proportion of this token's grade relative to the total grade
    const tokenProportion = token.TM_INVESTOR_GRADE / totalInvestorGrade;

    // Allocation for this token within the risky portion
    allocations[token.TOKEN_SYMBOL] = riskyAllocationPercentage * tokenProportion * 100;
  });

  // Allocation for USDC as the remaining portion
  allocations["USDC"] = (1 - riskyAllocationPercentage) * 100;

  return allocations;
}

/**
 * Calculates the rebalancing actions for the portfolio based on the current allocations, target percentages, and token prices.
 * @param currentAllocations - The current allocations of the portfolio.
 * @param targetPercentages - The target percentages of the portfolio.
 * @param tokenPrices - The prices of the tokens.
 * @returns An object with token symbols as keys and their respective rebalancing actions.
 */
export function calculateRebalancing(
  currentAllocations: CurrentAllocations,
  targetPercentages: TargetPercentages,
  tokenPrices: TokenPrices
): TokenAllocation {
  // Calculate the USD value of each token
  const usdValues: Record<string, number> = {};
  let totalUsdValue = 0;

  // First pass: convert all tokens to USD
  for (const token in currentAllocations) {
    const tokenAmount = currentAllocations[token];
    if (token === "USDC") {
      usdValues[token] = tokenAmount; // USDC is already in USD equivalent
    } else {
      const price = tokenPrices[token];
      if (price) {
        usdValues[token] = tokenAmount * price; // Convert token amount to USD
      } else {
        throw new Error(`Price for ${token} is not provided.`);
      }
    }
    totalUsdValue += usdValues[token];
  }

  // Calculate current percentages
  const currentPercentages: Record<string, number> = {};
  for (const token in usdValues) {
    currentPercentages[token] = (usdValues[token] / totalUsdValue) * 100;
  }

  console.log("=== Rebalancing Calculation ===");
  console.log("Current USD values:", usdValues);
  console.log("Current %:", currentPercentages);
  console.log("Target %:", targetPercentages);

  // Calculate target allocations in USD
  const targetAllocationsUSD: Record<string, number> = {};
  for (const token in targetPercentages) {
    targetAllocationsUSD[token] = (targetPercentages[token] / 100) * totalUsdValue;
  }

  console.log("Target USD values:", targetAllocationsUSD);

  // Determine buy/sell actions and amounts
  const adjustments: TokenAllocation = {};
  for (const token in currentAllocations) {
    // Skip if token is not in target percentages
    if (!(token in targetPercentages)) continue;

    const currentAmountUSD = usdValues[token];
    const targetAmountUSD = targetAllocationsUSD[token];

    if (targetAmountUSD !== undefined) {
      const amountDifferenceUSD = targetAmountUSD - currentAmountUSD;

      // Lower threshold for low-value tokens to catch small adjustments
      let minDifferenceThreshold = totalUsdValue * 0.0001; // 0.01% of portfolio by default

      // Skip very small differences
      if (Math.abs(amountDifferenceUSD) < minDifferenceThreshold) {
        console.log(
          `Skipping small rebalance for ${token}: ${amountDifferenceUSD} USD (threshold: ${minDifferenceThreshold})`
        );
        continue;
      }

      const action = amountDifferenceUSD > 0 ? "1" : "0";

      // Convert difference back to token amount if it's not USDC
      const amount =
        token === "USDC"
          ? Math.abs(amountDifferenceUSD)
          : Math.abs(amountDifferenceUSD) / tokenPrices[token];

      // Skip if amount is effectively zero (use a very small threshold)
      if (amount <= 1e-15) continue;

      adjustments[token] = {
        tokenSymbol: token,
        action,
        amount,
      };
    }
  }

  console.log("Adjustments:", adjustments);
  return adjustments;
}

// Get the price of WETH and WBTC from CoinGecko
export const getWETHPrice = async () => {
  // Fetch token prices from API
  const wethPriceResponse = await fetch(
    "https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&vs_currencies=usd"
  );
  const wethPriceData = await wethPriceResponse.json();
  const wethPrice = wethPriceData["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"].usd;
  return wethPrice;
};

// Get the price of WBTC from CoinGecko
export const getWBTCPrice = async () => {
  const wbtcPriceResponse = await fetch(
    "https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0x2260fac5e5542a773aa44fbcfedf7c193bc2c599&vs_currencies=usd"
  );
  const wbtcPriceData = await wbtcPriceResponse.json();
  const wbtcPrice = wbtcPriceData["0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"].usd;
  return wbtcPrice;
};
