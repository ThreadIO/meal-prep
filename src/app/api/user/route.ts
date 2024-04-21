import connect from "@/database/conn";
import { createUser } from "@/controller/user.controller";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  const body = JSON.parse(await request.text());
  console.log("User: ", body.userid);
  console.log("Settings: ", body.settings);
  const res = await createUser(body.userid, body.settings);
  return res;
}
