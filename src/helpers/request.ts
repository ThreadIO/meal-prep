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
    await fetch("/api/propelauth/user", {
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
  console.log("In Patch Product: ", body);
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

export async function getMeal(mealid: string, url: string) {
  const { success, data, error } = await (
    await fetch(`/api/meal/${mealid}/${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();
  if (!success) throw new Error("Error fetching meal: ", error);
  return data;
}

export async function createMeal(body: any) {
  const { success, data, error } = await (
    await fetch(`/api/meal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  ).json();
  if (!success) throw new Error("Error creating meal: ", error);
  return data;
}

export async function patchMeal(mealid: string, url: string, body: any) {
  const { success, data, error } = await (
    await fetch(`/api/meal/${mealid}/${url}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  ).json();
  if (!success) throw new Error("Error updating meal: ", error);
  return data;
}

export async function deleteMeal(mealid: string, url: string) {
  const { success, data, error } = await (
    await fetch(`/api/meal/${mealid}/${url}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();
  if (!success) throw new Error("Error deleting meal: ", error);
  return data;
}

export async function getProductAddons(productid: string, body: any) {
  const { success, data, error } = await (
    await fetch(`/api/woocommerce/getproductaddons/${productid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  ).json();
  if (!success) throw new Error("Error fetching product addons: ", error);
  return data;
}

export async function patchProductAddOns(productid: string, body: any) {
  console.log("In Patch Product Addons: ", body);
  const { success, data, error } = await (
    await fetch(`/api/woocommerce/productaddons/${productid}`, {
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

export async function postProductAddOns(productid: string, body: any) {
  console.log("In Post Product Addons: ", body);
  const { success, data, error } = await (
    await fetch(`/api/woocommerce/productaddons/${productid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  ).json();
  if (!success) throw new Error("Error updating product: ", error);
  return data;
}

export async function getAllMeals(userid: string, mealids?: string[]) {
  const { success, data, error } = await (
    await fetch(`/api/getmeals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userid: userid,
        mealids: mealids || [],
      }),
    })
  ).json();
  if (!success) throw new Error("Error fetching meals: ", error);
  return data;
}

export async function createOrg(body: any) {
  const { success, data, error } = await (
    await fetch(`/api/org`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  ).json();
  if (!success) throw new Error("Error creating org: ", error);
  return data;
}

export async function getOrg(orgid: string) {
  const { success, data, error } = await (
    await fetch(`/api/org/propelauth/${orgid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();
  if (!success) throw new Error("Error fetching org: " + error);
  return data;
}

export async function patchOrg(orgid: string, body: any) {
  const { success, data, error } = await (
    await fetch(`/api/org/propelauth/${orgid}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  ).json();
  if (!success) throw new Error("Error updating org: " + error);
  return data;
}

export async function createCoupon(body: any) {
  const { success, data, error } = await (
    await fetch(`/api/woocommerce/coupons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  ).json();
  if (!success) throw new Error("Error creating coupon: ", error);
  return data;
}

export async function patchCoupon(couponid: string, body: any) {
  console.log("In Patch Coupon: ", body);
  const { success, data, error } = await (
    await fetch(`/api/woocommerce/coupons/${couponid}`, {
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

export async function deleteCoupon(couponid: string, body: any) {
  const { success, data, error } = await (
    await fetch(`/api/woocommerce/coupons/${couponid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  ).json();
  if (!success) throw new Error("Error deleting coupon: ", error);
  return data;
}

export async function getAllSubscriptions(
  mongoDbOrgId: string
): Promise<any[]> {
  if (!mongoDbOrgId) throw new Error("No MongoDB Org id present");
  const response = await fetch("/api/getsubscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orgid: mongoDbOrgId }),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch subscriptions");
  }
  const data = await response.json();
  return data.data;
}

export async function createSubscription(body: any) {
  console.log("In Create Subscription: ", body);
  const { success, data, error } = await (
    await fetch(`/api/subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  ).json();
  if (!success) throw new Error("Error creating subscription: ", error);
  return data;
}

export async function patchSubscription(subscriptionid: string, body: any) {
  console.log("In Patch Subscription: ", body);
  const { success, data, error } = await (
    await fetch(`/api/subscription/${subscriptionid}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  ).json();
  if (!success) throw new Error("Error updating org: ", error);
  return data;
}

export async function getAllIngredients(): Promise<any[]> {
  const response = await fetch("/api/getingredients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch ingredients");
  }
  const data = await response.json();
  return data.data;
}

export const createOrder = async (userId: string, order: any) => {
  const response = await fetch("/api/woocommerce/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userid: userId, ...order }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to create order: ${JSON.stringify(data)}`);
  }
  return data;
};

export const getProducts = async (userId: string) => {
  const response = await fetch("/api/woocommerce/getproducts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userid: userId }),
  });
  const products = (await response.json()).data;
  if (!response.ok)
    throw new Error(`Failed to fetch products: ${JSON.stringify(products)}`);
  return products;
};

export const getCategories = async (user: any) => {
  const url = "/api/woocommerce/getproducts/getcategories";
  const method = "POST";
  const headers = {
    "Content-Type": "application/json",
  };
  const body = { userid: user?.userId };
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await response.json()).data;
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${JSON.stringify(data)}`);
  }
  return data;
};

export const getOrders = async (
  body: any,
  maxRetries = 3,
  initialDelay = 3000
) => {
  let allOrders: any[] = [];
  let currentPage = 1;
  let hasMore = true;

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  while (hasMore) {
    let retries = 0;
    let delay = initialDelay;

    while (retries < maxRetries) {
      try {
        console.log(`Fetching page ${currentPage} of orders...`);
        const response = await fetch("/api/woocommerce/getorders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, page: currentPage }),
        });

        if (!response.ok) {
          if (response.status === 504) {
            throw new Error("Gateway Timeout");
          }
          throw new Error(
            `Server responded with ${response.status}: ${response.statusText}`
          );
        }
        const result = await response.json();
        const { data, pagination } = result;
        allOrders = allOrders.concat(data);

        currentPage++;
        hasMore = pagination.hasMore;

        // Break out of the retry loop if successful
        break;
      } catch (error) {
        retries++;
        console.error(
          `Attempt ${retries} for page ${currentPage} failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );

        if (retries >= maxRetries) {
          throw new Error(
            `Max retries reached for page ${currentPage}. Last error: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }

        // Add jitter to the delay
        const jitter = Math.random() * 1000;
        delay = Math.min(delay * 2 + jitter, 60000); // Cap at 60 seconds

        if (error instanceof Error && error.message === "Gateway Timeout") {
          delay = Math.max(delay, 10000); // Minimum 10-second delay for 504 errors
        }

        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }

    // Add a small delay between successful requests to avoid rate limiting
    await sleep(1000);
  }

  console.log(`Fetching complete. Total orders fetched: ${allOrders.length}`);
  return allOrders;
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getOldOrders = async (body: any) => {
  const response = await fetch("/api/woocommerce/getorders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const orders = (await response.json()).data;
  console.log("Orders: ", orders);
  if (!response.ok)
    throw new Error(`Failed to fetch orders: ${JSON.stringify(orders)}`);
  return orders;
};
