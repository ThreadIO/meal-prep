import Image from "next/image";

const ProductCard = ({ product }: { product: any }) => {
  // Check if product.images[0].src is a valid URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Set productImage to either product image URL or default image URL
  const productImage =
    product.images &&
    product.images.length > 0 &&
    isValidUrl(product.images[0].src)
      ? product.images[0].src
      : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcq_HAOxMgMpwGXabyafUZkB0KUyo8x7fh8Zw8mAgsxA&s";

  const renderDescription = () => {
    // Check if the product description contains HTML tags
    const containsHTML = /<\/?[a-z][\s\S]*>/i.test(product.description);

    if (containsHTML) {
      return <div dangerouslySetInnerHTML={{ __html: product.description }} />;
    } else {
      return (
        <p className="text-sm text-gray-600 product-description">
          {product.description}
        </p>
      );
    }
  };

  return (
    <div className="border-gray-100 shadow-2xl border-4 text-center mt-10 max-w-[1040px] bg-white text-black">
      <div className="p-6">
        <div className="h-full flex flex-col">
          <h4 className="text-3xl font-bold">{product.name}</h4>
          <div className="mt-4 flex-grow">
            <div className="relative w-48 h-48 mx-auto rounded-md overflow-hidden">
              <Image
                src={productImage} // Use product image or placeholder if not available
                alt={"Product Image"}
                layout="fill"
                objectFit="contain"
                objectPosition="center"
              />
            </div>
          </div>
          <div className="mt-6 flex flex-col items-center justify-center">
            <h1 className="text-5xl font-bold">
              {(parseFloat(product.price) || 0).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </h1>
            <h3 className="mt-2">per item</h3>
          </div>
          <div className="mt-6 text-left">
            <div className="mt-6 text-left">{renderDescription()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
