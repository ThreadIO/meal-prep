// Meals are WooCommerce Products
// Tags are WooCommerce Product Categories
// Regular_Price is the price of the meal
// This will translate a meal object to a WooCommerce Product
export const createMealOnWoocommerce = (meal: any) => {
  // Will need to work this out -> Maybe will need to make api calls here
  return {
    name: meal.name,
    type: "simple",
    regular_price: meal.price,
    description: meal.description,
    short_description: meal.short_description,
    categories: meal.tags,
    images: [
      {
        src: meal.image,
      },
    ],
  };
};

export const updateMealOnWoocommerce = (meal: any) => {
  // Will need to work this out -> Maybe will need to make api calls here
  return {
    name: meal.name,
    type: "simple",
    regular_price: meal.price,
    description: meal.description,
    short_description: meal.short_description,
    categories: meal.tags,
    images: [
      {
        src: meal.image,
      },
    ],
  };
};
