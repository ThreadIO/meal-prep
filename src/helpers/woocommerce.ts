import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { format } from "date-fns";
import { getUser } from "@/controller/user.controller";
import { decryptField } from "@/helpers/encrypt";

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
    const decryptedKey = decryptField(user.settings.client_key);
    const decryptedSecret = decryptField(user.settings.client_secret);

    // Define the base endpoint URL
    const endpoint = `${company_url}/wp-json/wc/v3/${object}?per_page=100`;

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
