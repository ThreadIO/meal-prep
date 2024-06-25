import connect from "@/database/conn";
import { put, remove } from "@/helpers/woocommerce";
import { NextRequest, NextResponse } from "next/server";
interface Params {
  couponid: string;
}

export async function DELETE(
  request: NextRequest,
  context: { params: Params }
) {
  console.log(
    `Incoming DELETE request to /api/woocommerce/coupons/${context.params.couponid}`
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
  console.log("Coupon Id: ", context.params.couponid);
  const res = await remove(
    body.userid,
    `/wp-json/wc/v3/coupons/${context.params.couponid}`
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
  console.log("Product Id: ", context.params.couponid);

  const res = await put(
    body.userid,
    `/wp-json/wc/v3/coupons/${context.params.couponid}`,
    body
  );
  return res;
}
