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
  // Calculate the total current portfolio value in USD
  let totalPortfolioValue = 0;
  for (const token in currentAllocations) {
    if (token === "USDC") {
      totalPortfolioValue += currentAllocations[token]; // USDC value is in USD
    } else {
      const price = tokenPrices[token];
      if (price) {
        totalPortfolioValue += currentAllocations[token] * price;
      } else {
        throw new Error(`Price for ${token} is not provided.`);
      }
    }
  }

  console.log("totalPortfolioValue", totalPortfolioValue);

  // Calculate target allocations in USD
  const targetAllocationsUSD: { [token: string]: number } = {};
  for (const token in targetPercentages) {
    targetAllocationsUSD[token] = (targetPercentages[token] / 100) * totalPortfolioValue;
  }

  // Determine buy/sell actions and amounts
  const adjustments: TokenAllocation = {};
  for (const token in currentAllocations) {
    const currentAmountUSD =
      token === "USDC" ? currentAllocations[token] : currentAllocations[token] * tokenPrices[token];
    const targetAmountUSD = targetAllocationsUSD[token];

    if (targetAmountUSD !== undefined) {
      const amountDifferenceUSD = targetAmountUSD - currentAmountUSD;
      const action = amountDifferenceUSD > 0 ? "1" : "0";
      const amount =
        token === "USDC"
          ? Math.abs(amountDifferenceUSD)
          : Math.abs(amountDifferenceUSD) / tokenPrices[token];

      adjustments[token] = {
        tokenSymbol: token,
        action,
        amount,
      };
    }
  }

  return adjustments;
}
