import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";

export async function POST(request: NextRequest) {
  // Get merchant Id
  const auth = process.env.RF_APIKEY; // Private key

  const body = await request.text();

  const { payinId } = JSON.parse(body);
  const url = `https://api.sandbox.rainforestpay.com/v1/payins/${payinId}`;

  // const sessionType = ""
  // const payinId= ""
  // const merchantId = ""

  console.log("body attributes: ", payinId);

  var options;
  options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "Rainforest-Api-Version": "2023-12-01",
      "content-type": "application/json",
      authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify({
      statements: [
        {
          permissions: ["group#payment_component"],
          // TODO: remove hardcoded merchant Id
          constraints: {
            merchant: { merchant_id: process.env.THREAD_MERCHANT_ID },
          },
        },
      ],
      ttl: 3600,
    }),
  };

  try {
    const rfResponse = await fetch(url, options);
    const rfResponseJson = await rfResponse.json();

    if (rfResponse.status == 200) {
      return NextResponse.json({ success: true, response: rfResponseJson });
    } else {
      console.log("didn't work");
      return NextResponse.json(
        { success: false, response: rfResponseJson },
        { status: rfResponse.status }
      );
    }
  } catch (e) {
    console.log("Error in creating session for user");
    return NextResponse.json({ success: false, error: e }, { status: 400 });
  }
}
