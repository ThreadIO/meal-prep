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
  let statusColor = "bg-gray-200 text-gray-800";
  let statusText = order.status;
  if (order.status === "failed" || order.status === "cancelled") {
    statusColor = "bg-red-200 text-red-800";
    statusText = order.status === "failed" ? "Failed" : "Cancelled";
  } else if (order.status === "completed" || order.status === "processing") {
    statusText = order.status === "processing" ? "Paid" : "Completed";
    statusColor = "bg-green-200 text-green-800";
  } else if (order.status === "pending") {
    statusColor = "bg-yellow-200 text-yellow-800";
    statusText = "Awaiting Payment";
  }
  return (
    <div
      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${statusColor}`}
    >
      {statusText}
    </div>
  );
};
