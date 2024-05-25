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
