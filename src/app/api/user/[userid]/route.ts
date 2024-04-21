import connect from "@/database/conn";
import { getUser, deleteUser, patchUser } from "@/controller/user.controller";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  userid: string;
}

export async function GET(request: NextRequest, context: { params: Params }) {
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  console.log("User Id: ", context.params.userid);
  const res = await getUser(context.params.userid);
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
  console.log("User Id: ", context.params.userid);
  const res = await deleteUser(context.params.userid);
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
  console.log("User Id: ", context.params.userid);
  const body = JSON.parse(await request.text());
  console.log("Body: ", body);
  const res = await patchUser(context.params.userid, body);
  return res;
}
