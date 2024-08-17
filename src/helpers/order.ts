import Papa from "papaparse";
import { saveAs } from "file-saver";

// Interfaces
interface Order {
  line_items: LineItem[];
}

interface LineItem {
  name: string;
  quantity: number;
  meta_data?: MetaData[];
}

interface MetaData {
  key: string;
  value: string;
}

interface MealCount {
  mealName: string;
  count: number;
}

interface OrderedMeal {
  name: string;
  option: string;
  quantity: number;
}

interface Ingredient {
  ingredient: {
    name: string;
    defaultUnit: string;
  };
  quantity: number;
  unit: string;
  cookStyle: string;
}

interface MealOption {
  name: string;
  ingredients: Ingredient[];
}

interface Meal {
  name: string;
  options: MealOption[];
  custom_options?: Array<{ name: string; options: MealOption[] }>;
}

// Functions
export function getMealsFromOrders(orders: Order[]): MealCount[] {
  const mealsMap: { [meal: string]: number } = {};

  orders.forEach((order) => {
    order.line_items.forEach((item) => {
      const { name, quantity } = item;
      if (mealsMap[name]) {
        mealsMap[name] += quantity;
      } else {
        mealsMap[name] = quantity;
      }
    });
  });

  return Object.entries(mealsMap).map(([mealName, count]) => ({
    mealName,
    count,
  }));
}

export function calculateMealSum(filteredOrders: Order[]): {
  [key: string]: number;
} {
  const mealSum: { [key: string]: number } = {};

  filteredOrders.forEach((order) => {
    order.line_items.forEach((item) => {
      if (mealSum[item.name]) {
        mealSum[item.name] += item.quantity;
      } else {
        mealSum[item.name] = item.quantity;
      }
    });
  });

  return mealSum;
}

export function prepareOrderedMeals(filteredOrders: Order[]): OrderedMeal[] {
  const itemQuantities: Record<string, number> = {};

  filteredOrders.forEach((order) => {
    order.line_items.forEach((item) => {
      const sizeMetas =
        item.meta_data?.filter((meta) => !meta.key.startsWith("_")) || [];

      const size = sizeMetas.map((meta) => meta.value).join(" | ") || "Regular";

      const key = `${item.name}|||${size}`;

      if (itemQuantities[key]) {
        itemQuantities[key] += item.quantity;
      } else {
        itemQuantities[key] = item.quantity;
      }
    });
  });

  const orderedMeals: OrderedMeal[] = Object.entries(itemQuantities).map(
    ([key, quantity]) => {
      const [name, option] = key.split("|||");
      return {
        name,
        option,
        quantity,
      };
    }
  );

  return orderedMeals;
}

export function generateIngredientsReport(
  meals: Meal[],
  orderedMeals: OrderedMeal[]
) {
  const ingredientTotals: Record<
    string,
    { quantity: number; cookStyle: string }
  > = {};

  console.log("Ordered Meals: ", orderedMeals);
  console.log("Meals: ", meals);

  orderedMeals.forEach(({ name, option, quantity }) => {
    const meal = meals.find((m) => m.name === name);
    if (!meal) return;

    let mealOption: MealOption | undefined;

    // Check regular options
    mealOption = meal.options.find((o) => o.name === option);

    // if (meal.name == "Buttery Lemon Shrimp Linguine") {
    //   console.log("Meal: ", meal);
    //   console.log("Meal Options: ", meal.options);
    //   console.log("Option: ", option);
    //   console.log("Meal Option: ", mealOption);
    // }

    // Check custom options if not found in regular options
    if (!mealOption && meal.custom_options) {
      meal.custom_options.forEach((customOption) => {
        const foundOption = customOption.options.find((o) => o.name === option);
        if (foundOption) mealOption = foundOption;
      });
    }

    if (!mealOption) return;

    processIngredients(mealOption.ingredients, ingredientTotals, quantity);
  });

  const csvData = [
    ["Name of Ingredient", "Style of Cooking", "Amount in G", "Amount in Oz"],
  ];

  Object.entries(ingredientTotals).forEach(
    ([name, { quantity, cookStyle }]) => {
      const amountInOz = quantity * 0.035274; // Convert grams to ounces
      csvData.push([
        name,
        cookStyle,
        quantity.toFixed(2),
        amountInOz.toFixed(2),
      ]);
    }
  );

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "ingredients_report.csv");
}

function processIngredients(
  ingredients: Ingredient[],
  totals: Record<string, { quantity: number; cookStyle: string }>,
  mealQuantity: number
) {
  ingredients.forEach((ing) => {
    const { name } = ing.ingredient;
    if (!totals[name]) {
      totals[name] = { quantity: 0, cookStyle: ing.cookStyle };
    }
    totals[name].quantity += ing.quantity * mealQuantity;
  });
}
