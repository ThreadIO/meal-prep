import { NextRequest, NextResponse } from "next/server";
import connect from "@/database/conn";
import { post, filterProductAddons } from "@/helpers/woocommerce";

export async function POST(request: NextRequest) {
  console.log("Incoming POST request to /api/woocommerce/product");

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
    name,
    regular_price,
    description,
    images,
    categories,
    acf,
    product_addons,
    meta_data,
    stock_status,
  } = requestData;

  // Use the helper function to filter and process meta_data
  const filteredMetaData = filterProductAddons(meta_data, product_addons);
  console.log("filteredMetaData: ", filteredMetaData);
  const body = {
    name,
    regular_price,
    description,
    images,
    categories,
    acf,
    product_addons,
    meta_data: filteredMetaData, // Use the filtered meta_data array
    stock_status,
  };

  const create_products_response = await post(
    userid,
    `/wp-json/wc/v3/products`,
    body
  );
  return create_products_response;
}
