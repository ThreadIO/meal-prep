import { NextRequest, NextResponse } from "next/server";
import {
  getOrgByPropelAuth,
  patchOrgByPropelAuth,
} from "@/controller/org.controller";
import connect from "@/database/conn";

interface Params {
  orgid: string;
}

export async function GET(request: NextRequest, context: { params: Params }) {
  const orgid = context.params.orgid;

  try {
    await connect(process.env.NEXT_PUBLIC_COMPANY);
    const res = await getOrgByPropelAuth(orgid);
    return res;
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: "Error fetching organization",
      error: err,
    });
  }
}

export async function PATCH(request: NextRequest, context: { params: Params }) {
  try {
    await connect(process.env.NEXT_PUBLIC_COMPANY);
    const body = await request.json();
    const res = await patchOrgByPropelAuth(context.params.orgid, body);
    return res;
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: "Error updating organization",
      error: err,
    });
  }
}
