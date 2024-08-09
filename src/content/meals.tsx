"use client";
import { useEffect, useState } from "react";
import { useUser } from "@propelauth/nextjs/client";
import { Button, Spinner, Tooltip } from "@nextui-org/react";
import { useQuery, useQueryClient } from "react-query";
import ProductCard from "@/components/Product/ProductCard";
import { MealModal } from "@/components/Modals/MealModal";
import Dropdown from "@/components/Dropdown";
import FilterDropdown from "@/components/FilterDropdown";
import { getCategories, getProducts } from "@/helpers/frontend";
import { StockStatusOptions } from "@/helpers/utils";
import { LayoutGrid, Table as TableIcon } from "lucide-react";
import ProductTable from "@/components/Product/ProductTable";

const Meals = () => {
  const { loading, isLoggedIn, user } = useUser();
  const queryClient = useQueryClient();

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    new Set(["All"])
  );
  const [selectedStockStatus, setSelectedStockStatus] = useState<Set<string>>(
    new Set(["All"])
  );
  const [openProduct, setOpenProduct] = useState(false);
  const [layout, setLayout] = useState<"grid" | "table">("table");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useQuery(
    ["products", user?.userId, selectedKeys, selectedStockStatus],
    () => getProducts(user?.userId ?? ""),
    {
      enabled: !!user?.userId,
    }
  );

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery(["categories", user?.userId], () => getCategories(user), {
    enabled: !!user?.userId,
  });

  useEffect(() => {
    if (isLoggedIn && !loading) {
      queryClient.invalidateQueries(["products", user?.userId]);
      queryClient.invalidateQueries(["categories", user?.userId]);
    }
  }, [isLoggedIn, loading, queryClient, user?.userId]);

  useEffect(() => {
    const newFilteredProducts = getFilteredProducts();
    setFilteredProducts(newFilteredProducts);
  }, [selectedKeys, selectedStockStatus, products]);

  const handleCloseProductModal = () => {
    setOpenProduct(false);
  };

  const renderFilterDropdown = () => (
    <FilterDropdown
      selectedKeys={selectedKeys}
      setSelectedKeys={setSelectedKeys}
      options={categories}
    />
  );

  const renderStockStatusDropdown = () => {
    const getColor = (value: string) => {
      switch (value) {
        case "All":
          return "default";
        case "In Stock":
          return "success";
        case "Out Of Stock":
          return "danger";
        case "On Backorder":
          return "warning";
        default:
          return "default";
      }
    };

    return (
      <Dropdown
        aria_label="Stock Status selection example"
        variant="flat"
        closeOnSelect={false}
        disallowEmptySelection
        selectionMode="single"
        selectedKeys={selectedStockStatus}
        onSelectionChange={setSelectedStockStatus}
        items={StockStatusOptions.map((status) => ({ name: status.display }))}
        color={getColor(Array.from(selectedStockStatus)[0] as string)}
      />
    );
  };

  const renderProductPage = () => {
    if (productsError || categoriesError) {
      return renderError();
    } else {
      return (
        <div className="overflow-y-auto h-full pb-20">
          <div className="mx-auto max-w-4xl text-center mt-10 items-center">
            <h2 className="text-3xl font-semibold leading-7 mb-6">Meals</h2>
            <div className="flex justify-center">
              <Button
                color="primary"
                onPress={() => setOpenProduct(true)}
                className="mt-4"
              >
                Create New
              </Button>
            </div>
          </div>
          {productsLoading || categoriesLoading
            ? renderLoading()
            : renderProductContent()}
        </div>
      );
    }
  };

  const renderError = () => (
    <div style={{ textAlign: "center" }}>
      <p style={{ color: "red" }}>
        {(productsError as Error)?.message ||
          (categoriesError as Error)?.message ||
          "An error occurred"}
      </p>
    </div>
  );

  const renderLayoutButtons = () => {
    if (layout === "grid") {
      return (
        <div className="mt-10 flex justify-center space-x-4">
          <Tooltip content="Table Layout">
            <Button
              color="primary"
              isIconOnly
              onPress={() => setLayout("table")}
            >
              <TableIcon />
            </Button>
          </Tooltip>
        </div>
      );
    } else {
      return (
        <div className="mt-10 flex justify-center space-x-4">
          <Tooltip content="Grid Layout">
            <Button
              color="primary"
              isIconOnly
              onPress={() => setLayout("grid")}
            >
              <LayoutGrid />
            </Button>
          </Tooltip>
        </div>
      );
    }
  };

  const renderProductCards = (products: any[]) => {
    return products.map((product: any) => (
      <ProductCard
        key={product.id}
        product={product}
        onUpdate={() =>
          queryClient.invalidateQueries(["products", user?.userId])
        }
        userId={user!.userId}
        categories={categories}
      />
    ));
  };

  const getFilteredProducts = () => {
    if (!Array.isArray(products)) {
      console.error("Products is not an array:", products);
      return [];
    }

    return products
      .filter((product: any) => {
        if (selectedKeys.has("All")) {
          return true;
        }
        const productCategories = product.categories.map(
          (category: any) => category.name
        );
        return Array.from(selectedKeys).every((selectedCategory) =>
          productCategories.includes(selectedCategory)
        );
      })
      .filter((product: any) => {
        if (selectedStockStatus.has("All")) {
          return true;
        }
        const selectedStockStatusValue = Array.from(selectedStockStatus)[0];
        const mappedStockStatus = StockStatusOptions.find(
          (status) => status.display === selectedStockStatusValue
        )?.value;
        return (
          mappedStockStatus === "All" ||
          product.stock_status === mappedStockStatus
        );
      });
  };

  const renderProducts = (filteredProducts: any[]) => {
    if (layout === "grid") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-[1040px] mx-auto mt-5">
          {renderProductCards(filteredProducts)}
        </div>
      );
    } else {
      return (
        <ProductTable
          products={filteredProducts}
          onUpdate={() =>
            queryClient.invalidateQueries(["products", user?.userId])
          }
          userId={user!.userId}
          categories={categories}
        />
      );
    }
  };

  const renderProductContent = () => {
    console.log("Products: ", products);
    console.log("Filtered Products: ", filteredProducts);
    return (
      <div>
        <div className="text-center mt-5 flex justify-center space-x-4">
          <div>
            <h3 className="mb-2">Select Menu:</h3>
            {renderFilterDropdown()}
          </div>
          <div>
            <h3 className="mb-2">Stock Status:</h3>
            {renderStockStatusDropdown()}
          </div>
        </div>
        <div>{renderLayoutButtons()}</div>
        {renderProducts(filteredProducts)}
      </div>
    );
  };

  const renderLoading = () => (
    <div className="flex justify-center items-center h-full">
      <Spinner label={"Loading Meals"} />
    </div>
  );

  return (
    <>
      <MealModal
        meal={null}
        threadMeal={null}
        mealImage={{}}
        open={openProduct}
        mode={"create"}
        onClose={handleCloseProductModal}
        onUpdate={() =>
          queryClient.invalidateQueries(["products", user?.userId])
        }
        tags={categories}
      />
      {renderProductPage()}
    </>
  );
};

export default Meals;
