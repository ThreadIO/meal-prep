import { NextRequest, NextResponse } from "next/server";
import connect from "@/database/conn";
import { getAll } from "@/helpers/woocommerce";
import { calculateTotalRevenue } from "@/helpers/analytics";

export async function POST(request: NextRequest) {
  console.log(
    "Incoming POST request to /api/woocommerce/analytics/total-revenue"
  );

  await connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );

  const requestData = await request.json();
  const { userid } = requestData;

  // Get current date and calculate dates for the current and previous month

  // Fetch all orders and customers
  const allOrdersData = await (await getAll(userid, "orders")).json();

  const allOrders = allOrdersData.data;
  // Calculate metrics
  const totalRevenue = calculateTotalRevenue(allOrders);

  return NextResponse.json({
    success: true,
    data: {
      totalRevenue,
    },
  });
}
