import { User } from "@propelauth/react";

export async function getAllRecipes() {
  const { success, data } = await (await fetch("/api/recipe")).json();
  if (!success) throw new Error("Error fetching recipes");
  return data;
}

export async function getAllRecipesInOrg(orgid: string) {
  const { success, data } = await (
    await fetch("/api/recipe", {
      headers: {
        orgid: orgid,
      },
    })
  ).json();
  if (!success) throw new Error("Error fetching recipes");
  return data;
}

export async function createRecipe(
  name: string,
  orgid: string,
  userid: string,
  ingredients: { name: string; quantity: number; unit: string }[]
) {
  const { success, data } = await (
    await fetch(`/api/recipe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        orgid: orgid,
        userid: userid,
        ingredients: ingredients,
      }),
    })
  ).json();
  if (!success) throw new Error("Error creating recipe");
  return data;
}

export async function deleteRecipe(recipeid: string) {
  const { success, data } = await (
    await fetch(`/api/recipe/${recipeid}`, {
      method: "DELETE",
    })
  ).json();
  if (!success) throw new Error("Error deleting recipe");
  return data;
}

export async function patchRecipe(recipeid: string, body: any) {
  const { success, data } = await (
    await fetch(`/api/recipe/${recipeid}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  ).json();
  if (!success) throw new Error("Error updating recipe");
  return data;
}

export async function getAllUsersInOrg(orgid: string): Promise<User[]> {
  const { success, response } = await (
    await fetch("/api/user", {
      headers: {
        orgid: orgid,
      },
    })
  ).json();
  if (!success) throw new Error("Error fetching user");
  return response as User[];
}

export async function getUser(userid: string) {
  const { success, data } = await (await fetch(`/api/user/${userid}`)).json();
  if (!success) throw new Error("Error fetching user");
  return data;
}

export async function createUser(
  userid: string,
  settings: { client_key: string; client_secret: string; url: string }
) {
  const { success, data, error } = await (
    await fetch(`/api/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userid: userid,
        settings: settings,
      }),
    })
  ).json();
  if (!success) throw new Error("Error creating user: ", error);
  return data;
}

export async function patchUser(userid: string, body: any) {
  const { success, data, error } = await (
    await fetch(`/api/user/${userid}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  ).json();
  if (!success) throw new Error("Error updating user: ", error);
  return data;
}

export async function createProduct(body: any) {
  const { success, data, error } = await (
    await fetch(`/api/woocommerce/product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  ).json();
  if (!success) throw new Error("Error creating product: ", error);
  return data;
}

export async function patchProduct(productid: string, body: any) {
  const { success, data, error } = await (
    await fetch(`/api/woocommerce/product/${productid}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  ).json();
  if (!success) throw new Error("Error updating product: ", error);
  return data;
}

export async function deleteProduct(productid: string, body: any) {
  const { success, data, error } = await (
    await fetch(`/api/woocommerce/product/${productid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  ).json();
  if (!success) throw new Error("Error deleting product: ", error);
  return data;
}
