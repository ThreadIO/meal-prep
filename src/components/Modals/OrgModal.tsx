import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Accordion,
  AccordionItem,
  Spinner,
} from "@nextui-org/react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "react-query";
import { X } from "lucide-react";
import Dropdown from "@/components/Dropdown";

interface Subscription {
  _id?: string;
  orgId: string;
  status: "active" | "cancelled" | "paused";
  amount: number;
  currency: string;
  billingFrequency: "weekly" | "monthly" | "quarterly" | "yearly";
  paymentMethodId: string; // Added this field
}

interface Org {
  _id?: string;
  orgId: string;
  name: string;
  merchantid: string;
  url: string;
  service: string;
  subscriptions: string[];
}

interface OrgModalProps {
  org: any;
  threadOrg: Org | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const OrgModal = (props: OrgModalProps) => {
  const { org, open, threadOrg, onClose, onUpdate } = props;
  const [name, setName] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [url, setUrl] = useState("");
  const [service, setService] = useState("");
  const [loadingSave, setLoadingSave] = useState(false);
  const [mongoDbId, setMongoDbId] = useState<string | undefined>(undefined);
  const [localSubscriptions, setLocalSubscriptions] = useState<Subscription[]>(
    []
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("Org: ", org);
    console.log("Thread Org: ", threadOrg);
    if (threadOrg) {
      setName(threadOrg.name || "");
      setMerchantId(threadOrg.merchantid || "");
      setUrl(threadOrg.url || "");
      setService(threadOrg.service || "");
      setMongoDbId(threadOrg._id);
    } else if (org) {
      setName(org.name || "");
      setMerchantId("");
      setUrl("");
      setService("");
      setMongoDbId("");
    }
  }, [org, threadOrg]);

  const {
    data: subscriptions,
    isLoading: isLoadingSubscriptions,
    refetch: refetchSubscriptions,
  } = useQuery<Subscription[], Error>(
    ["subscriptions", mongoDbId],
    () => fetchSubscriptions(mongoDbId),
    {
      enabled: !!mongoDbId && open,
      retry: false,
    }
  );

  useEffect(() => {
    if (subscriptions) {
      setLocalSubscriptions(subscriptions);
    }
  }, [subscriptions]);

  const handleClose = () => {
    setLocalSubscriptions([]);
    onClose();
  };

