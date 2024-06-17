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
    label: "CUSTOMER_NAME",
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
    key: "price",
    label: "PRICE",
  },
  { key: "quantity", label: "QUANTITY" },
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
