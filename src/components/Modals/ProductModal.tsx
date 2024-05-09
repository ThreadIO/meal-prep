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
import { useState } from "react";
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

export const ProductModal = (props: ProductModalProps) => {
  const { product, productImage, open, onClose, onUpdate, categories } = props;
  const [productName, setProductName] = useState(product.name);
  const [loadingSave, setLoadingSave] = useState(false);
  const [productDescription, setProductDescription] = useState(
    product.description
  );
  const [productRegularPrice, setProductRegularPrice] = useState(
    product.regular_price
  );
  const [productSalePrice, setProductSalePrice] = useState(product.sale_price);
  const [selectedKeys, setSelectedKeys] = useState<any>(
    new Set(
      product.categories
        ? product.categories.map((category: any) => category.name)
        : []
    )
  );
  const { loading, user } = useUser();
  const userId = user?.userId || "";
  const handleSave = async () => {
    setLoadingSave(true);
    const selectedCategories = mapSelectedCategoriesToObjects();
    const body = {
      name: productName,
      images: [productImage],
      description: productDescription,
      regular_price: productRegularPrice,
      sale_price: productSalePrice,
      categories: selectedCategories,
      userid: userId,
    };
    const response =
      props.mode === "patch"
        ? await patchProduct(product.id, body)
        : await createProduct(body);
    console.log(response);
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
                defaultValue={productName}
                fullWidth
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            {renderCategoryDropdown()}
            {renderImage()}
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
                defaultValue={productRegularPrice}
                fullWidth
                onChange={(e) => setProductRegularPrice(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <strong>Sale Price:</strong>{" "}
              <Input
                defaultValue={productSalePrice}
                fullWidth
                onChange={(e) => setProductSalePrice(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <strong>Description:</strong>
              <Input
                defaultValue={productDescription}
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
