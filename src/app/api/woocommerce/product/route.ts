import { NextRequest, NextResponse } from "next/server";
import connect from "@/database/conn";
import { post } from "@/helpers/woocommerce";
export async function POST(request: NextRequest) {
  console.log("Incoming POST request to /api/woocommerce/product");
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  // Define the endpoint URL -> Need to parameterize this in the future
  const requestData = await request.json();
  // Extract start and end dates from the request body
  const { userid } = requestData;
  const { name, regular_price, description, images } = requestData;
  const body = { name, regular_price, description, images };
  const create_products_response = post(userid, "products", body);
  return create_products_response;
}
