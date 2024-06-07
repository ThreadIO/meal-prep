import connect from "@/database/conn";
import { createProduct } from "@/controller/product.controller";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = JSON.parse(await request.text());
  connect(body.settings.url).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  const res = await createProduct(body.productid, body);
  return res;
}
