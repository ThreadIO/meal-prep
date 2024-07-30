import connect from "@/database/conn";
import { getSubscriptions } from "@/controller/subscription.controller";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log(`Get Subscriptions in specific org in MongoDb...`);
  const body = JSON.parse(await request.text());
  console.log(`Org ID: ${body.orgid}`);
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  const res = await getSubscriptions(body.orgid);
  return res;
}
