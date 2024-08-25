import { getUser } from "@/helpers/request";
/* eslint-disable no-unused-vars */
export const getData = async (
  dataType: string,
  url: string,
  method: string,
  headers: any,
  onSuccess: (data: any) => void,
  onError: (error: any) => void,
  setLoading: (loading: boolean) => void,
  body?: any,
  onCall?: () => void,
  onEnd?: (data: any) => void,
  transformData?: (data: any) => any
) => {
  setLoading(true);
  if (onCall) {
    onCall();
  }
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const errorMessage =
        response.statusText || `Failed to fetch ${dataType} from the server`;
      onError(errorMessage);
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    if (transformData) {
      const transformedData = transformData(responseData.data);
      console.log(`Successfully transformed ${dataType}: `, transformedData);
      onSuccess(transformedData);
    } else {
      onSuccess(responseData.data || []);
    }
    console.log(
      `Successfully fetched ${dataType} from ${url}:`,
      responseData.data
    );
    setLoading(false); // This directly uses the setLoading parameter
    if (onEnd) {
      onEnd(responseData.data);
    }
  } catch (error: any) {
    console.error(`Error fetching ${dataType} from ${url}:`, error);
    onError(error.message || `An error occurred while fetching ${dataType}`);
    setLoading(false); // This directly uses the setLoading parameter
  }
};

export const findObjectByValue = (array: any[], key: string, value: any) => {
  return array.find((obj) => obj[key] === value);
};

export const friendlyUrl = (url: string) => {
  return url.replace(/^(https?:\/\/)/, "");
};

export const threadConnector = async (
  object: any,
  userId: string,
  // eslint-disable-next-line no-unused-vars
  functionToCall: (id: string, url: string) => Promise<void>
) => {
  if (object && Object.keys(object).length > 0) {
    const user = await getUser(userId);
    const url = friendlyUrl(user.settings.url);
    const response = await functionToCall(object.id, url);
    return response;
  }
  return null;
};

export const getProductImage = (product: any) => {
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  if (!product || !product.images) {
    return null;
  }
  let productImage = product.images[0];
  if (productImage && !isValidUrl(productImage.src)) {
    productImage = {
      src: "https://t3.ftcdn.net/jpg/04/60/01/36/360_F_460013622_6xF8uN6ubMvLx0tAJECBHfKPoNOR5cRa.jpg",
    };
  }
  return productImage;
};

export const generateListOfMealIds = (orders: any[]): string[] => {
  // Initialize a Set to store unique meal IDs
  const mealIdSet: Set<string> = new Set();

  // Iterate over each order in the orders array
  for (let order of orders) {
    // Check if the order has line_items property and it's an array
    if (Array.isArray(order.line_items)) {
      // Iterate over each line_item in the order's line_items array
      for (let item of order.line_items) {
        // Check if the line_item has a product_id
        if (item.product_id) {
          // Add the product_id to the Set (this automatically handles duplicates)
          mealIdSet.add(item.product_id);
        }
      }
    }
  }

  // Convert Set to array and return
  return Array.from(mealIdSet);
};

export const decodeHtmlEntities = (str: string) => {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = str;
  return textArea.value;
};

export const convertHtmlToPlainText = (html: string) => {
  // Remove all HTML tags
  let plainText = html.replace(/<[^>]+>/g, "");
  // Decode HTML entities
  plainText = decodeHtmlEntities(plainText);
  // Split into lines and trim
  const lines = plainText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  // Ensure each line starts with a single bullet point
  return lines.map((line) => line.replace(/^•?\s*/, "• ")).join("\n");
};

export const convertToHtml = (formattedString: string) => {
  const lines = formattedString.split("\n");
  return lines
    .map((line) => {
      const trimmedLine = line.trim().replace(/^•\s*/, ""); // Remove leading bullet point
      if (trimmedLine) {
        return `<p class="sh-color-black sh-color" dir="ltr" role="presentation"><span class="sh-color-black sh-color">• ${trimmedLine}</span></p>`;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
};
