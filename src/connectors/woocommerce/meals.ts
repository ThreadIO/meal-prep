// Meals are WooCommerce Products
// Tags are WooCommerce Product Categories
// Regular_Price is the price of the meal
// This will translate a meal object to a WooCommerce Product
import { createProduct, patchProduct } from "@/helpers/request";
import { stockStatusOptions } from "@/helpers/utils";

const convertTagsToCategories = (tags: string[], fullCategories: any) => {
  const converted_tags = fullCategories.filter((category: any) =>
    tags.includes(category.name)
  );
  return converted_tags;
};

const convertStatusToStockStatus = (status: string) => {
  const stockStatus = stockStatusOptions.find(
    (stockStatus) => stockStatus.display === status
  );
  return stockStatus ? stockStatus.value : "outofstock";
};
// Need to pass categories to createProduct
export const createMealOnWoocommerce = async (
  meal: any,
  image: any,
  fullCategories: any
) => {
  const categories = convertTagsToCategories(meal.tags, fullCategories); // Need to convert tags to categories
  const status = convertStatusToStockStatus(meal.status); // Need to convert status to stock_status

  const body = {
    userid: meal.userid,
    name: meal.name,
    type: "simple",
    regular_price: meal.price.toString(),
    description: meal.description,
    categories: categories,
    stock_status: status,
    images: [image],
  };

  const product = await createProduct(body);
  console.log("Product: ", product);
  return product;
};

export const updateMealOnWoocommerce = async (
  meal: any,
  image: any,
  fullCategories: any
) => {
  // Will need to work this out -> Maybe will need to make api calls here
  const categories = convertTagsToCategories(meal.tags, fullCategories); // Need to convert tags to categories
  const status = convertStatusToStockStatus(meal.status); // Need to convert status to stock_status
  console.log("Meal: ", meal);
  const body = {
    userid: meal.userid,
    name: meal.name,
    type: "simple",
    regular_price: meal.price.toString(),
    description: meal.description,
    categories: categories,
    stock_status: status,
    images: image ? [image] : [],
  };
  const product = await patchProduct(meal.mealid, body);
  return product;
};
