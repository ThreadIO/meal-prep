import {
  patchSubscription,
  deleteSubscription,
} from "@/controller/subscription.controller";
import connect from "@/database/conn";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  subscriptionid: string;
}

export async function PATCH(request: NextRequest, context: { params: Params }) {
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  console.log("Subscription Id: ", context.params.subscriptionid);
  const body = JSON.parse(await request.text());
  console.log("Body: ", body);
  const res = await patchSubscription(context.params.subscriptionid, body);
  return res;
}

export async function DELETE(context: { params: Params }) {
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  console.log("Subscription Id: ", context.params.subscriptionid);
  const res = await deleteSubscription(context.params.subscriptionid);
  return res;
}
