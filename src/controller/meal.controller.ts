import Meal from "@/models/meal.model";
import Ingredient from "@/models/ingredient.model";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

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
  console.log("In create meal helper");
  console.log("Meal ID: ", mealid);
  console.log("Body: ", body);
  try {
    const existingMeal = await Meal.findOne({
      mealid: mealid,
      url: body.url,
    });
    console.log("Existing Meal: ", existingMeal);
    if (existingMeal) {
      console.log("Meal already exists...!");
      return NextResponse.json({
        success: false,
        error: "Meal already exists...!",
      });
    }
    console.log("Meal details: ", body);
    const newMeal = {
      mealid: mealid,
      url: body.url,
      name: body.name,
      status: body.status,
      image: body.image,
      tags: body.tags,
      price: body.price,
      nutrition_facts: body.nutrition_facts,
      description: body.description,
      options: body.options,
      custom_options: body.custom_options.map((option: any) => ({
        name: option.name,
        options: option.options.map((subOption: any) => ({
          name: subOption.name,
          price: subOption.price,
          calories: subOption.calories,
          carbs: subOption.carbs,
          protein: subOption.protein,
          fat: subOption.fat,
        })),
      })),
    };
    const meal = await Meal.create(newMeal);
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
    if (!mealid) {
      return NextResponse.json({
        success: false,
        error: "No meal id present...!",
      });
    }

    if (Object.keys(body).length > 0) {
      console.log("Body: ", body);

      // Function to process ingredients
      const processIngredients = async (ingredients: any) => {
        return await Promise.all(
          ingredients.map(async (ing: any) => {
            let ingredient;
            if (mongoose.Types.ObjectId.isValid(ing.ingredient)) {
              ingredient = await Ingredient.findById(ing.ingredient);
            } else {
              ingredient = await Ingredient.findOne({ name: ing.ingredient });
            }

            if (!ingredient) {
              ingredient = await Ingredient.create({
                name: ing.ingredient,
                defaultUnit: ing.unit,
              });
            }

            return {
              ingredient: ingredient._id,
              quantity: ing.quantity,
              unit: ing.unit,
              cookStyle: ing.cookStyle,
            };
          })
        );
      };

      // Handle main meal options
      if (body.options) {
        body.options = await Promise.all(
          body.options.map(async (option: any) => ({
            ...option,
            ingredients: await processIngredients(option.ingredients || []),
          }))
        );
      }

      // Handle custom options
      if (body.custom_options) {
        body.custom_options = await Promise.all(
          body.custom_options.map(async (customOption: any) => ({
            name: customOption.name,
            options: await Promise.all(
              customOption.options.map(async (subOption: any) => ({
                ...subOption,
                ingredients: await processIngredients(
                  subOption.ingredients || []
                ),
              }))
            ),
          }))
        );
      }

      // Handle nutrition facts ingredients
      if (body.nutrition_facts && body.nutrition_facts.ingredients) {
        body.nutrition_facts.ingredients = await processIngredients(
          body.nutrition_facts.ingredients
        );
      }

      const updatedMeal = await Meal.findOneAndUpdate(
        { mealid: mealid, url: url },
        { $set: body }
      )
        .populate("nutrition_facts.ingredients.ingredient")
        .populate("options.ingredients.ingredient")
        .populate("custom_options.options.ingredients.ingredient");

      if (!updatedMeal) {
        return NextResponse.json({
          success: false,
          error: "Meal not found",
        });
      }
      console.log("Updated Meal: ", updatedMeal);
      return NextResponse.json({ success: true, updated: updatedMeal });
    } else {
      console.log("Error updating meal: No valid fields to update");
      return NextResponse.json({
        success: false,
        error: "No valid fields to update",
      });
    }
  } catch (error) {
    console.error("Error in patchMeal:", error);
    return NextResponse.json({ success: false, error: error });
  }
}

export async function getAllMeals(mealids: string[], url: string) {
  try {
    const meals = await Meal.find({ mealid: { $in: mealids }, url: url })
      .populate({
        path: "nutrition_facts.ingredients.ingredient",
        model: "Ingredient",
      })
      .populate({
        path: "options.ingredients.ingredient",
        model: "Ingredient",
      })
      .populate({
        path: "custom_options.options.ingredients.ingredient",
        model: "Ingredient",
      });

    return NextResponse.json({ success: true, data: meals });
  } catch (error) {
    console.log("Error in Get Meal: ", error);
    return NextResponse.json({ success: false, error: error }, { status: 400 });
  }
}
