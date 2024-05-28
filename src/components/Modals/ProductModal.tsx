import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  ModalFooter,
  Button,
  Spinner,
} from "@nextui-org/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createProduct, patchProduct } from "@/helpers/request";
import { useUser } from "@propelauth/nextjs/client";
import Dropdown from "@/components/Dropdown";

interface ProductModalProps {
  product: any;
  productImage: any;
  open: boolean;
  mode: "create" | "patch";
  onClose: () => void;
  onUpdate: () => void;
  categories: any[];
}

const stockStatusOptions = [
  { display: "In Stock", value: "instock" },
  { display: "Out Of Stock", value: "outofstock" },
  { display: "On Backorder", value: "onbackorder" },
];

export const ProductModal = (props: ProductModalProps) => {
  const { product, productImage, open, onClose, onUpdate, categories } = props;
  const [productName, setProductName] = useState("");
  const [loadingSave, setLoadingSave] = useState(false);
  const [productDescription, setProductDescription] = useState("");
  const [productRegularPrice, setProductRegularPrice] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<any>(new Set());
  const [selectedStockStatus, setSelectedStockStatus] = useState<any>(
    new Set()
  );
  const [productAddons, setProductAddons] = useState<any[]>([]);
  const [acf, setACF] = useState<any>({});

  useEffect(() => {
    if (product) {
      setProductName(product.name || "");
      setProductDescription(product.description || "");
      setProductRegularPrice(product.regular_price || "");
      setSelectedKeys(
        new Set(
          product.categories
            ? product.categories.map((category: any) => category.name)
            : []
        )
      );
      setSelectedStockStatus(
        new Set([
          stockStatusOptions.find(
            (option) => option.value === (product.stock_status || "instock")
          )?.display || "In Stock",
        ])
      );
      setProductAddons(product.product_addons || []);
      setACF(product.acf || {});
    }
  }, [product]);

  const { loading, user } = useUser();
  const userId = user?.userId || "";

  const handleSave = async () => {
    setLoadingSave(true);
    const selectedCategories = mapSelectedCategoriesToObjects();
    const selectedStockStatusDisplay = Array.from(selectedStockStatus)[0];
    const matchingStockOption = stockStatusOptions.find(
      (option) => option.display === selectedStockStatusDisplay
    );
    const matchingStockOptionValue = matchingStockOption?.value || "instock";
    const body = {
      ...(product || {}),
      name: productName,
      images: product.images,
      description: productDescription,
      regular_price: productRegularPrice,
      categories: selectedCategories,
      stock_status: matchingStockOptionValue,
      userid: userId,
      product_addons: productAddons,
      acf: acf,
    };

    const ignoredParams = [
      "composite_layout",
      "composite_add_to_cart_form_location",
      "composite_sold_individually_context",
      "composite_shop_price_calc",
      "bundle_layout",
    ];
    ignoredParams.forEach((param) => delete body[param]);
    props.mode === "patch"
      ? await patchProduct(product.id, body)
      : await createProduct(body);
    onUpdate();
    setLoadingSave(false);
    onClose();
  };

  const mapSelectedCategoriesToObjects = () => {
    const selectedCategoryObjects = categories.filter((category) =>
      selectedKeys.has(category.name)
    );
    return selectedCategoryObjects;
  };

  const handleAddonChange = (index: number, field: string, value: any) => {
    const updatedAddons = [...productAddons];
    updatedAddons[0].options[index][field] = value;
    setProductAddons(updatedAddons);
  };

  const renderCategoryDropdown = () => {
    return (
      <Dropdown
        aria_label="Multiple selection example"
        variant="flat"
        closeOnSelect={false}
        disallowEmptySelection
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        items={categories}
      />
    );
  };

  const renderStockStatusDropdown = () => {
    const getColor = (value: string) => {
      switch (value) {
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

  const renderOptions = () => {
    if (productAddons.length === 0 || !productAddons[0].options) {
      return null;
    }

    return (
      <div className="mb-4">
        <strong>Options:</strong>
        <div className="overflow-y-auto max-h-60 min-h-50">
          {productAddons[0].options.map((option: any, index: number) => (
            <div key={index} className="mb-4">
              <div className="mb-2">
                <strong>Label:</strong>
                <Input
                  value={option.label}
                  fullWidth
                  onChange={(e) =>
                    handleAddonChange(index, "label", e.target.value)
                  }
                />
              </div>
              <div className="mb-2">
                <strong>Calories:</strong>
                <Input
                  value={option.calories}
                  fullWidth
                  onChange={(e) =>
                    handleAddonChange(index, "label", e.target.value)
                  }
                />
              </div>
              <div className="mb-2">
                <strong>Carbs:</strong>
                <Input
                  value={option.carbs}
                  fullWidth
                  onChange={(e) =>
                    handleAddonChange(index, "carbs", e.target.value)
                  }
                />
              </div>
              <div className="mb-2">
                <strong>Fat:</strong>
                <Input
                  value={option.fat}
                  fullWidth
                  onChange={(e) =>
                    handleAddonChange(index, "fat", e.target.value)
                  }
                />
              </div>
              <div className="mb-2">
                <strong>Protein:</strong>
                <Input
                  value={option.protein}
                  fullWidth
                  onChange={(e) =>
                    handleAddonChange(index, "protein", e.target.value)
                  }
                />
              </div>
              <div className="mb-2">
                <strong>Price:</strong>
                <Input
                  value={option.price}
                  fullWidth
                  onChange={(e) =>
                    handleAddonChange(index, "price", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderNutritionFacts = () => {
    if (Object.keys(acf).length === 0) {
      return null;
    }

    const renderFields = (obj: any) => {
      return Object.keys(obj).map((key) => {
        const value = obj[key];
        if (value === null) {
          return null;
        } else if (typeof value === "object") {
          return (
            <div key={key} className="mb-2">
              {isNaN(parseInt(key)) && ( // Check if the key is not an index
                <strong>
                  {key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                  :
                </strong>
              )}
              {renderFields(value)}
            </div>
          );
        } else {
          return (
            <div key={key} className="mb-2">
              <strong>
                {key
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
                :
              </strong>
              <Input
                value={value}
                fullWidth
                onChange={(e) => {
                  setACF({
                    ...acf,
                    [key]: e.target.value,
                  });
                }}
              />
            </div>
          );
        }
      });
    };

    return (
      <div className="mb-4">
        <strong>Nutrition Facts:</strong>
        <div className="overflow-y-auto max-h-60 min-h-50">
          {renderFields(acf)}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Spinner label={"Loading Settings"} />
          </div>
        </div>
      );
    } else {
      return renderModalContent();
    }
  };

  const renderImage = () => {
    if (productImage && Object.keys(productImage).length !== 0) {
      return (
        <div className="relative h-60 mb-4 flex justify-center items-center">
          <Image
            src={productImage.src}
            alt={"Product Image"}
            width={100}
            height={100}
            style={{
              objectFit: "contain",
              objectPosition: "center",
            }}
          />
        </div>
      );
    }
  };

  const renderModalContent = () => {
    return (
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1 text-center">
            Product Information
          </ModalHeader>
          <ModalBody className="flex flex-col overflow-y-auto">
            <div className="mb-4">
              <strong>Name:</strong>
              <Input
                value={productName}
                fullWidth
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            {renderImage()}
            {renderCategoryDropdown()}
            {renderStockStatusDropdown()}
            {renderNutritionFacts()}
            {renderOptions()}
            <div className="mb-4">
              <strong>Price:</strong>{" "}
              {(parseFloat(product.price) || 0).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </div>
            <div className="mb-4">
              <strong>Regular Price:</strong>{" "}
              <Input
                value={productRegularPrice}
                fullWidth
                onChange={(e) => setProductRegularPrice(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <strong>Description:</strong>
              <Input
                value={productDescription}
                fullWidth
                onChange={(e) => setProductDescription(e.target.value)}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={() => handleSave()}
              isLoading={loadingSave || loading}
            >
              Save
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    );
  };

  return (
    <Modal isOpen={open} onOpenChange={onClose} size="full">
      {renderContent()}
    </Modal>
  );
};

export default ProductModal;
