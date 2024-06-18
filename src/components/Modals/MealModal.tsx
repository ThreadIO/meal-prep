import {
  Accordion,
  AccordionItem,
  Image,
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
import { patchProduct } from "@/helpers/request";
import { stockStatusOptions } from "@/helpers/utils";
import Dropdown from "@/components/Dropdown";

interface MealModalProps {
  meal: any;
  mealImage: any;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  categories: any[];
}

export const MealModal = (props: MealModalProps) => {
  const { meal, mealImage, open, onClose, onUpdate, categories } = props;
  const [loadingSave, setLoadingSave] = useState(false);
  const [mealDescription, setMealDescription] = useState("");
  const [mealRegularPrice, setMealRegularPrice] = useState("");
  const [mealName, setMealName] = useState("");
  const [selectedStockStatus, setSelectedStockStatus] = useState<any>(
    new Set()
  );
  const [selectedKeys, setSelectedKeys] = useState<any>(new Set());
  const [options, setOptions] = useState<any[]>();
  const { loading, user } = useUser();
  const userId = user?.userId || "";

  useEffect(() => {
    if (meal) {
      setMealName(meal.name || "");
      setMealDescription(meal.description || "");
      setMealRegularPrice(meal.regular_price || "");
      setSelectedKeys(
        new Set(
          meal.categories
            ? meal.categories.map((category: any) => category.name)
            : []
        )
      );
      setSelectedStockStatus(
        new Set([
          stockStatusOptions.find(
            (option) => option.value === (meal.stock_status || "instock")
          )?.display || "In Stock",
        ])
      );
    }
  }, [meal]);

  const mapSelectedCategoriesToObjects = () => {
    const selectedCategoryObjects = categories.filter((category) =>
      selectedKeys.has(category.name)
    );
    return selectedCategoryObjects;
  };

  const handleSave = async () => {
    setLoadingSave(true);
    const selectedCategories = mapSelectedCategoriesToObjects();
    const selectedStockStatusDisplay = Array.from(selectedStockStatus)[0];
    const matchingStockOption = stockStatusOptions.find(
      (option) => option.display === selectedStockStatusDisplay
    );
    const matchingStockOptionValue = matchingStockOption?.value || "instock";
    const body = {
      ...(meal || {}),
      name: String(mealName),
      images: meal.images,
      description: String(mealDescription),
      regular_price: String(mealRegularPrice),
      categories: selectedCategories,
      stock_status: matchingStockOptionValue,
      userid: userId,
    };

    const ignoredParams = [
      "composite_layout",
      "composite_add_to_cart_form_location",
      "composite_sold_individually_context",
      "composite_shop_price_calc",
      "bundle_layout",
    ];
    ignoredParams.forEach((param) => delete body[param]);
    await patchProduct(meal.id, body);
    onUpdate();
    setLoadingSave(false);
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

  const renderImage = () => {
    if (mealImage && Object.keys(mealImage).length !== 0) {
      return (
        <div style={{ flex: 1 }}>
          <div className="relative h-60 mb-4 flex justify-center items-center">
            <Image
              src={mealImage.src}
              alt={"Meal Image"}
              width={100}
              height={100}
              style={{
                objectFit: "contain",
                objectPosition: "center",
              }}
            />
          </div>
        </div>
      );
    }
  };

  const renderMealBasicInfo = () => {
    return (
      <div style={{ flex: 2 }}>
        <Input
          label="Meal Name"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
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
          {renderCategoryDropdown()}
        </div>
        <Input
          label="Regular Price"
          value={mealRegularPrice}
          onChange={(e) => setMealRegularPrice(e.target.value)}
        />
      </div>
    );
  };
  const renderCategoryDropdown = () => {
    return (
      <Dropdown
        aria_label="Multiple selection example"
        variant="flat"
        closeOnSelect={false}
        disallowEmptySelection
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        items={categories}
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
            <Input type="number" label="Calories" />
            <Input type="number" label="Carbs" />
            <Input type="number" label="Fat" />
            <Input type="number" label="Protein" />
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
            options.map((option, index) => renderOption(index.toString()))}
          {addOptionButton()}
        </AccordionItem>
      </Accordion>
    );
  };

  const renderOption = (index: string) => {
    return (
      <div
        key={index}
        style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}
      >
        <Input label="Option Name" />
        <Input label="Price Adjustment" type="number" />
        <Input label="Calories" type="number" />
        <Input label="Carbs" type="number" />
        <Input label="Fat" type="number" />
        <Input label="Protein" type="number" />
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
            Meal Details
          </ModalHeader>
          <ModalBody
            className="flex flex-col overflow-y-auto"
            style={{ gap: "2rem", paddingBottom: "2rem" }} // Added paddingBottom to ModalBody
          >
            <div>
              <div style={{ display: "flex" }}>
                {renderImage()}
                {renderMealBasicInfo()}
              </div>
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

export default MealModal;
