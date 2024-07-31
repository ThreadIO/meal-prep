// /api/rainforest/create-payin-config.ts
import { NextResponse } from "next/server";
import { createPayinConfig } from "@/helpers/rainforest";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await createPayinConfig(body);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: result.status || 400 });
    }
  } catch (e) {
    console.log("Error in creating the payin w/ user");
    return NextResponse.json({ success: false, error: e }, { status: 400 });
  }
}
