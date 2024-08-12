import { NextRequest, NextResponse } from "next/server";
import connect from "@/database/conn";
import { getAll } from "@/helpers/woocommerce";
import { processDailyData } from "@/helpers/analytics";

export async function POST(request: NextRequest) {
  console.log(
    "Incoming POST request to /api/woocommerce/analytics/month-revenue"
  );

  await connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );

  const requestData = await request.json();
  const { userid, startDate, endDate } = requestData;

  // Fetch orders for the specified date range
  const monthOrdersData = await (
    await getAll(userid, "orders", {
      startDate: startDate,
      endDate: endDate,
    })
  ).json();

  const monthOrders = monthOrdersData.data;

  // Process orders into daily data points
  const dailyData = processDailyData(monthOrders, startDate, endDate);

  return NextResponse.json({
    success: true,
    data: dailyData,
  });
}
