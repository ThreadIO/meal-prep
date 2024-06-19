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
import { getUser, getMeal, createMeal, patchMeal } from "@/helpers/request";
import { stockStatusOptions } from "@/helpers/utils";
import Dropdown from "@/components/Dropdown";

interface MealModalProps {
  meal: any;
  mealImage: any;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  tags: any[];
}

export const MealModal = (props: MealModalProps) => {
  const { meal, mealImage, open, onClose, onUpdate, tags } = props;
  const [loadingSave, setLoadingSave] = useState(false);
  const [mealDescription, setMealDescription] = useState("");
  const [mealRegularPrice, setMealRegularPrice] = useState("");
  const [mealName, setMealName] = useState("");
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
      setNutritionFacts({
        calories: meal.nutrition?.calories || 0,
        carbs: meal.nutrition?.carbs || 0,
        fat: meal.nutrition?.fat || 0,
        protein: meal.nutrition?.protein || 0,
      });
    }
  }, [meal]);

  const mapSelectedTagsToObjects = () => {
    console.log("Selected Keys: ", selectedKeys);
    const selectedTagObjects = tags.filter((tag) => selectedKeys.has(tag.name));
    return selectedTagObjects;
  };

  // Update this to save the meal in Mongo instead of WooCommerce
  const handleSave = async () => {
    setLoadingSave(true);
    const selectedTags = Array.from(
      mapSelectedTagsToObjects(),
      (item) => item.name
    );
    console.log("Selected Tags: ", selectedTags);
    try {
      if (meal) {
        // Meal exists in Service, need to check if it exists in Thread
        // Need to programmatically get url, from user settings
        const user = await getUser(userId);
        const url = user.settings.url.replace(/^(https?:\/\/)/, "");
        const selectedStockStatusString =
          Array.from(selectedStockStatus).join(", ");
        console.log("Menu Regular Price: ", mealRegularPrice);
        const body = {
          mealid: meal.id,
          name: String(mealName),
          url: url,
          status: selectedStockStatusString,
          description: String(mealDescription),
          price: parseFloat(mealRegularPrice),
          userid: userId,
          tags: selectedTags,
          nutrition_facts: nutritionFacts,
          options: options,
        };
        // Check if meal exists in thread db
        const existing_meal = await getMeal(meal.id, body.url);
        if (!existing_meal) {
          // This means the meal doesn't exist in thread db, so we need to create it
          await createMeal(body);
        } else {
          // This means the meal does exist, so we need to update it
          await patchMeal(meal.id, body.url, body);
          // Update in Service
        }
        console.log("Placeholder - Update in Service");
      } else {
        // Create it first in Service, then Create in Thread so we have an associated mealid
        console.log("Doesn't exist in WC yet");
        console.log("Placeholder - Create in Service");
        // Create in Thread
        console.log("Placeholder - Create in Thread");
      }
      onUpdate();
      setLoadingSave(false);
      onClose();
    } catch (error) {
      console.log("Some error: ", error);
      setLoadingSave(false);
    }
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
          {renderTagDropdown()}
        </div>
        <Input
          label="Regular Price"
          value={mealRegularPrice}
          onChange={(e) => setMealRegularPrice(e.target.value)}
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
    return (
      <div
        key={index}
        style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}
      >
        <Input
          label="Option Name"
          value={option.name}
          onChange={(e) => {
            const updatedOptions = [...options];
            updatedOptions[parseInt(index)].name = e.target.value;
            setOptions(updatedOptions);
          }}
        />
        <Input
          label="Price Adjustment"
          type="number"
          defaultValue={"0"}
          value={option.price_adjustment}
          onChange={(e) => {
            const updatedOptions = [...options];
            updatedOptions[parseInt(index)].price_adjustment = parseFloat(
              e.target.value
            );
            setOptions(updatedOptions);
          }}
        />
        <Input
          label="Calories"
          type="number"
          defaultValue={"0"}
          value={option.calories}
          onChange={(e) => {
            const updatedOptions = [...options];
            updatedOptions[parseInt(index)].calories = parseInt(e.target.value);
            setOptions(updatedOptions);
          }}
        />
        <Input
          label="Carbs"
          type="number"
          defaultValue={"0"}
          value={option.carbs}
          onChange={(e) => {
            const updatedOptions = [...options];
            updatedOptions[parseInt(index)].carbs = parseInt(e.target.value);
            setOptions(updatedOptions);
          }}
        />
        <Input
          label="Fat"
          type="number"
          defaultValue={"0"}
          value={option.fat}
          onChange={(e) => {
            const updatedOptions = [...options];
            updatedOptions[parseInt(index)].fat = parseInt(e.target.value);
            setOptions(updatedOptions);
          }}
        />
        <Input
          label="Protein"
          type="number"
          defaultValue={"0"}
          value={option.protein}
          onChange={(e) => {
            const updatedOptions = [...options];
            updatedOptions[parseInt(index)].protein = parseInt(e.target.value);
            setOptions(updatedOptions);
          }}
        />
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
