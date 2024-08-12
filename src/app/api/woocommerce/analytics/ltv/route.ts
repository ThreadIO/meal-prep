import { NextRequest, NextResponse } from "next/server";
import connect from "@/database/conn";
import { getAll } from "@/helpers/woocommerce";
import {
  calculateTotalRevenue,
  calculateAvgCustomerLifespan,
  calculateAvgOrdersPerCustomer,
  groupOrdersByCustomer,
} from "@/helpers/analytics";
export async function POST(request: NextRequest) {
  console.log("Incoming POST request to /api/woocommerce/analytics");

  await connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );

  const requestData = await request.json();
  const { userid } = requestData;

  // Fetch all orders and customers
  const allOrders = await (await getAll(userid, "orders")).json();
  const customers = await (await getAll(userid, "customers")).json();

  const totalRevenue = calculateTotalRevenue(allOrders);
  const totalCustomers = customers.data.length;

  // Calculate LTV metrics
  const ordersByCustomer = groupOrdersByCustomer(allOrders.data);
  const avgOrdersPerCustomer = calculateAvgOrdersPerCustomer(ordersByCustomer);
  const avgOrderValue = totalRevenue / allOrders.data.length;
  const totalCustomerValue = totalRevenue / totalCustomers;
  const avgCustomerLifespan = calculateAvgCustomerLifespan(ordersByCustomer);

  return NextResponse.json({
    success: true,
    data: {
      totalRevenue,
      totalCustomers,
      ltv: {
        avgOrdersPerCustomer,
        avgOrderValue,
        totalCustomerValue,
        avgCustomerLifespan,
      },
    },
  });
}
