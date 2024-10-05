"use client";
import { useUser } from "@propelauth/nextjs/client";
import {
  Button,
  Spinner,
  Card,
  CardBody,
  DateRangePicker,
} from "@nextui-org/react";
import { useState, useEffect, useCallback, useMemo } from "react";
import React from "react";
import { saveAs } from "file-saver";
import { demoFlag, not_products } from "@/helpers/utils";
import { generateListOfMealIds } from "@/helpers/frontend";
import {
  filterOrdersByDateRange,
  convertCalendarToZonedDateTime,
} from "@/helpers/date";
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
  downloadNameTags,
} from "@/helpers/order";
import { CircleX } from "lucide-react";
import { useOrgContext } from "@/components/context/OrgContext";
import { CreateOrderModal } from "@/components/Modals/CreateOrderModal";
import {
  getAllMeals,
  getCategories,
  getProducts,
  getOrders,
} from "@/helpers/request";
import { useQuery, useQueryClient } from "react-query";
import {
  filterOrdersByStatus,
  filterOrdersByCategory,
  filterBySearch,
  filterOrdersByComponent,
} from "@/helpers/filters";
import { renderDateInputs } from "@/content/orders/dateinputs";
import { StyledButton } from "@/components/StyledButton";
import { ClientModal } from "@/components/Modals/ClientModal";

