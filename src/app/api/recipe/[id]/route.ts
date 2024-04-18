import connect from "@/database/conn";
import {
  getRecipe,
  deleteRecipe,
  patchRecipe,
} from "@/controller/recipe.controller";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  id: string;
}

export async function GET(request: NextRequest, context: { params: Params }) {
  connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
    NextResponse.json({
      success: false,
      message: "Database connection error",
      error: err,
    })
  );
  console.log("Recipe Id: ", context.params.id);
  const res = await getRecipe(context.params.id);
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
  console.log("Recipe Id: ", context.params.id);
  const res = await deleteRecipe(context.params.id);
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
  console.log("Recipe Id: ", context.params.id);
  const body = JSON.parse(await request.text());
  console.log("Body: ", body);
  const res = await patchRecipe(context.params.id, body);
  return res;
}
