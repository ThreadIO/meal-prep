import {
  CalendarDate,
  ZonedDateTime,
  parseDate,
  isSameDay,
  getLocalTimeZone,
  fromDate,
} from "@internationalized/date";

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

export const filterOrdersByDateRange = (
  orders: any,
  startDate: CalendarDate | null,
  endDate: CalendarDate | null
) => {
  if (!startDate && !endDate) return orders;

  return orders.filter((order: any) => {
    const deliveryDate = getDeliveryDate(order);
    if (!deliveryDate) return false;

    // Get the local date string in YYYY-MM-DD format
    const localDateString = deliveryDate.toLocaleDateString("en-CA");

    // Parse the local date string
    const parsedDeliveryDate = parseDate(localDateString);

    if (startDate && endDate) {
      return (
        parsedDeliveryDate.compare(startDate) >= 0 &&
        parsedDeliveryDate.compare(endDate) <= 0
      );
    } else if (startDate) {
      return parsedDeliveryDate.compare(startDate) >= 0;
    } else if (endDate) {
      return parsedDeliveryDate.compare(endDate) <= 0;
    }

    return true;
  });
};

export const filterOrdersByDate = (
  orders: any,
  orderDeliveryDate: CalendarDate
) => {
  if (!orderDeliveryDate) return orders;

  return orders.filter((order: any) => {
    const deliveryDate = getDeliveryDate(order);
    if (!deliveryDate) return false;

    // Get the local date string in YYYY-MM-DD format
    const localDateString = deliveryDate.toLocaleDateString("en-CA");

    // Parse the local date string
    const parsedDeliveryDate = parseDate(localDateString);

    return isSameDay(parsedDeliveryDate, orderDeliveryDate);
  });
};

export const getDeliveryDate = (order: any) => {
  return (
    extractDeliveryDate(order.meta_data) || threadDeliveryDate(order) || null
  );
};

const extractDeliveryDate = (metaData: any[]): Date | null => {
  const deliveryDateObj = metaData.find(
    (item) => item.key === "_orddd_timestamp"
  );
  if (!deliveryDateObj) return null;

  const timestamp = parseInt(deliveryDateObj.value) * 1000;
  const utcDate = new Date(timestamp);

  // Create a new Date object with local year, month, and day
  const localDate = new Date(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate()
  );

  return localDate;
};

const threadDeliveryDate = (order: any): Date | null => {
  const shippingLines = order.shipping_lines;
  if (!shippingLines || shippingLines.length === 0) return null;

  const methodTitle = shippingLines[0].method_title;
  if (!methodTitle) return null;

  console.log("Method Title: ", methodTitle);

  // Extract the date string from the method title
  // This regex now matches the format "Delivery DayOfWeek - Month Day, Year"
  const dateMatch = methodTitle.match(/Delivery \w+ - (\w+ \d+, \d+)/);

  console.log("Date Match: ", dateMatch);
  if (!dateMatch) return null;

  const dateString = dateMatch[1];
  const deliveryDate = new Date(dateString);

  // Check if the parsed date is valid
  if (isNaN(deliveryDate.getTime())) return null;

  return deliveryDate;
};

export function removeTimezoneInfo(dateTimeString: string): string {
  // This regex matches the pattern: any characters, followed by a hyphen or plus,
  // followed by exactly 5 characters (representing the offset),
  // then an opening square bracket, any characters, and a closing square bracket
  const regex = /^(.+)[-+]\d{2}:\d{2}\[.*\]$/;

  const match = dateTimeString.match(regex);

  if (match) {
    return match[1];
  }

  // If the pattern doesn't match, return the original string
  return dateTimeString;
}

export function convertCalendarToZonedDateTime(
  calendarDate: CalendarDate,
  hour?: number,
  minute?: number
): ZonedDateTime {
  const localTimeZone = getLocalTimeZone();
  const date = calendarDate.toDate(localTimeZone);
  const zonedDate = fromDate(date, localTimeZone);
  const zonedDateTime = zonedDate.set({ hour: hour, minute: minute });
  return zonedDateTime;
}
