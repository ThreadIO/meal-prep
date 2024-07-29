export const not_products = [
  "3 Meal Plan",
  "5 Meal Plan",
  "10 Meal Plan",
  "15 Meal Plan",
  "20 Meal Plan",
  "Boston Hockey Academy",
];

export const not_labels = ["BHA NO DELIVERY", "BHA - NO DELIVERY"];

export const StockStatusOptions = [
  { display: "All", value: "All" },
  { display: "In Stock", value: "instock" },
  { display: "Out Of Stock", value: "outofstock" },
  { display: "On Backorder", value: "onbackorder" },
];

export const product_columns = [
  {
    key: "image",
    label: "IMAGE",
  },
  {
    key: "name",
    label: "NAME",
  },
  {
    key: "categories",
    label: "CATEGORIES",
  },
  {
    key: "stock_status",
    label: "STOCK STATUS",
  },
  {
    key: "price",
    label: "PRICE",
  },
  {
    key: "actions",
    label: "ACTIONS",
  },
];

export const order_columns = [
  {
    key: "order_id",
    label: "ORDER ID",
  },
  {
    key: "customer_name",
    label: "CUSTOMER NAME",
  },
  {
    key: "order_date",
    label: "ORDER DATE",
  },
  {
    key: "delivery_date",
    label: "DELIVERY DATE",
  },
  {
    key: "status",
    label: "STATUS",
  },
  // {
  //   key: "actions",
  //   label: "ACTIONS",
  // },
];

export const line_item_columns = [
  {
    key: "image",
    label: "IMAGE",
  },
  {
    key: "name",
    label: "NAME",
  },
  {
    key: "size",
    label: "SIZE",
  },
  {
    key: "subtotal",
    label: "Total",
  },
  { key: "quantity", label: "QUANTITY" },
  { key: "total_tax", label: "TOTAL TAX" },
  // {
  //   key: "actions",
  //   label: "ACTIONS",
  // },
];

export const stockStatusOptions = [
  { display: "In Stock", value: "instock" },
  { display: "Out Of Stock", value: "outofstock" },
  { display: "On Backorder", value: "onbackorder" },
];

export const statusOptions = [
  { name: "pending", display: "Awaiting Payment" },
  { name: "processing", display: "Paid" },
  { name: "completed", display: "Shipped" },
  { name: "cancelled", display: "Cancelled" },
  { name: "refunded", display: "Refunded" },
  { name: "failed", display: "Failed" },
];

export const coupon_columns = [
  {
    key: "code",
    label: "CODE",
  },
  {
    key: "amount",
    label: "AMOUNT",
  },
  {
    key: "discount_type",
    label: "DISCOUNT TYPE",
  },
  {
    key: "minimum_amount",
    label: "MINIMUM AMOUNT",
  },
  {
    key: "usage_limit",
    label: "USAGE LIMIT",
  },
  {
    key: "usage_count",
    label: "USAGE COUNT",
  },
  { key: "date_expires", label: "DATE EXPIRES" },
  {
    key: "actions",
    label: "ACTIONS",
  },
];

export const CouponDiscountType = [
  { display: "Fixed Cart", value: "fixed_cart" },
  { display: "Fixed Product", value: "fixed_product" },
  { display: "Percent", value: "percent" },
];

export const demoFlag = false;
