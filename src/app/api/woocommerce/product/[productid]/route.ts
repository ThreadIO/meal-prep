import connect from "@/database/conn";
import { patch, remove } from "@/helpers/woocommerce";
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
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  const body = JSON.parse(await request.text());
  console.log("Body: ", body);
  console.log("Product Id: ", context.params.productid);
  const res = await remove(body.userid, "products", context.params.productid);
  return res;
}

export async function PATCH(request: NextRequest, context: { params: Params }) {
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  console.log("Product Id: ", context.params.productid);
  const body = JSON.parse(await request.text());
  console.log("Body: ", body);
  const res = await patch(
    body.userid,
    "products",
    context.params.productid,
    body
  );
  return res;
}
