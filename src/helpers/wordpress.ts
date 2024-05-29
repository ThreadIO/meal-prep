import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { format } from "date-fns";
import { getUser } from "@/controller/user.controller";
import { decryptField } from "@/helpers/encrypt";

function getHeaders(username: string, application_password: string) {
  const decryptedUsername = decryptField(username);
  const decryptedApplicationPassword = decryptField(application_password);
  const auth = Buffer.from(
    `${decryptedUsername}:${decryptedApplicationPassword}`
  ).toString("base64");
  return {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json",
  };
}

export async function getAll(
  userid: string,
  object: string,
  { startDate, endDate }: { startDate?: string; endDate?: string } = {}
) {
  try {
    console.log("Inside getAll wordpress helper function");
    console.log("Object: ", object);
    console.log("Start Date: ", startDate);
    console.log("End Date: ", endDate);

    // Retrieve user data
    const user_response = await (await getUser(userid)).json();
    const user = user_response.data;

    // Extract necessary data from user settings
    const company_url = user.settings.url;
    const endpoint = `${company_url}/wp-json/wp/v2/${object}?per_page=100`;

    const headers = getHeaders(
      user.settings.username,
      user.settings.application_password
    );

    // Fetch data from the wordpress API
    let allData: any[] = [];
    let page = 1;
    let nextPageExists = true;

    while (nextPageExists) {
      // Construct the full URL with query parameters for pagination
      let url = `${endpoint}&page=${page}`;
      if (startDate && endDate) {
        const formattedStartDate = format(
          new Date(startDate),
          "yyyy-MM-dd'T'HH:mm:ss"
        );
        const formattedEndDate = format(
          new Date(endDate),
          "yyyy-MM-dd'T'HH:mm:ss"
        );
        url += `&after=${formattedStartDate}&before=${formattedEndDate}`;
      }

      console.log("URL: ", url);

      // Fetch data from the current page
      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });

      // Check if the response is successful
      if (response.ok) {
        // Parse the JSON response
        const data = await response.json();
        allData = allData.concat(data);
        // Check if there's a next page
        const totalPages = parseInt(
          response.headers.get("x-wp-totalpages") || "0"
        );
        nextPageExists = page < totalPages;
        page++;
      } else {
        // Handle the case where the response is not successful
        console.error("Failed to fetch data:", response.statusText);
        return NextResponse.json(
          { success: false, message: "Failed to fetch data" },
          { status: response.status }
        );
      }
    }

    // Return a successful response with the fetched data
    return NextResponse.json({ success: true, data: allData }, { status: 200 });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    );
  }
}

export async function get(userid: string, object: string, objectid: string) {
  console.log("Inside getAll wordpress helper function");
  console.log("Object: ", object);
  console.log("Object ID: ", objectid);

  // Retrieve user data
  const user_response = await (await getUser(userid)).json();
  const user = user_response.data;

  // Extract necessary data from user settings
  const company_url = user.settings.url;
  const headers = getHeaders(
    user.settings.username,
    user.settings.application_password
  );
  const endpoint = `${company_url}/wp-json/wp/v2/${object}/${objectid}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: headers,
  });
  const data = await response.json();
  return NextResponse.json({ success: true, data: data }, { status: 200 });
}

export async function post(userid: string, object: string, body: any) {
  console.log("Inside post wordpress helper function");
  console.log("Object: ", object);
  console.log("Body: ", body);
  // Retrieve user data
  const user_response = await (await getUser(userid)).json();
  const user = user_response.data;

  // Extract necessary data from user settings
  const company_url = user.settings.url;
  const headers = getHeaders(
    user.settings.username,
    user.settings.application_password
  );
  const endpoint = `${company_url}/wp-json/wp/v2/${object}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return NextResponse.json({ success: true, data: data }, { status: 200 });
}

