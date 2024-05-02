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
import { deleteProduct } from "@/helpers/request";
import { useUser } from "@propelauth/nextjs/client";
interface DeleteModalProps {
  object: any;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const DeleteModal = (props: DeleteModalProps) => {
  const { object, open, onClose, onUpdate } = props;
  const [loadingDelete, setLoadingDelete] = useState(false);
  const { loading, user } = useUser();
  const userId = user?.userId || "";
  const handleSave = async () => {
    setLoadingDelete(true);
    const body = {
      name: object.name,
      userid: userId,
    };
    const response = await deleteProduct(object.id, body);
    console.log(response);
    onUpdate();
    setLoadingDelete(false);
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
            Are you sure you want to delete {object.name}?
          </ModalHeader>
          <ModalBody className="flex flex-col overflow-y-auto">
            <div className="mb-4">
              <strong>This action cannot be undone</strong>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              onPress={() => handleSave()}
              isLoading={loadingDelete || loading}
            >
              Delete
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
