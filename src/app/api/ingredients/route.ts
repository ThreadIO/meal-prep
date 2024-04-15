import { NextRequest, NextResponse } from "next/server";
import { getIngredientsForMeals } from "@/helpers/recipe";
import { getMealsFromOrders } from "@/helpers/order";

export async function POST(request: NextRequest) {
  try {
    console.log("Incoming POST request to /api/ingredients");
    const data = await request.json();
    const { orders } = data;
    if (orders) {
      const meals = getMealsFromOrders(orders);
      console.log("Meals: ", meals);
      const ingredients = getIngredientsForMeals(meals);
      printIngredients(ingredients);
      return NextResponse.json({ success: true, ingredients }, { status: 200 });
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
