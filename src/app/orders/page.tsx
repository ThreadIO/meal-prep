"use client";
import { useUser } from "@propelauth/nextjs/client";
import { Button, Spinner, Input } from "@nextui-org/react";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import React from "react";
import { SignupAndLoginButtons } from "@/components/SignupAndLoginButtons";
import { saveAs } from "file-saver";
import { Packer, Document, Paragraph, TextRun, HeadingLevel } from "docx";
import { useOrgContext } from "@/components/OrgContext";

export default function OrdersPage() {
  const { loading, isLoggedIn, user } = useUser();
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10)); // Default to today's date
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [ingredients, setIngredients] = useState<any>({});
  const [ingredientsLoading, setIngredientsLoading] = useState<boolean>(false);
  const [showLineItems, setShowLineItems] = useState(true);
  const [showOrders, setShowOrders] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [error, setError] = useState<string>("");
  const { currentOrg } = useOrgContext();
  function getOrg() {
    return user?.getOrg(currentOrg);
  }
  const currentOrgId = getOrg()?.orgId as string;
  const getOrders = async () => {
    setShowOrders(true);
    console.log("Inside Client-side Get Orders");
    console.log("Start Date: ", startDate);
    console.log("End Date: ", endDate);

    const requestData = {
      userid: user?.userId,
      startDate: startDate,
      endDate: endDate,
    };
    console.log(JSON.stringify(requestData));
    setOrders([]);
    setOrdersLoading(true);
    try {
      const ordersResponse = await fetch("/api/woocommerce/getorders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!ordersResponse.ok) {
        if (ordersResponse.statusText === "Unauthorized") {
          setError("Incorrect Client Key or Client Secret");
        } else {
          setError(`Failed to fetch orders: ${ordersResponse.statusText}`);
        }
        throw new Error(`Failed to fetch orders: ${ordersResponse.statusText}`);
      }
      setError("");
      const responseData = await ordersResponse.json();

      // Assuming responseData contains the orders directly, if not, adjust accordingly
      const ordersData = responseData.data || [];

      console.log("Orders Response: ", ordersResponse);
      console.log("Orders Data: ", ordersData);

      setOrders(ordersData);
      setOrdersLoading(false);
      setShowOrders(true);

      // Pre-fetch ingredients
      getIngredients(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setOrdersLoading(false);
      setShowOrders(false);
    }
  };

  const clear = async () => {
    clearOrders();
    clearIngredients();
  };
  const clearOrders = async () => {
    setOrders([]);
    setOrdersLoading(false);
    setShowOrders(false);
  };

  const clearIngredients = async () => {
    setIngredients([]);
    setIngredientsLoading(false);
    setShowIngredients(false);
  };

  const getIngredients = async (ingredients_orders: any[] = orders) => {
    console.log("Inside Client-side Get Ingredients");
    const requestData = {
      orders: ingredients_orders,
      orgid: currentOrgId,
    };
    console.log("Request Data: ", requestData);

    setIngredients({});
    setIngredientsLoading(true);
    try {
      const ingredientsResponse = await fetch("/api/ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!ingredientsResponse.ok) {
        throw new Error(
          `Failed to fetch orders: ${ingredientsResponse.statusText}`
        );
      }

      const responseData = await ingredientsResponse.json();

      // Assuming responseData contains the orders directly, if not, adjust accordingly
      const ingredientsData = responseData.ingredients || [];

      console.log("Ingredients Response: ", ingredientsResponse);
      console.log("Ingredients Data: ", ingredientsData);
      setIngredients(ingredientsData);
      setIngredientsLoading(false);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      setIngredients({});
      setIngredientsLoading(false);
    }
  };

  const downloadOrders = async (
    ordersData: any,
    startDate: any,
    endDate: any
  ) => {
    console.log("download orders");
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Orders Report", bold: true }),
                new TextRun({
                  text: ` (from ${startDate} to ${endDate})`,
                  bold: true,
                }),
              ],
              heading: HeadingLevel.HEADING_1,
            }),
            ...ordersData.flatMap((order: any) => {
              const lines = order.line_items.map((item: any) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                currency_symbol: order.currency_symbol,
              }));
              return [
                new Paragraph({
                  children: [
                    new TextRun({ text: `Order ID: ${order.id}`, bold: true }),
                    new TextRun({ text: " " }), // Add a space
                    new TextRun(
                      `Customer Name: ${order.billing.first_name} ${order.billing.last_name}`
                    ),
                    new TextRun({ text: " " }), // Add a space
                    new TextRun(`Date: ${order.date_created}`),
                  ],
                  heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                  children: [new TextRun({ text: "Line Items:", bold: true })],
                }),
                ...lines.flatMap((line: any) => [
                  new Paragraph({ text: `Product Name: ${line.name}` }),
                  new Paragraph({ text: `Quantity: ${line.quantity}` }),
                  new Paragraph({
                    text: `Price: ${line.price} ${line.currency_symbol}`,
                  }),
                ]),
                new Paragraph({}), // Add a line break after line items
              ];
            }),
          ],
        },
      ],
    });
    console.log(doc);
    const buffer = await Packer.toBuffer(doc);
    console.log("Buffer: ", buffer);
    saveAs(new Blob([buffer]), `orders-${startDate}-${endDate}.docx`);
  };

  const downloadIngredients = async () => {
    console.log("download ingredients");
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Ingredients Report", bold: true }),
              ],
              heading: HeadingLevel.HEADING_1,
            }),
            ...Object.entries(ingredients).flatMap(
              ([ingredient, details]: [any, any]) => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Ingredient: ${ingredient}`,
                      bold: true,
                    }),
                  ],
                  heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Quantity: ${details.quantity} ${details.unit}`,
                    }),
                  ],
                }),
                new Paragraph({}), // Add a line break after each ingredient
              ]
            ),
          ],
        },
      ],
    });
    console.log(doc);
    const buffer = await Packer.toBuffer(doc);
    console.log(buffer);
    saveAs(new Blob([buffer]), `ingredients-report.docx`);
  };

  const handleShowOrders = () => {
    setShowOrders(true);
    setShowIngredients(false);
  };

  const handleShowIngredients = () => {
    setShowOrders(false);
    setShowIngredients(true);
  };

  // Function to generate CSV data from orders
  const generateCsvData = (orders: any[]) => {
    const extractDeliveryDate = (metaData: any[]) => {
      const deliveryDateObj = metaData.find(
        (item) => item.key === "_orddd_timestamp"
      );
      return deliveryDateObj
        ? new Date(parseInt(deliveryDateObj.value) * 1000)
        : null; // Convert timestamp to Date object
    };

    const extractAllergens = (acf: any) => {
      const allergens = acf?.allergens?.items
        ?.map((item: any) => item.label.name)
        .join(", ");
      return allergens || "";
    };

    const formatSize = (metaData: any[]) => {
      const addonsData = metaData.find((item) => item.key === "_addons_data");
      if (addonsData) {
        const sizeAddons = addonsData.value.filter(
          (addon: any) => addon.name === "Size"
        );
        const sizes = sizeAddons.map((addon: any) => addon.value);
        return sizes.join(" | ");
      }
      return ""; // Return empty string if size is not found or metadata doesn't contain addons data
    };

    const csvData = [
      [
        "Customer Name",
        "First Name",
        "Last Name",
        "Product Name",
        "Expiry Date",
        "calories",
        "Protein",
        "Carbs",
        "Fat",
        "Ingredients",
        "Allergens",
        "Delivery Date",
        "All Slides",
      ],
    ];

    orders.forEach((order) => {
      const deliveryDate = extractDeliveryDate(order.meta_data);
      order.line_items.forEach((item: any) => {
        // Wrap each field in double quotes to handle commas in item names
        const allergens = extractAllergens(item.product_data.acf);
        csvData.push([
          `${order.billing.first_name} ${order.billing.last_name}`,
          order.billing.first_name,
          order.billing.last_name,
          `"${item.name}"`, // Enclose item name in double quotes
          deliveryDate
            ? new Date(deliveryDate.getTime() + 4 * 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 10)
            : "", // Add 4 days if deliveryDate is not null
          item.product_data.acf?.facts?.calories || "",
          item.product_data.acf?.facts?.items?.find(
            (fact: any) => fact.label === "protein"
          )?.amount || "",
          item.product_data.acf?.facts?.items?.find(
            (fact: any) => fact.label === "carbs"
          )?.amount || "",
          item.product_data.acf?.facts?.items?.find(
            (fact: any) => fact.label === "fat"
          )?.amount || "",
          `"${
            item.product_data.acf?.ingredients?.description?.replace(
              /<[^>]+>/g,
              ""
            ) || ""
          }"`,
          allergens,
          deliveryDate ? deliveryDate.toISOString().slice(0, 10) : "", // Convert deliveryDate to ISO string if not null
          formatSize(item.meta_data),
        ]);
      });
    });

    return csvData.map((row) => row.join(",")).join("\n");
  };

  // Function to handle downloading CSV file
  const downloadCsv = () => {
    const csvData = generateCsvData(orders);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `orders-${startDate}-${endDate}.csv`);
  };

  // Render CSV download button
  const renderCsvDownloadButton = () => {
    if (orders.length > 0) {
      return (
        <Button
          style={{
            marginRight: "10px",
            padding: "5px 10px",
            borderRadius: "5px",
          }}
          onClick={() => downloadCsv()}
          color="primary"
        >
          Download Orders CSV
        </Button>
      );
    }
    return null;
  };

  const renderOrdersContent = () => {
    if (
      (ordersLoading && showOrders) ||
      (ingredientsLoading && showIngredients)
    ) {
      return renderLoading();
    } else if (showIngredients) {
      return renderIngredients();
    } else if (showOrders) {
      return renderOrders();
    } else {
      return renderDateInputs();
    }
  };

  const renderLoading = () => {
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
          <Spinner
            label={ordersLoading ? "Loading Orders" : "Loading Ingredients"}
          />
        </div>
      </div>
    );
  };

  const renderIngredients = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxHeight: "80vh", // Set the max height to 80% of the screen height
            overflowY: "auto", // Enable vertical scrolling
          }}
        >
          {Object.entries(ingredients).map(
            ([ingredient, details]: [any, any], index) => (
              <div key={index} style={{ marginBottom: "20px" }}>
                <strong>Ingredient:</strong> {ingredient}
                <br />
                <div style={{ marginLeft: "20px" }}>
                  <strong>Quantity:</strong> {details.quantity} {details.unit}
                </div>
              </div>
            )
          )}
        </div>
        <div style={{ marginTop: "10px" }}>
          <Button
            style={{
              marginRight: "10px",
              padding: "5px 10px",
              borderRadius: "5px",
            }}
            onClick={() => downloadIngredients()}
            color="primary"
          >
            Download Ingredients
          </Button>
          <Button
            style={{
              marginRight: "10px",
              padding: "5px 10px",
              borderRadius: "5px",
            }}
            onClick={() => handleShowOrders()}
            color="primary"
          >
            Show Orders
          </Button>
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    // State variable to toggle between line items and meal quantities

    // Function to calculate the sum of quantities for each meal
    const calculateMealSum = () => {
      const mealSum: { [key: string]: number } = {}; // Define mealSum with type annotation

      orders.forEach((order) => {
        order.line_items.forEach((item: any) => {
          if (mealSum[item.name]) {
            mealSum[item.name] += item.quantity;
          } else {
            mealSum[item.name] = item.quantity;
          }
        });
      });

      return mealSum;
    };

    // Function to render aggregated meal information
    const renderMealSum = (mealSum: { [key: string]: number }) => {
      return Object.entries(mealSum).map(([meal, quantity], index) => (
        <div key={index} style={{ marginBottom: "20px" }}>
          <strong>Meal:</strong> {meal} <strong>Quantity:</strong>{" "}
          {quantity !== undefined ? quantity : "N/A"}
        </div>
      ));
    };

    // Function to render individual order details with line items
    const renderLineItems = () => {
      return orders.map((order, index) => (
        <div key={index} style={{ marginBottom: "20px" }}>
          <strong>Order ID:</strong> {order.id} <strong>Customer Name:</strong>{" "}
          {order.billing.first_name} {order.billing.last_name}{" "}
          <strong>Date:</strong> {order.date_created}
          <br />
          <div style={{ marginLeft: "20px" }}>
            <strong>Line Items:</strong>
            {order.line_items.map(
              (
                item: any,
                i: number // Provide type annotations for item and i
              ) => (
                <div key={i} style={{ marginLeft: "20px", marginTop: "5px" }}>
                  <div>
                    <strong>Product Name:</strong> {item.name}
                  </div>
                  <div>
                    <strong>Quantity:</strong> {item.quantity}
                  </div>
                  <div>
                    <strong>Price:</strong> {item.price.toFixed(2)}{" "}
                    {order.currency_symbol}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ));
    };

    // Get meal sums
    const mealSum = calculateMealSum();

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxHeight: "80vh", // Set the max height to 80% of the screen height
            overflowY: "auto", // Enable vertical scrolling
          }}
        >
          {/* Toggle between showing line items and meal quantities */}
          {showLineItems
            ? renderLineItems()
            : Object.keys(mealSum).length > 0
              ? renderMealSum(mealSum)
              : null}
        </div>
        <div style={{ marginTop: "10px" }}>
          {/* Button to toggle between line items and meal quantities */}
          <Button
            style={{
              marginRight: "10px",
              padding: "5px 10px",
              borderRadius: "5px",
            }}
            onClick={() => setShowLineItems((prev) => !prev)}
            color="primary"
          >
            {showLineItems ? "Show Meal Quantities" : "Show Line Items"}
          </Button>
          {/* Other buttons */}
          <Button
            style={{
              marginRight: "10px",
              padding: "5px 10px",
              borderRadius: "5px",
            }}
            onClick={() => handleShowIngredients()}
            color="primary"
          >
            Show Ingredients
          </Button>
          <Button
            style={{
              marginRight: "10px",
              padding: "5px 10px",
              borderRadius: "5px",
            }}
            onClick={() => downloadOrders(orders, startDate, endDate)}
            color="primary"
          >
            Download Orders
          </Button>
          <Button
            style={{
              marginRight: "10px",
              padding: "5px 10px",
              borderRadius: "5px",
            }}
            onClick={() => clear()}
            color="primary"
          >
            Clear Orders
          </Button>
          {renderCsvDownloadButton()}
        </div>
      </div>
    );
  };

  const renderDateInputs = () => {
    const renderError = () => {
      return (
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "red" }}>{error}</p>
        </div>
      );
    };

    return (
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
          {renderError()}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <Input
              type="date"
              variant="bordered"
              label="Start Date"
              defaultValue={startDate}
              onChange={(e) => setStartDate(e.target.value)} // Update state when the date changes
              max={new Date(endDate) // Set max to one day before end date
                .toISOString()
                .slice(0, 10)}
            ></Input>
            <Input
              type="date"
              variant="bordered"
              label="End Date"
              defaultValue={endDate} // Set default value to today's date
              onChange={(e) => setEndDate(e.target.value)} // Update state when the date changes
              min={new Date(startDate) // Set min to one day after start date
                .toISOString()
                .slice(0, 10)}
              max={new Date().toISOString().slice(0, 10)} // Restrict to today's date or earlier
            ></Input>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "10px",
            }}
          >
            <Button
              style={{
                marginRight: "10px",
                padding: "5px 10px",
                borderRadius: "5px",
              }}
              onClick={() => getOrders()}
              color="primary"
            >
              Get Orders
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoggedIn) {
    return (
      <div style={{ display: "flex", height: "100vh" }}>
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          {renderOrdersContent()}
        </div>
      </div>
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
