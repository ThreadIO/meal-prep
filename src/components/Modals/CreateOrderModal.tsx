import React, { useState, useMemo, useCallback } from "react";
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
  Autocomplete,
  AutocompleteItem,
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
  products,
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
      country: "US",
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
      country: "US",
    },
    line_items: [] as {
      product_id: number;
      quantity: number;
      variation_id?: number;
    }[],
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  // Memoize the products array to prevent unnecessary re-renders
  const memoizedProducts = useMemo(() => products, [products]);

  const handleInputChange = useCallback(
    (section: "billing" | "shipping", field: string, value: string) => {
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
    },
    [sameAsShipping]
  );

  const handleSameAsShippingChange = useCallback((checked: boolean) => {
    setSameAsShipping(checked);
    if (checked) {
      setOrderData((prevData) => ({
        ...prevData,
        shipping: { ...prevData.billing },
      }));
    }
  }, []);

  const handleProductSelect = useCallback(
    (productId: number) => {
      const product = memoizedProducts.find((p) => p.id === productId);
      setSelectedProduct(product || null);
    },
    [memoizedProducts]
  );

  const handleAddLineItem = useCallback(() => {
    if (selectedProduct && quantity > 0) {
      setOrderData((prevData) => ({
        ...prevData,
        line_items: [
          ...prevData.line_items,
          { product_id: selectedProduct.id, quantity },
        ],
      }));
      setSelectedProduct(null);
      setQuantity(1);
    }
  }, [selectedProduct, quantity]);

  const handleRemoveLineItem = useCallback((index: number) => {
    setOrderData((prevData) => ({
      ...prevData,
      line_items: prevData.line_items.filter((_, i) => i !== index),
    }));
  }, []);

  const handleCreate = useCallback(async () => {
    if (user) {
      const orderDataToSubmit = { ...orderData };
      if (!orderDataToSubmit.billing.email) {
        delete (orderDataToSubmit.billing as any).email;
      }
      const request = await createOrder(user.userId, orderDataToSubmit);
      onCreate(request.data);
      onClose();
    }
  }, [user, orderData, onCreate, onClose]);

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
            type="email"
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
            {products.find((p) => p.id === item.product_id)?.name} (
            {item.quantity})
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
      <div className="flex items-center gap-2 mt-4">
        <Autocomplete
          label="Select Product"
          placeholder="Start typing..."
          onSelectionChange={(id) => handleProductSelect(Number(id))}
        >
          {products.map((product) => (
            <AutocompleteItem key={product.id} value={product.id.toString()}>
              {product.name}
            </AutocompleteItem>
          ))}
        </Autocomplete>
        <Input
          type="number"
          label="Quantity"
          value={quantity.toString()}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min={1}
        />
        <Button
          color="primary"
          onPress={handleAddLineItem}
          disabled={!selectedProduct}
        >
          Add Item
        </Button>
      </div>
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
