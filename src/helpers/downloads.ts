import { getDeliveryDate } from "@/helpers/date";

export const generateFullCsvData = (orders: any[], meals: any = []) => {
  // This means that the meal doesn't exist (stopgap solution for now before meals are updated in the database)
  if (!meals || meals.length === 0) {
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
      return ""; // Return empty string if size is not found or metadata doesn't contain addons data
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

    const csvData = [
      [
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
      ],
    ];

    console.log("Generating CSV data for: ", orders);
    orders.forEach((order) => {
      const deliveryDate = getDeliveryDate(order);
      order.line_items.forEach((item: any) => {
        // Generate a label for each instance of the line item
        for (let i = 0; i < item.quantity; i++) {
          const allergens = extractAllergens(item.product_data.acf);
          const selectedSizeRegex = /(\d+\s*cal(?:ories)?)/i; // Match "400cal" or "400 Calories", case insensitive
          const selectedSizeMatch = selectedSizeRegex.exec(
            formatSize(item.meta_data)
          );
          let selectedSize = "";
          if (selectedSizeMatch) {
            selectedSize = selectedSizeMatch[1]; // Use the matched value
          } else {
            const sizeOptions = formatSize(item.meta_data).split(" | ");
            // Prioritize "400cal" if it exists
            selectedSize =
              sizeOptions.find((size: any) => size.includes("cal")) || "";
          }
          const facts = calculateFacts(
            selectedSize,
            item.product_data.product_addons
          );
          csvData.push([
            `${order.billing.first_name} ${order.billing.last_name}`,
            order.billing.first_name,
            order.billing.last_name,
            `"${item.name}"`, // Enclose item name in double quotes
            deliveryDate
              ? new Date(deliveryDate.getTime() + 4 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 10)
              : "", // Add 4 days if deliveryDate is not null
            (parseInt(item.product_data.acf?.facts?.calories) || 0) +
              (facts ? facts.calories : 0), // Add existing calories to calculated calories, with null check for 'facts'
            (parseInt(
              item.product_data.acf?.facts?.items?.find(
                (fact: any) => fact.label === "protein"
              )?.amount
            ) || 0) + (facts ? facts.protein : 0), // Add existing protein to calculated protein, with null check for 'facts'
            (parseInt(
              item.product_data.acf?.facts?.items?.find(
                (fact: any) => fact.label === "carbs"
              )?.amount
            ) || 0) + (facts ? facts.carbs : 0), // Add existing carbs to calculated carbs, with null check for 'facts'
            (parseInt(
              item.product_data.acf?.facts?.items?.find(
                (fact: any) => fact.label === "fat"
              )?.amount
            ) || 0) + (facts ? facts.fat : 0), // Add existing fat to calculated fat, with null check for 'facts'
            `"${
              item.product_data.acf?.ingredients?.description?.replace(
                /<[^>]+>/g,
                ""
              ) || ""
            }"`,
            allergens,
            deliveryDate ? deliveryDate.toISOString().slice(0, 10) : "", // Convert deliveryDate to ISO string if not null
            formatSize(item.meta_data),
          ]);
        }
      });
    });

    return csvData.map((row) => row.join(",")).join("\n");
  } else {
    const csvData = [
      [
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
      ],
    ];

    console.log("Generating CSV data for: ", orders);
    orders.forEach((order: any) => {
      const deliveryDate = getDeliveryDate(order);
      order.line_items.forEach((item: any) => {
        for (let i = 0; i < item.quantity; i++) {
          // Filter all metadata entries that contain "size" and do not start with '_'
          const sizeMetadata = item.meta_data.filter(
            (meta: any) => !meta.key.startsWith("_")
          );

          // Concatenate all sizes with a delimiter '|'
          const selectedSizes =
            sizeMetadata.map((meta: any) => meta.value).join(" | ") || "";

          const meal = meals.find((m: any) => m.name === item.name);

          let calories = 0,
            protein = 0,
            carbs = 0,
            fat = 0;
          let ingredients = "",
            allergens = "",
            allSizes = "";

          if (meal) {
            // Find a matching option based on any of the selected sizes
            const selectedOption =
              meal.options.find((opt: any) =>
                selectedSizes.includes(opt.name)
              ) || meal.options[0];

            calories = selectedOption.calories || 0;
            protein = selectedOption.protein || 0;
            carbs = selectedOption.carbs || 0;
            fat = selectedOption.fat || 0;
            ingredients = meal.ingredients || "";
            allergens = meal.allergens || "";
            allSizes = meal.options.map((opt: any) => opt.name).join(" | ");
          }

          csvData.push([
            `${order.billing.first_name} ${order.billing.last_name}`,
            order.billing.first_name,
            order.billing.last_name,
            `"${item.name}"`,
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
          ]);
        }
      });
    });

    return csvData.map((row) => row.join(",")).join("\n");
  }
};