  const fetchSubscriptions = async (
    mongoDbId: string | undefined
  ): Promise<Subscription[]> => {
    if (!mongoDbId) throw new Error("No MongoDB id present");
    const response = await fetch("/api/getsubscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgid: mongoDbId }),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch subscriptions");
    }
    const data = await response.json();
    return data.data;
  };

  useEffect(() => {
    if (open && mongoDbId) {
      refetchSubscriptions();
    }
  }, [open, mongoDbId, refetchSubscriptions]);

  const saveMutation = useMutation<Org, Error, Partial<Org>>(
    async (formData) => {
      const response = await fetch(
        `/api/org${mongoDbId ? `/propelauth/${mongoDbId}` : ""}`,
        {
          method: mongoDbId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save organization");
      }

      return response.json();
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["org", org?.orgId]);
        queryClient.invalidateQueries(["subscriptions", data._id]);
        setMongoDbId(data._id);
        onUpdate();
        handleClose();
      },
      onError: (error: Error) => {
        console.error("Error saving organization:", error);
      },
      onSettled: () => {
        setLoadingSave(false);
      },
    }
  );

  const subscriptionMutation = useMutation<
    Subscription,
    Error,
    { action: string; data: Partial<Subscription> }
  >(
    async ({ action, data }) => {
      let url = "/api/subscription";
      let method = "POST";

      if (action === "update" && data._id) {
        url += `/${data._id}`;
        method = "PATCH";
      } else if (action === "delete" && data._id && mongoDbId) {
        url += `/${data._id}/${mongoDbId}`;
        method = "DELETE";
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} subscription`);
      }

      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["subscriptions", mongoDbId]);
      },
      onError: (error: Error) => {
        console.error("Error managing subscription:", error);
      },
    }
  );

  const handleSave = async () => {
    setLoadingSave(true);
    const formData: Partial<Org> = {
      orgId: org?.orgId,
      _id: mongoDbId,
      name,
      merchantid: merchantId,
      url,
      service,
    };

    // Save org data
    await saveMutation.mutateAsync(formData);

    // Save subscription changes
    if (mongoDbId) {
      for (const subscription of localSubscriptions) {
        if (subscription._id) {
          // Update existing subscription
          await subscriptionMutation.mutateAsync({
            action: "update",
            data: subscription,
          });
        } else {
          // Create new subscription
          await subscriptionMutation.mutateAsync({
            action: "create",
            data: { ...subscription, orgId: mongoDbId },
          });
        }
      }
    }

    // Refetch subscriptions to ensure we have the latest data
    refetchSubscriptions();

    setLoadingSave(false);
    onUpdate();
    handleClose();
  };

  const handleSubscriptionChange = (
    index: number,
    field: keyof Subscription,
    value: any
  ) => {
    setLocalSubscriptions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addSubscription = () => {
    const newSubscription: Subscription = {
      orgId: mongoDbId || "",
      status: "active",
      amount: 0,
      currency: "USD",
      billingFrequency: "monthly",
      paymentMethodId: "",
    };
    setLocalSubscriptions((prev) => [...prev, newSubscription]);
  };

  const deleteSubscription = (index: number) => {
    setLocalSubscriptions((prev) => prev.filter((_, i) => i !== index));
  };

  const renderContent = () => {
    if (loadingSave) {
      return (
        <div className="flex justify-center items-center h-full">
          <Spinner label="Saving..." />
        </div>
      );
    }
    return (
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Organization Details
        </ModalHeader>
        <ModalBody>
          {renderBasicInfo()}
          <Accordion>
            <AccordionItem key="subscriptions" title="Subscriptions">
              {renderSubscriptions()}
            </AccordionItem>
          </Accordion>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={handleSave} isLoading={loadingSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    );
  };

  const renderBasicInfo = () => {
    return (
      <>
        <Input
          label="Organization Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-2"
        />
        <Input
          label="Merchant ID"
          value={merchantId}
          onChange={(e) => setMerchantId(e.target.value)}
          className="mb-2"
        />
        <Input
          label="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mb-2"
        />
        <Input
          label="Service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="mb-2"
        />
      </>
    );
  };

  const renderSubscriptions = () => {
    if (isLoadingSubscriptions) {
      return <Spinner label="Loading subscriptions..." />;
    }
    return (
      <>
        {localSubscriptions.map((subscription: Subscription, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <Dropdown
              aria_label="Subscription Status"
              variant="flat"
              selectedKeys={new Set([subscription.status])}
              onSelectionChange={(keys) =>
                handleSubscriptionChange(
                  index,
                  "status",
                  Array.from(keys)[0] as Subscription["status"]
                )
              }
              items={[
                { key: "active", name: "Active" },
                { key: "cancelled", name: "Cancelled" },
                { key: "paused", name: "Paused" },
              ]}
            />
            <Input
              label="Amount"
              type="number"
              value={subscription.amount.toString()}
              onChange={(e) =>
                handleSubscriptionChange(
                  index,
                  "amount",
                  parseFloat(e.target.value)
                )
              }
            />
            <Input
              label="Currency"
              value={subscription.currency}
              onChange={(e) =>
                handleSubscriptionChange(index, "currency", e.target.value)
              }
            />
            <Dropdown
              aria_label="Billing Frequency"
              variant="flat"
              selectedKeys={new Set([subscription.billingFrequency])}
              onSelectionChange={(keys) =>
                handleSubscriptionChange(
                  index,
                  "billingFrequency",
                  Array.from(keys)[0] as Subscription["billingFrequency"]
                )
              }
              items={[
                { key: "weekly", name: "Weekly" },
                { key: "monthly", name: "Monthly" },
                { key: "quarterly", name: "Quarterly" },
                { key: "yearly", name: "Yearly" },
              ]}
            />
            <Input
              label="Payment Method ID"
              value={subscription.paymentMethodId || ""}
              onChange={(e) =>
                handleSubscriptionChange(
                  index,
                  "paymentMethodId",
                  e.target.value
                )
              }
            />
            <Button
              isIconOnly
              color="danger"
              variant="ghost"
              onPress={() => deleteSubscription(index)}
            >
              <X />
            </Button>
          </div>
        ))}
        <Button color="primary" onPress={addSubscription}>
          Add Subscription
        </Button>
      </>
    );
  };

  return (
    <Modal isOpen={open} onOpenChange={handleClose} size="full">
      {renderContent()}
    </Modal>
  );
};

export default OrgModal;
