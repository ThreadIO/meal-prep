export function calculateTotalRevenue(orders: any[]): number {
  if (!orders || !Array.isArray(orders)) {
    return 0;
  }
  return orders.reduce(
    (total: any, order: any) => total + parseFloat(order.total),
    0
  );
}

export function processDailyData(
  orders: any,
  startDate: string,
  endDate: string
) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dailyData = [];
  let cumulativeRevenue = 0;

  for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    const dayStr = day.toISOString().split("T")[0];
    const dayOrders = orders.filter((order: any) =>
      order.date_created.startsWith(dayStr)
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

export function groupOrdersByCustomer(orders: any[]): Record<string, any[]> {
  return orders.reduce((acc, order) => {
    const customerId = order.customer_id;
    if (!acc[customerId]) {
      acc[customerId] = [];
    }
    acc[customerId].push(order);
    return acc;
  }, {});
}

export function calculateAvgOrdersPerCustomer(
  ordersByCustomer: Record<string, any[]>
): number {
  const totalCustomers = Object.keys(ordersByCustomer).length;
  const totalOrders = Object.values(ordersByCustomer).reduce(
    (sum, orders) => sum + orders.length,
    0
  );
  return totalOrders / totalCustomers;
}

export function calculateAvgCustomerLifespan(
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
