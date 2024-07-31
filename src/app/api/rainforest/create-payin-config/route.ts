import { NextResponse } from "next/server";
import fetch from "node-fetch";

const idemptencyStore: { [key: string]: any } = {};

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json().catch(() => ({}));

    // Get merchant Id
    const merchantId = body.merchantId || "sbx_mid_2g6zrrR2AgUpICJFqWIc56FRu3Q"; // Test merchant Id

    // Use provided idempotency key or generate a new one
    const idempotency_key = body.idempotencyKey || crypto.randomUUID();

    // Use provided amount or default to 1000 ($10.00)
    const amountBilled = body.amount || 1000;
    const currencyCode = body.currencyCode || "USD";

    // TODO: change APIKEY to production
    const auth = process.env.RF_SANDBOX_APIKEY; // Private key

    // TODO: change url to production url
    const url = "https://api.sandbox.rainforestpay.com/v1/payin_configs";
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${auth}`,
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        idempotency_key: idempotency_key,
        amount: amountBilled,
        currency_code: currencyCode,
      }),
    };

    // Check DB for payin config
    const payin = checkDBForPayin(idempotency_key);

    if (payin) {
      return NextResponse.json({
        success: true,
        response: { payin, cache: true },
      });
    } else {
      // Make call to RF and Create Payin Config
      const rfResponse = await fetch(url, options);
      const rfResponseJson = await rfResponse.json();

      if (rfResponse.status == 200) {
        idemptencyStore[idempotency_key] = rfResponseJson;
        return NextResponse.json({ success: true, response: rfResponseJson });
      } else {
        return NextResponse.json(
          { success: false, response: rfResponseJson },
          { status: rfResponse.status }
        );
      }
    }
  } catch (e) {
    console.log("Error in creating the payin w/ user");
    return NextResponse.json({ success: false, error: e }, { status: 400 });
  }
}

// For testing locally
function checkDBForPayin(idempotency_key: string) {
  return idemptencyStore[idempotency_key];
}
