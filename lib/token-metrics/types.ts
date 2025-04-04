export interface TMInvestorGradeResponse {
  data: TokenData[];
  length: number;
  message: string;
  success: boolean;
}

export interface TokenData {
  TOKEN_ID: number;
  TOKEN_NAME: string;
  TOKEN_SYMBOL: string;
  DATE: string; // ISO 8601 date string
  TM_INVESTOR_GRADE: number;
  TM_INVESTOR_GRADE_7D_PCT_CHANGE: number;
  FUNDAMENTAL_GRADE: number;
  TECHNOLOGY_GRADE: number;
  VALUATION_GRADE: number;
  DEFI_USAGE_SCORE: number | null;
  COMMUNITY_SCORE: number;
  EXCHANGE_SCORE: number;
  VC_SCORE: number | null;
  TOKENOMICS_SCORE: number;
  DEFI_SCANNER_SCORE: number | null;
  ACTIVITY_SCORE: number;
  SECURITY_SCORE: number | null;
  REPOSITORY_SCORE: number;
  COLLABORATION_SCORE: number;
}

export interface TokenAllocation {
  [tokenSymbol: string]: {
    tokenSymbol: string;
    action: "1" | "0"; // '1' for buying, '0' for selling
    amount: number;
  };
}

export interface CurrentAllocations {
  [tokenSymbol: string]: number;
}

export interface TargetPercentages {
  [tokenSymbol: string]: number;
}

export interface TokenPrices {
  [tokenSymbol: string]: number;
}
