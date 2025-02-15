import { NextRequest, NextResponse } from "next/server";
import connect from "@/database/conn";
import { get } from "@/helpers/woocommerce";

export async function POST(request: NextRequest) {
  console.log(
    "Incoming POST request to /api/woocommerce/getglobalproductaddons"
  );
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  // Define the endpoint URL -> Need to parameterize this in the future
  const requestData = await request.json();
  const { userid } = requestData;
  const get_products_response = get(
    userid,
    `/wp-json/wc-product-add-ons/v1/product-add-ons`
  );
  return get_products_response;
}
