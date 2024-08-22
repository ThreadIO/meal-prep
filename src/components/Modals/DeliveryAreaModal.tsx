import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";

interface DeliveryAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  newArea: { area: string; zipcodes: string };
  setNewArea: React.Dispatch<
    React.SetStateAction<{ area: string; zipcodes: string }>
  >;
  handleSaveArea: () => void;
  editingIndex: number | null;
}

const DeliveryAreaModal: React.FC<DeliveryAreaModalProps> = ({
  isOpen,
  onClose,
  newArea,
  setNewArea,
  handleSaveArea,
  editingIndex,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          {editingIndex !== null ? "Edit" : "Add"} Delivery Area
        </ModalHeader>
        <ModalBody>
          <Input
            label="Area Name"
            value={newArea.area}
            onChange={(e) => setNewArea({ ...newArea, area: e.target.value })}
          />
          <Input
            label="Zipcodes (comma-separated)"
            value={newArea.zipcodes}
            onChange={(e) =>
              setNewArea({ ...newArea, zipcodes: e.target.value })
            }
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSaveArea}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeliveryAreaModal;
