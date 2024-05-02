import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { format } from "date-fns";
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

export async function getAll(
  userid: string,
  object: string,
  { startDate, endDate }: { startDate?: string; endDate?: string } = {}
) {
  try {
    console.log("Inside getAll woocommerce helper function");
    console.log("Object: ", object);
    console.log("Start Date: ", startDate);
    console.log("End Date: ", endDate);

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
    let page = 1;
    let nextPageExists = true;

    while (nextPageExists) {
      // Construct the full URL with query parameters for pagination
      let url = `${endpoint}&page=${page}`;
      if (startDate && endDate) {
        const formattedStartDate = format(
          new Date(startDate),
          "yyyy-MM-dd'T'HH:mm:ss"
        );
        const formattedEndDate = format(
          new Date(endDate),
          "yyyy-MM-dd'T'HH:mm:ss"
        );
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
        const totalPages = parseInt(
          response.headers.get("x-wp-totalpages") || "0"
        );
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

    // Return a successful response with the fetched data
    return NextResponse.json({ success: true, data: allData }, { status: 200 });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    );
  }
}

export async function get(userid: string, object: string, objectid: string) {
  console.log("Inside getAll woocommerce helper function");
  console.log("Object: ", object);
  console.log("Object ID: ", objectid);

  // Retrieve user data
  const user_response = await (await getUser(userid)).json();
  const user = user_response.data;

  // Extract necessary data from user settings
  const company_url = user.settings.url;
  const headers = getHeaders(
    user.settings.client_key,
    user.settings.client_secret
  );
  const endpoint = `${company_url}/wp-json/wc/v3/${object}/${objectid}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: headers,
  });
  const data = await response.json();
  return NextResponse.json({ success: true, data: data }, { status: 200 });
}

export async function post(userid: string, object: string, body: any) {
  console.log("Inside post woocommerce helper function");
  console.log("Object: ", object);

  // Retrieve user data
  const user_response = await (await getUser(userid)).json();
  const user = user_response.data;

  // Extract necessary data from user settings
  const company_url = user.settings.url;
  const headers = getHeaders(
    user.settings.client_key,
    user.settings.client_secret
  );
  const endpoint = `${company_url}/wp-json/wc/v3/${object}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return NextResponse.json({ success: true, data: data }, { status: 200 });
}

export async function patch(
  userid: string,
  object: string,
  objectid: string,
  body: any
) {
  console.log("Inside patch woocommerce helper function");
  console.log("Object: ", object);
  console.log("Object ID: ", objectid);

  // Retrieve user data
  const user_response = await (await getUser(userid)).json();
  const user = user_response.data;

  // Extract necessary data from user settings
  const company_url = user.settings.url;
  const headers = getHeaders(
    user.settings.client_key,
    user.settings.client_secret
  );
  const endpoint = `${company_url}/wp-json/wc/v3/${object}/${objectid}`;
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return NextResponse.json({ success: true, data: data }, { status: 200 });
}

export async function remove(userid: string, object: string, objectid: string) {
  console.log("Inside remove woocommerce helper function");
  console.log("Object: ", object);
  console.log("Object ID: ", objectid);

  // Retrieve user data
  const user_response = await (await getUser(userid)).json();
  const user = user_response.data;

  // Extract necessary data from user settings
  const company_url = user.settings.url;
  const headers = getHeaders(
    user.settings.client_key,
    user.settings.client_secret
  );
  const endpoint = `${company_url}/wp-json/wc/v3/${object}/${objectid}`;
  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: headers,
  });
  const data = await response.json();
  return NextResponse.json({ success: true, data: data }, { status: 200 });
}
