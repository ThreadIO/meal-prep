"use client";
import { useUser } from "@propelauth/nextjs/client";
import { Button, Spinner, Input } from "@nextui-org/react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import React from "react";
import { SignupAndLoginButtons } from "@/components/SignupAndLoginButtons";
import { saveAs } from "file-saver";
import { Packer, Document, Paragraph, TextRun, HeadingLevel } from "docx";
import { useOrgContext } from "@/components/OrgContext";
// TO-DO: Make a helper function to tie the react render to how the word doc looks
// Add SideBar -> https://flowbite-react.com/docs/components/sidebar

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
  const { currentOrg } = useOrgContext();
  function getOrg() {
    return user?.getOrg(currentOrg);
  }
  const currentOrgId = getOrg()?.orgId as string;
  const getOrders = async () => {
    console.log("Inside Client-side Get Orders");
    console.log("Start Date: ", startDate);
    console.log("End Date: ", endDate);

    const requestData = {
      startDate: startDate,
      endDate: endDate,
    };
    setOrders([]);
    setOrdersLoading(true);
    try {
      const ordersResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!ordersResponse.ok) {
        throw new Error(`Failed to fetch orders: ${ordersResponse.statusText}`);
      }

      const responseData = await ordersResponse.json();

      // Assuming responseData contains the orders directly, if not, adjust accordingly
      const ordersData = responseData.orders || [];

      console.log("Orders Response: ", ordersResponse);
      console.log("Orders Data: ", ordersData);

      setOrders(ordersData);
      setOrdersLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setOrdersLoading(false);
    }
  };
  const clearOrders = async () => {
    setOrders([]);
    setOrdersLoading(false);
  };

  const clearIngredients = async () => {
    setIngredients([]);
    setIngredientsLoading(false);
  };

  const getIngredients = async () => {
    console.log("Inside Client-side Get Ingredients");

    const requestData = {
      orders: orders,
      orgid: currentOrgId,
    };

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
                    new TextRun(`Date: ${order.iconic_delivery_meta.date}`),
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
    saveAs(new Blob([buffer]), `ingredients-report.docx`);
  };
  if (isLoggedIn) {
    return (
      <>
        <Navbar />
        {ordersLoading || ingredientsLoading ? (
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
        ) : Object.keys(ingredients).length > 0 ? (
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
                      <strong>Quantity:</strong> {details.quantity}{" "}
                      {details.unit}
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
                onClick={() => clearIngredients()}
                color="primary"
              >
                Clear Ingredients
              </Button>
            </div>
          </div>
        ) : orders && orders.length ? (
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
              {orders.map((order, index) => (
                <div key={index} style={{ marginBottom: "20px" }}>
                  <strong>Order ID:</strong> {order.id}{" "}
                  <strong>Customer Name:</strong> {order.billing.first_name}{" "}
                  {order.billing.last_name} <strong>Date:</strong>{" "}
                  {order.iconic_delivery_meta.date}
                  <br />
                  <div style={{ marginLeft: "20px" }}>
                    <strong>Line Items:</strong>
                    {order.line_items.map((item: any, i: any) => (
                      <div
                        key={i}
                        style={{ marginLeft: "20px", marginTop: "5px" }}
                      >
                        <div>
                          <strong>Product Name:</strong> {item.name}
                        </div>
                        <div>
                          <strong>Quantity:</strong> {item.quantity}
                        </div>
                        <div>
                          <strong>Price:</strong> {item.price}{" "}
                          {order.currency_symbol}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "10px" }}>
              <Button
                style={{
                  marginRight: "10px",
                  padding: "5px 10px",
                  borderRadius: "5px",
                }}
                onClick={() => getIngredients()}
                color="primary"
              >
                Get Ingredients
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
                onClick={() => clearOrders()}
                color="primary"
              >
                Clear Orders
              </Button>
            </div>
          </div>
        ) : (
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
        )}
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
