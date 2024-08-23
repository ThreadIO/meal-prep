import connect from "@/database/conn";
import { NextResponse } from "next/server";
import { getMerchants } from "@/controller/rainforest.controller";

export async function POST() {
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  const res = await getMerchants();
  return res;
}
