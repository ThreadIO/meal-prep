import { NextRequest, NextResponse } from "next/server";
import connect from "@/database/conn";
import { getAll } from "@/helpers/woocommerce";

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

  // Get current date and calculate dates for the current and previous month
  const currentDate = new Date();
  const currentMonthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const previousMonthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  );

  // Fetch orders for the current and previous month
  const currentMonthOrders = await (
    await getAll(userid, "orders", {
      startDate: currentMonthStart.toISOString(),
      endDate: currentDate.toISOString(),
    })
  ).json();
  const previousMonthOrders = await (
    await getAll(userid, "orders", {
      startDate: previousMonthStart.toISOString(),
      endDate: currentMonthStart.toISOString(),
    })
  ).json();

  // Fetch all orders and customers
  const allOrders = await (await getAll(userid, "orders")).json();
  const customers = await (await getAll(userid, "customers")).json();

  // Calculate metrics
  const currentMonthRevenue = calculateTotalRevenue(currentMonthOrders);
  const previousMonthRevenue = calculateTotalRevenue(previousMonthOrders);
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
      currentMonthRevenue,
      previousMonthRevenue,
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

function calculateTotalRevenue(ordersResponse: any): number {
  if (!ordersResponse.data || !Array.isArray(ordersResponse.data)) {
    return 0;
  }
  return ordersResponse.data.reduce(
    (total: any, order: any) => total + parseFloat(order.total),
    0
  );
}

function groupOrdersByCustomer(orders: any[]): Record<string, any[]> {
  return orders.reduce((acc, order) => {
    const customerId = order.customer_id;
    if (!acc[customerId]) {
      acc[customerId] = [];
    }
    acc[customerId].push(order);
    return acc;
  }, {});
}

function calculateAvgOrdersPerCustomer(
  ordersByCustomer: Record<string, any[]>
): number {
  const totalCustomers = Object.keys(ordersByCustomer).length;
  const totalOrders = Object.values(ordersByCustomer).reduce(
    (sum, orders) => sum + orders.length,
    0
  );
  return totalOrders / totalCustomers;
}

function calculateAvgCustomerLifespan(
  ordersByCustomer: Record<string, any[]>
): number {
  const lifespans = Object.values(ordersByCustomer).map((orders) => {
    const firstOrder = new Date(orders[0].date_created);
    const lastOrder = new Date(orders[orders.length - 1].date_created);
    return (
      (lastOrder.getTime() - firstOrder.getTime()) / (1000 * 60 * 60 * 24 * 365)
    ); // Convert to years
  });
  return (
    lifespans.reduce((sum, lifespan) => sum + lifespan, 0) / lifespans.length
  );
}
