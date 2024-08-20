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
  nutrition_facts: NutritionFacts;
  custom_options?: Array<{ name: string; options: MealOption[] }>;
}

interface NutritionFacts {
  ingredients: Ingredient[];
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
    Record<string, { quantity: number; cookStyle: string; unit: string }>
  > = {};

  console.log("Ordered Meals: ", orderedMeals);
  console.log("Meals: ", meals);
  orderedMeals.forEach(({ name, option, quantity }) => {
    const meal = meals.find((m) => m.name === name);
    if (!meal) return;

    const [sizeOption, ...customOptions] = option.split(" | ");

    // Process size option
    let mealOption = meal.options.find((o) => o.name === sizeOption);
    if (mealOption) {
      processIngredients(mealOption.ingredients, ingredientTotals, quantity);
    }

    // Process custom options
    customOptions.forEach((customOption) => {
      const customMealOption = findCustomOption(meal, customOption);
      if (customMealOption) {
        processIngredients(
          customMealOption.ingredients,
          ingredientTotals,
          quantity
        );
      }
    });

    // If no options were found, use default ingredients
    if (!mealOption && customOptions.length === 0) {
      processIngredients(
        meal.nutrition_facts.ingredients,
        ingredientTotals,
        quantity
      );
    }
  });

  // Collect and sort ingredient data
  const sortedIngredientData: [
    string,
    string,
    number,
    number,
    number,
    number,
  ][] = [];
  Object.entries(ingredientTotals).forEach(([cookStyle, ingredients]) => {
    Object.entries(ingredients).forEach(([name, { quantity, unit }]) => {
      if (unit === "count") {
        sortedIngredientData.push([name, cookStyle, 0, 0, 0, quantity]);
      } else {
        const amountInOz = quantity * 0.035274; // Convert grams to ounces
        const amountInLbs = quantity * 0.00220462; // Convert grams to pounds
        sortedIngredientData.push([
          name,
          cookStyle,
          quantity,
          amountInOz,
          amountInLbs,
          0,
        ]);
      }
    });
  });

  // Sort the data alphabetically by ingredient name
  sortedIngredientData.sort((a, b) => a[0].localeCompare(b[0]));

  // Generate CSV data
  const csvData = [
    [
      "Name of Ingredient",
      "Cooking Style",
      "Amount in G",
      "Amount in Oz",
      "Amount in Lbs",
      "Count",
    ],
    ...sortedIngredientData.map(
      ([name, cookStyle, quantity, amountInOz, amountInLbs, count]) => [
        name,
        cookStyle,
        quantity.toFixed(2),
        amountInOz.toFixed(2),
        amountInLbs.toFixed(2),
        count.toFixed(0),
      ]
    ),
  ];

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "ingredients_report.csv");
}

function processIngredients(
  ingredients: Ingredient[],
  totals: Record<
    string,
    Record<string, { quantity: number; cookStyle: string; unit: string }>
  >,
  mealQuantity: number
) {
  ingredients.forEach((ing) => {
    const { name } = ing.ingredient;
    const cookStyle = ing.cookStyle || "Unspecified";
    const unit = ing.unit;

    if (!totals[cookStyle]) {
      totals[cookStyle] = {};
    }

    if (!totals[cookStyle][name]) {
      totals[cookStyle][name] = { quantity: 0, cookStyle, unit };
    }

    totals[cookStyle][name].quantity += ing.quantity * mealQuantity;
  });
}

function findCustomOption(
  meal: Meal,
  customOption: string
): MealOption | undefined {
  for (const customOptionGroup of meal.custom_options || []) {
    const option = customOptionGroup.options.find(
      (o) => o.name === customOption
    );
    if (option) return option;
  }
  return undefined;
}
