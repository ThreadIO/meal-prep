// // Meals are WooCommerce Products
// // Tags are WooCommerce Product Categories
// // Regular_Price is the price of the meal
// // This will translate a meal object to a WooCommerce Product
import { createCoupon, patchCoupon } from "@/helpers/request";

// Need to pass categories to createProduct
export const createCouponOnWoocommerce = async (coupon: any) => {
  console.log("Discount Type: ", coupon.discount_type);
  const body = {
    userid: coupon.userid,
    code: coupon.code,
    amount: coupon.amount,
    minimum_amount: coupon.minimum_amount,
    discount_type: coupon.discount_type,
    description: coupon.description,
    usage_limit: coupon.usage_limit,
    individual_use: coupon.individual_use,
    exclude_sale_items: coupon.exclude_sale_items,
  };

  const createdCoupon = await createCoupon(body);
  return createdCoupon;
};

export const updateCouponOnWoocommerce = async (coupon: any) => {
  // Will need to work this out -> Maybe will need to make api calls here
  const body = {
    userid: coupon.userid,
    code: coupon.code,
    amount: coupon.amount,
    minimum_amount: coupon.minimum_amount,
    discount_type: coupon.discount_type,
    description: coupon.description,
    usage_limit: coupon.usage_limit,
    individual_use: coupon.individual_use,
    exclude_sale_items: coupon.exclude_sale_items,
  };

  const patchedCoupon = await patchCoupon(coupon.couponid, body);
  // Need to update the add ons here
  return patchedCoupon;
};
