"use client";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
const Products = () => {
  const renderProductContent = () => {
    return (
      <section className="w-full">
        <div className="mx-auto max-w-4xl text-center mt-10 items-center">
          Coming Soon!
        </div>
      </section>
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        {renderProductContent()}
      </div>
    </div>
  );
};

export default Products;
