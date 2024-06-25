import { Chip, ChipProps } from "@nextui-org/react";

export const renderCategories = (product: any) => {
  return (
    <div className="flex flex-wrap gap-1 w-full">
      {product.categories.map((category: any) => (
        <Chip key={category.id} color="default" size="sm">
          {category.name}
        </Chip>
      ))}
    </div>
  );
};

export const renderStockStatus = (product: any) => {
  let color: ChipProps["color"] = "success";
  let statusText = "In Stock";

  if (
    product.stock_status === "outofstock" ||
    product.stock_status === "onbackorder"
  ) {
    color = product.stock_status === "outofstock" ? "danger" : "warning";
    statusText =
      product.stock_status === "outofstock" ? "Out of Stock" : "On Backorder";
  }

  return (
    <Chip color={color} variant="solid" size="sm">
      {statusText}
    </Chip>
  );
};

export const renderOrderStatus = (order: any) => {
  let color: ChipProps["color"] = "default";
  let statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);

  switch (order.status) {
    case "failed":
    case "cancelled":
      color = "danger";
      break;
    case "completed":
    case "processing":
      color = "success";
      break;
    case "pending":
      color = "warning";
      break;
    default:
      color = "default";
  }

  return (
    <Chip color={color} variant="solid" size="sm">
      {statusText}
    </Chip>
  );
};
