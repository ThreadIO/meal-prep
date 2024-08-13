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
  const { userid, startPage = 1, pageCount = 10 } = requestData;

  let allOrders: any[] = [];
  let hasMore = true;
  let currentPage = startPage;

  while (hasMore) {
    const ordersResponse = await getAll(userid, "orders", {
      startPage: currentPage,
      pageCount,
    });
    const ordersData = await ordersResponse.json();

    if (ordersData.success) {
      allOrders = allOrders.concat(ordersData.data);
      hasMore = ordersData.pagination.hasMore;
      currentPage += pageCount;
    } else {
      return NextResponse.json({
        success: false,
        message: "Failed to fetch orders",
        error: ordersData.message,
      });
    }
  }

  const totalRevenue = calculateTotalRevenue(allOrders);
  const validOrderCount = allOrders.filter(
    (order) => order.status === "processing" || order.status === "completed"
  ).length;

  return NextResponse.json({
    success: true,
    data: {
      totalRevenue,
      orderCount: validOrderCount,
    },
  });
}
