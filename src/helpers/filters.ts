export const filterOrdersByStatus = (
  orders: any[],
  selectedKeys: Set<string>
) => {
  // Check if "All" is in the selectedKeys
  if (selectedKeys.has("All")) {
    return orders;
  }

  // Filter the orders where the status is one of the selected keys
  return orders.filter((order) => selectedKeys.has(order.status));
};

export const filterOrdersByCategory = (
  orders: any[],
  selectedKeys: Set<string>,
  products: any[]
) => {
  return orders
    .map((order) => ({
      ...order,
      line_items: order.line_items.filter((item: any) => {
        if (selectedKeys.has("All")) {
          return true;
        }
        const associatedProduct = products.find(
          (product: any) => product.id === item.product_id
        );
        const itemCategories =
          associatedProduct?.categories?.map(
            (category: any) => category.name
          ) || [];
        return Array.from(selectedKeys).every((selectedCategory: any) =>
          itemCategories.includes(selectedCategory)
        );
      }),
    }))
    .filter((order) => selectedKeys.has("All") || order.line_items.length > 0);
};

export const filterBySearch = (orders: any[], searchTerm: string) => {
  if (searchTerm.toLowerCase().startsWith("name:")) {
    return nameSearch(orders, searchTerm);
  } else {
    // Regular filter based on id field (unchanged)
    const filteredOrders = orders.filter((order) =>
      order.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filteredOrders;
  }
};

const nameSearch = (orders: any[], searchTerm: string) => {
  // Extract the name search terms (after "name:")
  const nameSearchTerms = searchTerm
    .slice(5)
    .split(",")
    .map((term: string) => term.trim().toLowerCase());

  // Filter orders based on the full name derived from first_name and last_name
  const filteredOrders = orders.filter((order) => {
    const fullName =
      `${order.billing.first_name} ${order.billing.last_name}`.toLowerCase();
    // Check if any of the search terms match the full name
    return nameSearchTerms.some((term) => fullName.includes(term));
  });

  return filteredOrders;
};

export const filterOrdersByComponent = (
  orders: any[],
  selectedKeys: Set<string>
) => {
  return orders
    .map((order) => {
      const includedProducts = new Set();
      return {
        ...order,
        line_items: order.line_items.filter((item: any) => {
          if (selectedKeys.has("All")) {
            return true;
          }
          if (item.composite_parent) {
            const compositeData = item.meta_data.find(
              (meta: any) => meta.key === "_composite_data"
            );
            if (compositeData && compositeData.value) {
              const matchedComponent = Object.values(compositeData.value).find(
                (component: any) =>
                  component.product_id === item.product_id &&
                  selectedKeys.has(component.title)
              );
              if (matchedComponent && !includedProducts.has(item.product_id)) {
                includedProducts.add(item.product_id);
                return true;
              }
            }
          }
          return false;
        }),
      };
    })
    .filter((order) => selectedKeys.has("All") || order.line_items.length > 0);
};
