// curl --request POST \
//      --url https://api.tokenmetrics.com/v2/tmai \
//      --header 'accept: application/json' \
//      --header 'api_key: tm-********-****-****-****-************' \
//      --header 'content-type: application/json' \
//      --data '
// {
//   "messages": [
//     {
//       "user": "What is the next 100x coin ?"
//     }
//   ]
// }

import ky from "ky";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const message = "Tell me about the next 10x coin, please.";

  try {
    const response = await ky
      .post("https://api.tokenmetrics.com/v2/tmai", {
        method: "POST",
        headers: {
          accept: "application/json",
          api_key: env.TOKEN_METRICS_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({ messages: [{ user: message }] }),
      })
      .json();

    return new Response(JSON.stringify(response));
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to fetch data from Token Metrics" }), {
      status: 500,
    });
  }
}
