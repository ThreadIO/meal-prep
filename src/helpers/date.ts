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
  if (!shippingLines || shippingLines.length === 0) return null;

  const methodTitle = shippingLines[0].method_title;
  if (!methodTitle) return null;

  const datePaid = new Date(order.date_paid);
  if (isNaN(datePaid.getTime())) return null;

  const isWednesdayDelivery = methodTitle.toLowerCase().includes("wednesday");
  const isSundayDelivery = methodTitle.toLowerCase().includes("sunday");

  if (!isWednesdayDelivery && !isSundayDelivery) return null;

  const getCutoffDate = (date: Date) => {
    const cutoff = new Date(date);
    cutoff.setDate(cutoff.getDate() + ((5 - cutoff.getDay() + 7) % 7));
    cutoff.setHours(0, 0, 0, 0);
    return cutoff;
  };

  const getNextDayOfWeek = (date: Date, dayOfWeek: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + ((dayOfWeek - result.getDay() + 7) % 7));
    return result;
  };

  const cutoffDate = getCutoffDate(datePaid);
  let nextDeliveryDate;

  if (isWednesdayDelivery) {
    nextDeliveryDate = getNextDayOfWeek(datePaid, 3);
    if (datePaid >= cutoffDate || nextDeliveryDate <= datePaid) {
      nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 7);
    }
  } else {
    nextDeliveryDate = getNextDayOfWeek(datePaid, 0);
    if (datePaid >= cutoffDate) {
      nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 7);
    }
  }

  const ensureMinimumDeliveryTime = (datePaid: Date, deliveryDate: Date) => {
    const twoDaysInMilliseconds = 2 * 24 * 60 * 60 * 1000;
    const timeDifference = deliveryDate.getTime() - datePaid.getTime();

    if (timeDifference < twoDaysInMilliseconds) {
      deliveryDate.setDate(deliveryDate.getDate() + 7);
    }

    return deliveryDate;
  };

  nextDeliveryDate = ensureMinimumDeliveryTime(datePaid, nextDeliveryDate);

  return nextDeliveryDate;
};
