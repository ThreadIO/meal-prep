import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "react-query";

interface OrgModalProps {
  org: any;
  threadOrg: any;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const OrgModal = (props: OrgModalProps) => {
  const { org, open, threadOrg, onClose, onUpdate } = props;
  const [name, setName] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [url, setUrl] = useState("");
  const [service, setService] = useState("");
  const [loadingSave, setLoadingSave] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (threadOrg) {
      setName(threadOrg.name || "");
      setMerchantId(threadOrg.merchantid || "");
      setUrl(threadOrg.url || "");
      setService(threadOrg.service || "");
    } else if (org) {
      setName(org.name || "");
    }
  }, [org]);

  const saveOrUpdateOrg = async (formData: any) => {
    const response = await fetch("/api/org", {
      method: org ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error("Failed to save organization");
    }

    return response.json();
  };

  const saveMutation = useMutation(saveOrUpdateOrg, {
    onSuccess: () => {
      queryClient.invalidateQueries(["org", org?.orgId]);
      onUpdate();
      onClose();
    },
    onError: (error) => {
      console.error("Error saving organization:", error);
      // Handle error (e.g., show error message to user)
    },
    onSettled: () => {
      setLoadingSave(false);
    },
  });

  const handleSave = () => {
    setLoadingSave(true);
    const formData = {
      orgid: org.orgId,
      name,
      merchantid: merchantId,
      url,
      service,
    };
    saveMutation.mutate(formData);
  };

  return (
    <Modal isOpen={open} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>Organization Details</ModalHeader>
        <ModalBody>
          <Input
            label="Organization Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Merchant ID"
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value)}
          />
          <Input
            label="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Input
            label="Service"
            value={service}
            onChange={(e) => setService(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={handleSave} isLoading={loadingSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OrgModal;
