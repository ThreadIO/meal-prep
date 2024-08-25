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
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";
import RefundLineItemTable from "@/components/Order/RefundLineItemTable";

interface RefundModalProps {
  order: any;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const RefundModal = (props: RefundModalProps) => {
  const { order, open, onClose } = props;
  const [loadingSave] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const { loading } = useUser();

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

  const modals = (order: any) => {
    if (order) {
      return (
        <>
          <ConfirmationModal
            open={openConfirm}
            object={{ ...order, name: `Order# ${order.id}` }}
            onClose={() => setOpenConfirm(false)}
            onConfirm={() => {}}
            loading={loading || loadingSave}
            action="Refund"
          />
        </>
      );
    }
  };
  const renderButtons = () => {
    return (
      <>
        <Button
          color="danger"
          onPress={() => {}}
          style={{ marginRight: "auto" }} // Pushes to the leftmost side
        >
          Save
        </Button>
      </>
    );
  };
  const renderModalContent = () => {
    return (
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1 text-center">
            Refund Order# {order.id}
          </ModalHeader>
          <ModalBody className="flex flex-col overflow-y-auto">
            <RefundLineItemTable line_items={order.line_items} />
          </ModalBody>
          <ModalFooter
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            {renderButtons()}
          </ModalFooter>
        </>
      </ModalContent>
    );
  };

  return (
    <Modal isOpen={open} onOpenChange={onClose} size="full">
      {modals(order)}
      {renderContent()}
    </Modal>
  );
};

export default RefundModal;
