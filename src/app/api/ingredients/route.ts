import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { getIngredientsForMeals } from "@/helpers/recipe";
import { getMealsFromOrders } from "@/helpers/order";

export async function POST() {
  try {
    console.log("Incoming POST request to /api/ingredients");
    const baseUrl = process.env.VERCEL_URL
      ? "https://" + process.env.VERCEL_URL
      : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
    });

    if (response.ok) {
      const data: any = await response.json(); // Specify data as any
      const meals = getMealsFromOrders(data.orders);
      console.log("Meals: ", meals);
      const ingredients = getIngredientsForMeals(meals);
      printIngredients(ingredients);
      return NextResponse.json({ success: true, ingredients }, { status: 200 });
    } else {
      console.error("Failed to fetch order data:", response.statusText);
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

function printIngredients(ingredients: {
  [x: string]: { quantity: any; unit: any };
}) {
  console.log("Ingredients:");
  console.log("=============================");
  Object.keys(ingredients).forEach((ingredient) => {
    const { quantity, unit } = ingredients[ingredient];
    console.log(`${ingredient}: ${quantity} ${unit}`);
  });
  console.log("=============================");
}
