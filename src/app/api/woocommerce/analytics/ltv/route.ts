import { NextRequest, NextResponse } from "next/server";
import connect from "@/database/conn";
import { getAll } from "@/helpers/woocommerce";
import {
  calculateAllMetrics,
  processDailyData,
  isValidOrder,
} from "@/helpers/analytics";

export async function POST(request: NextRequest) {
  console.log("Incoming POST request to /api/woocommerce/analytics/ltv");

  try {
    await connect(process.env.NEXT_PUBLIC_COMPANY);

    const requestData = await request.json();
    const {
      userid,
      startDate,
      endDate,
      startPage = 1,
      pageCount = 10,
    } = requestData;

    if (!userid) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch all orders with pagination
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
        return NextResponse.json(
          {
            success: false,
            message: "Failed to fetch orders",
            error: ordersData.message,
          },
          { status: 500 }
        );
      }
    }

    // Filter valid orders
    const validOrders = allOrders.filter(isValidOrder);

    // Calculate all metrics
    const metrics = calculateAllMetrics(validOrders);

    // Process daily data if start and end dates are provided
    let dailyData = null;
    if (startDate && endDate) {
      dailyData = processDailyData(validOrders, startDate, endDate);
    }

    // Prepare the response
    const response = {
      success: true,
      data: {
        metrics: {
          totalRevenue: metrics.totalRevenue,
          totalCustomers: metrics.totalCustomers,
          avgOrderValue: metrics.avgOrderValue,
          avgPurchaseFrequency: metrics.avgPurchaseFrequency,
          avgCustomerLifespan: metrics.avgCustomerLifespan,
          lifetimeValue: metrics.lifetimeValue,
        },
        dailyData: dailyData,
      },
    };

    // Add some logging
    console.log("LTV analysis completed successfully");
    console.log(`Total customers: ${metrics.totalCustomers}`);
    console.log(`Average Order Value: $${metrics.avgOrderValue.toFixed(2)}`);
    console.log(
      `Average Purchase Frequency: ${metrics.avgPurchaseFrequency.toFixed(2)} orders`
    );
    console.log(
      `Average Customer Lifespan: ${metrics.avgCustomerLifespan.toFixed(2)} days`
    );
    console.log(`Lifetime Value: $${metrics.lifetimeValue.toFixed(2)}`);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in LTV analysis:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during LTV analysis",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
