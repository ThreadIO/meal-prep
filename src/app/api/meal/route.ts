import connect from "@/database/conn";
import { createMeal } from "@/controller/meal.controller";
import { NextRequest, NextResponse } from "next/server";
import { Console } from "console";

export async function POST(request: NextRequest) {
  console.log("Creating Meal in MongoDb...");
  const body = JSON.parse(await request.text());
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  const res = await createMeal(body.mealid, body);
  return res;
}
