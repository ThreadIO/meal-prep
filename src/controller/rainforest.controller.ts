// rainforest.controller.ts

import { NextResponse } from "next/server";

interface SessionParams {
  sessionType: string;
  payinId?: string;
  merchantId?: string;
}

export async function createSession(
  params: SessionParams
): Promise<NextResponse> {
  const { sessionType, payinId, merchantId } = params;
  const auth = process.env.RF_APIKEY;
  const url = `${process.env.RAINFOREST_URL}/v1/sessions`;

  let body;

  switch (sessionType) {
    case "receipt":
      body = {
        statements: [
          {
            permissions: ["group#payin_receipt_component"],
            constraints: {
              payin: { payin_id: payinId },
            },
          },
        ],
        ttl: 3600,
      };
      break;
    case "merchant-deposit-report":
      body = {
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
      };
      break;
    case "merchant-payment-report":
      body = {
        statements: [
          {
            permissions: [
              "group#payment_report_component",
              "group#payment_report_component.create_refund",
            ],
            constraints: {
              merchant: { merchant_id: merchantId },
            },
          },
        ],
        ttl: 3600,
      };
      break;
    default:
      body = {
        statements: [
          {
            permissions: ["group#payment_component"],
            constraints: {
              merchant: { merchant_id: process.env.THREAD_MERCHANT_ID },
            },
          },
        ],
        ttl: 3600,
      };
  }

  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "Rainforest-Api-Version": "2023-12-01",
      "content-type": "application/json",
      authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify(body),
  };

  try {
    const rfResponse = await fetch(url, options);
    const rfResponseJson = await rfResponse.json();

    if (rfResponse.ok) {
      return NextResponse.json({ success: true, response: rfResponseJson });
    } else {
      console.log("Session creation failed");
      return NextResponse.json(
        { success: false, response: rfResponseJson },
        { status: rfResponse.status }
      );
    }
  } catch (e) {
    console.log("Error in creating session:", e);
    return NextResponse.json({ success: false, error: e }, { status: 500 });
  }
}
