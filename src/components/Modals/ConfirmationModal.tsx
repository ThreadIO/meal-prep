import {
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { useState } from "react";

interface ConfirmationModalProps {
  object: any;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action?: string | null;
  loading?: boolean;
}

// This modal is used to confirm an action before proceeding
export const ConfirmationModal = (props: ConfirmationModalProps) => {
  const { object, open, onClose, onConfirm, action, loading } = props;
  const [confirmText, setConfirmText] = useState("");
  // Set default value if action is null
  const actionText = action ?? "Delete";

  const handleConfirm = async () => {
    onConfirm();
  };

  const renderContent = () => {
    return renderModalContent();
  };

  const renderModalContent = () => {
    return (
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1 text-center">
            Are you sure you want to {actionText.toLowerCase()}{" "}
            <u>{object.name}</u>
            <Input
              placeholder={`Type "${object.name}" to confirm`}
              onChange={(e) => setConfirmText(e.target.value)}
              value={confirmText}
            />
          </ModalHeader>
          <ModalFooter>
            <Button
              color="danger"
              onPress={() => handleConfirm()}
              isDisabled={confirmText !== object.name}
              isLoading={loading}
            >
              {actionText}
            </Button>
          </ModalFooter>
          <p className="text-center text-gray-500 mt-2">
            This action cannot be undone.
          </p>
        </>
      </ModalContent>
    );
  };

  return (
    <Modal isOpen={open} onOpenChange={onClose}>
      {renderContent()}
    </Modal>
  );
};
