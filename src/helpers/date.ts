export const filterOrdersByDate = (orders: any, orderDeliveryDate: any) => {
  if (!orderDeliveryDate) return orders;

  const start = new Date(orderDeliveryDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(orderDeliveryDate);
  end.setHours(23, 59, 59, 999);
  console.log("order Delivery Date", orderDeliveryDate);
  console.log("start", start);
  console.log("end", end);
  return orders.filter((order: any) => {
    const deliveryDate = getDeliveryDate(order);
    if (!deliveryDate) return false;
    const normalizedDeliveryDate = new Date(deliveryDate);
    normalizedDeliveryDate.setHours(0, 0, 0, 0); // Normalize to start of the day
    return normalizedDeliveryDate >= start && normalizedDeliveryDate <= end;
  });
};

export const getDeliveryDate = (order: any) => {
  return extractDeliveryDate(order.meta_data) || threadDeliveryDate(order);
};

const extractDeliveryDate = (metaData: any[]) => {
  const deliveryDateObj = metaData.find(
    (item) => item.key === "_orddd_timestamp"
  );
  if (!deliveryDateObj) return null;

  const deliveryDate = new Date(parseInt(deliveryDateObj.value) * 1000);
  deliveryDate.setHours(0, 0, 0, 0); // Normalize to start of the day
  return deliveryDate;
};

const threadDeliveryDate = (order: any): Date | null => {
  const shippingLines = order.shipping_lines;
  if (!shippingLines || shippingLines.length === 0) {
    return null; // Handle case where there are no shipping lines
  }

  const shippingLineItem = shippingLines[0];
  const methodTitle = shippingLineItem.method_title;
  if (!methodTitle) {
    return null; // Handle case where there is no method_title
  }

  // Regular expression to find the day in the method_title
  const dayRegex =
    /\b(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\b/;
  const matchedDay = methodTitle.match(dayRegex);
  if (!matchedDay) {
    return null; // Handle case where no day is found
  }

  const dayOfWeek = matchedDay[0];
  const datePaid = new Date(order.date_paid);
  if (isNaN(datePaid.getTime())) {
    return null; // Handle invalid date_paid
  }

  // Helper function to find the next occurrence of a specific day of the week
  const getNextDayOfWeek = (date: Date, dayName: string): Date => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const targetDay = daysOfWeek.indexOf(dayName);
    const currentDay = date.getDay();
    let daysUntilNext = (targetDay - currentDay + 7) % 7;
    if (daysUntilNext === 0) {
      daysUntilNext = 7; // Move to the next week if the day is today
    }
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + daysUntilNext);
    return nextDate;
  };

  const nextDeliveryDate = getNextDayOfWeek(datePaid, dayOfWeek);
  nextDeliveryDate.setHours(0, 0, 0, 0); // Set to the beginning of the day
  return nextDeliveryDate; // Return the Date object
};
