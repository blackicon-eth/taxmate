import { BrianChatResponse } from "@/lib/brian/types";
import { env } from "@/lib/env";
import ky from "ky";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const walletAddress = request.headers.get("x-user-address");
  if (!walletAddress) {
    return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  }

  const { message } = await request.json();

  try {
    const { result } = await ky
      .post<BrianChatResponse>(`${env.NEXT_PUBLIC_BRIAN_ENDPOINT}/agent/knowledge`, {
        headers: {
          "x-brian-api-key": env.BRIAN_API_KEY,
          "Content-Type": "application/json",
        },
        json: {
          prompt: message,
        },
        timeout: false,
      })
      .json();

    return NextResponse.json(result.answer, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Error fetching data from Brian", { status: 500 });
  }
};
