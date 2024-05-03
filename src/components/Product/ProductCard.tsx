import Image from "next/image";
import { Button } from "@nextui-org/react";
import { useState } from "react";
import { ProductModal } from "@/components/Modals/ProductModal";
import { DeleteModal } from "@/components/Modals/DeleteModal";
import { deleteProduct } from "@/helpers/request";
interface ProductCardProps {
  product: any;
  onUpdate: () => void;
  userId: string;
}

const ProductCard = (props: ProductCardProps) => {
  const [openProduct, setOpenProduct] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const { product, userId, onUpdate } = props;

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  const productImage =
    product.images &&
    product.images.length > 0 &&
    isValidUrl(product.images[0].src)
      ? product.images[0].src
      : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcq_HAOxMgMpwGXabyafUZkB0KUyo8x7fh8Zw8mAgsxA&s";

  const renderDescription = () => {
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

  const openProductModal = () => {
    setOpenProduct(true);
  };

  const handleCloseProductModal = () => {
    setOpenProduct(false);
  };

  const handleCloseDeleteModal = () => {
    setOpenDelete(false);
  };

  const handleDelete = async () => {
    await deleteProduct(product.id, { userid: userId });
    onUpdate();
    setOpenDelete(false);
  };
  return (
    <div className="border-gray-100 shadow-2xl border-4 text-center mt-10 max-w-[1040px] bg-white text-black relative">
      <ProductModal
        product={product}
        productImage={productImage}
        open={openProduct}
        mode="patch"
        onClose={() => handleCloseProductModal()}
        onUpdate={() => onUpdate()}
      />
      <DeleteModal
        object={product}
        open={openDelete}
        onClose={() => handleCloseDeleteModal()}
        onDelete={() => handleDelete()}
      />
      <Button
        className="flex"
        color="danger"
        size="sm"
        onClick={() => setOpenDelete(true)} // Handle delete action
      >
        Delete
      </Button>
      <div className="p-6">
        <div className="h-full flex flex-col">
          <h4 className="text-3xl font-bold">{product.name}</h4>
          <div className="mt-4 flex-grow">
            <div className="relative w-48 h-48 mx-auto rounded-md overflow-hidden">
              <Image
                src={productImage}
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
          <div className="mt-6 text-left">{renderDescription()}</div>
          <Button
            style={{ padding: "5px 10px", borderRadius: "5px" }}
            onClick={() => openProductModal()}
            color="primary"
          >
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
