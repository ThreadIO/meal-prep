"use client";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useUser } from "@propelauth/nextjs/client";
import { SignupAndLoginButtons } from "@/components/SignupAndLoginButtons";
import { Button, Spinner } from "@nextui-org/react";
import ProductCard from "@/components/Product/ProductCard";
import { ProductModal } from "@/components/Modals/ProductModal";
import Dropdown from "@/components/Dropdown";

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

  const stockStatusOptions = [
    { display: "All", value: "All" },
    { display: "In Stock", value: "instock" },
    { display: "Out Of Stock", value: "outofstock" },
    { display: "On Backorder", value: "onbackorder" },
  ];

  const getProducts = async () => {
    setProductsLoading(true);
    await getCategories();
    try {
      const productsResponse = await fetch("/api/woocommerce/getproducts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userid: user?.userId }),
      });

      if (!productsResponse.ok) {
        if (productsResponse.statusText === "Unauthorized") {
          setError("Incorrect Client Key or Client Secret");
        } else {
          setError(`Failed to fetch products: ${productsResponse.statusText}`);
        }
        throw new Error(
          `Failed to fetch products: ${productsResponse.statusText}`
        );
      }
      setError("");
      const responseData = await productsResponse.json();
      const productsData = responseData.data || [];
      console.log("Products Data: ", productsData);
      setProducts(productsData);
      setProductsLoading(false);
    } catch (error) {
      console.error("Error fetching Products:", error);
      setProducts([]);
      setProductsLoading(false);
    }
  };

  const getCategories = async () => {
    setCategoriesLoading(true);
    try {
      const categoriesResponse = await fetch(
        "/api/woocommerce/getproducts/getcategories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userid: user?.userId }),
        }
      );

      if (!categoriesResponse.ok) {
        if (categoriesResponse.statusText === "Unauthorized") {
          setError("Incorrect Client Key or Client Secret");
        } else {
          setError(
            `Failed to fetch products: ${categoriesResponse.statusText}`
          );
        }
        throw new Error(
          `Failed to fetch products: ${categoriesResponse.statusText}`
        );
      }
      setError("");
      const responseData = await categoriesResponse.json();
      const categoriesData = responseData.data || [];
      console.log("Categories Data: ", categoriesData);
      setCategories(categoriesData);
      setCategoriesLoading(false);
    } catch (error) {
      console.error("Error fetching Categories:", error);
      setCategories([]);
      setCategoriesLoading(false);
    }
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
        items={stockStatusOptions.map((status) => ({ name: status.display }))}
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

  const renderProductContent = () => {
    const filteredProducts = products.filter((product) => {
      // Filter by categories
      const selectedCategories = Array.from(selectedKeys);
      if (!selectedCategories.includes("All")) {
        const productCategories = product.categories.map(
          (category: any) => category.name
        );
        if (
          !selectedCategories.every((category) =>
            productCategories.includes(category)
          )
        ) {
          return false;
        }
      }
      // Filter by stock status
      const selectedStockStatusValue = Array.from(selectedStockStatus)[0];
      if (
        selectedStockStatusValue !== "All" &&
        product.stock_status !== selectedStockStatusValue
      ) {
        return false;
      }
      return true;
    });

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-[1040px] mx-auto mt-5">
          {filteredProducts.map((product: any) => (
            <ProductCard
              key={product.id}
              product={product}
              onUpdate={() => getProducts()}
              userId={user!.userId}
              categories={categories}
            />
          ))}
        </div>
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
