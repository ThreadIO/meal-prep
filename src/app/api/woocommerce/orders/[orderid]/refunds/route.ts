import { NextRequest, NextResponse } from "next/server";
import connect from "@/database/conn";
import { post } from "@/helpers/woocommerce";

interface Params {
  orderid: string;
}

// Issue a full refund for an order
export async function POST(request: NextRequest, context: { params: Params }) {
  const { orderid } = context.params;
  console.log(
    `Incoming POST request to /api/woocommerce/orders/${orderid}/refunds`
  );

  // Establish the database connection
  try {
    await connect(process.env.NEXT_PUBLIC_COMPANY);
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    });
  }

  const requestData = await request.json();
  const { userid } = requestData;
  const { amount } = requestData;
  console.log("Request Data: ", requestData);
  const body = { amount: amount };
  const issue_full_refund_response = await post(
    userid,
    `orders/${orderid}/refunds`,
    body
  );
  return issue_full_refund_response;
}
