import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Input,
  Checkbox,
  //   Dropdown,
} from "@nextui-org/react";
import { useUser } from "@propelauth/nextjs/client";
import { createOrder } from "@/helpers/request";

interface CreateOrderModalProps {
  products: any[];
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onCreate: (orderData: any) => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  //   products,
  open,
  onClose,
  onCreate,
}) => {
  const { loading, user } = useUser();
  const [orderData, setOrderData] = useState({
    billing: {
      first_name: "",
      last_name: "",
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      postcode: "",
      country: "",
      email: "",
      phone: "",
    },
    shipping: {
      first_name: "",
      last_name: "",
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      postcode: "",
      country: "",
    },
    line_items: [] as any[],
    // payment_method: "bacs",
    // payment_method_title: "Direct Bank Transfer",
    // set_paid: false,
    // shipping_lines: [
    //   { method_id: "flat_rate", method_title: "Flat Rate", total: "10.00" },
    // ],
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);

  const handleInputChange = (
    section: "billing" | "shipping",
    field: string,
    value: string
  ) => {
    setOrderData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: value,
      },
    }));

    if (sameAsShipping && section === "billing") {
      setOrderData((prevData) => ({
        ...prevData,
        shipping: {
          ...prevData.shipping,
          [field]: value,
        },
      }));
    }
  };

  const handleSameAsShippingChange = (checked: boolean) => {
    setSameAsShipping(checked);
    if (checked) {
      setOrderData((prevData) => ({
        ...prevData,
        shipping: { ...prevData.billing },
      }));
    }
  };

  //   const handleAddLineItem = (productId: string, quantity: number) => {
  //     const product = products.find((p) => p.id === productId);
  //     if (product) {
  //       setOrderData((prevData) => ({
  //         ...prevData,
  //         line_items: [
  //           ...prevData.line_items,
  //           {
  //             product_id: productId,
  //             quantity: quantity,
  //             name: product.name,
  //             price: product.price,
  //           },
  //         ],
  //       }));
  //     }
  //   };

  const handleRemoveLineItem = (index: number) => {
    setOrderData((prevData) => ({
      ...prevData,
      line_items: prevData.line_items.filter((_, i) => i !== index),
    }));
  };

  const handleCreate = async () => {
    if (user) {
      const orderDataToSubmit = { ...orderData };
      if (!orderDataToSubmit.billing.email) {
        delete (orderDataToSubmit.billing as any).email;
      }
      const request = await createOrder(user.userId, orderData);
      onCreate(request.data);
      onClose();
    }
  };

  const renderAddressFields = (section: "billing" | "shipping") => (
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="First Name"
        value={orderData[section].first_name}
        onChange={(e) =>
          handleInputChange(section, "first_name", e.target.value)
        }
      />
      <Input
        label="Last Name"
        value={orderData[section].last_name}
        onChange={(e) =>
          handleInputChange(section, "last_name", e.target.value)
        }
      />
      <Input
        label="Address 1"
        value={orderData[section].address_1}
        onChange={(e) =>
          handleInputChange(section, "address_1", e.target.value)
        }
      />
      <Input
        label="Address 2"
        value={orderData[section].address_2}
        onChange={(e) =>
          handleInputChange(section, "address_2", e.target.value)
        }
      />
      <Input
        label="City"
        value={orderData[section].city}
        onChange={(e) => handleInputChange(section, "city", e.target.value)}
      />
      <Input
        label="State"
        value={orderData[section].state}
        onChange={(e) => handleInputChange(section, "state", e.target.value)}
      />
      <Input
        label="Postcode"
        value={orderData[section].postcode}
        onChange={(e) => handleInputChange(section, "postcode", e.target.value)}
      />
      {section === "billing" && (
        <>
          <Input
            label="Email"
            value={orderData.billing.email}
            onChange={(e) =>
              handleInputChange("billing", "email", e.target.value)
            }
          />
          <Input
            label="Phone"
            value={orderData.billing.phone}
            onChange={(e) =>
              handleInputChange("billing", "phone", e.target.value)
            }
          />
        </>
      )}
    </div>
  );

  const renderLineItems = () => (
    <div>
      <h3 className="text-lg font-bold mb-2">Line Items</h3>
      {orderData.line_items.map((item, index) => (
        <div key={index} className="flex justify-between items-center mb-2">
          <span>
            {item.name} (x{item.quantity})
          </span>
          <Button
            color="danger"
            size="sm"
            onPress={() => handleRemoveLineItem(index)}
          >
            Remove
          </Button>
        </div>
      ))}
      {/* <Dropdown>
        <Dropdown.Trigger>
          <Button>Add Product</Button>
        </Dropdown.Trigger>
        <Dropdown.Menu
          items={products}
          onAction={(key) => handleAddLineItem(key as string, 1)}
        >
          {(item) => <Dropdown.Item key={item.id}>{item.name}</Dropdown.Item>}
        </Dropdown.Menu>
      </Dropdown> */}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center">
          <Spinner label="Loading..." />
        </div>
      );
    }
    return (
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Create New Order
        </ModalHeader>
        <ModalBody>
          <h3 className="text-lg font-bold mb-2">Billing Information</h3>
          {renderAddressFields("billing")}
          <Checkbox
            isSelected={sameAsShipping}
            onValueChange={handleSameAsShippingChange}
          >
            Shipping address same as billing
          </Checkbox>
          {!sameAsShipping && (
            <>
              <h3 className="text-lg font-bold mt-4 mb-2">
                Shipping Information
              </h3>
              {renderAddressFields("shipping")}
            </>
          )}
          {renderLineItems()}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleCreate}>
            Create Order
          </Button>
        </ModalFooter>
      </ModalContent>
    );
  };

  return (
    <Modal isOpen={open} onOpenChange={onClose} size="4xl">
      {renderContent()}
    </Modal>
  );
};

export default CreateOrderModal;
