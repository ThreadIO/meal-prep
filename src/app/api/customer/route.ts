import connect from "@/database/conn";
import { createCustomer } from "@/controller/customer.controller";
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
  const res = await createCustomer(body);
  return res;
}
