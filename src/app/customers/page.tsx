"use client";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { SignupAndLoginButtons } from "@/components/SignupAndLoginButtons";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  getKeyValue,
  Spinner,
} from "@nextui-org/react";
import { useUser } from "@propelauth/nextjs/client";
import { useEffect, useState } from "react";

export default function CustomersPage() {
  const { loading, isLoggedIn, user } = useUser();
  const [customers, setCustomers] = useState<any[]>([]);
  const [showCustomers, setShowCustomers] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const rowsPerPage = 15;

  const getCustomers = async () => {
    setShowCustomers(true);
    console.log("Inside Client-side Get Customers");

    const requestData = {
      userid: user?.userId,
    };

    console.log("Requesting the customers");

    setCustomersLoading(true);

    try {
      const customersResponse = await fetch("api/woocommerce/getcustomers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!customersResponse.ok) {
        if (customersResponse.statusText === "Unauthorized") {
          setError("Incorrect Client Key or Client Secret");
        } else {
          setError(
            `Failed to fetch customers: ${customersResponse.statusText}`
          );
        }
        throw new Error(
          `Failed to fetch customers: ${customersResponse.statusText}`
        );
      }
      setError("");
      const responseData = await customersResponse.json();

      const customersData = responseData.data || [];

      console.log("Customers Response: ", customersResponse);
      console.log("Customers Data: ", customersData);

      setCustomers(customersData);
      setCustomersLoading(false);
      setShowCustomers(true);
      setPages(Math.ceil(customersData.length / rowsPerPage));
    } catch (error) {
      console.error("Error fetching customers: ", error);
      setCustomers([]);
      setCustomersLoading(false);
      setShowCustomers(false);
    }
  };

  useEffect(() => {
    // Check customers.length === 0 to ensure it only runs when the page loads and we don't get subsequent calls to Woocommerce
    if (user && customers.length === 0) {
      getCustomers();
    }
  }, [user, customers, getCustomers]);

  const renderCustomersContent = () => {
    if (customersLoading && showCustomers) {
      return renderLoading();
    } else if (error) {
      return renderError();
    } else if (showCustomers) {
      return renderCustomers();
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
          <Spinner label={"Loading Customers"} />
        </div>
      </div>
    );
  };

  const renderError = () => {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <p style={{ color: "red" }}>Error: {error}</p>
        <button onClick={() => getCustomers()} style={{ marginTop: "10px" }}>
          Retry
        </button>
      </div>
    );
  };

  const renderCustomers = () => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const displayedCustomers = customers.slice(startIndex, endIndex);

    return (
      <div
        style={{
          display: "flex",
          width: "auto",
          height: "80vh",
        }}
      >
        <Table
          isHeaderSticky
          isStriped
          aria-label="Table of Customers"
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
              />
            </div>
          }
        >
          <TableHeader>
            <TableColumn key="first_name">First Name</TableColumn>
            <TableColumn key="last_name">Last Name</TableColumn>
            <TableColumn key="username">Username</TableColumn>
            <TableColumn key="email">Email</TableColumn>
            <TableColumn key="role">Role</TableColumn>
          </TableHeader>
          <TableBody
            items={displayedCustomers}
            loadingContent={<Spinner />}
            loadingState={customersLoading ? "loading" : "idle"}
          >
            {(item) => (
              <TableRow key={item?.username}>
                {(columnKey) => (
                  <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (isLoggedIn) {
    return (
      <div style={{ display: "flex", height: "100vh" }}>
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          {renderCustomersContent()}
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
