// // Meals are WooCommerce Products
// // Tags are WooCommerce Product Categories
// // Regular_Price is the price of the meal
// // This will translate a meal object to a WooCommerce Product
// import { createCoupon, patchCoupon } from "@/helpers/request";

// // Need to pass categories to createProduct
// export const createCouponOnWoocommerce = async (coupon: any) => {
//   const body = {
//     userid: coupon.userid,
//     name: meal.name,
//     type: "simple",
//     regular_price: meal.price.toString(),
//     description: meal.description,
//   };

//   const createdCoupon = await createCoupon(body);
//   return createdCoupon;
// };

// export const updateCouponOnWoocommerce = async (coupon: any) => {
//   // Will need to work this out -> Maybe will need to make api calls here
//   const body = {
//     userid: coupon.userid,
//     name: meal.name,
//     type: "simple",
//     regular_price: meal.price.toString(),
//     description: meal.description,
//   };
//   const patchCoupon = await patchCoupon(coupon, body);
//   // Need to update the add ons here
//   return patchCoupon;
// };
