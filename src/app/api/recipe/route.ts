import connect from "@/database/conn";
import {
  getAllRecipes,
  createRecipe,
  getAllRecipesInOrg,
} from "@/controller/recipe.controller";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  const orgid = request.headers.get("orgid") as string;
  if (request.headers.get("orgid")) {
    const res = await getAllRecipesInOrg(orgid);
    return res;
  }
  const res = await getAllRecipes();
  return res;
}

export async function POST(request: NextRequest) {
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  const body = JSON.parse(await request.text());
  const res = await createRecipe(
    body.name,
    body.orgid,
    body.userid,
    body.ingredients
  );
  return res;
}
