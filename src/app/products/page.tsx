"use client";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useEffect, useState, useMemo } from "react";
import { useUser } from "@propelauth/nextjs/client";
import { SignupAndLoginButtons } from "@/components/SignupAndLoginButtons";
import {
  Button,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  // Pagination,
} from "@nextui-org/react";
import ProductCard from "@/components/Product/ProductCard";
import { ProductModal } from "@/components/Modals/ProductModal";

const Products = () => {
  const { loading, isLoggedIn, user } = useUser();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<any>(new Set(["All"]));

  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [openProduct, setOpenProduct] = useState(false);

  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
    [selectedKeys]
  );

  const getProducts = async () => {
    setProductsLoading(true);
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

      const allCategories: string[] = productsData.flatMap((product: any) =>
        product.categories.map((category: { name: string }) => category.name)
      );

      const distinctCategories = Array.from(new Set(allCategories));
      distinctCategories.unshift("All");
      setCategories(distinctCategories);
      setProducts(productsData);
      setProductsLoading(false);
    } catch (error) {
      console.error("Error fetching Products:", error);
      setProducts([]);
      setProductsLoading(false);
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
      <Dropdown>
        <DropdownTrigger>
          <Button variant="bordered" className="capitalize">
            {selectedValue}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Multiple selection example"
          variant="flat"
          closeOnSelect={false}
          disallowEmptySelection
          selectionMode="multiple"
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
        >
          {categories.map((category) => (
            <DropdownItem key={category}>{category}</DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
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
          {productsLoading ? renderLoading() : renderProductContent()}
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
    // Filter products based on selected categories
    const filteredProducts = selectedKeys.has("All")
      ? products
      : products.filter((product) => {
          const productCategories = product.categories.map(
            (category: any) => category.name
          );
          // Check if any of the product's categories match any of the selected keys
          return productCategories.some((category: any) =>
            selectedKeys.has(category)
          );
        });
    return (
      <div>
        <div className="text-center mt-5">{renderFilterDropdown()}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-[1040px] mx-auto">
          {filteredProducts.map((product: any) => (
            <ProductCard
              key={product.id}
              product={product}
              onUpdate={() => getProducts()}
              userId={user!.userId}
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
