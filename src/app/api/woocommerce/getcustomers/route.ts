import { NextRequest, NextResponse } from "next/server";
import connect from "@/database/conn";
import { getAll } from "@/helpers/woocommerce";

export async function POST(request: NextRequest) {
  console.log("Incoming POST request to /api/woocommerce/getcustomers");
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );

  const requestData = await request.json();

  const { userid } = requestData;
  const get_customers_response = getAll(userid, "customers");
  return get_customers_response;
}
