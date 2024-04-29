import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { format } from "date-fns";
import { getUser } from "@/controller/user.controller";
import { decryptField } from "@/helpers/encrypt";
export async function getAll(
  userid: string,
  object: string,
  { startDate, endDate }: { startDate: string; endDate: string } = {
    startDate: "",
    endDate: "",
  }
) {
  try {
    console.log("Inside getAll woocommerce helper function");
    console.log("Object: ", object);
    console.log("Start Date: ", startDate);
    console.log("End Date: ", endDate);
    // Define the endpoint URL -> Need to parameterize this in the future
    // Extract start and end dates from the request body
    const user_response = await (await getUser(userid)).json();

    const user = user_response.data;
    const company_url = user.settings.url;
    const endpoint = `${company_url}/wp-json/wc/v3/${object}`;
    // If endDate is not provided, default to the current date
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
    // Construct the full URL with query parameters
    let url = endpoint;
    if (startDate && endDate) {
      const formattedStartDate = format(
        new Date(startDate),
        "yyyy-MM-dd'T'HH:mm:ss"
      );
      const formattedEndDate = format(
        new Date(endDate),
        "yyyy-MM-dd'T'HH:mm:ss"
      );
      url = `${endpoint}?after=${formattedStartDate}&before=${formattedEndDate}`;
    }
    console.log("URL: ", url);
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
      return NextResponse.json({ success: true, data: data }, { status: 200 });
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
