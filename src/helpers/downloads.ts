import { getDeliveryDate } from "@/helpers/date";
import { decodeHtmlEntities } from "@/helpers/frontend";

export const generateFullCsvData = (orders: any[], meals: any = []) => {
  const extractAllergens = (acf: any) => {
    const allergens = acf?.allergens?.items
      ?.map((item: any) => item.label.name)
      .join(", ");
    return allergens || "";
  };

  const formatSize = (metaData: any[]) => {
    const addonsData = metaData.find((item) => item.key === "_addons_data");
    if (addonsData) {
      const sizeAddons = addonsData.value.filter(
        (addon: any) => addon.name === "Size"
      );
      const sizes = sizeAddons.map((addon: any) => addon.value);
      return sizes.join(" | ");
    }
    return "";
  };

  const calculateFacts = (selectedSize: string, metaData: any[]) => {
    if (!metaData) {
      return null;
    }
    const sizeData = metaData.find((item) => item.name === "Size");
    if (sizeData) {
      const selectedOption = sizeData.options.find(
        (option: any) => option.label === selectedSize
      );
      if (selectedOption) {
        const calories = parseInt(selectedOption.calories) || 0;
        const protein = parseInt(selectedOption.protein) || 0;
        const carbs = parseInt(selectedOption.carbs) || 0;
        const fat = parseInt(selectedOption.fat) || 0;
        return {
          calories: calories,
          protein: protein,
          carbs: carbs,
          fat: fat,
        };
      }
    }
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
  };

  const extractMealOption = (item: any) => {
    if (item.composite_parent) {
      const compositeData = item.meta_data.find(
        (meta: any) => meta.key === "_composite_data"
      );
      if (compositeData && compositeData.value) {
        const component: any = Object.values(compositeData.value).find(
          (comp: any) => comp.product_id === item.product_id
        );
        return component ? component.title : "";
      }
    }
    return "";
  };

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

  console.log("Generating CSV data for: ", orders);

  if (!meals || meals.length === 0) {
    orders.forEach((order) => {
      const deliveryDate = getDeliveryDate(order);
      order.line_items.forEach((item: any) => {
        for (let i = 0; i < item.quantity; i++) {
          const allergens = extractAllergens(item.product_data.acf);
          const selectedSizeRegex = /(\d+\s*cal(?:ories)?)/i;
          const selectedSizeMatch = selectedSizeRegex.exec(
            formatSize(item.meta_data)
          );
          let selectedSize = "";
          if (selectedSizeMatch) {
            selectedSize = selectedSizeMatch[1];
          } else {
            const sizeOptions = formatSize(item.meta_data).split(" | ");
            selectedSize =
              sizeOptions.find((size: any) => size.includes("cal")) || "";
          }
          const facts = calculateFacts(
            selectedSize,
            item.product_data.product_addons
          );
          const mealOption = extractMealOption(item);
          csvData.push([
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
            `"${
              item.product_data.acf?.ingredients?.description?.replace(
                /<[^>]+>/g,
                ""
              ) || ""
            }"`,
            allergens,
            deliveryDate ? deliveryDate.toISOString().slice(0, 10) : "",
            formatSize(item.meta_data),
            mealOption,
          ]);
        }
      });
    });
  } else {
    orders.forEach((order: any) => {
      const deliveryDate = getDeliveryDate(order);
      order.line_items.forEach((item: any) => {
        for (let i = 0; i < item.quantity; i++) {
          const selectedSizes =
            item.meta_data
              .filter((meta: any) => !meta.key.startsWith("_"))
              .map((meta: any) => meta.value)
              .join(" | ") || "";

          const meal = meals.find(
            (m: any) =>
              decodeHtmlEntities(m.name) === decodeHtmlEntities(item.name)
          );

          let calories = 0,
            protein = 0,
            carbs = 0,
            fat = 0;
          let ingredients = "",
            allergens = "",
            allSizes = "";

          if (meal) {
            let selectedOption;
            let customOption;

            selectedOption = meal.options.find((opt: any) =>
              selectedSizes.includes(opt.name)
            );

            if (!selectedOption) {
              for (const customOptionGroup of meal.custom_options) {
                customOption = customOptionGroup.options.find((opt: any) =>
                  selectedSizes.includes(opt.name)
                );
                if (customOption) break;
              }
            }

            if (selectedOption) {
              calories = selectedOption.calories || 0;
              protein = selectedOption.protein || 0;
              carbs = selectedOption.carbs || 0;
              fat = selectedOption.fat || 0;
              ingredients = meal.ingredients || "";
              allergens = meal.allergens || "";
              allSizes = meal.options.map((opt: any) => opt.name).join(" | ");
            } else if (customOption) {
              calories = customOption.calories || 0;
              protein = customOption.protein || 0;
              carbs = customOption.carbs || 0;
              fat = customOption.fat || 0;
              ingredients = meal.ingredients || "";
              allergens = meal.allergens || "";
              allSizes = meal.custom_options
                .flatMap((group: any) =>
                  group.options.map((opt: any) => opt.name)
                )
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

          const mealOption = extractMealOption(item);

          csvData.push([
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
            mealOption,
          ]);
        }
      });
    });
  }

  return csvData.map((row) => row.join(",")).join("\n");
};
