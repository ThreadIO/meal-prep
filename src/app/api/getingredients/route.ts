import connect from "@/database/conn";
import { NextResponse } from "next/server";
import { getAllIngredients } from "@/controller/ingredient.controller";
export async function POST() {
  console.log("Get All Meals in MongoDb...");
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  const res = await getAllIngredients();
  return res;
}
