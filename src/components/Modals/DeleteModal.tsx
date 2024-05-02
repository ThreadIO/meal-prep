import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { useState } from "react";

interface DeleteModalProps {
  object: any;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export const DeleteModal = (props: DeleteModalProps) => {
  const { object, open, onClose, onDelete } = props;
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleDelete = async () => {
    setLoadingDelete(true);
    onDelete();
    setLoadingDelete(false);
  };

  const renderContent = () => {
    return renderModalContent();
  };

  const renderModalContent = () => {
    return (
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1 text-center">
            Are you sure you want to delete <u>{object.name}</u>
          </ModalHeader>
          <ModalFooter>
            <Button
              color="danger"
              onPress={() => handleDelete()}
              isLoading={loadingDelete}
            >
              Delete
            </Button>
          </ModalFooter>
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
