"use client";
import { useUser } from "@propelauth/nextjs/client";
import { Button, Spinner, DatePicker, Card, CardBody } from "@nextui-org/react";
import { useState, useEffect, useCallback } from "react";
import React from "react";
import { saveAs } from "file-saver";
import { demoFlag, not_products } from "@/helpers/utils";
import { generateListOfMealIds, getData } from "@/helpers/frontend";
import { filterOrdersByDate } from "@/helpers/date";
import { generateFullCsvData } from "@/helpers/downloads";
import { now, getLocalTimeZone } from "@internationalized/date";
import FilterDropdown from "@/components/FilterDropdown";
import OrderTable from "@/components/Order/OrderTable";
import { statusOptions } from "@/helpers/utils";
import Papa from "papaparse";
import MealSumTable from "@/components/Order/MealSumTable";
import Searchbar from "@/components/Searchbar";
import {
  calculateMealSum,
  prepareOrderedMeals,
  generateIngredientsReport,
  deliveryList,
} from "@/helpers/order";
import { CircleX } from "lucide-react";
import { useOrgContext } from "@/components/context/OrgContext";
import { CreateOrderModal } from "@/components/Modals/CreateOrderModal";
import { getCategories, getProducts } from "@/helpers/request";

export default function OrdersPage() {
  const { user } = useUser();
  const { currentOrg } = useOrgContext();
  const [org, setOrg] = useState<any>({});

  const [endDate, setEndDate] = useState(now(getLocalTimeZone())); // Default to today's date
  const [startDate, setStartDate] = useState(
    now(getLocalTimeZone()).subtract({ weeks: 1 })
  ); // Default to a week ago
  const [orders, setOrders] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [mealsLoading, setMealsLoading] = useState<boolean>(false);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [orgLoading, setOrgLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [selectedMenuKeys, setSelectedMenuKeys] = useState<any>(
    new Set(["All"])
  );
  const [selectedStatusKeys, setSelectedStatusKeys] = useState<any>(
    new Set(["processing", "completed"])
  );

  const [showLineItems, setShowLineItems] = useState(true);
  const [showCosts, setShowCosts] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [error, setError] = useState<string>("");
  const [deliveryDate, setDeliveryDate] = useState<any>();
  const [searchTerm, setSearchTerm] = useState("");

  const [compositeComponents, setCompositeComponents] = useState<any[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<any>(
    new Set(["All"])
  );
  const [hasCompositeProducts, setHasCompositeProducts] = useState(false);
  const [createOrderModalOpen, setCreateOrderModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  useEffect(() => {
    if (currentOrg && !orgLoading) {
      getOrg(currentOrg);
    }
  }, [currentOrg]);

  const calculateTotalMeals = (orders: any) => {
    return orders.reduce((total: any, order: any) => {
      return (
        total +
        order.line_items.reduce(
          (itemTotal: any, item: any) => itemTotal + item.quantity,
          0
        )
      );
    }, 0);
  };

  const calculateTotalRevenue = (orders: any) => {
    return orders.reduce((total: any, order: any) => {
      return total + parseFloat(order.total);
    }, 0);
  };

  const extractCompositeComponents = (orders: any) => {
    const components = new Set();
    orders.forEach((order: any) => {
      order.line_items.forEach((item: any) => {
        if (item.composite_parent) {
          const compositeData = item.meta_data.find(
            (meta: any) => meta.key === "_composite_data"
          );
          if (compositeData && compositeData.value) {
            Object.values(compositeData.value).forEach((component: any) => {
              components.add(component.title);
            });
          }
        }
      });
    });
    return Array.from(components);
  };

  const checkForCompositeProducts = (orders: any) => {
    return orders.some((order: any) =>
      order.line_items.some((item: any) => item.composite_parent)
    );
  };

  const clearDateButton = (onClear: () => void) => {
    return (
      <Button
        variant="light"
        size="sm"
        isIconOnly
        radius="full"
        disableAnimation
        onClick={onClear}
      >
        <CircleX />
      </Button>
    );
  };
  useEffect(() => {
    if (orders.length > 0) {
      const hasComposite = checkForCompositeProducts(orders);
      setHasCompositeProducts(hasComposite);
      if (hasComposite) {
        const components = extractCompositeComponents(orders);
        setCompositeComponents(components);
      }
    }
  }, [orders]);

  const filterOrdersByComponent = (
    orders: any[],
    selectedKeys: Set<string>
  ) => {
    return orders
      .map((order) => {
        const includedProducts = new Set();
        return {
          ...order,
          line_items: order.line_items.filter((item: any) => {
            if (selectedKeys.has("All")) {
              return true;
            }
            if (item.composite_parent) {
              const compositeData = item.meta_data.find(
                (meta: any) => meta.key === "_composite_data"
              );
              if (compositeData && compositeData.value) {
                const matchedComponent = Object.values(
                  compositeData.value
                ).find(
                  (component: any) =>
                    component.product_id === item.product_id &&
                    selectedKeys.has(component.title)
                );
                if (
                  matchedComponent &&
                  !includedProducts.has(item.product_id)
                ) {
                  includedProducts.add(item.product_id);
                  return true;
                }
              }
            }
            return false;
          }),
        };
      })
      .filter(
        (order) => selectedKeys.has("All") || order.line_items.length > 0
      );
  };

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const getOrders = async () => {
    const url = "/api/woocommerce/getorders";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
    };

    const body = {
      userid: user?.userId,
      startDate: startDate.toString(),
      endDate: endDate.toString(),
    };
    getData(
      "orders",
      url,
      method,
      headers,
      (data) => handleSuccessfulFetch(data),
      setError,
      setOrdersLoading,
      body,
      () => {
        setShowOrders(true);
        fetchProducts();
      },
      (data) => {
        getMeals(data);
      },
      transformOrdersData
    );
  };

  // New function to fetch categories
  const fetchCategories = async () => {
    if (categories.length == 0) {
      setCategoriesLoading(true);
      try {
        const categoriesData = await getCategories(user);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to fetch categories");
      } finally {
        setCategoriesLoading(false);
      }
    } else {
      console.log("Categories already fetched");
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const productsData = await getProducts(user?.userId || "");
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products");
    } finally {
      setProductsLoading(false);
    }
  };

  const getOrg = async (orgid: string) => {
    const url = `/api/org/propelauth/${orgid}`;
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
    };
    getData(
      "org",
      url,
      method,
      headers,
      (org) => {
        setOrg(org);
      },
      setError,
      setOrgLoading
    );
  };

  const getMeals = async (orders: any) => {
    const url = "/api/getmeals";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
    };
    const mealids = generateListOfMealIds(orders);
    console.log("Meal Ids: ", mealids);
    const body = {
      mealids: generateListOfMealIds(orders),
      userid: user?.userId,
    };
    getData(
      "meals",
      url,
      method,
      headers,
      (data) => {
        setMeals(data);
      },
      setError,
      setMealsLoading,
      body
    );
  };

  useEffect(() => {
    const filtered = getFilteredOrders(
      orders,
      selectedMenuKeys,
      selectedStatusKeys,
      selectedComponent
    );
    setFilteredOrders(filtered);
  }, [
    selectedMenuKeys,
    selectedStatusKeys,
    orders,
    deliveryDate,
    searchTerm,
    selectedComponent,
  ]);

  const nameSearch = (orders: any[], searchTerm: string) => {
    // Extract the name search terms (after "name:")
    const nameSearchTerms = searchTerm
      .slice(5)
      .split(",")
      .map((term: string) => term.trim().toLowerCase());

    // Filter orders based on the full name derived from first_name and last_name
    const filteredOrders = orders.filter((order) => {
      const fullName =
        `${order.billing.first_name} ${order.billing.last_name}`.toLowerCase();
      // Check if any of the search terms match the full name
      return nameSearchTerms.some((term) => fullName.includes(term));
    });

    return filteredOrders;
  };

  const handleSuccessfulFetch = (data: any) => {
    setOrders(data);
    setFilteredOrders(data);
    console.log("Orders: ", data);
  };

  const handleDownloadDeliveryList = () => {
    // hardcoding
    const areaZipcodeMap = org.zipcodeMap;
    console.log("Area Zipcode Map: ", areaZipcodeMap);
    deliveryList(filteredOrders, areaZipcodeMap);
  };

  const getFilteredOrders = (
    orders: any[],
    selectedMenuKeys: Set<string>,
    selectedStatusKeys: Set<string>,
    selectedComponent: Set<string>
  ) => {
    console.log("Orders: ", orders);
    let filtered = filterOrdersByStatus(orders, selectedStatusKeys);
    filtered = filterOrdersByCategory(filtered, selectedMenuKeys);
    filtered = filterOrdersByDate(filtered, deliveryDate);
    filtered = filterOrdersByComponent(filtered, selectedComponent);
    filtered = filterBySearch(filtered, searchTerm);
    console.log("Filtered Orders: ", filtered);
    return filtered;
  };

  const filterBySearch = (orders: any[], searchTerm: string) => {
    if (searchTerm.toLowerCase().startsWith("name:")) {
      return nameSearch(orders, searchTerm);
    } else {
      // Regular filter based on id field (unchanged)
      const filteredOrders = orders.filter((order) =>
        order.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      return filteredOrders;
    }
  };

  const filterOrdersByCategory = (orders: any[], selectedKeys: Set<string>) => {
    return orders
      .map((order) => ({
        ...order,
        line_items: order.line_items.filter((item: any) => {
          if (selectedKeys.has("All")) {
            return true;
          }
          const associatedProduct = products.find(
            (product) => product.id === item.product_id
          );
          const itemCategories =
            associatedProduct?.categories?.map(
              (category: any) => category.name
            ) || [];
          return Array.from(selectedKeys).every((selectedCategory: any) =>
            itemCategories.includes(selectedCategory)
          );
        }),
      }))
      .filter(
        (order) => selectedKeys.has("All") || order.line_items.length > 0
      );
  };

  const filterOrdersByStatus = (orders: any[], selectedKeys: Set<string>) => {
    // Check if "All" is in the selectedKeys
    if (selectedKeys.has("All")) {
      return orders;
    }

    // Filter the orders where the status is one of the selected keys
    return orders.filter((order) => selectedKeys.has(order.status));
  };

  const renderComponentFilterDropdown = () => {
    if (!hasCompositeProducts) return null;
    return (
      <div style={{ textAlign: "center" }}>
        <h3 style={{ marginBottom: "10px" }}>Select Meal:</h3>
        <FilterDropdown
          selectedKeys={selectedComponent}
          setSelectedKeys={setSelectedComponent}
          options={compositeComponents.map((component) => ({
            name: component,
          }))}
          selectionMode="single"
        />
      </div>
    );
  };

  const renderCategoryFilterDropdown = () => {
    if (products.length > 0 && !productsLoading && !categoriesLoading) {
      return (
        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "10px" }}>Select Menu:</h3>
          <FilterDropdown
            selectedKeys={selectedMenuKeys}
            setSelectedKeys={setSelectedMenuKeys}
            options={categories}
          />
        </div>
      );
    }
  };

  const renderStatusFilterDropdown = () => {
    return (
      <FilterDropdown
        selectedKeys={selectedStatusKeys}
        setSelectedKeys={setSelectedStatusKeys}
        options={statusOptions}
        preSelectedOptions={["processing", "completed"]}
      />
    );
  };

  const transformOrdersData = (ordersData: any) => {
    try {
      const transformedData = ordersData.map((order: any) => ({
        ...order,
        line_items: order.line_items.filter(
          (item: any) => !not_products.includes(item.name)
        ),
      }));
      return transformedData;
    } catch (error) {
      console.log("Error: ", error);
      return ordersData;
    }
  };

  const clear = async () => {
    clearOrders();
  };
  const clearOrders = async () => {
    setOrders([]);
    setOrdersLoading(false);
    setMealsLoading(false);
    setShowOrders(false);
  };

  const downloadOrders = async (
    ordersData: any,
    startDate: any,
    endDate: any
  ) => {
    console.log("download orders");

    // Group items by name and size
    const itemQuantities = ordersData.reduce(
      (acc: Record<string, number>, order: any) => {
        order.line_items.forEach((item: any) => {
          const sizeMetas = item.meta_data.filter(
            (meta: any) => !meta.key.startsWith("_")
          );

          const sizes =
            sizeMetas.map((meta: any) => meta.value).join(" | ") || "N/A";

          const key = `${item.name}|||${sizes}`;

          if (acc[key]) {
            acc[key] += item.quantity;
          } else {
            acc[key] = item.quantity;
          }
        });
        return acc;
      },
      {}
    );

    // Sort items alphabetically by name (and size implicitly)
    const sortedItemQuantities = Object.entries(itemQuantities).sort(
      ([keyA], [keyB]) => {
        const [nameA] = keyA.split("|||");
        const [nameB] = keyB.split("|||");
        return nameA.localeCompare(nameB);
      }
    );

    // Prepare data for CSV
    const csvData = [
      [`Delivery Dates Range:, ${startDate} - ${endDate}`],
      [],
      ["Meal & Side Name(s)", "Size", "QTY."],
      ...sortedItemQuantities.map(([key, quantity]) => {
        const [name, size] = key.split("|||");
        return [name, size, quantity];
      }),
      [],
      [
        "",
        "Total Qty.",
        sortedItemQuantities.reduce(
          (sum, [, quantity]) => sum + Number(quantity),
          0
        ),
      ],
    ];

    // Generate CSV content
    const csvContent = Papa.unparse(csvData, {
      quotes: true, // Use quotes around all fields
      quoteChar: '"',
      escapeChar: '"',
    });

    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

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
          startContent={clearDateButton(() => {
            setDeliveryDate(null);
          })}
        />
      </div>
    );
  };

  const renderOrderSummary = () => {
    const totalMeals = calculateTotalMeals(filteredOrders);
    const totalRevenue = calculateTotalRevenue(filteredOrders);

    // Function to format currency
    const formatCurrency = (amount: any) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    };

    return (
      <Card className="w-full max-w-sm m-4">
        {" "}
        {/* Added margin (m-4) */}
        <CardBody>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-md">Total Meals:</p>
              <p className="text-2xl font-bold" style={{ color: "green" }}>
                {totalMeals.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-md">Total Revenue:</p>
              <p className="text-2xl font-bold" style={{ color: "green" }}>
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };
  const generateFilteredCsvData = (filteredOrders: any[], meals: any) => {
    // Generate CSV data from filtered orders
    const filteredCsvData = generateFullCsvData(filteredOrders, meals);
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
        {!showLineItems && demoFlag && (
          <StyledButton
            onClick={() => setShowCosts((prev) => !prev)}
            text={"Show Ingredient Costs"}
          />
        )}
        <StyledButton
          onClick={() =>
            generateIngredientsReport(
              meals,
              prepareOrderedMeals(filteredOrders)
            )
          }
          text="Download Ingredients Report"
        />
        <StyledButton
          onClick={() => downloadOrders(filteredOrders, startDate, endDate)}
          text="Download Orders Manifest"
        />
        <StyledButton
          onClick={() => {
            handleDownloadDeliveryList();
          }}
          text="Download Delivery List"
        />
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
              generateFilteredCsvData(filteredOrders, meals),
              `orders-${startDate}-${endDate}-filtered.csv`
            )
          }
          text="Download Labels Manifest"
        />
      </div>
    );
  };

  // Render buttons
  const renderAllButtons = () => {
    return <div>{renderButtons()}</div>;
  };

  const renderOrdersContent = () => {
    if ((ordersLoading && showOrders) || categoriesLoading || mealsLoading) {
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
          {ordersLoading ? (
            <Spinner label="Loading Orders" />
          ) : categoriesLoading ? (
            <Spinner label="Loading Categories" />
          ) : mealsLoading ? (
            <Spinner label="Loading Meals" />
          ) : orgLoading ? (
            <Spinner label="Loading Organization" />
          ) : null}
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    // State variable to toggle between line items and meal quantities
    // Assuming showLineItems and filteredOrders are defined elsewhere
    // Function to calculate the sum of quantities for each meal

    // Function to render individual order details with line items
    const renderLineItems = () => {
      return (
        <OrderTable orders={filteredOrders} onUpdate={() => getOrders()} />
      );
    };

    // Get meal sums
    const mealSum = calculateMealSum(filteredOrders);

    // Function to render search bar with adjusted width
    const renderSearchBar = () => {
      return (
        <Searchbar
          onSearch={handleSearch}
          placeholder="Search orders..."
          tooltipContent='Use "name:" followed by comma-separated names to search for multiple customers, or search by order id'
          width="70%"
        />
      );
    };

    const modals = () => {
      return (
        <CreateOrderModal
          open={createOrderModalOpen}
          onClose={() => setCreateOrderModalOpen(false)}
          onCreate={(order) => handleCreateOrder(order)}
          products={products}
        />
      );
    };

    const handleCreateOrder = async (order: any) => {
      //console.log(parseAbsoluteToLocal(order.date_created));
      const new_endDate = now(getLocalTimeZone()).add({ hours: 1 });
      console.log("New End Date: ", new_endDate);
      console.log("Order Create Time: ", order.date_created);
      setEndDate(new_endDate);
      await getOrders();
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative", // Contain button section within the parent
          boxSizing: "border-box",
          width: "100%", // Make sure the parent container takes full width
        }}
      >
        {modals()}
        {renderOrderSummary()}
        {renderSearchBar()}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
            width: "100%",
          }}
        >
          <StyledButton
            onClick={() => setCreateOrderModalOpen(true)}
            text="Create Order"
          />
          <div style={{ textAlign: "center" }}>
            <h3 style={{ marginBottom: "10px" }}>Delivery Date:</h3>
            {renderDeliveryDateInputs()}
          </div>
          {renderCategoryFilterDropdown()}
          {renderComponentFilterDropdown()}
          <div style={{ textAlign: "center" }}>
            <h3 style={{ marginBottom: "10px" }}>Select Status:</h3>
            {renderStatusFilterDropdown()}
          </div>
          <StyledButton onClick={() => clear()} text="Clear Orders" />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            maxHeight: "calc(60vh - 80px)", // Adjust based on button height
            overflowY: "auto",
            marginTop: "20px",
            width: "100%",
          }}
        >
          {showLineItems ? (
            renderLineItems()
          ) : Object.keys(mealSum).length > 0 ? (
            <MealSumTable mealSum={mealSum} showCosts={showCosts} />
          ) : null}
          <div style={{ height: "80px" }} /> {/* Spacer to prevent overlap */}
        </div>
        <div
          style={{
            position: "sticky", // Use sticky to keep it in view
            bottom: "0",
            width: "100%", // Ensure full width within parent
            padding: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxSizing: "border-box",
            backgroundColor: "transparent", // Ensure no background color
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
              maxValue={endDate?.copy().subtract({ days: 1 })}
              showMonthAndYearPickers
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e)}
              minValue={startDate?.copy().add({ days: 1 })}
              showMonthAndYearPickers
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

  return renderOrdersContent();
}
