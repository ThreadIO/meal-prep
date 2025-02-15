import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { removeTimezoneInfo } from "@/helpers/date";

import { getUser } from "@/controller/user.controller";
import { decryptField } from "@/helpers/encrypt";

function getHeaders(client_key: string, client_secret: string) {
  const decryptedKey = decryptField(client_key);
  const decryptedSecret = decryptField(client_secret);
  const auth = Buffer.from(`${decryptedKey}:${decryptedSecret}`).toString(
    "base64"
  );
  return {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json",
  };
}

export async function getAllByPagination(
  userid: string,
  object: string,
  {
    startDate,
    endDate,
    startPage = 1,
    pageCount = 1,
  }: {
    startDate?: string;
    endDate?: string;
    startPage?: number;
    pageCount?: number;
  } = {}
) {
  try {
    console.log("Inside getAll woocommerce helper function");
    console.log("Object: ", object);
    console.log("Start Date: ", startDate);
    console.log("End Date: ", endDate);
    console.log("Start Page: ", startPage);
    console.log("Page Count: ", pageCount);

    const user_response = await (await getUser(userid)).json();
    const user = user_response.data;

    const company_url = user.settings.url;
    const endpoint = `${company_url}/wp-json/wc/v3/${object}?per_page=100`;

    const headers = getHeaders(
      user.settings.client_key,
      user.settings.client_secret
    );

    let allData: any[] = [];
    let page = startPage;
    let totalPages = 0;

    while (page < startPage + pageCount) {
      let url = `${endpoint}&page=${page}`;

      if (startDate && endDate) {
        const formattedStartDate = removeTimezoneInfo(startDate);
        const formattedEndDate = removeTimezoneInfo(endDate);
        url += `&after=${formattedStartDate}&before=${formattedEndDate}`;
      }

      console.log("URL: ", url);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          allData = allData.concat(data);
          totalPages = parseInt(response.headers.get("x-wp-totalpages") || "0");
          page++;
        } else {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
      } catch (fetchError: unknown) {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          throw new Error("Request timed out after 30 seconds");
        }
        throw fetchError;
      }
    }

    return {
      data: allData,
      pagination: {
        currentPage: startPage,
        pageCount: pageCount,
        totalPages: totalPages,
        hasMore: page < totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export async function getAll(
  userid: string,
  object: string,
  {
    startDate,
    endDate,
    startPage = 1,
    pageCount = 10,
  }: {
    startDate?: string;
    endDate?: string;
    startPage?: number;
    pageCount?: number;
  } = {}
) {
  try {
    console.log("Inside getAll woocommerce helper function");
    console.log("Object: ", object);
    console.log("Start Date: ", startDate);
    console.log("End Date: ", endDate);
    console.log("Start Page: ", startPage);
    console.log("Page Count: ", pageCount);

    // Retrieve user data
    const user_response = await (await getUser(userid)).json();
    const user = user_response.data;

    // Extract necessary data from user settings
    const company_url = user.settings.url;
    const endpoint = `${company_url}/wp-json/wc/v3/${object}?per_page=100`;

    const headers = getHeaders(
      user.settings.client_key,
      user.settings.client_secret
    );

    // Fetch data from the WooCommerce API
    let allData: any[] = [];
    let page = startPage;
    let nextPageExists = true;
    let totalPages = 0;

    while (nextPageExists && page < startPage + pageCount) {
      // Construct the full URL with query parameters for pagination
      let url = `${endpoint}&page=${page}`;

      if (startDate && endDate) {
        // Convert to UTC strings for the API
        const formattedStartDate = removeTimezoneInfo(startDate);
        const formattedEndDate = removeTimezoneInfo(endDate);

        url += `&after=${formattedStartDate}&before=${formattedEndDate}`;
      }

      console.log("URL: ", url);
      // Fetch data from the current page
      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });

      // Check if the response is successful
      if (response.ok) {
        // Parse the JSON response
        const data = await response.json();
        allData = allData.concat(data);
        // Check if there's a next page
        totalPages = parseInt(response.headers.get("x-wp-totalpages") || "0");
        nextPageExists = page < totalPages;
        page++;
      } else {
        // Handle the case where the response is not successful
        console.error("Failed to fetch data:", response.statusText);
        return NextResponse.json(
          { success: false, message: "Failed to fetch data" },
          { status: response.status }
        );
      }
    }

    // Return a successful response with the fetched data and pagination info
    return NextResponse.json(
      {
        success: true,
        data: allData,
        pagination: {
          currentPage: startPage,
          pageCount: pageCount,
          totalPages: totalPages,
          hasMore: page < totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    );
  }
}

export async function get(userid: string, url: string) {
  console.log("Inside get woocommerce helper function");

  // Retrieve user data
  const user_response = await (await getUser(userid)).json();
  const user = user_response.data;

  // Extract necessary data from user settings
  const company_url = user.settings.url;
  const headers = getHeaders(
    user.settings.client_key,
    user.settings.client_secret
  );
  const endpoint = `${company_url}${url}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: headers,
  });
  const data = await response.json();
  return NextResponse.json({ success: true, data: data }, { status: 200 });
}

export async function post(userid: string, url: string, body: any) {
  try {
    console.log("Inside post woocommerce helper function");
    console.log("Body: ", body);
    // Retrieve user data
    const user_response = await (await getUser(userid)).json();
    const user = user_response.data;

    // Extract necessary data from user settings
    const company_url = user.settings.url;
    const headers = getHeaders(
      user.settings.client_key,
      user.settings.client_secret
    );
    const endpoint = `${company_url}${url}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (response.ok) {
      return NextResponse.json({ success: true, data: data }, { status: 200 });
    } else {
      return NextResponse.json(
        { success: false, message: "An error occurred", data: data },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred", data: error },
      { status: 500 }
    );
  }
}

export async function put(userid: string, url: string, body: any) {
  console.log("Inside patch woocommerce helper function");
  console.log("Body: ", body);

  // Retrieve user data
  const user_response = await (await getUser(userid)).json();
  const user = user_response.data;

  // Extract necessary data from user settings
  const company_url = user.settings.url;
  const headers = getHeaders(
    user.settings.client_key,
    user.settings.client_secret
  );
  const endpoint = `${company_url}${url}`;
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify(body),
  });
  const data = await response.json();
  console.log("Patch Data: ", data);
  return NextResponse.json({ success: true, data: data }, { status: 200 });
}

