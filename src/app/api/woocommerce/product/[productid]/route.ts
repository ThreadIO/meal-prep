import connect from "@/database/conn";
import { put, remove, filterProductAddons } from "@/helpers/woocommerce";
import { post_one, convertACF } from "@/helpers/wordpress";
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
  const res = await remove(
    body.userid,
    `/wp-json/wc/v3/products/${context.params.productid}`
  );
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

  const res = await put(
    body.userid,
    `/wp-json/wc/v3/products/${context.params.productid}`,
    body
  );
  // This is a workaround to update the ACF fields
  if (body.acf && body.acf.length > 0) {
    console.log("ACF fields found");
    const acf_body = convertACF(body.acf);

    await post_one(
      body.userid,
      "product",
      context.params.productid,
      acf_body,
      "?_fields=acf"
    );
  }
  return res;
}
