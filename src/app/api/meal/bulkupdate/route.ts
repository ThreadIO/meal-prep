import connect from "@/database/conn";
// import { bulkPatchMeals } from "@/controller/meal.controller";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  console.log("Creating Meal in MongoDb...");
  const { body, query } = JSON.parse(await request.text());
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  console.log("Body: ", body);
  console.log("Query: ", query);
  //const res = await bulkPatchMeals(body, query);
  return NextResponse.json({ success: true, data: [] });
}
