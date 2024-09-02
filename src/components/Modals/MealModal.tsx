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
import {
  convertToHtml,
  decodeHtmlEntities,
  convertHtmlToPlainText,
  friendlyUrl,
} from "@/helpers/frontend";
import { convertProductAddOnsToOptions } from "@/connectors/woocommerce/options";
import { useMutation, useQueryClient } from "react-query";
import ImageUploader from "@/components/Product/ImageUploader";
import { getAllIngredients } from "@/helpers/request";

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
  const [uploadedImage, setUploadedImage] = useState<any>(null);
  const [newProductImage, setNewProductImage] = useState<any>(null);
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
    ingredients: [] as any[],
  });
  const [reorderMode, setReorderMode] = useState(false);
  const [subOptionReorderMode, setSubOptionReorderMode] = useState(false);

  const [customOptions, setCustomOptions] = useState<any[]>([]);

  const [ingredients, setIngredients] = useState<any[]>([]);

  const { loading, user } = useUser();
  const userId = user?.userId || "";
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    if (threadMeal) {
      setMealName(threadMeal.name || "");
      setMealDescription(
        convertHtmlToPlainText(
          threadMeal.description || meal.short_description || ""
        )
      );
      setMealPrice(threadMeal.price || "0");
      setNutritionFacts({
        calories: threadMeal.nutrition_facts.calories || 0,
        carbs: threadMeal.nutrition_facts.carbs || 0,
        fat: threadMeal.nutrition_facts.fat || 0,
        protein: threadMeal.nutrition_facts.protein || 0,
        ingredients: threadMeal.nutrition_facts.ingredients || [],
      });
      setSelectedKeys(new Set(threadMeal.tags || []));
      setOptions(threadMeal.options || []);
      setCustomOptions(threadMeal.custom_options || []);
    } else if (meal) {
      // This means that the meal exists in WooCommerce (Hard coding for a HMP Meal)
      if (meal.add_ons) {
        const customAddOns = meal.add_ons.filter(
          (addOn: any) => !addOn.name.includes("Size")
        );
        setCustomOptions(
          customAddOns.map((addOn: any) => ({
            name: addOn.name,
            options: addOn.options.map((option: any) => ({
              name: option.label,
              price: parseFloat(option.price) || 0,
              calories: parseInt(option.calories) || 0,
              carbs: parseInt(option.carbs) || 0,
              protein: parseInt(option.protein) || 0,
              fat: parseInt(option.fat) || 0,
            })),
          }))
        );
      }
      const { calories, carbs, fat, protein } = getHMPProductData(meal);
      setMealName(meal.name || "");
      setMealDescription(convertHtmlToPlainText(meal.short_description || ""));
      setMealPrice(meal.regular_price || "0");
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
        ingredients: [],
      });
      setOptions(convertProductAddOnsToOptions(meal) || []);
    }
  }, [meal, threadMeal]);

  const fetchIngredients = async () => {
    try {
      const fetchedIngredients = await getAllIngredients();
      setIngredients(fetchedIngredients);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  const convertToGrams = (quantity: number, unit: string) => {
    return unit === "oz" ? quantity * 28.3495 : quantity;
  };

  const mapSelectedTagsToObjects = () => {
    console.log("Selected Keys: ", selectedKeys);
    const selectedTagObjects = tags.filter((tag) => selectedKeys.has(tag.name));
    return selectedTagObjects;
  };

  const saveMutation = useMutation(
    async (formData: any) => {
      const user = await getUser(userId);
      const url = friendlyUrl(user.settings.url);

      if (mode === "patch" && meal) {
        const existing_meal = await getMeal(meal.id, url);
        if (!existing_meal) {
          await createMeal(formData);
        } else {
          await patchMeal(meal.id, url, formData);
        }
        return updateMealOnWoocommerce(formData, mealImage, tags);
      } else {
        // Create new meal
        const woocommerceProduct = await createMealOnWoocommerce(
          formData,
          mealImage,
          tags
        );
        if (
          !(woocommerceProduct.data && woocommerceProduct.data.status === 400)
        ) {
          formData.mealid = woocommerceProduct.id;
          await createMeal(formData);
        } else {
          throw new Error("Error creating meal in WooCommerce");
        }
        return woocommerceProduct;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["products", user?.userId]);
        onUpdate();
        onClose();
      },
      onError: (error) => {
        console.error("Error saving meal:", error);
        // Handle error (e.g., show error message to user)
        queryClient.invalidateQueries(["products", user?.userId]);
      },
      onSettled: () => {
        setLoadingSave(false);
      },
    }
  );

  // Add these functions to handle custom option changes
  const handleCustomOptionChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedOptions = [...customOptions];
    updatedOptions[index][field] = value;
    setCustomOptions(updatedOptions);
  };

  const handleCustomSubOptionChange = (
    optionIndex: number,
    subOptionIndex: number,
    field: string,
    value: string | number
  ) => {
    const updatedOptions = [...customOptions];
    updatedOptions[optionIndex].options[subOptionIndex][field] = value;
    setCustomOptions(updatedOptions);
  };

  const addCustomOption = () => {
    setCustomOptions([
      ...customOptions,
      { name: "", options: [{ label: "", price: "" }] },
    ]);
  };

  const addSubOption = (index: number) => {
    const updatedOptions = [...customOptions];
    updatedOptions[index].options.push({
      label: "",
      price: "",
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
    });
    setCustomOptions(updatedOptions);
  };

  const renderIngredientSelection = (
    optionIngredients: any[],
    // eslint-disable-next-line no-unused-vars
    updateIngredients: (newIngredients: any[]) => void,
    title: string
  ) => {
    const addIngredient = () => {
      updateIngredients([
        ...optionIngredients,
        {
          ingredient: "",
          quantity: "",
          unit: "g",
          cookStyle: "",
        },
      ]);
    };

    return (
      <Accordion>
        <AccordionItem key={`ingredients-${title}`} title={title}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {renderIngredientList(optionIngredients, updateIngredients)}
            <Button color="primary" onPress={addIngredient}>
              Add Ingredient
            </Button>
          </div>
        </AccordionItem>
      </Accordion>
    );
  };

  const renderIngredientList = (
    optionIngredients: any[],
    // eslint-disable-next-line no-unused-vars
    updateIngredients: (newIngredients: any[]) => void
  ) => {
    const handleIngredientChange = (
      index: number,
      field: string,
      value: any
    ) => {
      const updatedIngredients = optionIngredients.map((ing, i) => {
        if (i === index) {
          if (field === "ingredient") {
            const selectedIngredient = ingredients.find(
              (ingredient) => ingredient.name === value
            );
            return {
              ...ing,
              ingredient: selectedIngredient?._id || "",
              unit: selectedIngredient?.defaultUnit || "g",
            };
          } else {
            return { ...ing, [field]: value };
          }
        }
        return ing;
      });
      updateIngredients(updatedIngredients);
    };

    const deleteIngredient = (index: number) => {
      const updatedIngredients = optionIngredients.filter(
        (_, i) => i !== index
      );
      updateIngredients(updatedIngredients);
    };

    return (
      <div>
        {optionIngredients.map((ingredient, index) => {
          const ingredientId = ingredient.ingredient;
          const selectedIngredient = ingredients.find(
            (ing) => ing._id === ingredientId
          );
          const ingredientName = selectedIngredient?.name || "";
          const isCountBased = selectedIngredient?.defaultUnit === "count";

          return (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "0.5rem",
                alignItems: "center",
              }}
            >
              <Dropdown
                aria_label="Select Ingredient"
                variant="flat"
                closeOnSelect={false}
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={new Set([ingredientName])}
                onSelectionChange={(newIngredient) =>
                  handleIngredientChange(
                    index,
                    "ingredient",
                    Array.from(newIngredient)[0]
                  )
                }
                items={ingredients}
                style={{ minWidth: "150px", flex: 1.5 }}
              />
              <Input
                label={isCountBased ? "Count" : "Quantity"}
                type="number"
                value={ingredient.quantity}
                onChange={(e) =>
                  handleIngredientChange(index, "quantity", e.target.value)
                }
              />
              {!isCountBased && (
                <Dropdown
                  aria_label="Select Unit"
                  variant="flat"
                  closeOnSelect={false}
                  disallowEmptySelection
                  selectionMode="single"
                  selectedKeys={new Set([ingredient.unit])}
                  onSelectionChange={(newUnit) =>
                    handleIngredientChange(
                      index,
                      "unit",
                      Array.from(newUnit)[0]
                    )
                  }
                  items={[{ name: "g" }, { name: "oz" }]}
                />
              )}
              <Input
                label="Cook Style"
                value={ingredient.cookStyle}
                onChange={(e) =>
                  handleIngredientChange(index, "cookStyle", e.target.value)
                }
              />
              <Button
                isIconOnly
                color="danger"
                variant="ghost"
                onPress={() => deleteIngredient(index)}
              >
                <X />
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCustomOptions = () => {
    return (
      <Accordion>
        <AccordionItem key="custom_options" title="Custom Options">
          {customOptions.map((option, index) =>
            renderCustomOption(option, index.toString())
          )}
          {addCustomOptionButton()}
        </AccordionItem>
      </Accordion>
    );
  };

  const renderCustomOption = (option: any, index: string) => {
    const moveCustomOption = (
      currentIndex: number,
      direction: "up" | "down"
    ) => {
      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= customOptions.length) {
        return; // Index out of bounds, do nothing
      }

      const updatedOptions = [...customOptions];
      const temp = updatedOptions[newIndex];
      updatedOptions[newIndex] = updatedOptions[currentIndex];
      updatedOptions[currentIndex] = temp;
      setCustomOptions(updatedOptions);
    };

    const moveSubOption = (
      optionIndex: number,
      subOptionIndex: number,
      direction: "up" | "down"
    ) => {
      const newSubIndex =
        direction === "up" ? subOptionIndex - 1 : subOptionIndex + 1;

      if (
        newSubIndex < 0 ||
        newSubIndex >= customOptions[optionIndex].options.length
      ) {
        return; // Do nothing if the new index is out of bounds
      }

      const updatedOptions = [...customOptions];
      const currentOption = updatedOptions[optionIndex];
      const temp = currentOption.options[newSubIndex];
      currentOption.options[newSubIndex] =
        currentOption.options[subOptionIndex];
      currentOption.options[subOptionIndex] = temp;

      setCustomOptions(updatedOptions);
    };

    const deleteCustomOption = () => {
      const updatedOptions = customOptions.filter(
        (_, i) => i !== parseInt(index)
      );
      setCustomOptions(updatedOptions);
    };

    const deleteSubOption = (optionIndex: number, subOptionIndex: number) => {
      const updatedOptions = [...customOptions];
      updatedOptions[optionIndex].options = updatedOptions[
        optionIndex
      ].options.filter((_: any, index: any) => index !== subOptionIndex);
      setCustomOptions(updatedOptions);
    };

    return (
      <div key={index} style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          {reorderMode ? (
            <>
              <Button
                onPress={() => moveCustomOption(parseInt(index), "up")}
                isIconOnly
                variant="light"
              >
                <ArrowUp />
              </Button>
              <Button
                onPress={() => moveCustomOption(parseInt(index), "down")}
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
              onPress={() => setReorderMode(true)}
            >
              <Grip />
            </Button>
          )}
          <Input
            label="Option Name"
            value={option.name}
            onChange={(e) => {
              const newName = e.target.value;
              handleCustomOptionChange(parseInt(index), "name", newName);
            }}
            fullWidth
          />
          {!reorderMode && (
            <Button
              isIconOnly
              color="danger"
              variant="ghost"
              onPress={deleteCustomOption}
            >
              <X />
            </Button>
          )}
        </div>
        {!reorderMode && (
          <div style={{ marginLeft: "2rem" }}>
            {option.options.map((subOption: any, subIndex: number) => {
              return (
                <div
                  key={subIndex}
                  style={{
                    marginBottom: "1rem",
                    padding: "1rem",
                    border: "1px solid #ccc",
                    borderRadius: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      marginBottom: "0.5rem",
                      alignItems: "center",
                    }}
                  >
                    {subOptionReorderMode ? (
                      <>
                        <Button
                          onPress={() =>
                            moveSubOption(parseInt(index), subIndex, "up")
                          }
                          isIconOnly
                          variant="light"
                        >
                          <ArrowUp />
                        </Button>
                        <Button
                          onPress={() =>
                            moveSubOption(parseInt(index), subIndex, "down")
                          }
                          isIconOnly
                          variant="light"
                        >
                          <ArrowDown />
                        </Button>
                        <Button
                          isIconOnly
                          color="success"
                          variant="light"
                          onPress={() => setSubOptionReorderMode(false)}
                        >
                          <Check />
                        </Button>
                      </>
                    ) : (
                      <Button
                        isIconOnly
                        variant="light"
                        style={{ cursor: "grab" }}
                        onPress={() => setSubOptionReorderMode(true)}
                      >
                        <Grip />
                      </Button>
                    )}
                    <Input
                      label="Sub-option Label"
                      value={subOption.name}
                      onChange={(e) =>
                        handleCustomSubOptionChange(
                          parseInt(index),
                          subIndex,
                          "name",
                          e.target.value
                        )
                      }
                    />
                    <Input
                      label="Price Adjustment"
                      type="number"
                      value={subOption.price}
                      onChange={(e) =>
                        handleCustomSubOptionChange(
                          parseInt(index),
                          subIndex,
                          "price",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                    <Input
                      label="Calories"
                      type="number"
                      value={subOption.calories}
                      onChange={(e) =>
                        handleCustomSubOptionChange(
                          parseInt(index),
                          subIndex,
                          "calories",
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <Input
                      label="Carbs"
                      type="number"
                      value={subOption.carbs}
                      onChange={(e) =>
                        handleCustomSubOptionChange(
                          parseInt(index),
                          subIndex,
                          "carbs",
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <Input
                      label="Fat"
                      type="number"
                      value={subOption.fat}
                      onChange={(e) =>
                        handleCustomSubOptionChange(
                          parseInt(index),
                          subIndex,
                          "fat",
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <Input
                      label="Protein"
                      type="number"
                      value={subOption.protein}
                      onChange={(e) =>
                        handleCustomSubOptionChange(
                          parseInt(index),
                          subIndex,
                          "protein",
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <Button
                      isIconOnly
                      color="danger"
                      variant="ghost"
                      onPress={() => deleteSubOption(parseInt(index), subIndex)}
                    >
                      <X />
                    </Button>
                  </div>
                  <div style={{ marginTop: "1rem" }}>
                    {renderIngredientSelection(
                      subOption.ingredients || [],
                      (newIngredients) => {
                        const updatedOptions = [...customOptions];
                        updatedOptions[parseInt(index)].options[
                          subIndex
                        ].ingredients = newIngredients;
                        setCustomOptions(updatedOptions);
                      },
                      `${option.name} - ${subOption.name} Ingredients`
                    )}
                  </div>
                </div>
              );
            })}
            <Button
              color="primary"
              onPress={() => addSubOption(parseInt(index))}
              style={{ marginTop: "0.5rem" }}
            >
              Add Sub-option
            </Button>
          </div>
        )}
      </div>
    );
  };

  const addCustomOptionButton = () => {
    return (
      <Button color="primary" onPress={addCustomOption}>
        Add Custom Option
      </Button>
    );
  };

  async function uploadImageToS3(selectedImage: File | null) {
    let imageUrl = null;
    if (selectedImage) {
      const formData = new FormData();
      formData.append("image", selectedImage);

      try {
        const response = await fetch("/api/s3-upload", {
          method: "POST",
          body: "formData",
        });

        const data = await response.json();
        console.log(data.status);

        imageUrl = data.url;
        // Create a new image object for the image array appended to the product
        setNewProductImage({ src: imageUrl });
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  }

  const saveIngredients = (passed_ingredients: any[]) => {
    if (ingredients.length === 0) {
      return [];
    }
    console.log("Ingredients: ", ingredients);
    console.log("Passed Ingredients: ", passed_ingredients);
    return passed_ingredients.map((ing: any) => {
      const selectedIngredient = ingredients.find(
        (i) => i._id === ing.ingredient
      );
      console.log("Selected Ingredient: ", selectedIngredient);
      if (selectedIngredient?.defaultUnit === "count") {
        return {
          ...ing,
          quantity: parseInt(ing.quantity),
          unit: "count",
        };
      } else {
        return {
          ...ing,
          quantity: convertToGrams(ing.quantity, ing.unit),
          unit: "g",
        };
      }
    });
  };

  const handleSave = async () => {
    setLoadingSave(true);
    const selectedTags = Array.from(
      mapSelectedTagsToObjects(),
      (item) => item.name
    );

    // Upload Image
    await uploadImageToS3(uploadedImage);

    const selectedStockStatusString =
      Array.from(selectedStockStatus).join(", ");
    console.log("Custom Options: ", customOptions);
    const formData = {
      name: decodeHtmlEntities(String(mealName)),
      url: friendlyUrl((await getUser(userId)).settings.url),
      status: selectedStockStatusString,
      description: convertToHtml(mealDescription),
      short_description: convertToHtml(mealDescription),
      price: parseFloat(mealPrice),
      userid: userId,
      tags: selectedTags,
      nutrition_facts: {
        ...nutritionFacts,
        ingredients: saveIngredients(nutritionFacts.ingredients),
      },
      options: options.map((option) => ({
        ...option,
        ingredients: saveIngredients(option.ingredients || []),
      })),
      custom_options: customOptions.map((customOption) => ({
        ...customOption,
        options: customOption.options.map((option: any) => ({
          ...option,
          ingredients: saveIngredients(option.ingredients || []),
        })),
      })),
      image: mealImage ? mealImage.src : newProductImage ? newProductImage : "",
      mealid: meal && mode === "patch" ? meal.id : undefined,
    };
    saveMutation.mutate(formData);
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
          value={decodeHtmlEntities(mealName)}
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
        <div style={{ marginTop: "1rem" }}>
          <textarea
            placeholder="Meal Description"
            value={mealDescription}
            onChange={(e) => setMealDescription(e.target.value)}
            rows={5}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "0.25rem",
              border: "1px solid #ccc",
            }}
          />
        </div>
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
          {renderIngredientSelection(
            nutritionFacts.ingredients,
            (newIngredients) =>
              setNutritionFacts({
                ...nutritionFacts,
                ingredients: newIngredients,
              }),
            "Base Ingredients"
          )}
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

    const updateOptionIngredients = (newIngredients: any[]) => {
      const updatedOptions = [...options];
      updatedOptions[parseInt(index)].ingredients = newIngredients;
      setOptions(updatedOptions);
    };

    return (
      <div>
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
        {renderIngredientSelection(
          option.ingredients || [],
          updateOptionIngredients,
          "Ingredients"
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
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ marginBottom: "4px" }}>
                  {renderImage() ?? (
                    <ImageUploader onImageSelect={setUploadedImage} />
                  )}
                </div>
                {renderMealBasicInfo()}
              </div>
              <div style={{ marginTop: "1rem" }}>
                {renderNutritionFacts()} {/* Added marginTop for spacing */}
              </div>
              <div style={{ marginTop: "1rem" }}>
                {renderOptions()} {/* Added marginTop for spacing */}
                {renderCustomOptions()}
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
