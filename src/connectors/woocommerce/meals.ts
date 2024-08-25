// Meals are WooCommerce Products
// Tags are WooCommerce Product Categories
// Regular_Price is the price of the meal
// This will translate a meal object to a WooCommerce Product
import {
  createProduct,
  patchProduct,
  patchProductAddOns,
  postProductAddOns,
} from "@/helpers/request";
import { stockStatusOptions } from "@/helpers/utils";
import {
  convertOptionsToProductAddOns,
  convertCustomOptionsToProductAddOns,
} from "@/connectors/woocommerce/options";

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
    images: image ? [image] : [],
  };
  const product = await createProduct(body);
  const sizeAddOns = convertOptionsToProductAddOns(meal.options);
  const customAddOns = convertCustomOptionsToProductAddOns(meal.custom_options);
  console.log("Custom Add Ons: ", customAddOns);
  const allAddOns = {
    fields: [...sizeAddOns.fields, ...customAddOns.fields],
    userid: meal.userid,
  };
  console.log("All Addons: ", allAddOns);
  await postProductAddOns(product.id, allAddOns);
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
  const body = {
    userid: meal.userid,
    name: meal.name,
    type: "simple",
    regular_price: meal.price.toString(),
    description: meal.description,
    short_description: meal.short_description,
    categories: categories,
    stock_status: status,
    images: image ? [image] : [],
  };
  const product = await patchProduct(meal.mealid, body);
  const sizeAddOns = convertOptionsToProductAddOns(meal.options);
  const customAddOns = convertCustomOptionsToProductAddOns(meal.custom_options);

  const allAddOns = {
    fields: [...sizeAddOns.fields, ...customAddOns.fields],
    userid: meal.userid,
  };
  await patchProductAddOns(meal.mealid, allAddOns);
  return product;
};

export const getHMPProductData = (meal: any) => {
  // TO-DO: Get the product data from HMP
  // This should return the product data from HMP
  const facts = meal.acf?.facts || {};
  const calories = facts?.calories || 0;
  const items = facts?.items;
  const carbs =
    items?.find((item: any) => item.nutrition_fact_label === "carbs")?.amount ||
    0;
  const protein =
    items?.find((item: any) => item.nutrition_fact_label === "protein")
      ?.amount || 0;
  const fat =
    items?.find((item: any) => item.nutrition_fact_label === "fat")?.amount ||
    0;
  const productData = {
    calories: parseInt(calories),
    protein: parseInt(protein),
    fat: parseInt(fat),
    carbs: parseInt(carbs),
  };
  return productData;
};
