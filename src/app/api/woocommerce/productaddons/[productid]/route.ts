import connect from "@/database/conn";
import { patch, post } from "@/helpers/woocommerce";
import { NextRequest, NextResponse } from "next/server";
interface Params {
  productid: string;
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
  const { userid, ...rest } = body;
  const res = await patch(
    userid,
    `/wp-json/wc-product-add-ons/v1/product-add-ons/${context.params.productid}`,
    rest
  );
  return res;
}

export async function POST(request: NextRequest, context: { params: Params }) {
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
  const { userid, ...rest } = body;
  const res = await post(
    userid,
    `/wp-json/wc-product-add-ons/v1/product-add-ons/${context.params.productid}`,
    rest
  );
  return res;
}
