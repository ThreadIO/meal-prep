import Meal from "@/models/meal.model";
import { NextResponse } from "next/server";

export async function getMeal(mealid: string, url: string) {
  try {
    const meal = await Meal.findOne({ mealid: mealid, url: url });
    console.log("Meal: ", meal);
    return NextResponse.json({ success: true, data: meal });
  } catch (error) {
    console.log("Error in Get Meal: ", error);
    return NextResponse.json({ success: false, error: error }, { status: 400 });
  }
}

/** POST: http://localhost:3000/api/meal */
export async function createMeal(mealid: string, body: any) {
  try {
    if (!mealid)
      return NextResponse.json({
        success: false,
        error: "No meal id present...!",
      });
    console.log("Settings: ", body);
    const newMeal = {
      mealid: mealid,
      meal_name: body.meal_name,
      url: body.url,
      calories: body.calories,
      protein: body.protein,
      fat: body.fat,
      carbs: body.carbs,
      add_ons: body.add_ons,
    };
    console.log("New Meal: ", newMeal);
    const meal = await Meal.create(newMeal);
    console.log("Meal Created: ", meal);
    return NextResponse.json({ success: true, data: meal });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}

/** DELETE: http://localhost:3000/api/recipe/id */
export async function deleteMeal(mealid: string, url: string) {
  try {
    if (!mealid)
      return NextResponse.json({
        success: false,
        error: "No meal id present...!",
      });

    await Meal.deleteMany({ mealid: mealid, url: url });

    return NextResponse.json({ success: true, deleted: mealid });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}

export async function patchMeal(mealid: string, url: string, body: any = {}) {
  try {
    console.log("MealId ID: ", mealid);
    if (!mealid)
      return NextResponse.json({
        success: false,
        error: "No meal id present...!",
      });

    if (Object.keys(body).length > 0) {
      await Meal.updateOne({ mealid: mealid, url: url }, { $set: body });
      return NextResponse.json({ success: true, updated: mealid });
    } else {
      return NextResponse.json({
        success: false,
        error: "No valid fields to update",
      });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}
