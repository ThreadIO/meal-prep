import Recipe from "@/models/recipe.model";
import { NextResponse } from "next/server";

export async function getAllRecipes() {
  try {
    const recipes = await Recipe.find({});
    return NextResponse.json({ success: true, data: recipes });
  } catch (error) {
    return NextResponse.json({ success: false, error: error }, { status: 400 });
  }
}

export async function getAllRecipesInOrg(orgid: string) {
  try {
    const recipes = await Recipe.find({ orgid: orgid });
    return NextResponse.json({ success: true, data: recipes });
  } catch (error) {
    return NextResponse.json({ success: false, error: error }, { status: 400 });
  }
}

/** POST: http://localhost:3000/api/recipe */
export async function createRecipe(
  name: string,
  orgid: string,
  userid: string,
  ingredients: any
) {
  try {
    const newRecipe = {
      name: name,
      orgid: orgid,
      userid: userid,
      ingredients: ingredients,
    };
    const recipe = await Recipe.create(newRecipe);
    return NextResponse.json({ success: true, data: recipe });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}

/** GET: http://localhost:3000/api/recipe/id */
export async function getRecipe(id: string) {
  try {
    if (!id)
      return NextResponse.json(
        { success: false, error: "No recipe id present...!" },
        { status: 400 }
      );

    const recipe = await Recipe.findById(id); /*.populate('messages')*/
    if (!recipe)
      return NextResponse.json(
        { success: false, error: "No recipe Found...!" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, data: recipe });
  } catch (error) {
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}

/** DELETE: http://localhost:3000/api/recipe/id */
export async function deleteRecipe(id: string) {
  try {
    if (!id)
      return NextResponse.json({
        success: false,
        error: "No recipe id present...!",
      });

    await Recipe.findByIdAndDelete(id);

    return NextResponse.json({ success: true, deleted: id });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}

export async function patchRecipe(id: string, body = {}) {
  try {
    console.log("Recipe ID: ", id);
    if (!id)
      return NextResponse.json({
        success: false,
        error: "No recipe id present...!",
      });

    await Recipe.findByIdAndUpdate(id, body);

    return NextResponse.json({ success: true, updated: id });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}
