"use client";
import { useUser } from "@propelauth/nextjs/client";
import { Button, Spinner, DatePicker } from "@nextui-org/react";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import React from "react";
import { SignupAndLoginButtons } from "@/components/SignupAndLoginButtons";
import { saveAs } from "file-saver";
import { not_products } from "@/helpers/utils";
import { getCategories, getData } from "@/helpers/frontend";
import { filterOrdersByDate } from "@/helpers/date";
import { generateFullCsvData } from "@/helpers/downloads";
import { today, getLocalTimeZone } from "@internationalized/date";
import FilterDropdown from "@/components/FilterDropdown";
import OrderTable from "@/components/Order/OrderTable";
import { statusOptions } from "@/helpers/utils";
export default function OrdersPage() {
  const { loading, isLoggedIn, user } = useUser();
  const [endDate, setEndDate] = useState(today(getLocalTimeZone())); // Default to today's date
  const [startDate, setStartDate] = useState(
    today(getLocalTimeZone()).subtract({ weeks: 1 })
  ); // Default to a week ago
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [selectedMenuKeys, setSelectedMenuKeys] = useState<any>(
    new Set(["All"])
  );
  const [selectedStatusKeys, setSelectedStatusKeys] = useState<any>(
    new Set(["All"])
  );

  const [showLineItems, setShowLineItems] = useState(true);
  const [showOrders, setShowOrders] = useState(false);
  const [error, setError] = useState<string>("");
  const [deliveryDate, setDeliveryDate] = useState<any>();

  const getOrders = async () => {
    const url = "/api/woocommerce/getorders";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
    };
    const start_one = startDate.copy().subtract({ days: 1 }).toString();
    const end_one = endDate.copy().add({ days: 1 }).toString();
    const body = {
      userid: user?.userId,
      startDate: start_one,
      endDate: end_one,
    };
    getData(
      "orders",
      url,
      method,
      headers,
      (data) => {
        setOrders(data);
        setFilteredOrders(data);
      },
      setError,
      setOrdersLoading,
      body,
      () => {
        setShowOrders(true);
        getCategories(user, setCategories, setError, setCategoriesLoading);
      },
      () => {},
      transformOrdersData
    );
    console.log("Orders: ", orders);
  };

  useEffect(() => {
    console.log("Local time zone: ", getLocalTimeZone());
    const filtered = getFilteredOrders(
      orders,
      selectedMenuKeys,
      selectedStatusKeys
    );
    setFilteredOrders(filtered);
  }, [selectedMenuKeys, selectedStatusKeys, orders, deliveryDate]);

  const getFilteredOrders = (
    orders: any[],
    selectedMenuKeys: Set<string>,
    selectedStatusKeys: Set<string>
  ) => {
    const filteredByStatus = filterOrdersByStatus(orders, selectedStatusKeys);
    const filteredByCategory = filterOrdersByCategory(
      filteredByStatus,
      selectedMenuKeys
    );
    const filteredByDate = filterOrdersByDate(filteredByCategory, deliveryDate);
    return filteredByDate;
  };

  const filterOrdersByCategory = (orders: any[], selectedKeys: Set<string>) => {
    return orders
      .map((order) => ({
        ...order,
        line_items: order.line_items.filter((item: any) => {
          if (selectedKeys.has("All")) {
            return true;
          }
          const itemCategories = item.product_data.categories.map(
            (category: any) => category.name
          );
          return Array.from(selectedKeys).every((selectedCategory: any) =>
            itemCategories.includes(selectedCategory)
          );
        }),
      }))
      .filter((order) => order.line_items.length > 0);
  };

  const filterOrdersByStatus = (orders: any[], selectedKeys: Set<string>) => {
    // Check if "All" is in the selectedKeys
    if (selectedKeys.has("All")) {
      return orders;
    }

    // Filter the orders where the status is one of the selected keys
    return orders.filter((order) => selectedKeys.has(order.status));
  };

  const renderCategoryFilterDropdown = () => {
    return (
      <FilterDropdown
        selectedKeys={selectedMenuKeys}
        setSelectedKeys={setSelectedMenuKeys}
        options={categories}
      />
    );
  };

  const renderStatusFilterDropdown = () => {
    return (
      <FilterDropdown
        selectedKeys={selectedStatusKeys}
        setSelectedKeys={setSelectedStatusKeys}
        options={statusOptions}
      />
    );
  };

  const transformOrdersData = (ordersData: any) => {
    return ordersData.map((order: any) => ({
      ...order,
      line_items: order.line_items.filter(
        (item: any) => !not_products.includes(item.name)
      ),
    }));
  };

  const clear = async () => {
    clearOrders();
  };
  const clearOrders = async () => {
    setOrders([]);
    setOrdersLoading(false);
    setShowOrders(false);
  };

  const downloadOrders = async (
    ordersData: any,
    startDate: any,
    endDate: any
  ) => {
    console.log("download orders");

    // CSV Header
    let csvContent =
      "Delivery Dates Range:, " + startDate + " - " + endDate + "\n\n";
    csvContent += "Meal & Side Name(s), QTY.\n";

    // Group items by name and sort alphabetically
    const itemQuantities = ordersData.reduce((acc: any, order: any) => {
      order.line_items.forEach((item: any) => {
        if (acc[item.name]) {
          acc[item.name] += item.quantity;
        } else {
          acc[item.name] = item.quantity;
        }
      });
      return acc;
    }, {});

    // Sort items alphabetically by name
    const sortedItemQuantities = Object.entries(itemQuantities).sort(
      ([nameA], [nameB]) => nameA.localeCompare(nameB)
    );

    // Construct CSV lines from sorted grouped data
    const lines = sortedItemQuantities.map(
      ([name, quantity]) => `"${name}", ${quantity}`
    );

    // Add each line to the CSV content
    csvContent += lines.join("\n") + "\n\n";

    // Calculate total quantity
    const totalQuantity = sortedItemQuantities.reduce(
      (sum, [, quantity]: any) => sum + quantity,
      0
    );

    // Add total quantity to the CSV content
    csvContent += `Total Qty., ${totalQuantity}`;

    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: "text/csv" });

    // Save the CSV file
    saveAs(blob, `orders-${startDate}-${endDate}.csv`);
  };

  const renderDeliveryDateInputs = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <DatePicker
          label="Delivery Date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e)}
        />
      </div>
    );
  };

  const generateFilteredCsvData = (filteredOrders: any[]) => {
    // Generate CSV data from filtered orders
    const filteredCsvData = generateFullCsvData(filteredOrders);
    return filteredCsvData;
  };

  // Function to handle downloading CSV file
  const downloadCsv = (data: string, fileName: string) => {
    const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, fileName);
  };

  // Reusable Button component with consistent styling
  const StyledButton = ({
    onClick,
    text,
  }: {
    onClick: () => void;
    text: string;
  }) => {
    return (
      <Button
        style={{
          marginRight: "10px",
          padding: "5px 10px",
          borderRadius: "5px",
        }}
        size="sm"
        onClick={onClick}
        color="primary"
      >
        {text}
      </Button>
    );
  };

  // Render buttons with StyledButton component
  const renderButtons = () => {
    return (
      <div
        style={{
          marginTop: "20px",
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        <StyledButton
          onClick={() => setShowLineItems((prev) => !prev)}
          text={showLineItems ? "Show Meal Quantities" : "Show Line Items"}
        />
        <StyledButton
          onClick={() => downloadOrders(orders, startDate, endDate)}
          text="Download Orders"
        />
        <StyledButton onClick={() => clear()} text="Clear Orders" />
        {renderCsvDownloadButtons()}
      </div>
    );
  };

  // Render buttons for CSV download
  const renderCsvDownloadButtons = () => {
    return (
      <div>
        <StyledButton
          onClick={() =>
            downloadCsv(
              generateFullCsvData(orders),
              `orders-${startDate}-${endDate}-full.csv`
            )
          }
          text="Download Full Labels CSV"
        />
        <StyledButton
          onClick={() =>
            downloadCsv(
              generateFilteredCsvData(filteredOrders),
              `orders-${startDate}-${endDate}-filtered.csv`
            )
          }
          text="Download Filtered Labels CSV"
        />
      </div>
    );
  };

  // Render buttons
  const renderAllButtons = () => {
    return <div>{renderButtons()}</div>;
  };

  const renderOrdersContent = () => {
    if ((ordersLoading && showOrders) || categoriesLoading) {
      return renderLoading();
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

  const renderOrders = () => {
    // State variable to toggle between line items and meal quantities

    // Function to calculate the sum of quantities for each meal
    const calculateMealSum = () => {
      const mealSum: { [key: string]: number } = {}; // Define mealSum with type annotation

      filteredOrders.forEach((order) => {
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
      return (
        <OrderTable orders={filteredOrders} onUpdate={() => getOrders()} />
      );
    };

    // Get meal sums
    const mealSum = calculateMealSum();

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "20px",
          position: "relative",
          minHeight: "100vh",
          boxSizing: "border-box",
          paddingBottom: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
            width: "100%",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h3 style={{ marginBottom: "10px" }}>Delivery Date:</h3>
            {renderDeliveryDateInputs()}
          </div>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ marginBottom: "10px" }}>Select Menu:</h3>
            {renderCategoryFilterDropdown()}
          </div>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ marginBottom: "10px" }}>Select Status:</h3>
            {renderStatusFilterDropdown()}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxHeight: "65vh",
            overflowY: "auto",
            marginTop: "20px",
            width: "100%",
          }}
        >
          {showLineItems
            ? renderLineItems()
            : Object.keys(mealSum).length > 0
              ? renderMealSum(mealSum)
              : null}
        </div>

        <div
          style={{
            position: "fixed",
            bottom: "0",
            width: "100%",
            padding: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxSizing: "border-box", // Ensure padding is included in total height
          }}
        >
          {renderAllButtons()}
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
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e)}
              maxValue={endDate.copy().subtract({ days: 1 })}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e)}
              minValue={startDate.copy().add({ days: 1 })}
            />
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
