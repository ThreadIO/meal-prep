import connect from "@/database/conn";
import { getOrgByPropelAuth, patchOrg } from "@/controller/org.controller";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  orgid: string;
}

export async function GET(request: NextRequest, context: { params: Params }) {
  const orgid = context.params.orgid;
  console.log(`Get Org ${orgid} in MongoDb...`);
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  const res = await getOrgByPropelAuth(orgid);
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
  console.log("Org Id: ", context.params.orgid);
  const body = JSON.parse(await request.text());
  console.log("Body: ", body);
  const res = await patchOrg(context.params.orgid, body);
  return res;
}
