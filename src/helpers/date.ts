import { CalendarDate, parseDate, isSameDay } from "@internationalized/date";
export const friendlyDate = (
  date: Date | null,
  includeMinutes: boolean = false
): string => {
  if (date === null) {
    return "";
  }
  return includeMinutes
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
};
export const filterOrdersByDate = (
  orders: any,
  orderDeliveryDate: CalendarDate
) => {
  if (!orderDeliveryDate) return orders;
  console.log("order Delivery Date", orderDeliveryDate);
  return orders.filter((order: any) => {
    const deliveryDate = getDeliveryDate(order);
    if (!deliveryDate) return false;

    // Extract only the date part as YYYY-MM-DD
    const isoDateString = deliveryDate.toISOString().split("T")[0];

    // Parse date in the correct format
    const parsedDeliveryDate = parseDate(isoDateString);

    return isSameDay(parsedDeliveryDate, orderDeliveryDate);
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

    // Create a new Date object for the cutoff (Thursday at 23:59)
    const cutoff = new Date(date);
    cutoff.setHours(23, 59, 0, 0);
    if (currentDay < 4) {
      // If it's earlier in the week, set to previous Thursday
      cutoff.setDate(cutoff.getDate() - ((cutoff.getDay() + 3) % 7));
    }

    // If it's after the cutoff, add a week
    if (date > cutoff || currentDay === 5 || currentDay === 6) {
      daysUntilNext += 7;
    }

    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + daysUntilNext);
    nextDate.setHours(0, 0, 0, 0); // Set to the beginning of the day
    return nextDate;
  };

  const nextDeliveryDate = getNextDayOfWeek(datePaid, dayOfWeek);
  return nextDeliveryDate;
};
