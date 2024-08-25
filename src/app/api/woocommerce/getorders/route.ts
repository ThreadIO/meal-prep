import { NextRequest, NextResponse } from "next/server";
import connect from "@/database/conn";
import { getAll } from "@/helpers/woocommerce";
export async function POST(request: NextRequest) {
  console.log("Incoming POST request to /api/woocommerce/getorders");
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  // Define the endpoint URL -> Need to parameterize this in the future
  const requestData = await request.json();
  // Extract start and end dates from the request body
  const { userid, startDate, endDate } = requestData;
  const get_orders_response = getAll(userid, "orders", { startDate, endDate });
  return get_orders_response;
}