export async function remove(userid: string, url: string) {
  console.log("Inside remove woocommerce helper function");

  // Retrieve user data
  const user_response = await (await getUser(userid)).json();
  const user = user_response.data;

  // Extract necessary data from user settings
  const company_url = user.settings.url;
  const headers = getHeaders(
    user.settings.client_key,
    user.settings.client_secret
  );
  const endpoint = `${company_url}${url}`;
  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: headers,
  });
  const data = await response.json();
  return NextResponse.json({ success: true, data: data }, { status: 200 });
}

export function filterProductAddons(meta_data: any, product_addons: any) {
  // Filter out the object with key "_product_addons"
  if (!meta_data) return [];
  if (!product_addons) return meta_data;
  let filteredMetaData = meta_data.filter(
    (item: any) => item.key !== "_product_addons"
  );

  // Extract names from the product_addons array
  const productAddonsMetadata = meta_data.find(
    (item: any) => item.key === "_product_addons"
  );

  if (productAddonsMetadata && productAddonsMetadata.value) {
    filteredMetaData.push({
      ...productAddonsMetadata,
      value: product_addons,
    });
  }

  return filteredMetaData;
}

export async function patch(userid: string, url: string, body: any) {
  console.log("Inside patch woocommerce helper function");
  console.log("Body: ", body);

  // Retrieve user data
  const user_response = await (await getUser(userid)).json();
  const user = user_response.data;

  // Extract necessary data from user settings
  const company_url = user.settings.url;
  const headers = getHeaders(
    user.settings.client_key,
    user.settings.client_secret
  );
  const endpoint = `${company_url}${url}`;
  const response = await fetch(endpoint, {
    method: "PATCH",
    headers: headers,
    body: JSON.stringify(body),
  });
  const data = await response.json();
  console.log("Patch Data: ", data);
  return NextResponse.json({ success: true, data: data }, { status: 200 });
}
