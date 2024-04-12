import { NextRequest, NextResponse } from "next/server";
import { getMinimumOrderAmount } from "@/helpers/delivery";

// Function to extract the zipcode from the address
function extractZipcode(address: string): string {
  // Example logic to extract the zipcode from the address
  // You may need to adjust this based on the format of your addresses
  const zipcodePattern = /\b\d{5}(?:-\d{4})?\b/;
  const matches = address.match(zipcodePattern);
  if (matches && matches.length > 0) {
    return matches[0];
  } else {
    throw new Error("Zipcode not found in the address");
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Incoming POST request to /api/delivery");
    const data = await request.json();
    const { address, orderAmount } = data;

    // Check if the address and order amount are provided in the request body
    if (!address || !orderAmount) {
      throw new Error("Address or order amount is missing in the request body");
    }

    // Extract the zipcode from the address
    const zipcode = extractZipcode(address);

    // Get the minimum order amount based on the provided zipcode
    const minimumOrderAmount = getMinimumOrderAmount(zipcode);

    // Check if the order amount is less than the minimum allowed amount
    if (orderAmount < minimumOrderAmount) {
      // Return false if the order amount is less than the minimum allowed amount
      return NextResponse.json(
        {
          success: false,
          message: `The minimum order amount for Zipcode ${zipcode} is ${minimumOrderAmount}`,
        },
        { status: 200 }
      );
    }

    // Return true if the order amount meets the minimum requirement
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    // Handle any errors that occur during the process
    console.error("Error processing delivery request:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
