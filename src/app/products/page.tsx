"use client";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useUser } from "@propelauth/nextjs/client";
import { SignupAndLoginButtons } from "@/components/SignupAndLoginButtons";
import { Button, Spinner, Tooltip } from "@nextui-org/react";
import ProductCard from "@/components/Product/ProductCard";
import { ProductModal } from "@/components/Modals/ProductModal";
import Dropdown from "@/components/Dropdown";
import { getData } from "@/helpers/frontend";
import { StockStatusOptions } from "@/helpers/utils";
import { LayoutGrid, Table as TableIcon } from "lucide-react";
import ProductTable from "@/components/Product/ProductTable";

const Products = () => {
  const { loading, isLoggedIn, user } = useUser();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<any>(new Set(["All"]));
  const [selectedStockStatus, setSelectedStockStatus] = useState<any>(
    new Set(["All"])
  );

  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [openProduct, setOpenProduct] = useState(false);
  const [layout, setLayout] = useState<"grid" | "table">("table");
  const getProducts = async () => {
    const url = "/api/woocommerce/getproducts";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
    };
    const body = { userid: user?.userId };
    getData(
      "products",
      url,
      method,
      headers,
      setProducts,
      setError,
      setProductsLoading,
      body,
      getCategories
    );
  };

  const getCategories = async () => {
    const url = "/api/woocommerce/getproducts/getcategories";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
    };
    const body = { userid: user?.userId };
    getData(
      "categories",
      url,
      method,
      headers,
      setCategories,
      setError,
      setCategoriesLoading,
      body
    );
  };

  useEffect(() => {
    if (isLoggedIn && !loading && !productsLoading) {
      getProducts();
    }
  }, [isLoggedIn, loading]);

  const handleCloseProductModal = () => {
    setOpenProduct(false);
  };

  const renderFilterDropdown = () => {
    return (
      <Dropdown
        aria_label="Multiple selection example"
        variant="flat"
        closeOnSelect={false}
        disallowEmptySelection
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        items={[{ name: "All" }, ...categories]}
      />
    );
  };

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
    if (error) {
      return renderError();
    } else {
      return (
        <div className="overflow-y-auto h-full pb-20">
          <div className="mx-auto max-w-4xl text-center mt-10 items-center">
            <h2 className="text-3xl font-semibold leading-7 mb-6">Products</h2>
            <div className="flex justify-center">
              <Button color="primary" onPress={() => setOpenProduct(true)}>
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

  const renderError = () => {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  };

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

  const renderProductCards = (products: any) => {
    return products.map((product: any) => (
      <ProductCard
        key={product.id}
        product={product}
        onUpdate={() => getProducts()}
        userId={user!.userId}
        categories={categories}
      />
    ));
  };

  const getFilteredProducts = () => {
    return products
      .filter((product) => {
        if (selectedKeys.has("All")) {
          return true;
        }
        const productCategories = product.categories.map(
          (category: any) => category.name
        );
        return [...selectedKeys].every((selectedCategory: any) =>
          productCategories.includes(selectedCategory)
        );
      })
      .filter((product) => {
        if (selectedStockStatus.has("All")) {
          return true;
        }
        const selectedStockStatusValue = Array.from(selectedStockStatus)[0];
        const mappedStockStatus = StockStatusOptions.find(
          (status: any) => status.display === selectedStockStatusValue
        )?.value;
        return (
          mappedStockStatus === "All" ||
          product.stock_status === mappedStockStatus
        );
      });
  };

  const renderProducts = (filteredProducts: any) => {
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
          onUpdate={() => getProducts()}
          userId={user!.userId}
          categories={categories}
        />
      );
    }
  };

  const renderProductContent = () => {
    const filteredProducts = getFilteredProducts();

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

  const renderLoading = () => {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner label={"Loading Products"} />
      </div>
    );
  };

  if (isLoggedIn) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <ProductModal
            product={{}}
            productImage={{}}
            open={openProduct}
            mode={"create"}
            onClose={() => handleCloseProductModal()}
            onUpdate={() => getProducts()}
            categories={categories}
          />
          {renderProductPage()}
        </div>
      </div>
    );
  } else if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner label="Loading Page" />
      </div>
    );
  } else {
    return <SignupAndLoginButtons />;
  }
};

export default Products;
