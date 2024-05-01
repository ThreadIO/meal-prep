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
import { patchProduct } from "@/helpers/request";
import { useUser } from "@propelauth/nextjs/client";
interface EditProductModalProps {
  product: any;
  productImage: any;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const EditProductModal = (props: EditProductModalProps) => {
  const { product, productImage, open, onClose, onUpdate } = props;
  const [productName, setProductName] = useState(product.name);
  const [loadingSave, setLoadingSave] = useState(false);
  const { loading, user } = useUser();
  const userId = user?.userId || "";
  const handleSave = async () => {
    setLoadingSave(true);
    const body = { name: productName, userid: userId };
    const response = await patchProduct(product.id, body);
    console.log(response);
    onUpdate();
    setLoadingSave(false);
    onClose();
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
  const renderModalContent = () => {
    return (
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1 text-center">
            Product Information
          </ModalHeader>
          <ModalBody className="flex flex-col">
            <div className="mb-4">
              <strong>Name:</strong>
              <Input
                defaultValue={productName}
                fullWidth
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            <div className="relative w-full h-60">
              <Image
                src={productImage} // Use product image or placeholder if not available
                alt={"Product Image"}
                layout="fill"
                objectFit="contain"
                objectPosition="center"
              />
            </div>
            <div className="mb-4">
              <strong>Price:</strong>{" "}
              {(parseFloat(product.price) || 0).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </div>
            {product.description && (
              <div className="mb-4">
                <strong>Description:</strong> {product.description}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={() => handleSave()}
              isLoading={loadingSave}
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
