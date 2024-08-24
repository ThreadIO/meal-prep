import { getDeliveryDate } from "@/helpers/date";
import { decodeHtmlEntities } from "@/helpers/frontend";

// Helper function to extract allergens
const extractAllergens = (acf: any) => {
  return (
    acf?.allergens?.items?.map((item: any) => item.label.name).join(", ") || ""
  );
};

// Helper function to format size
const formatSize = (metaData: any[]) => {
  const addonsData = metaData.find((item) => item.key === "_addons_data");
  if (addonsData) {
    const sizeAddons = addonsData.value.filter(
      (addon: any) => addon.name === "Size"
    );
    return sizeAddons.map((addon: any) => addon.value).join(" | ");
  }
  return "";
};

// Helper function to calculate nutritional facts
const calculateFacts = (selectedSize: string, metaData: any[]) => {
  if (!metaData) return null;
  const sizeData = metaData.find((item) => item.name === "Size");
  if (sizeData) {
    const selectedOption = sizeData.options.find(
      (option: any) => option.label === selectedSize
    );
    if (selectedOption) {
      return {
        calories: parseInt(selectedOption.calories) || 0,
        protein: parseInt(selectedOption.protein) || 0,
        carbs: parseInt(selectedOption.carbs) || 0,
        fat: parseInt(selectedOption.fat) || 0,
      };
    }
  }
  return { calories: 0, protein: 0, carbs: 0, fat: 0 };
};

// Helper function to extract meal option
const extractMealOption = (item: any, compositeItemKey: string) => {
  if (item.composite_parent) {
    const compositeData = item.meta_data.find(
      (meta: any) => meta.key === "_composite_data"
    );
    if (compositeData && compositeData.value) {
      const component = compositeData.value[compositeItemKey];
      if (component && component.title) {
        return `${component.title} - ${component.addons?.[0]?.value || ""}`;
      }
    }
  }
  return "";
};

// Helper function to process an order item without meal data
const processOrderItemWithoutMeal = (
  item: any,
  order: any,
  deliveryDate: Date
) => {
  const allergens = extractAllergens(item.product_data.acf);
  const selectedSizeRegex = /(\d+\s*cal(?:ories)?)/i;
  const formattedSize = formatSize(item.meta_data);
  const selectedSizeMatch = selectedSizeRegex.exec(formattedSize);
  let selectedSize = selectedSizeMatch
    ? selectedSizeMatch[1]
    : formattedSize.split(" | ").find((size: any) => size.includes("cal")) ||
      "";
  const facts = calculateFacts(selectedSize, item.product_data.product_addons);
  const compositeItemKey = item.meta_data.find(
    (meta: any) => meta.key === "_composite_item"
  )?.value;
  const mealOption = extractMealOption(item, compositeItemKey);

  return [
    `${order.billing.first_name} ${order.billing.last_name}`,
    order.billing.first_name,
    order.billing.last_name,
    `"${decodeHtmlEntities(item.name)}"`,
    deliveryDate
      ? new Date(deliveryDate.getTime() + 4 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10)
      : "",
    (parseInt(item.product_data.acf?.facts?.calories) || 0) +
      (facts ? facts.calories : 0),
    (parseInt(
      item.product_data.acf?.facts?.items?.find(
        (fact: any) => fact.label === "protein"
      )?.amount
    ) || 0) + (facts ? facts.protein : 0),
    (parseInt(
      item.product_data.acf?.facts?.items?.find(
        (fact: any) => fact.label === "carbs"
      )?.amount
    ) || 0) + (facts ? facts.carbs : 0),
    (parseInt(
      item.product_data.acf?.facts?.items?.find(
        (fact: any) => fact.label === "fat"
      )?.amount
    ) || 0) + (facts ? facts.fat : 0),
    `"${item.product_data.acf?.ingredients?.description?.replace(/<[^>]+>/g, "") || ""}"`,
    allergens,
    deliveryDate ? deliveryDate.toISOString().slice(0, 10) : "",
    formattedSize,
    decodeHtmlEntities(mealOption),
  ];
};

