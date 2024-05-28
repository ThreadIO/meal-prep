import connect from "@/database/conn";
import { patch, remove, filterProductAddons } from "@/helpers/woocommerce";
import { NextRequest, NextResponse } from "next/server";
interface Params {
  productid: string;
}

export async function DELETE(
  request: NextRequest,
  context: { params: Params }
) {
  console.log(
    `Incoming DELETE request to /api/woocommerce/product/${context.params.productid}`
  );
  try {
    await connect(process.env.NEXT_PUBLIC_COMPANY);
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    });
  }

  const body = JSON.parse(await request.text());
  console.log("Body: ", body);
  console.log("Product Id: ", context.params.productid);
  const res = await remove(body.userid, "products", context.params.productid);
  return res;
}

export async function PATCH(request: NextRequest, context: { params: Params }) {
  try {
    await connect(process.env.NEXT_PUBLIC_COMPANY);
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    });
  }

  const body = JSON.parse(await request.text());
  console.log("Product Id: ", context.params.productid);

  if (body.meta_data && body.product_addons) {
    // Filter meta_data
    const filtered_meta_data = filterProductAddons(
      body.meta_data,
      body.product_addons
    );
    body.meta_data = filtered_meta_data;
  }
  console.log("Body: ", body.acf);
  const res = await patch(
    body.userid,
    "products",
    context.params.productid,
    body
  );

  return res;
}
