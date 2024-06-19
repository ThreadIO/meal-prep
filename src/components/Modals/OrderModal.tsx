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
import { ConfirmationModal } from "./ConfirmationModal";

interface OrderModalProps {
  order: any;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

// To-do: Implement refund function from woocommerce

export const OrderModal = (props: OrderModalProps) => {
  const { order, open, onClose, onUpdate } = props;
  const [openConfirm, setOpenConfirm] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const { loading } = useUser();

  const handleRefund = async () => {
    setRefundLoading(true);
    const body = { amount: order.total };
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
    };
    const response = await fetch(
      `/api/woocommerce/orders/${order.id}/refunds`,
      {
        method,
        headers,
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      console.error("Error refunding order:", response.statusText);
    }
    onUpdate();
    setRefundLoading(false);
    setOpenConfirm(false);
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

  const modals = (order: any) => {
    if (order) {
      return (
        <>
          <ConfirmationModal
            object={{ ...order, name: `Order# ${order.id}` }}
            open={openConfirm}
            onClose={() => setOpenConfirm(false)}
            onConfirm={() => handleRefund()}
            action="Full Refund"
            loading={refundLoading}
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
          onPress={() => setOpenConfirm(true)}
          style={{ marginRight: "auto" }} // Pushes to the leftmost side
        >
          Full Refund
        </Button>
      </>
    );
  };
  const renderModalContent = () => {
    return (
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1 text-center">
            Order# {order.id}
          </ModalHeader>
          <ModalBody className="flex flex-col overflow-y-auto">
            <LineItemTable line_items={order.line_items} />
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

export default OrderModal;
