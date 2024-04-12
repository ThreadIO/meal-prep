import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { subWeeks, format } from "date-fns";

export async function POST() {
  try {
    console.log("Incoming POST request to /api/orders");

    // Define the endpoint URL
    const endpoint = "https://khanafresh.com/wp-json/wc/v3/orders";

    // Define the credentials
    const username = "ck_06a78e91d33bd733071fc315ec5df21092aa8efc";
    const password = "cs_4c72230dd5ceb5eebde14d25fc974c93183f76de";

    // Encode the credentials in Base64
    const auth = Buffer.from(`${username}:${password}`).toString("base64");

    // Define headers with Basic Authentication
    const headers = {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    };

    // Calculate the start date of the past week
    const startDate = format(subWeeks(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss");

    // Construct the query parameters for filtering orders by creation date
    const queryParams = `after=${startDate}`;

    // Construct the full URL with query parameters
    const url = `${endpoint}?${queryParams}`;

    // Fetch data from the WooCommerce API
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    // Check if the response is successful
    if (response.ok) {
      // Parse the JSON response
      const data = await response.json();

      // Return a successful response with the fetched data
      return NextResponse.json(
        { success: true, orders: data },
        { status: 200 }
      );
    } else {
      // Handle the case where the response is not successful
      console.error("Failed to fetch data:", response.statusText);
      return NextResponse.json(
        { success: false, message: "Failed to fetch data" },
        { status: response.status }
      );
    }
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    );
  }
}
