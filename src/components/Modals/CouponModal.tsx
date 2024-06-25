import {
  Accordion,
  AccordionItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Input,
} from "@nextui-org/react";
import { useState, useEffect } from "react";
import { useUser } from "@propelauth/nextjs/client";
import {
  getUser,
  //   getCoupon,
  //   createCoupon,
  //   patchCoupon,
} from "@/helpers/request";
import { stockStatusOptions } from "@/helpers/utils";
import Dropdown from "@/components/Dropdown";
import { X, Grip, Check, ArrowUp, ArrowDown } from "lucide-react";
// import {
//   createCouponOnWoocommerce,
//   updateCouponOnWoocommerce,
// } from "@/connectors/woocommerce/coupons";
import { friendlyUrl } from "@/helpers/frontend";
import { convertProductAddOnsToOptions } from "@/connectors/woocommerce/options";
// import { useMutation, useQueryClient } from "react-query";

interface CouponModalProps {
  coupon: any;
  threadCoupon: any;
  couponImage: any;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  tags: any[];
  mode: "create" | "patch";
}

export const CouponModal = (props: CouponModalProps) => {
  const { coupon, threadCoupon, open, onClose, tags, mode } = props; //On update
  const [loadingSave, setLoadingSave] = useState(false);
  const [couponDescription, setCouponDescription] = useState("");
  const [couponPrice, setCouponPrice] = useState("");
  const [couponName, setCouponName] = useState("");
  const [selectedStockStatus, setSelectedStockStatus] = useState<any>(
    new Set()
  );
  const [selectedKeys, setSelectedKeys] = useState<any>(new Set());
  const [options, setOptions] = useState<any[]>([]);
  const [nutritionFacts, setNutritionFacts] = useState({
    calories: 0,
    carbs: 0,
    fat: 0,
    protein: 0,
  });
  const [reorderMode, setReorderMode] = useState(false);
  const { loading, user } = useUser();
  const userId = user?.userId || "";
  //   const queryClient = useQueryClient();

  useEffect(() => {
    if (threadCoupon) {
      setCouponName(threadCoupon.name || "");
      setCouponDescription(threadCoupon.description || "");
      setCouponPrice(threadCoupon.price || "");
      setSelectedKeys(new Set(threadCoupon.tags || []));
      setOptions(threadCoupon.options || []);
    } else if (coupon) {
      // This means that the coupon exists in WooCommerce
      setCouponName(coupon.name || "");
      setCouponDescription(coupon.description || "");
      setCouponPrice(coupon.regular_price || "");
      setSelectedKeys(
        new Set(
          coupon.categories
            ? coupon.categories.map((category: any) => category.name)
            : []
        )
      );
      setSelectedStockStatus(
        new Set([
          stockStatusOptions.find(
            (option) => option.value === (coupon.stock_status || "instock")
          )?.display || "In Stock",
        ])
      );
      setOptions(convertProductAddOnsToOptions(coupon) || []);
    }
  }, [coupon, threadCoupon]);

  const mapSelectedTagsToObjects = () => {
    console.log("Selected Keys: ", selectedKeys);
    const selectedTagObjects = tags.filter((tag) => selectedKeys.has(tag.name));
    return selectedTagObjects;
  };

  //   const saveMutation = useMutation(
  //     async (formData: any) => {
  //       const user = await getUser(userId);
  //       const url = friendlyUrl(user.settings.url);

  //       if (mode === "patch" && coupon) {
  //         // Update existing coupon
  //         const existing_coupon = await getCoupon(coupon.id, url);
  //         if (!existing_coupon) {
  //           await createCoupon(formData);
  //         } else {
  //           await patchCoupon(coupon.id, url, formData);
  //         }
  //         return updateCouponOnWoocommerce(formData, couponImage, tags);
  //       } else {
  //         // Create new coupon
  //         const woocommerceProduct = await createCouponOnWoocommerce(
  //           formData,
  //           tags
  //         );
  //         if (
  //           !(woocommerceProduct.data && woocommerceProduct.data.status === 400)
  //         ) {
  //           formData.couponid = woocommerceProduct.id;
  //           await createCoupon(formData);
  //         } else {
  //           throw new Error("Error creating coupon in WooCommerce");
  //         }
  //         return woocommerceProduct;
  //       }
  //     },
  //     {
  //       onSuccess: () => {
  //         queryClient.invalidateQueries("products");
  //         onUpdate();
  //         onClose();
  //       },
  //       onError: (error) => {
  //         console.error("Error saving coupon:", error);
  //         // Handle error (e.g., show error message to user)
  //       },
  //       onSettled: () => {
  //         setLoadingSave(false);
  //       },
  //     }
  //   );

  const handleSave = async () => {
    setLoadingSave(true);
    const selectedTags = Array.from(
      mapSelectedTagsToObjects(),
      (item) => item.name
    );
    const selectedStockStatusString =
      Array.from(selectedStockStatus).join(", ");

    const formData = {
      name: String(couponName),
      url: friendlyUrl((await getUser(userId)).settings.url),
      status: selectedStockStatusString,
      description: String(couponDescription),
      price: parseFloat(couponPrice),
      userid: userId,
      tags: selectedTags,
      nutrition_facts: nutritionFacts,
      options: options,
      couponid: coupon && mode === "patch" ? coupon.id : undefined,
    };

    console.log("Form Data: ", formData);
    // saveMutation.mutate(formData);
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

  const renderCouponBasicInfo = () => {
    return (
      <div style={{ flex: 2 }}>
        <Input
          label="Coupon Name"
          value={couponName}
          onChange={(e) => setCouponName(e.target.value)}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            margin: "1rem",
          }}
        >
          {renderStockStatusDropdown()}
          {renderTagDropdown()}
        </div>
        <Input
          label="Regular Price"
          value={couponPrice}
          onChange={(e) => setCouponPrice(e.target.value)}
        />
      </div>
    );
  };
  const renderTagDropdown = () => {
    return (
      <Dropdown
        aria_label="Multiple selection example"
        variant="flat"
        closeOnSelect={false}
        disallowEmptySelection
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        items={tags}
      />
    );
  };

  const renderStockStatusDropdown = () => {
    const getColor = (value: string) => {
      switch (value) {
        case "In Stock":
          return "success";
        case "Out Of Stock":
          return "danger";
        case "On Backorder":
          return "warning";
        default:
          return "default";
      }
    };

    return (
      <Dropdown
        aria_label="Stock Status selection example"
        variant="flat"
        closeOnSelect={false}
        disallowEmptySelection
        selectionMode="single"
        selectedKeys={selectedStockStatus}
        onSelectionChange={setSelectedStockStatus}
        items={stockStatusOptions.map((status) => ({ name: status.display }))}
        color={getColor(Array.from(selectedStockStatus)[0] as string)}
      />
    );
  };

  const renderNutritionFacts = () => {
    return (
      <Accordion>
        <AccordionItem key="nutrition_facts" title="Nutrition Facts">
          <div style={{ display: "flex", gap: "1rem" }}>
            <Input
              type="number"
              label="Calories"
              value={nutritionFacts.calories.toString()}
              onChange={(e) =>
                setNutritionFacts({
                  ...nutritionFacts,
                  calories: parseInt(e.target.value),
                })
              }
            />
            <Input
              type="number"
              label="Carbs"
              value={nutritionFacts.carbs.toString()}
              onChange={(e) =>
                setNutritionFacts({
                  ...nutritionFacts,
                  carbs: parseInt(e.target.value),
                })
              }
            />
            <Input
              type="number"
              label="Fat"
              value={nutritionFacts.fat.toString()}
              onChange={(e) =>
                setNutritionFacts({
                  ...nutritionFacts,
                  fat: parseInt(e.target.value),
                })
              }
            />
            <Input
              type="number"
              label="Protein"
              value={nutritionFacts.protein.toString()}
              onChange={(e) =>
                setNutritionFacts({
                  ...nutritionFacts,
                  protein: parseInt(e.target.value),
                })
              }
            />
          </div>
        </AccordionItem>
      </Accordion>
    );
  };

  const renderOptions = () => {
    return (
      <Accordion>
        <AccordionItem key="options" title="Options">
          {options &&
            options.map((option, index) =>
              renderOption(option, index.toString())
            )}
          {addOptionButton()}
        </AccordionItem>
      </Accordion>
    );
  };

  const renderOption = (option: any, index: string) => {
    const moveOption = (currentIndex: number, direction: "up" | "down") => {
      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= options.length) {
        return; // Index out of bounds, do nothing
      }

      // Create a copy of the options array
      const updatedOptions = [...options];

      // Swap the options at currentIndex and newIndex
      const temp = updatedOptions[newIndex];
      updatedOptions[newIndex] = updatedOptions[currentIndex];
      updatedOptions[currentIndex] = temp;

      // Update the state with the new options array
      setOptions(updatedOptions);
    };

    const handleInputChange = (field: string, value: any) => {
      // Create a copy of the options array
      const updatedOptions = [...options];

      // Update the specific option's field with the new value
      updatedOptions[parseInt(index)][field] = value;

      // Update the state with the new options array
      setOptions(updatedOptions);
    };

    const deleteOption = () => {
      // Filter out the option at the current index
      const updatedOptions = options.filter((_, i) => i !== parseInt(index));

      // Update the state with the new options array
      setOptions(updatedOptions);
    };

    return (
      <div
        key={index}
        style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}
      >
        {reorderMode ? (
          <>
            <Button
              onPress={() => moveOption(parseInt(index), "up")}
              isIconOnly
              variant="light"
            >
              <ArrowUp />
            </Button>
            <Button
              onPress={() => moveOption(parseInt(index), "down")}
              isIconOnly
              variant="light"
            >
              <ArrowDown />
            </Button>
            <Button
              isIconOnly
              color="success"
              variant="light"
              onPress={() => setReorderMode(false)}
            >
              <Check />
            </Button>
          </>
        ) : (
          <Button
            isIconOnly
            variant="light"
            style={{ cursor: "grab" }}
            onPress={() => {
              setReorderMode(true);
            }}
          >
            <Grip />
          </Button>
        )}
        <Input
          label="Option Name"
          value={option.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
        />
        {!reorderMode && (
          <>
            <Input
              label="Price Adjustment"
              type="number"
              defaultValue={"0"}
              value={option.price_adjustment}
              onChange={(e) =>
                handleInputChange(
                  "price_adjustment",
                  parseFloat(e.target.value)
                )
              }
            />
            <Input
              label="Calories"
              type="number"
              defaultValue={"0"}
              value={option.calories}
              onChange={(e) =>
                handleInputChange("calories", parseInt(e.target.value))
              }
            />
            <Input
              label="Carbs"
              type="number"
              defaultValue={"0"}
              value={option.carbs}
              onChange={(e) =>
                handleInputChange("carbs", parseInt(e.target.value))
              }
            />
            <Input
              label="Fat"
              type="number"
              defaultValue={"0"}
              value={option.fat}
              onChange={(e) =>
                handleInputChange("fat", parseInt(e.target.value))
              }
            />
            <Input
              label="Protein"
              type="number"
              defaultValue={"0"}
              value={option.protein}
              onChange={(e) =>
                handleInputChange("protein", parseInt(e.target.value))
              }
            />
            <Button
              isIconOnly
              color="danger"
              variant="ghost"
              onPress={deleteOption}
            >
              <X />
            </Button>
          </>
        )}
      </div>
    );
  };

  const addOptionButton = () => {
    const addOption = () => {
      // Assuming each option is an object with some properties, you can customize this part
      const newOption = {};
      setOptions(options ? [...options, newOption] : [newOption]);
    };
    return (
      <Button color="primary" onPress={addOption}>
        Add Option
      </Button>
    );
  };

  const renderModalContent = () => {
    return (
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1 text-left">
            Coupon Details
          </ModalHeader>
          <ModalBody
            className="flex flex-col overflow-y-auto"
            style={{ gap: "2rem", paddingBottom: "2rem" }} // Added paddingBottom to ModalBody
          >
            <div>
              <div style={{ display: "flex" }}>{renderCouponBasicInfo()}</div>
              <div style={{ marginTop: "1rem" }}>
                {renderNutritionFacts()} {/* Added marginTop for spacing */}
              </div>
              <div style={{ marginTop: "1rem" }}>
                {renderOptions()} {/* Added marginTop for spacing */}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={() => handleSave()}
              isLoading={loadingSave || loading}
            >
              Save
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

export default CouponModal;
