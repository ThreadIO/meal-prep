import { Chip, ChipProps } from "@nextui-org/react";

export const renderCategories = (product: any) => {
  return (
    <div className="flex flex-wrap justify-center mt-4">
      {product.categories.map((category: any) => (
        <span
          key={category.id}
          className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
        >
          {category.name}
        </span>
      ))}
    </div>
  );
};

export const renderStockStatus = (product: any) => {
  let statusColor = "bg-green-200 text-green-800";
  let statusText = "In Stock";

  if (
    product.stock_status === "outofstock" ||
    product.stock_status === "onbackorder"
  ) {
    statusColor = "bg-red-200 text-red-800";
    statusText =
      product.stock_status === "outofstock" ? "Out of Stock" : "On Backorder";
  }

  return (
    <div
      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${statusColor}`}
    >
      {statusText}
    </div>
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
