"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import PricingCard from "@/components/PricingCard";
import { Spinner } from "@nextui-org/react";
const Pricing = () => {
  const [prices, setPrices] = useState<any>([]);
  const [products, setProducts] = useState<any>([]);
  const [pricesLoading, setPricesLoading] = useState<boolean>(false);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  useEffect(() => {
    fetchPrices();
    fetchProducts();
  }, []);
  const fetchPrices = async () => {
    setPricesLoading(true);
    const pricesResponse = await fetch("/api/prices", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await pricesResponse.json();
    setPrices(data);
    setPricesLoading(false);
    console.log("Prices: ", data);
  };
  const fetchProducts = async () => {
    setProductsLoading(true);
    const productsResponse = await fetch("/api/products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await productsResponse.json();
    setProducts(data);
    setProductsLoading(false);
    console.log(data);
  };
  const renderLoading = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Spinner
            label={productsLoading ? "Loading Products" : "Loading Prices"}
          />
        </div>
      </div>
    );
  };
  const renderPricingContent = () => {
    if (pricesLoading || productsLoading) {
      return renderLoading();
    } else {
      return (
        <section className="w-full">
          <div className="mx-auto max-w-4xl text-center mt-10 items-center">
            <h2 className="text-3xl font-semibold leading-7">Meals</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              Choose the meal for you!
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 sm:text-center">
              Check out all meals below
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-[1040px] items-center mx-auto">
            {prices &&
              prices.map((price: any) => (
                <PricingCard
                  key={price.id}
                  price={price}
                  product={products.find(
                    (product: any) => product.id === price.product
                  )}
                />
              ))}
          </div>
        </section>
      );
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        {renderPricingContent()}
      </div>
    </div>
  );
};

export default Pricing;
