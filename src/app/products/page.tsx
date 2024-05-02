"use client";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useUser } from "@propelauth/nextjs/client";
import { SignupAndLoginButtons } from "@/components/SignupAndLoginButtons";
import { Button, Spinner } from "@nextui-org/react";
import ProductCard from "@/components/ProductCard";
import { ProductModal } from "@/components/Modals/ProductModal";

const Products = () => {
  const { loading, isLoggedIn, user } = useUser();
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [openProduct, setOpenProduct] = useState(false);

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

  const renderProductPage = () => {
    if (error) {
      return renderError();
    } else if (productsLoading) {
      return renderLoading();
    } else {
      return renderProductContent();
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
    return (
      <div className="overflow-y-auto h-full pb-20">
        <div className="mx-auto max-w-4xl text-center mt-10 items-center">
          <h2 className="text-3xl font-semibold leading-7 mb-6">Products</h2>
          {/* Container div to center the button */}
          <div className="flex justify-center">
            <Button color="primary" onPress={() => setOpenProduct(true)}>
              Create New
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-[1040px] mx-auto">
          {products.map((product: any) => (
            <ProductCard
              key={product.id}
              product={product}
              onUpdate={() => getProducts()}
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
