// analytics-helpers.ts

/**
 * Checks if an order is valid for calculation purposes.
 * @param order The order object to check
 * @returns boolean indicating if the order is valid
 */
export function isValidOrder(order: any): boolean {
  return (
    (order.status === "processing" || order.status === "completed") &&
    parseFloat(order.total) > 0
  );
}

/**
 * Calculates the total revenue from all valid orders.
 * @param orders Array of all orders
 * @returns Total revenue as a number
 */
export function calculateTotalRevenue(orders: any[]): number {
  return orders
    .filter(isValidOrder)
    .reduce((total: number, order: any) => total + parseFloat(order.total), 0);
}

/**
 * Groups orders by customer ID.
 * @param orders Array of all orders
 * @returns Object with customer IDs as keys and arrays of their orders as values
 */
export function groupOrdersByCustomer(orders: any[]): Record<string, any[]> {
  return orders.filter(isValidOrder).reduce((acc, order) => {
    const customerId = order.customer_id;
    if (!acc[customerId]) {
      acc[customerId] = [];
    }
    acc[customerId].push(order);
    return acc;
  }, {});
}

/**
 * Calculates the Average Order Value (AOV).
 * @param orders Array of all orders
 * @returns AOV as a number
 */
export function calculateAOV(orders: any[]): number {
  const validOrders = orders.filter(isValidOrder);
  const totalRevenue = validOrders.reduce(
    (sum, order) => sum + parseFloat(order.total),
    0
  );
  return validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
}

/**
 * Calculates the average purchase frequency per customer.
 * @param ordersByCustomer Object with customer IDs as keys and arrays of their orders as values
 * @returns Average purchase frequency as a number
 */
export function calculatePurchaseFrequency(
  ordersByCustomer: Record<string, any[]>
): number {
  const totalOrders = Object.values(ordersByCustomer).reduce(
    (sum, orders) => sum + orders.length,
    0
  );
  const totalCustomers = Object.keys(ordersByCustomer).length;
  return totalCustomers > 0 ? totalOrders / totalCustomers : 0;
}

/**
 * Calculates the average customer lifespan in days.
 * @param ordersByCustomer Object with customer IDs as keys and arrays of their orders as values
 * @returns Average customer lifespan in days
 */
export function calculateAvgCustomerLifespan(
  ordersByCustomer: Record<string, any[]>
): number {
  const lifespans = Object.values(ordersByCustomer).map((orders) => {
    if (orders.length < 2) return 0;
    const sortedOrders = orders.sort(
      (a, b) =>
        new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
    );
    const firstOrder = new Date(sortedOrders[0].date_created);
    const lastOrder = new Date(
      sortedOrders[sortedOrders.length - 1].date_created
    );
    return (lastOrder.getTime() - firstOrder.getTime()) / (1000 * 60 * 60 * 24); // Convert to days
  });

  return lifespans.length > 0
    ? lifespans.reduce((sum, span) => sum + span, 0) / lifespans.length
    : 0;
}

/**
 * Calculates the Customer Lifetime Value (LTV).
 * @param totalRevenue Total Revenue
 * @param totalCustomers Total Customers
 * @returns LTV as a number
 */
export function calculateLTV(
  totalRevenue: number,
  totalCustomers: number
): number {
  return totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
}

/**
 * Processes daily data for revenue and orders.
 * @param orders Array of all orders
 * @param startDate Start date for the analysis period
 * @param endDate End date for the analysis period
 * @returns Array of daily data objects
 */
export function processDailyData(
  orders: any[],
  startDate: string,
  endDate: string
) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dailyData = [];
  let cumulativeRevenue = 0;

  for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    const dayStr = day.toISOString().split("T")[0];
    const dayOrders = orders.filter(
      (order: any) =>
        isValidOrder(order) && order.date_created.startsWith(dayStr)
    );

    const dayRevenue = dayOrders.reduce(
      (sum: number, order: any) => sum + parseFloat(order.total),
      0
    );
    cumulativeRevenue += dayRevenue;

    dailyData.push({
      date: dayStr,
      orders: dayOrders.length,
      revenue: dayRevenue,
      cumulativeRevenue: cumulativeRevenue,
    });
  }

  return dailyData;
}

/**
 * Calculates all key metrics for LTV analysis.
 * @param orders Array of all orders
 * @returns Object containing all calculated metrics
 */
export function calculateAllMetrics(orders: any[]) {
  const ordersByCustomer = groupOrdersByCustomer(orders);
  const totalRevenue = calculateTotalRevenue(orders);
  const totalCustomers = Object.keys(ordersByCustomer).length;
  const aov = calculateAOV(orders);
  const purchaseFrequency = calculatePurchaseFrequency(ordersByCustomer);
  const avgCustomerLifespan = calculateAvgCustomerLifespan(ordersByCustomer);
  const ltv = calculateLTV(totalRevenue, totalCustomers);

  return {
    totalRevenue,
    totalCustomers,
    avgOrderValue: aov,
    avgPurchaseFrequency: purchaseFrequency,
    avgCustomerLifespan,
    lifetimeValue: ltv,
  };
}
