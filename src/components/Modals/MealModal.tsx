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
import { X, Grip, Check, ArrowUp, ArrowDown } from "lucide-react";
import {
  createMealOnWoocommerce,
  getHMPProductData,
  updateMealOnWoocommerce,
} from "@/connectors/woocommerce/meals";
import { friendlyUrl } from "@/helpers/frontend";
import { convertProductAddOnsToOptions } from "@/connectors/woocommerce/options";

interface MealModalProps {
  meal: any;
  threadMeal: any;
  mealImage: any;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  tags: any[];
  mode: "create" | "patch";
}

export const MealModal = (props: MealModalProps) => {
  const { meal, threadMeal, mealImage, open, onClose, onUpdate, tags, mode } =
    props;
  const [loadingSave, setLoadingSave] = useState(false);
  const [mealDescription, setMealDescription] = useState("");
  const [mealPrice, setMealPrice] = useState("");
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
  const [reorderMode, setReorderMode] = useState(false);
  const { loading, user } = useUser();
  const userId = user?.userId || "";
  useEffect(() => {
    if (threadMeal) {
      setMealName(threadMeal.name || "");
      setMealDescription(threadMeal.description || "");
      setMealPrice(threadMeal.price || "");
      setNutritionFacts({
        calories: threadMeal.nutrition_facts.calories || 0,
        carbs: threadMeal.nutrition_facts.carbs || 0,
        fat: threadMeal.nutrition_facts.fat || 0,
        protein: threadMeal.nutrition_facts.protein || 0,
      });
      setSelectedKeys(new Set(threadMeal.tags || []));
      setOptions(threadMeal.options || []);
    } else if (meal) {
      // This means that the meal exists in WooCommerce (Hard coding for a HMP Meal)
      const { calories, carbs, fat, protein } = getHMPProductData(meal);
      setMealName(meal.name || "");
      setMealDescription(meal.description || "");
      setMealPrice(meal.regular_price || "");
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
        calories: calories || 0,
        carbs: carbs || 0,
        fat: fat || 0,
        protein: protein || 0,
      });
      setOptions(convertProductAddOnsToOptions(meal) || []);
    }
  }, [meal, threadMeal]);

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
      const user = await getUser(userId);
      const url = friendlyUrl(user.settings.url);
      const selectedStockStatusString =
        Array.from(selectedStockStatus).join(", ");
      console.log("Menu Price: ", mealPrice);
      const body: {
        name: string;
        url: string;
        status: string;
        description: string;
        price: number;
        userid: string;
        image: string;
        tags: any[];
        nutrition_facts: {
          calories: number;
          carbs: number;
          fat: number;
          protein: number;
        };
        options: any[];
        mealid?: string; // Add the mealid property
      } = {
        name: String(mealName),
        url: url,
        status: selectedStockStatusString,
        description: String(mealDescription),
        price: parseFloat(mealPrice),
        userid: userId,
        tags: selectedTags,
        nutrition_facts: nutritionFacts,
        options: options,
        image: mealImage ? mealImage.src : "",
      };

      if (meal && mode === "patch") {
        // Meal exists in Service, need to check if it exists in Thread
        body.mealid = meal.id;
        const existing_meal = await getMeal(meal.id, url);
        if (!existing_meal) {
          // Create the meal in Thread DB
          await createMeal(body);
        } else {
          // Update the meal in Thread DB
          await patchMeal(meal.id, url, body);
          // Update in Service if needed
        }
        const woocommerceProduct = await updateMealOnWoocommerce(
          body,
          mealImage,
          tags
        );
        console.log("Updated Product: ", woocommerceProduct);
      } else {
        // Create it first in Service, then create in Thread DB
        console.log("Doesn't exist in WC yet");
        const woocommerceProduct = await createMealOnWoocommerce(
          body,
          mealImage,
          tags
        );
        body.mealid = woocommerceProduct.id;
        // Then create in Thread DB
        if (
          !(woocommerceProduct.data && woocommerceProduct.data.status === 400)
        ) {
          await createMeal(body);
        } else {
          console.log(
            "Error creating meal in WooCommerce so not making in MongoDB"
          );
        }
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
          value={mealPrice}
          onChange={(e) => setMealPrice(e.target.value)}
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