export default function OrdersPage() {
  const { user } = useUser();
  const { org, isLoading: orgLoading } = useOrgContext();
  const queryClient = useQueryClient();
  const [endDate, setEndDate] = useState(now(getLocalTimeZone())); // Default to today's date
  const [startDate, setStartDate] = useState(
    now(getLocalTimeZone()).subtract({ weeks: 1 })
  ); // Default to a week ago
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

  const [deliveryDateRange, setDeliveryDateRange] = useState<any>({
    start: null,
    end: null,
  });

  const [deliveryStartDate, setDeliveryStartDate] = useState<any>(null);
  const [deliveryEndDate, setDeliveryEndDate] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [compositeComponents, setCompositeComponents] = useState<any[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<any>(
    new Set(["All"])
  );
  const [hasCompositeProducts, setHasCompositeProducts] = useState(false);
  const [createOrderModalOpen, setCreateOrderModalOpen] = useState(false);

  const [mode, setMode] = useState("delivery");
  const [loading, setLoading] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);

  const queryKey = ["orders", user?.userId, startDate, endDate];

  const triggerFetchOrders = async (mode: string) => {
    // Ideally this should be just a 2 week band, but need to restructure to code so that it can handle large date ranges
    console.log("trigger fetch orders");
    if (mode === "delivery") {
      const today = now(getLocalTimeZone());
      let weekAgo = today
        .subtract({ weeks: 2 })
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      if (org?.name == "JustFit Kitchen") {
        weekAgo = today
          .subtract({ weeks: 1 })
          .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      }
      const start = convertCalendarToZonedDateTime(
        deliveryDateRange.start,
        0,
        0
      );
      const end = convertCalendarToZonedDateTime(deliveryDateRange.end, 23, 59);

      const newStartDate = deliveryDateRange.start
        ? start.copy().subtract({ weeks: 1 })
        : now(getLocalTimeZone()).subtract({ weeks: 1 });

      const newEndDate = deliveryDateRange.end ? end : now(getLocalTimeZone());

      if (newStartDate > weekAgo) {
        setStartDate(weekAgo);
      } else {
        setStartDate(newStartDate);
      }
      if (newEndDate > today) {
        setEndDate(today);
      } else {
        setEndDate(newEndDate);
      }

      console.log("Start Date: ", startDate);
      console.log("End Date: ", endDate);
      setDeliveryDateRange({
        start: deliveryDateRange.start,
        end: deliveryDateRange.end,
      });
    }
    setDeliveryStartDate(deliveryDateRange.start);
    setDeliveryEndDate(deliveryDateRange.end);
    setLoading(true);
    console.log("refetching orders");
    await refetchOrders();
    console.log("refetched orders");

    setShowOrders(true);
    setLoading(false);
  };

  const {
    data: orders = [],
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useQuery(
    ["orders", user?.userId, startDate, endDate],
    async () => {
      const ordersData = await getOrders({
        userid: user?.userId,
        startDate: startDate.toString(),
        endDate: endDate.toString(),
      });
      return transformOrdersData(ordersData);
    },
    {
      onError: (error: any) => {
        console.error("Error fetching orders: ", error.message);
        setError(`Error fetching orders: ${error.message}`);
      },
      enabled: !!user?.userId && showOrders,
    }
  );

  const { data: categories = [], isLoading: categoriesLoading } = useQuery(
    ["categories", user?.userId],
    () => getCategories(user),
    {
      onError: (error: any) => {
        console.error("Error fetching categories: ", error.message);
        setError(`Error fetching categories: ${error.message}`);
      },
      enabled: !!user?.userId,
    }
  );

  const { data: meals = [], isLoading: mealsLoading } = useQuery(
    ["meals", user?.userId],
    () => getAllMeals(user?.userId ?? "", generateListOfMealIds(orders)),
    {
      onError: (error: any) => {
        console.error("Error fetching meals: ", error.message);
        setError(`Error fetching meals: ${error.message}`);
      },
      enabled: !!user?.userId,
    }
  );

  const { data: products = [], isLoading: productsLoading } = useQuery(
    ["products", user?.userId],
    () => getProducts(user?.userId ?? ""),
    {
      onError: (error: any) => {
        console.error("Error fetching products: ", error.message);
        setError(`Error fetching products: ${error.message}`);
      },
      enabled: !!user?.userId,
    }
  );

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

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    let filtered = filterOrdersByStatus(orders, selectedStatusKeys);
    filtered = filterOrdersByCategory(filtered, selectedMenuKeys, products);
    filtered = filterOrdersByDateRange(
      filtered,
      deliveryStartDate,
      deliveryEndDate
    );
    filtered = filterOrdersByComponent(filtered, selectedComponent);
    filtered = filterBySearch(filtered, searchTerm);
    return filtered;
  }, [
    orders,
    products,
    selectedStatusKeys,
    selectedMenuKeys,
    deliveryStartDate,
    deliveryEndDate,
    selectedComponent,
    searchTerm,
  ]);

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

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleDownloadDeliveryList = () => {
    // hardcoding
    const areaZipcodeMap = org.zipcodeMap;
    console.log("Area Zipcode Map: ", areaZipcodeMap);
    deliveryList(
      filteredOrders,
      areaZipcodeMap,
      generateDescriptiveFilename("delivery_list_")
    );
  };

  const handleClientListUpload = () => {
    // hardcoding
    setClientModalOpen(true);
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
          selectionMode="multiple"
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
      <div style={{ textAlign: "center" }}>
        <h3 style={{ marginBottom: "10px" }}>Select Status:</h3>
        <FilterDropdown
          selectedKeys={selectedStatusKeys}
          setSelectedKeys={setSelectedStatusKeys}
          options={statusOptions}
          preSelectedOptions={["processing", "completed"]}
        />
      </div>
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

  const clearOrders = () => {
    queryClient.setQueryData(queryKey, []);
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
    saveAs(blob, generateDescriptiveFilename("orders_"));
  };

  const renderDeliveryDateInputs = () => {
    return (
      <div style={{ textAlign: "center" }}>
        <h3 style={{ marginBottom: "10px" }}>Delivery Date Range:</h3>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <DateRangePicker
            label="Delivery Date Range"
            value={{
              start: deliveryStartDate,
              end: deliveryEndDate,
            }}
            onChange={({ start, end }) => {
              setDeliveryStartDate(start);
              setDeliveryEndDate(end);
            }}
            granularity="day"
            showMonthAndYearPickers
            startContent={clearDateButton(() => {
              setDeliveryStartDate(null);
              setDeliveryEndDate(null);
            })}
          />
        </div>
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

  // New function to generate a descriptive filename
  const generateDescriptiveFilename = (descriptors: string) => {
    const dateRange = `${startDate.toString()}_to_${endDate.toString()}`;
    const statusFilter = Array.from(selectedStatusKeys).join("-");
    const menuFilter = Array.from(selectedMenuKeys).join("-");
    const componentFilter = Array.from(selectedComponent).join("-");

    let filename = `${dateRange}`;

    // Add delivery date range if it's set
    if (deliveryStartDate && deliveryEndDate) {
      filename += `_delivery_${deliveryStartDate.toString()}_to_${deliveryEndDate.toString()}`;
    }

    if (statusFilter !== "All") filename += `_status_${statusFilter}`;
    if (menuFilter !== "All") filename += `_menu_${menuFilter}`;
    if (componentFilter !== "All") filename += `_component_${componentFilter}`;
    if (searchTerm) filename += `_search_${searchTerm.replace(/\s+/g, "-")}`;

    return `${descriptors}${filename}.csv`;
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
              prepareOrderedMeals(filteredOrders),
              generateDescriptiveFilename("ingredients_report_")
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
        <StyledButton
          onClick={() => {
            downloadNameTags(
              filteredOrders,
              generateDescriptiveFilename("name_tags_")
            );
          }}
          text="Download Name Tags with Address"
        />
        <StyledButton
          onClick={() => {
            handleClientListUpload();
          }}
          text="Check Client List"
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
              generateDescriptiveFilename("labels_")
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
    if (
      (ordersLoading && showOrders) ||
      categoriesLoading ||
      mealsLoading ||
      orgLoading ||
      productsLoading ||
      loading
    ) {
      return renderLoading();
    } else if (showOrders) {
      return renderOrders();
    } else {
      return renderDateInputs(
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        triggerFetchOrders,
        error,
        mode,
        setMode,
        deliveryStartDate,
        setDeliveryStartDate,
        deliveryEndDate,
        setDeliveryEndDate,
        deliveryDateRange,
        setDeliveryDateRange
      );
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
          {ordersLoading || loading ? (
            <Spinner label="Loading Orders" />
          ) : categoriesLoading ? (
            <Spinner label="Loading Categories" />
          ) : mealsLoading ? (
            <Spinner label="Loading Meals" />
          ) : productsLoading ? (
            <Spinner label="Loading Products" />
          ) : orgLoading ? (
            <Spinner label="Loading Organization" />
          ) : null}
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    // Function to render individual order details with line items
    const renderLineItems = () => {
      return (
        <OrderTable
          orders={filteredOrders}
          onUpdate={() =>
            queryClient.invalidateQueries(["orders", user?.userId])
          }
        />
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
        <>
          <CreateOrderModal
            open={createOrderModalOpen}
            onClose={() => setCreateOrderModalOpen(false)}
            onCreate={(order) => handleCreateOrder(order)}
            products={products}
          />
          <ClientModal
            open={clientModalOpen}
            onClose={() => setClientModalOpen(false)}
            orders={filteredOrders}
          />
        </>
      );
    };

    const handleCreateOrder = async (order: any) => {
      //console.log(parseAbsoluteToLocal(order.date_created));
      const new_endDate = now(getLocalTimeZone()).add({ hours: 1 });
      console.log("New End Date: ", new_endDate);
      console.log("Order Create Time: ", order.date_created);
      setEndDate(new_endDate);
      queryClient.invalidateQueries(["orders", user?.userId]);
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
          {renderDeliveryDateInputs()}
          {renderCategoryFilterDropdown()}
          {renderComponentFilterDropdown()}
          {renderStatusFilterDropdown()}
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

  return renderOrdersContent();
}
