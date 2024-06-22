import connect from "@/database/conn";
import { createOrg, getAllOrgs } from "@/controller/org.controller";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  console.log("Get all Orgs in MongoDb...");
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  const res = await getAllOrgs();
  return res;
}

export async function POST(request: NextRequest) {
  console.log("Creating Org in MongoDb...");
  const body = JSON.parse(await request.text());
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  const res = await createOrg(body.orgid, body);
  return res;
}
