import connect from "@/database/conn";
import { checkSubscriptions } from "@/controller/subscription.controller";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connect(process.env.NEXT_PUBLIC_COMPANY);

    // Check for API key
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await checkSubscriptions();
    return res;
  } catch (error) {
    console.error("Error in check-subscriptions route:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while checking subscriptions",
        error: error,
      },
      { status: 500 }
    );
  }
}
