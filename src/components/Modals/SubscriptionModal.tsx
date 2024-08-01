import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { patchSubscription } from "@/helpers/request";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: any;
  onUpdate: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpdate,
}) => {
  const handleAction = async (action: "paused" | "cancelled" | "active") => {
    try {
      let updatedData: any = {
        status: action,
      };

      if (action === "paused" || action === "cancelled") {
        updatedData.nextBillingDate = null;
      } else if (action === "active") {
        const nextBillingDate = new Date();
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        updatedData.nextBillingDate = nextBillingDate;
      }

      await patchSubscription(subscription._id, updatedData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating subscription:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Manage Subscription</ModalHeader>
        <ModalBody>
          <p>Current Status: {subscription.status}</p>
          {subscription.nextBillingDate && (
            <p>
              Next Billing Date:{" "}
              {new Date(subscription.nextBillingDate).toLocaleDateString()}
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          {subscription.status === "active" && (
            <>
              <Button color="warning" onPress={() => handleAction("paused")}>
                Pause Subscription
              </Button>
              <Button color="danger" onPress={() => handleAction("cancelled")}>
                Cancel Subscription
              </Button>
            </>
          )}
          {(subscription.status === "paused" ||
            subscription.status === "cancelled") && (
            <Button color="success" onPress={() => handleAction("active")}>
              Reactivate Subscription
            </Button>
          )}
          <Button color="primary" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SubscriptionModal;
