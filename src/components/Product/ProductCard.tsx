import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  CardFooter,
} from "@nextui-org/react";
import Image from "next/image";
import { useState } from "react";
import { ProductModal } from "@/components/Modals/ProductModal";
import { DeleteModal } from "@/components/Modals/DeleteModal";
import { deleteProduct } from "@/helpers/request";
import { Copy } from "lucide-react";
import { renderCategories, renderStockStatus } from "@/components/Renders";
interface ProductCardProps {
  product: any;
  onUpdate: () => void;
  userId: string;
  categories: any[];
}

const ProductCard = (props: ProductCardProps) => {
  const [openProduct, setOpenProduct] = useState(false);
  const [openCopyProduct, setOpenCopyProduct] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<any>({});
  const { product, userId, onUpdate, categories } = props;
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

    // Create a map to store unique addon names and their options
    const uniqueAddons = new Map<string, any[]>();

    productAddons.value.forEach((addon: any) => {
      const { name, options } = addon;

      // If the addon name doesn't exist in the map, add it along with its options
      if (!uniqueAddons.has(name)) {
        uniqueAddons.set(name, options);
      }
    });

    //let totalPrice = 0; // Initialize totalPrice

    // Render dropdowns for unique addon names and their options
    return Array.from(uniqueAddons).map(([addonName, addonOptions]) => {
      const selectedOptionLabel =
        selectedOptions[addonName] || new Set(["Select"]);
      const selectedLabelString =
        selectedOptionLabel !== "Select"
          ? Array.from(selectedOptionLabel)[0]
          : "";
      const selectedOption =
        selectedOptionLabel !== "Select"
          ? addonOptions.find(
              (option: any) => option.label === selectedLabelString
            )
          : null;

      // Update totalPrice with selected option price
      if (selectedOption) {
        const optionPrice = parseFloat(selectedOption.price || "0");
        totalPrice += optionPrice;
      }

      return (
        <div key={addonName} className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{addonName}</h3>
          <Dropdown>
            <DropdownTrigger>
              <Button className="capitalize">
                {selectedOption
                  ? `${selectedOption.label} +$${parseFloat(selectedOption.price || "0").toFixed(2)}`
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
              {(addonOptions as any).map((option: any) => (
                <DropdownItem key={option.label}>
                  {`${option.label} +$${parseFloat(option.price || "0").toFixed(2)}`}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      );
    });
  };

  return (
    <Card
      isPressable
      onPress={() => openProductModal()}
      className="text-center mt-4"
    >
      <ProductModal
        product={product}
        productImage={productImage}
        open={openProduct}
        mode="patch"
        categories={categories}
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
        categories={categories}
      />
      <DeleteModal
        object={product}
        open={openDelete}
        onClose={() => handleCloseDeleteModal()}
        onDelete={() => handleDelete()}
      />
      <CardHeader className="flex justify-between p-4">
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
      </CardHeader>
      <CardBody className="text-center">
        <div className="p-6">
          <div className="h-full flex flex-col">
            <h4 className="text-3xl font-bold">{product.name}</h4>
            {renderCategories(product)}
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
          </div>
        </div>
      </CardBody>
      <CardFooter className="flex justify-center p-4">
        {renderStockStatus(product)}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
