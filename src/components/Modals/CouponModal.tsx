import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Input,
  Switch,
} from "@nextui-org/react";
import { useState, useEffect } from "react";
import { useUser } from "@propelauth/nextjs/client";
import { getUser } from "@/helpers/request";
import {
  createCouponOnWoocommerce,
  updateCouponOnWoocommerce,
} from "@/connectors/woocommerce/coupons";
import { friendlyUrl } from "@/helpers/frontend";
import { useMutation, useQueryClient } from "react-query";
import Dropdown from "@/components/Dropdown";
import { CouponDiscountType } from "@/helpers/utils";
interface CouponModalProps {
  coupon: any;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  mode: "create" | "patch";
}

export const CouponModal = (props: CouponModalProps) => {
  const { coupon, open, onClose, onUpdate, mode } = props;
  const [loadingSave, setLoadingSave] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponAmount, setCouponAmount] = useState("");
  const [couponMinAmount, setCouponMinAmount] = useState("");
  const [couponDescription, setCouponDescription] = useState("");
  const [couponUsageLimit, setCouponUsageLimit] = useState("");
  const [discountType, setDiscountType] = useState(new Set(["percent"]));
  const [individualUse, setIndividualUse] = useState(false);
  const [excludeSaleItems, setExcludeSaleItems] = useState(false);
  const { loading, user } = useUser();
  const userId = user?.userId || "";
  const queryClient = useQueryClient();

  const mapDisplayToValue = (display: string): string => {
    const found = CouponDiscountType.find((dt) => dt.display === display);
    return found ? found.value : "percent"; // default to 'percent' if not found
  };

  const mapValueToDisplay = (value: string): string => {
    const found = CouponDiscountType.find((dt) => dt.value === value);
    return found ? found.display : "Percent"; // default to 'Percent' if not found
  };

  useEffect(() => {
    if (coupon) {
      setCouponCode(coupon.code || "");
      setCouponDescription(coupon.description || "");
      setCouponAmount(coupon.amount || "");
      setCouponMinAmount(coupon.minimum_amount || "");
      setCouponUsageLimit(coupon.usage_limit || "");
      setDiscountType(
        new Set([mapValueToDisplay(coupon.discount_type || "percent")])
      );
      setIndividualUse(coupon.individual_use || false);
      setExcludeSaleItems(coupon.exclude_sale_items || false);
    }
  }, [coupon]);

  const saveMutation = useMutation(
    async (formData: any) => {
      if (mode === "patch" && coupon) {
        return updateCouponOnWoocommerce(formData);
      } else {
        return createCouponOnWoocommerce(formData);
      }
    },
    {
      onSuccess: (data) => {
        console.log("Coupon saved successfully:", data);
        queryClient.invalidateQueries(["coupons", userId]);
        onUpdate();
        onClose();
      },
      onError: (error) => {
        console.error("Error saving coupon:", error);
        // You might want to show an error message to the user
      },
      onSettled: () => {
        setLoadingSave(false);
      },
    }
  );

  const handleSave = async () => {
    setLoadingSave(true);
    const selectedDiscountTypeDisplay = Array.from(discountType)[0];
    const selectedDiscountTypeValue = mapDisplayToValue(
      selectedDiscountTypeDisplay
    );

    const formData = {
      code: String(couponCode),
      url: friendlyUrl((await getUser(userId)).settings.url),
      amount: String(couponAmount), // Ensure this is a string
      description: couponDescription,
      userid: userId,
      couponid: coupon && mode === "patch" ? coupon.id : undefined,
      discount_type: selectedDiscountTypeValue,
      individual_use: individualUse,
      exclude_sale_items: excludeSaleItems,
      minimum_amount: couponMinAmount ? String(couponMinAmount) : "", // Ensure this is a string
      usage_limit: couponUsageLimit ? parseInt(couponUsageLimit) : null,
    };

    console.log("Saving coupon with data:", formData);
    saveMutation.mutate(formData);
  };

  const renderDiscountTypeDropdown = () => {
    return (
      <div className="w-full">
        <Dropdown
          aria_label="Discount Type selection"
          variant="flat"
          closeOnSelect={true}
          disallowEmptySelection
          selectionMode="single"
          selectedKeys={discountType}
          onSelectionChange={(keys) => {
            setDiscountType(keys as Set<string>);
          }}
          items={CouponDiscountType.map((discount_type) => ({
            name: discount_type.display,
          }))}
        />
      </div>
    );
  };

  const renderCouponBasicInfo = () => {
    return (
      <div className="flex flex-col space-y-6 w-full">
        <Input
          label="Coupon Code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          fullWidth
        />
        <Input
          label="Amount"
          value={couponAmount}
          onChange={(e) => setCouponAmount(e.target.value)}
          fullWidth
        />
        {renderDiscountTypeDropdown()}
        <Input
          label="Minimum Amount"
          value={couponMinAmount}
          onChange={(e) => setCouponMinAmount(e.target.value)}
          placeholder="Enter minimum amount or leave empty"
          fullWidth
        />
        <Input
          label="Description"
          value={couponDescription}
          onChange={(e) => setCouponDescription(e.target.value)}
          fullWidth
        />
        <Input
          label="Usage Limit"
          value={couponUsageLimit}
          onChange={(e) => setCouponUsageLimit(e.target.value)}
          placeholder="Enter usage limit or leave empty for unlimited use"
          fullWidth
        />
        <div className="space-y-4">
          <Switch
            isSelected={individualUse}
            onValueChange={setIndividualUse}
            color="primary"
          >
            Individual Use Only
          </Switch>
          <Switch
            isSelected={excludeSaleItems}
            onValueChange={setExcludeSaleItems}
            color="primary"
          >
            Exclude Sale Items
          </Switch>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-full">
          <Spinner label="Loading Settings" />
        </div>
      );
    } else {
      return renderModalContent();
    }
  };

  const renderModalContent = () => {
    return (
      <ModalContent className="h-full">
        <ModalHeader className="flex flex-col gap-1">
          {mode === "create" ? "Create New Coupon" : "Edit Coupon"}
        </ModalHeader>
        <ModalBody className="flex-grow overflow-y-auto px-6 py-4">
          {renderCouponBasicInfo()}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={handleSave} isLoading={loadingSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    );
  };

  return (
    <Modal
      isOpen={open}
      onOpenChange={onClose}
      size="full"
      classNames={{
        body: "p-0",
        base: "h-screen",
        header: "px-6 py-4",
        footer: "px-6 py-4",
      }}
    >
      {renderContent()}
    </Modal>
  );
};

export default CouponModal;
