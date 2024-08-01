import fetch from "node-fetch";

const idemptencyStore: { [key: string]: any } = {};

interface PayinConfigBody {
  merchantId?: string;
  idempotencyKey?: string;
  amount?: number;
  currencyCode?: string;
}

export async function createPayinConfig(body: PayinConfigBody) {
  try {
    const merchantId = body.merchantId || process.env.THREAD_MERCHANT_ID;
    const idempotency_key = body.idempotencyKey || crypto.randomUUID();
    const amountBilled = body.amount || 1000;
    const currencyCode = body.currencyCode || "USD";

    // TODO: change APIKEY to production
    const auth = process.env.RF_APIKEY;

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
      return {
        success: true,
        response: { payin, cache: true },
      };
    } else {
      // Make call to RF and Create Payin Config
      const rfResponse = await fetch(url, options);
      const rfResponseJson = await rfResponse.json();

      if (rfResponse.status === 200) {
        idemptencyStore[idempotency_key] = rfResponseJson;
        return { success: true, response: rfResponseJson };
      } else {
        return {
          success: false,
          response: rfResponseJson,
          status: rfResponse.status,
        };
      }
    }
  } catch (e) {
    console.log("Error in creating the payin w/ user");
    return { success: false, error: e, status: 400 };
  }
}

export async function createPayinFromPaymentMethod(
  paymentMethodId: string,
  payinConfigId: string
) {
  try {
    const auth = process.env.RF_APIKEY;
    const url = `https://api.sandbox.rainforestpay.com/v1/payment_methods/${paymentMethodId}/payin`;
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${auth}`,
      },
      body: JSON.stringify({
        payin_config_id: payinConfigId,
      }),
    };

    const rfResponse = await fetch(url, options);
    const rfResponseJson = await rfResponse.json();

    if (rfResponse.status === 200) {
      return { success: true, response: rfResponseJson };
    } else {
      return {
        success: false,
        response: rfResponseJson,
        status: rfResponse.status,
      };
    }
  } catch (e) {
    console.log("Error in creating the payin w/ user");
    return { success: false, error: e, status: 400 };
  }
}
// For testing locally
function checkDBForPayin(idempotency_key: string) {
  return idemptencyStore[idempotency_key];
}
