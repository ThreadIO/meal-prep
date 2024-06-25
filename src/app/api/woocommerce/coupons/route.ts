import { NextRequest, NextResponse } from "next/server";
import connect from "@/database/conn";
import { post } from "@/helpers/woocommerce";

export async function POST(request: NextRequest) {
  console.log("Incoming POST request to /api/woocommerce/coupons");

  // Establish the database connection
  try {
    await connect(process.env.NEXT_PUBLIC_COMPANY);
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    });
  }

  const requestData = await request.json();
  console.log("Request Data: ", requestData);

  const { userid } = requestData;
  const {
    code,
    discount_type,
    amount,
    individual_use,
    excude_sale_items,
    minimum_amount,
  } = requestData;

  // Use the helper function to filter and process meta_data
  const body = {
    code,
    discount_type,
    amount,
    individual_use,
    excude_sale_items,
    minimum_amount,
  };

  const create_coupons_response = await post(
    userid,
    `/wp-json/wc/v3/coupons`,
    body
  );
  return create_coupons_response;
}