// Helper function to process an order item with meal data
const processOrderItemWithMeal = (
  item: any,
  order: any,
  deliveryDate: Date,
  meals: any[]
) => {
  const selectedSizes = item.meta_data
    .filter((meta: any) => !meta.key.startsWith("_"))
    .map((meta: any) => meta.value)
    .join(" | ");

  const meal = meals.find(
    (m: any) => decodeHtmlEntities(m.name) === decodeHtmlEntities(item.name)
  );

  let calories = 0,
    protein = 0,
    carbs = 0,
    fat = 0;
  let ingredients = "",
    allergens = "",
    allSizes = "";

  if (meal) {
    const selectedOption = meal.options.find((opt: any) =>
      selectedSizes.includes(opt.name)
    );
    const customOption = meal.custom_options
      ?.flatMap((group: any) => group.options)
      .find((opt: any) => selectedSizes.includes(opt.name));

    if (selectedOption || customOption) {
      const option = selectedOption || customOption;
      calories = option.calories || 0;
      protein = option.protein || 0;
      carbs = option.carbs || 0;
      fat = option.fat || 0;
      ingredients = meal.ingredients || "";
      allergens = meal.allergens || "";
      allSizes = selectedOption
        ? meal.options.map((opt: any) => opt.name).join(" | ")
        : meal.custom_options
            .flatMap((group: any) => group.options.map((opt: any) => opt.name))
            .join(" | ");
    } else {
      calories = meal.nutrition_facts.calories || 0;
      protein = meal.nutrition_facts.protein || 0;
      carbs = meal.nutrition_facts.carbs || 0;
      fat = meal.nutrition_facts.fat || 0;
      ingredients = meal.nutrition_facts.ingredients || "";
      allergens = meal.allergens || "";
      allSizes = "";
    }
  }

  const compositeItemKey = item.meta_data.find(
    (meta: any) => meta.key === "_composite_item"
  )?.value;
  const mealOption = extractMealOption(item, compositeItemKey);

  return [
    `${order.billing.first_name} ${order.billing.last_name}`,
    order.billing.first_name,
    order.billing.last_name,
    `"${decodeHtmlEntities(item.name)}"`,
    deliveryDate
      ? new Date(deliveryDate.getTime() + 4 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10)
      : "",
    calories,
    protein,
    carbs,
    fat,
    `"${ingredients}"`,
    `"${allergens}"`,
    deliveryDate ? deliveryDate.toISOString().slice(0, 10) : "",
    selectedSizes || allSizes,
    decodeHtmlEntities(mealOption),
  ];
};

// Main function to generate full CSV data
export const generateFullCsvData = (orders: any[], meals: any = []) => {
  const csvHeader = [
    "Customer Name",
    "First Name",
    "Last Name",
    "Product Name",
    "Expiry Date",
    "Calories",
    "Protein",
    "Carbs",
    "Fat",
    "Ingredients",
    "Allergens",
    "Delivery Date",
    "All Sizes",
    "Meal Option",
  ];

  const csvData = [csvHeader];

  orders.forEach((order) => {
    const deliveryDate = getDeliveryDate(order);
    order.line_items.forEach((item: any) => {
      for (let i = 0; i < item.quantity; i++) {
        const rowData =
          meals.length === 0
            ? processOrderItemWithoutMeal(
                item,
                order,
                deliveryDate || new Date()
              )
            : processOrderItemWithMeal(
                item,
                order,
                deliveryDate || new Date(),
                meals
              );
        csvData.push(rowData);
      }
    });
  });

  return csvData
    .map((row) =>
      row
        .map((field) =>
          typeof field === "string" ? decodeHtmlEntities(field) : field
        )
        .join(",")
    )
    .join("\n");
};
