import connect from "@/database/conn";
import { NextRequest, NextResponse } from "next/server";
import { getMerchants } from "@/controller/rainforest.controller";

export async function POST(request: NextRequest) {
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  const req = await request.text();
  const body = req ? JSON.parse(req) : undefined;
  console.log("Body: ", body);
  const res = await getMerchants(body);
  return res;
}
