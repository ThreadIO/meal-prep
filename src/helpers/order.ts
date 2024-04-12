interface Order {
  line_items: { name: string; quantity: number }[];
}

interface MealCount {
  mealName: string;
  count: number;
}

export function getMealsFromOrders(orders: Order[]): MealCount[] {
  const mealsMap: { [meal: string]: number } = {};

  orders.forEach((order) => {
    order.line_items.forEach((item) => {
      const { name, quantity } = item;
      if (mealsMap[name]) {
        mealsMap[name] += quantity;
      } else {
        mealsMap[name] = quantity;
      }
    });
  });

  return Object.entries(mealsMap).map(([mealName, count]) => ({
    mealName,
    count,
  }));
}
