import ky from "ky";
import { env } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";

// https://api.tokenmetrics.com/v2/investor-grades?token_id=3375%2C3306%2C4425&startDate=2024-01-01&endDate=2025-04-03&limit=3&page=0

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Get the token ids
  const tokenIds = searchParams.get("tokenIds");

  if (!tokenIds || tokenIds.length === 0) {
    return new Response(JSON.stringify({ error: "Token IDs are required" }), {
      status: 400,
    });
  }

  // Get the start date
  const startDate = "2024-01-01";

  // Get the end date
  const date = new Date();
  const endDate = date.toISOString().split("T")[0];

  // Get the number of tokens to fetch
  const limit = tokenIds ? tokenIds.split(",").length : 3;

  try {
    const response = await ky
      .get(
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

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch data from Token Metrics" }, { status: 500 });
  }
}
