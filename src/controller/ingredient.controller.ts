import Ingredient from "@/models/ingredient.model";
import { NextResponse } from "next/server";

export async function createIngredient(body: any) {
  console.log("In create ingredient helper");
  console.log("Body: ", body);
  try {
    const existingIngredient = await Ingredient.findOne({
      name: body.name,
    });
    console.log("Existing Ingredient: ", existingIngredient);
    if (existingIngredient) {
      console.log("Ingredient already exists...!");
      return NextResponse.json({
        success: false,
        error: "Ingredient already exists...!",
      });
    }
    if (!body) {
      return NextResponse.json({
        success: false,
        error: "Please provide ingredient details...!",
      });
    }
    console.log("Ingredient details: ", body);
    const nutritionPer100g = body.nutritionPer100g
      ? body.nutritionPer100g
      : undefined;
    const newIngredient = {
      name: body.name,
      defaultUnit: body.defaultUnit,
      nutritionPer100g: nutritionPer100g,
    };
    const ingredient = await Ingredient.create(newIngredient);
    return NextResponse.json({ success: true, data: ingredient });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}
