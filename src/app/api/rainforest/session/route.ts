// api/rainforest/session.ts

import { NextRequest } from "next/server";
import { createSession } from "@/controller/rainforest.controller";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sessionType, payinId, merchantId } = body;

  return createSession({ sessionType, payinId, merchantId });
}
