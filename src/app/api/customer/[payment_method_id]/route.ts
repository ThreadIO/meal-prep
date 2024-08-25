import connect from "@/database/conn";
import {
  getCustomer,
  deleteCustomer,
  patchCustomer,
} from "@/controller/customer.controller";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  payment_method_id: string;
}

export async function GET(request: NextRequest, context: { params: Params }) {
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  console.log("Payment Method Id: ", context.params.payment_method_id);
  const res = await getCustomer(context.params.payment_method_id);
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
  console.log("Payment Method Id: ", context.params.payment_method_id);
  const res = await deleteCustomer(context.params.payment_method_id);
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
  console.log("Payment Method Id: ", context.params.payment_method_id);
  const body = JSON.parse(await request.text());
  console.log("Body: ", body);
  const res = await patchCustomer(context.params.payment_method_id, body);
  return res;
}
