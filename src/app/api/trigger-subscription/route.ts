import connect from "@/database/conn";
import { triggerSubscription } from "@/controller/subscription.controller";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  const body = JSON.parse(await request.text());
  console.log("Body: ", body);
  const res = await triggerSubscription(
    body.subscriptionid,
    body.nextBillingDate
  );
  return res;
}
