import Image from "next/image";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { useState } from "react";
import { ProductModal } from "@/components/Modals/ProductModal";
import { DeleteModal } from "@/components/Modals/DeleteModal";
import { deleteProduct } from "@/helpers/request";
import { Copy } from "lucide-react";

interface ProductCardProps {
  product: any;
  onUpdate: () => void;
  userId: string;
}

const ProductCard = (props: ProductCardProps) => {
  const [openProduct, setOpenProduct] = useState(false);
  const [openCopyProduct, setOpenCopyProduct] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<any>({});

  const { product, userId, onUpdate } = props;

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  let productImage = product.images[0];

  if (productImage && !isValidUrl(productImage.src)) {
    productImage = {
      src: "https://t3.ftcdn.net/jpg/04/60/01/36/360_F_460013622_6xF8uN6ubMvLx0tAJECBHfKPoNOR5cRa.jpg",
    };
  }

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

  const handleCloseCopyProductModal = () => {
    setOpenCopyProduct(false);
  };

  const handleCloseDeleteModal = () => {
    setOpenDelete(false);
  };

  const handleDelete = async () => {
    await deleteProduct(product.id, { userid: userId });
    onUpdate();
    setOpenDelete(false);
  };

  const renderImage = () => {
    if (productImage && Object.keys(productImage).length !== 0) {
      return (
        <div className="relative w-full h-60">
          <Image
            src={productImage.src}
            alt={"Product Image"}
            fill
            sizes="100vw"
            style={{
              objectFit: "contain",
              objectPosition: "center",
            }}
          />
        </div>
      );
    }
  };

  let totalPrice = parseFloat(product.price) || 0;

  const renderOptions = () => {
    if (!product.meta_data) return null;
    const productAddons = product.meta_data.find(
      (item: any) => item.key === "_product_addons"
    );
    if (!productAddons || !productAddons.value) return null;

    productAddons.value.forEach((addon: any) => {
      const selectedOptionLabel =
        selectedOptions[addon.name] || new Set(["Select"]);
      const selectedLabelString =
        selectedOptionLabel !== "Select"
          ? Array.from(selectedOptionLabel)[0]
          : "";
      const selectedOption =
        selectedOptionLabel !== "Select"
          ? addon.options.find(
              (option: any) => option.label === selectedLabelString
            )
          : null;

      if (selectedOption) {
        const optionPrice = parseFloat(selectedOption.price || "0"); // Fix: Default to "0" if price is empty string
        totalPrice += optionPrice;
      }
    });

    return productAddons.value.map((addon: any) => {
      const addonName: string = addon.name;
      const selectedOptionLabel =
        selectedOptions[addonName] || new Set(["Select"]);
      const selectedLabelString =
        selectedOptionLabel !== "Select"
          ? Array.from(selectedOptionLabel)[0]
          : "";
      const selectedOption =
        selectedOptionLabel !== "Select"
          ? addon.options.find(
              (option: any) => option.label === selectedLabelString
            )
          : null;

      return (
        <div key={addonName} className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{addonName}</h3>
          <Dropdown>
            <DropdownTrigger>
              <Button className="capitalize">
                {selectedOption
                  ? `${selectedOption.label} +$${parseFloat(selectedOption.price || "0").toFixed(2)}` // Fix: Default to "0" if price is empty string
                  : selectedOptionLabel}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label={addonName}
              variant="flat"
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={[selectedOptionLabel]}
              onSelectionChange={(newSelected) =>
                setSelectedOptions((prev: any) => ({
                  ...prev,
                  [addonName]:
                    (newSelected as string) === "Select"
                      ? ""
                      : (newSelected as string),
                }))
              }
            >
              <DropdownItem key="Select">Select</DropdownItem>
              {addon.options.map((option: any) => (
                <DropdownItem key={option.label}>
                  {`${option.label} +$${parseFloat(option.price || "0").toFixed(2)}`}{" "}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      );
    });
  };

  const renderCategories = () => {
    return (
      <div className="flex flex-wrap justify-center mt-4">
        {product.categories.map((category: any) => (
          <span
            key={category.id}
            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
          >
            {category.name}
          </span>
        ))}
      </div>
    );
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
      <ProductModal
        product={product}
        productImage={productImage}
        open={openCopyProduct}
        mode="create"
        onClose={() => handleCloseCopyProductModal()}
        onUpdate={() => onUpdate()}
      />
      <DeleteModal
        object={product}
        open={openDelete}
        onClose={() => handleCloseDeleteModal()}
        onDelete={() => handleDelete()}
      />
      <div className="flex justify-between p-4">
        <Button color="danger" size="sm" onClick={() => setOpenDelete(true)}>
          Delete
        </Button>
        <Button
          color="primary"
          size="sm"
          onClick={() => setOpenCopyProduct(true)}
          isIconOnly
        >
          <Copy />
        </Button>
      </div>
      <div className="p-6">
        <div className="h-full flex flex-col">
          <h4 className="text-3xl font-bold">{product.name}</h4>
          {renderCategories()}
          <div className="mt-4 flex-grow">{renderImage()}</div>
          <div className="mt-6 flex flex-col items-center justify-center">
            <h1 className="text-5xl font-bold">
              {totalPrice.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </h1>
            <h3 className="mt-2">per item</h3>
          </div>
          <div className="mt-6 text-left">{renderDescription()}</div>
          {renderOptions()}
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
