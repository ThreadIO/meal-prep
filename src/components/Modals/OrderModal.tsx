import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Card,
  Divider,
  Chip,
} from "@nextui-org/react";
import { useState } from "react";
import { useUser } from "@propelauth/nextjs/client";
import LineItemTable from "@/components/Order/LineItemTable";
import { ConfirmationModal } from "./ConfirmationModal";
import { friendlyDate, getDeliveryDate } from "@/helpers/date";

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

  const renderCustomerInfo = () => {
    const deliveryDate = friendlyDate(getDeliveryDate(order)) || "N/A";
    const deliveryDay =
      order.shipping_lines && order.shipping_lines[0]?.method_title;

    return (
      <Card className="mb-4 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-bold">Order Summary</h3>
          {deliveryDate && (
            <Chip color="primary" variant="solid">
              Delivery: {deliveryDay} - {deliveryDate}
            </Chip>
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-between text-sm">
          <div>
            <p>
              <strong>Customer:</strong> {order.billing.first_name}{" "}
              {order.billing.last_name}
            </p>
            <p>
              <strong>Email:</strong> {order.billing.email}
            </p>
            <p>
              <strong>Phone:</strong> {order.billing.phone}
            </p>
          </div>
          <div className="mt-2 sm:mt-0">
            <p>
              <strong>Billing:</strong> {order.billing.address_1},{" "}
              {order.billing.city}, {order.billing.state}{" "}
              {order.billing.postcode}
            </p>
            <p>
              <strong>Shipping:</strong> {order.shipping.address_1},{" "}
              {order.shipping.city}, {order.shipping.state}{" "}
              {order.shipping.postcode}
            </p>
          </div>
          {order.customer_note && (
            <div className="mt-4">
              <p className="font-bold">Customer Note:</p>
              <p className="p-2 rounded-md">{order.customer_note}</p>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderModalContent = () => {
    return (
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              Order# {order.id}
            </ModalHeader>
            <ModalBody className="flex flex-col overflow-y-auto">
              {renderCustomerInfo()}
              <Divider className="my-4" />
              <LineItemTable line_items={order.line_items} />
            </ModalBody>
            <ModalFooter>
              <div className="flex justify-between w-full">
                {renderButtons()}
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
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
