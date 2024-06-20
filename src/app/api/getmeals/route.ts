import connect from "@/database/conn";
import { getAllMeals } from "@/controller/meal.controller";
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/controller/user.controller";
import { friendlyUrl } from "@/helpers/frontend";

export async function POST(request: NextRequest) {
  console.log("Get All Meals in MongoDb...");
  const body = JSON.parse(await request.text());
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  const user_response = await (await getUser(body.userid)).json();
  const user = user_response.data;
  const res = await getAllMeals(body.mealids, friendlyUrl(user.settings.url));
  return res;
}
