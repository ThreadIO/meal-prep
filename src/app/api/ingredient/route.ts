import connect from "@/database/conn";
import { createIngredient } from "@/controller/ingredient.controller";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("Creating Ingredient in MongoDb...");
  const body = JSON.parse(await request.text());
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  const res = await createIngredient(body);
  return res;
}
