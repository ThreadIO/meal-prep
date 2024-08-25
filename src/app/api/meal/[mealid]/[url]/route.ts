import connect from "@/database/conn";
import { getMeal, deleteMeal, patchMeal } from "@/controller/meal.controller";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  mealid: string;
  url: string;
}

export async function GET(request: NextRequest, context: { params: Params }) {
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  console.log("Meal Id: ", context.params.mealid);
  const res = await getMeal(context.params.mealid, context.params.url);
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
  console.log("Meal Id: ", context.params.mealid);
  const res = await deleteMeal(context.params.mealid, context.params.url);
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
  console.log("Meal Id: ", context.params.mealid);
  const body = JSON.parse(await request.text());
  console.log("Body: ", body);
  const res = await patchMeal(context.params.mealid, context.params.url, body);
  return res;
}
