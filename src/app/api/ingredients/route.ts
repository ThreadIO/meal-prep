import { NextRequest, NextResponse } from "next/server";
import { getIngredientsForMeals } from "@/helpers/recipe";
import { getMealsFromOrders } from "@/helpers/order";
import { getAllRecipesInOrg } from "@/controller/recipe.controller";
import connect from "@/database/conn";
export async function POST(request: NextRequest) {
  try {
    console.log("Incoming POST request to /api/ingredients");
    console.log("Connecting to the db...");
    await connect(process.env.NEXT_PUBLIC_COMPANY).catch((err) =>
      NextResponse.json({
        success: false,
        message: "Database connection error",
        error: err,
      })
    );
    console.log("connected to the db");
    const data = await request.json();
    const { orders, orgid } = data;
    if (orders) {
      const meals = getMealsFromOrders(orders);
      const response = await (await getAllRecipesInOrg(orgid)).json();
      const recipes = response.data;
      if (recipes) {
        const ingredients = getIngredientsForMeals(meals, recipes);
        return NextResponse.json(
          { success: true, ingredients },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            message: "An error occurred while fetching recipes",
          },
          { status: 500 }
        );
      }
    } else {
      console.error("Failed to fetch order data");
      return NextResponse.json(
        {
          success: false,
          message: "An error occurred while fetching orders data",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching ingredients data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching ingredients data",
      },
      { status: 500 }
    );
  }
}
