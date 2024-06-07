import connect from "@/database/conn";
import {
  getProduct,
  deleteProduct,
  patchProduct,
} from "@/controller/product.controller";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  productid: string;
  url: string;
}

export async function GET(request: NextRequest, context: { params: Params }) {
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  console.log("Product Id: ", context.params.productid);
  const res = await getProduct(context.params.productid, context.params.url);
  return res;
}

export async function DELETE(
  request: NextRequest,
  context: { params: Params }
) {
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  console.log("Product Id: ", context.params.productid);
  const res = await deleteProduct(context.params.productid, context.params.url);
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
  const res = await patchProduct(
    context.params.productid,
    context.params.url,
    body
  );
  return res;
}
