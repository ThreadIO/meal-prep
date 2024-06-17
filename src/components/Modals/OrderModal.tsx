import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "@nextui-org/react";
import { useState } from "react";
import { useUser } from "@propelauth/nextjs/client";
import LineItemTable from "@/components/Order/LineItemTable";

interface OrderModalProps {
  order: any;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const OrderModal = (props: OrderModalProps) => {
  const { order, open, onClose, onUpdate } = props;
  const [loadingSave, setLoadingSave] = useState(false);

  const { loading } = useUser();

  const handleSave = async () => {
    setLoadingSave(true);
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
            Order# {order.id}
          </ModalHeader>
          <ModalBody className="flex flex-col overflow-y-auto">
            <LineItemTable
              line_items={order.line_items}
              onUpdate={function (): void {
                throw new Error("Function not implemented.");
              }}
            />
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

export default OrderModal;
