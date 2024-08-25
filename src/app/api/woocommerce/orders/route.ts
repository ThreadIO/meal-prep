import { NextRequest, NextResponse } from "next/server";
import connect from "@/database/conn";
import { post } from "@/helpers/woocommerce";

export async function POST(request: NextRequest) {
  console.log("Incoming POST request to /api/woocommerce/orders");

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
    payment_method,
    payment_method_title,
    set_paid,
    billing,
    shipping,
    line_items,
    shipping_lines,
  } = requestData;

  // Use the helper function to filter and process meta_data
  const body = {
    payment_method,
    payment_method_title,
    set_paid,
    billing,
    shipping,
    line_items,
    shipping_lines,
  };

  const create_orders_response = await post(
    userid,
    `/wp-json/wc/v3/orders`,
    body
  );

  return create_orders_response;
}