export async function post_one(
  userid: string,
  object: string,
  objectid: string,
  body: any,
  filters: string = ""
) {
  console.log("Inside post wordpress helper function");
  console.log("Object: ", object);
  console.log("Body: ", body);
  // Retrieve user data
  const user_response = await (await getUser(userid)).json();
  const user = user_response.data;

  // Extract necessary data from user settings
  const company_url = user.settings.url;
  const headers = getHeaders(
    user.settings.username,
    user.settings.application_password
  );
  const endpoint = `${company_url}/wp-json/wp/v2/${object}/${objectid}${filters}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });
  const data = await response.json();
  console.log("WP Data: ", data);
  return NextResponse.json({ success: true, data: data }, { status: 200 });
}

export async function patch(
  userid: string,
  object: string,
  objectid: string,
  body: any
) {
  console.log("Inside patch wordpress helper function");
  console.log("Object: ", object);
  console.log("Object ID: ", objectid);

  // Retrieve user data
  const user_response = await (await getUser(userid)).json();
  const user = user_response.data;

  // Extract necessary data from user settings
  const company_url = user.settings.url;
  const headers = getHeaders(
    user.settings.username,
    user.settings.application_password
  );
  const endpoint = `${company_url}/wp-json/wp/v2/${object}/${objectid}`;
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return NextResponse.json({ success: true, data: data }, { status: 200 });
}

export async function remove(userid: string, object: string, objectid: string) {
  console.log("Inside remove wordpress helper function");
  console.log("Object: ", object);
  console.log("Object ID: ", objectid);

  // Retrieve user data
  const user_response = await (await getUser(userid)).json();
  const user = user_response.data;

  // Extract necessary data from user settings
  const company_url = user.settings.url;
  const headers = getHeaders(
    user.settings.username,
    user.settings.application_password
  );
  const endpoint = `${company_url}/wp-json/wp/v2/${object}/${objectid}`;
  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: headers,
  });
  const data = await response.json();
  return NextResponse.json({ success: true, data: data }, { status: 200 });
}

export function filterProductAddons(meta_data: any, product_addons: any) {
  // Filter out the object with key "_product_addons"
  let filteredMetaData = meta_data.filter(
    (item: any) => item.key !== "_product_addons"
  );

  // Extract names from the product_addons array
  const productAddonsMetadata = meta_data.find(
    (item: any) => item.key === "_product_addons"
  );

  if (productAddonsMetadata && productAddonsMetadata.value) {
    filteredMetaData.push({
      ...productAddonsMetadata,
      value: product_addons,
    });
  }

  return filteredMetaData;
}

export function convertACF(wc_acf: any) {
  console.log("Converting ACF: ", wc_acf);

  const productSettings: any[] = [];

  // Transform Nutrition Facts
  if (wc_acf.facts) {
    const nutritionFacts = {
      acf_fc_layout: "nutrition_facts",
      calories: wc_acf.facts.calories,
      facts: wc_acf.facts.items.map((item: any) => ({
        acf_fc_layout: "fact",
        use_in_chart: true, // Assuming all facts use in chart
        nutrition_fact_label: item.label, // Assuming each item has a label field
        amount: item.amount, // Assuming each item has an amount field
      })),
    };
    productSettings.push(nutritionFacts);
  }

  // Transform Ingredients
  if (wc_acf.ingredients) {
    const ingredients = {
      acf_fc_layout: "ingredients", // Using "nutrition_facts" as the valid layout
      description: wc_acf.ingredients.description.replace(
        /<\/?[^>]+(>|$)/g,
        ""
      ), // Removing HTML tags
      ingredients_list:
        wc_acf.ingredients.items.length > 0 ? wc_acf.ingredients.items : null,
    };
    productSettings.push(ingredients);
  }

  // Allergen and how-to sections are commented out because they may not match the expected format
  /*
  // If allergens need to be transformed (example, adding another section)
  if (wc_acf.allergens) {
    const allergens = {
      acf_fc_layout: "nutrition_facts", // Using "nutrition_facts" as the valid layout
      title: wc_acf.allergens.title,
      items: wc_acf.allergens.items
    };
    productSettings.push(allergens);
  }

  // If howtos need to be transformed (example, adding another section)
  if (wc_acf.howtos) {
    const howtos = {
      acf_fc_layout: "nutrition_facts", // Using "nutrition_facts" as the valid layout
      title: wc_acf.howtos.title,
      items: wc_acf.howtos.items
    };
    productSettings.push(howtos);
  }
  */

  return {
    acf: {
      product_settings: productSettings,
    },
  };
}
