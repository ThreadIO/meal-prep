import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";
import { format } from "date-fns";
import connect from "@/database/conn";
import { getUser } from "@/controller/user.controller";
import { decryptField } from "@/helpers/encrypt";
export async function POST(request: NextRequest) {
  try {
    console.log("Incoming POST request to /api/orders");

    // Define the endpoint URL
    const endpoint = "https://khanafresh.com/wp-json/wc/v3/orders";
    const requestData = await request.json();
    // Extract start and end dates from the request body
    const { userid, startDate, endDate } = requestData;
    // If endDate is not provided, default to the current date
    connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
      NextResponse.json({
        success: false,
        message: "Database connection error",
        error: err,
      })
    );
    const user_response = await (await getUser(userid)).json();
    const user = user_response.data;
    const decryptedKey = decryptField(user.settings.client_key);
    const decryptedSecret = decryptField(user.settings.client_secret);
    // Define the credentials
    const username = decryptedKey;
    const password = decryptedSecret;

    // Encode the credentials in Base64
    const auth = Buffer.from(`${username}:${password}`).toString("base64");

    // Define headers with Basic Authentication
    const headers = {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    };

    // Construct the query parameters for filtering orders by creation date
    const queryParams = `after=${format(new Date(startDate), "yyyy-MM-dd'T'HH:mm:ss")}&before=${format(new Date(endDate), "yyyy-MM-dd'T'HH:mm:ss")}`;

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
