import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";

// interface SessionParams {
//   statements: any[]; // Needs permissions AND constraints
//   ttl: number;
// }

// TODO: Remove hardcoded merchantId
// const merchant_id = "sbx_mid_2g6zrrR2AgUpICJFqWIc56FRu3Q"; // Test merchant Id

export async function POST(request: NextRequest) {
  // Get merchant Id
  const auth = process.env.RF_SANDBOX_APIKEY; // Private key

  const url = "https://api.sandbox.rainforestpay.com/v1/sessions";

  const body = JSON.parse(await request.text());

  const { sessionType, payinId, merchantId } = body;

  console.log("body attributes: ", sessionType, payinId, merchantId);

  var options;
  if (sessionType == "receipt") {
    console.log("Received the sessionType: ", sessionType);

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
            permissions: ["group#payin_receipt_component"],
            constraints: {
              payin: {
                payin_id: `${payinId}`,
              },
            },
          },
        ],
        ttl: 3600,
      }),
    };
  } else if (sessionType == "merchant") {
    console.log("Received the sessionType: ", sessionType);

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
            permissions: [
              "group#deposit_report_component",
              "group#deposit_report_component.create_refund",
            ],
            constraints: {
              merchant: { merchant_id: merchantId },
            },
          },
        ],
        ttl: 3600,
      }),
    };
  } else {
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
              merchant: { merchant_id: "sbx_mid_2g6zrrR2AgUpICJFqWIc56FRu3Q" },
            },
          },
        ],
        ttl: 3600,
      }),
    };
  }

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

// Delete a created session
export async function DELETE() {}
