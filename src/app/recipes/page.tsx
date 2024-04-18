"use client";
import { useUser } from "@propelauth/nextjs/client";
import { Button, Spinner, Input } from "@nextui-org/react";
import Navbar from "@/components/Navbar";
import React, { useState } from "react";
import { SignupAndLoginButtons } from "@/components/SignupAndLoginButtons";
// import { getRecipes } from "@/helpers/recipe";
// import { useMutation, useQueryClient } from "react-query";
// import { createRecipe } from "@/helpers/request";
// import { useOrgContext } from "@/components/OrgContext";
export default function RecipesPage() {
  const { loading, isLoggedIn } = useUser();
  const [recipeName, setRecipeName] = useState("");
  const [ingredients, setIngredients] = useState<any[]>([]);
  // const [bulkRecipesInput, setBulkRecipesInput] = useState("");
  // const { currentOrg } = useOrgContext();
  // function getOrg() {
  //   return user?.getOrg(currentOrg);
  // }
  // const currentOrgId = getOrg()?.orgId as string;
  const handleIngredientChange = (index: any, key: any, value: any) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index][key] = value;
    setIngredients(updatedIngredients);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  };

  const handleRemoveIngredient = (index: any) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients.splice(index, 1);
    setIngredients(updatedIngredients);
  };
  // const queryclient = useQueryClient();
  // const createMutation = useMutation(
  //   (data: {
  //     name: string;
  //     orgId: string;
  //     userId: string;
  //     ingredients: { name: string; quantity: number; unit: string }[];
  //   }) => createRecipe(data.name, data.orgId, data.userId, data.ingredients),
  //   {
  //     onSuccess: () => {
  //       queryclient.invalidateQueries("recipes");
  //       // This sets the current room to the newly created room
  //     },
  //   }
  // );

  const addRecipe = async () => {
    console.log("Adding Recipe:", { name: recipeName, ingredients });
    // You can add your logic here to handle adding the recipe
    // Reset inputs after adding recipe
    setRecipeName("");
    setIngredients([]);
  };

  const renderIngredients = () => {
    return ingredients.map((ingredient, index) => (
      <div
        key={index}
        style={{ display: "flex", alignItems: "center", marginTop: "10px" }}
      >
        <Input
          value={ingredient.name}
          placeholder="Ingredient name"
          onChange={(e) =>
            handleIngredientChange(index, "name", e.target.value)
          }
          style={{ marginRight: "10px" }}
        />
        <Input
          value={ingredient.quantity}
          placeholder="Quantity"
          onChange={(e) =>
            handleIngredientChange(index, "quantity", e.target.value)
          }
          style={{ marginRight: "10px" }}
        />
        <Input
          value={ingredient.unit}
          placeholder="Unit"
          onChange={(e) =>
            handleIngredientChange(index, "unit", e.target.value)
          }
          style={{ marginRight: "10px" }}
        />
        <Button onClick={() => handleRemoveIngredient(index)}>Remove</Button>
      </div>
    ));
  };

  // const bulkAddRecipes = () => {
  //   const recipes = getRecipes();

  //   // Iterate over each recipe and format the ingredients
  //   const formattedRecipes = recipes.map((recipe) => {
  //     return {
  //       name: recipe.name,
  //       ingredients: recipe.ingredients.map((ingredient) => ({
  //         name: ingredient.name,
  //         quantity: ingredient.quantity,
  //         unit: ingredient.unit,
  //       })),
  //     };
  //   });
  //   console.log("Formatted Recipes: ", formattedRecipes);
  //   // Example using formattedRecipes[0], change index as needed
  //   const orgId = currentOrgId;
  //   const userId = user?.userId || "";

  //   formattedRecipes.forEach((recipe) => {
  //     const name = recipe.name;
  //     const ingredients = recipe.ingredients;

  //     createMutation.mutate({
  //       orgId: orgId,
  //       userId: userId,
  //       name: name,
  //       ingredients: ingredients,
  //     });
  //   });
  // };

  if (isLoggedIn) {
    return (
      <>
        <Navbar />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Input
              value={recipeName}
              placeholder="Recipe Name"
              onChange={(e) => setRecipeName(e.target.value)}
            />
            {renderIngredients()}
            <Button onClick={handleAddIngredient}>Add Ingredient</Button>
            <Button onClick={addRecipe}>Add Recipe</Button>
            {/* <Input
              value={bulkRecipesInput}
              placeholder="Paste recipes JSON here"
              style={{ marginTop: "20px", width: "300px" }}
              onChange={(e) => setBulkRecipesInput(e.target.value)}
            /> */}
            {/* Button for bulk adding recipes */}
            {/* <Button onClick={bulkAddRecipes} style={{ marginTop: "10px" }}>
              Bulk Add Recipes
            </Button> */}
          </div>
        </div>
      </>
    );
  } else if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Spinner label="Loading Page" />
        </div>
      </div>
    );
  } else {
    return <SignupAndLoginButtons />;
  }
}
