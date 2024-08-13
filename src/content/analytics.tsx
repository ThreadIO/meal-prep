import React from "react";
import { Card, CardBody, Spinner } from "@nextui-org/react";
import { useUser } from "@propelauth/nextjs/client";
import { useQuery } from "react-query";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Repeat,
  Calendar,
} from "lucide-react";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const KPICard = ({
  title,
  value,
  icon,
  isLoading,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  isLoading: boolean;
}) => (
  <Card className="flex-1 border-r last:border-r-0" radius="none" shadow="none">
    <CardBody className="p-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm mb-1">{title}</h3>
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <p className="text-2xl font-bold">{value}</p>
          )}
        </div>
        <div>{icon}</div>
      </div>
    </CardBody>
  </Card>
);

type CustomerMetricCardProps = {
  title: string;
  value: string;
  subvalue: string;
  icon: React.ReactNode;
  isLoading: boolean;
};

const CustomerMetricCard = ({
  title,
  value,
  subvalue,
  icon,
  isLoading,
}: CustomerMetricCardProps) => (
  <Card className="flex-1">
    <CardBody className="p-4">
      <div className="flex items-center mb-2">
        {icon}
        <h3 className="text-sm ml-2">{title}</h3>
      </div>
      {isLoading ? (
        <Spinner size="sm" />
      ) : (
        <>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-500">{subvalue}</p>
        </>
      )}
    </CardBody>
  </Card>
);

const fetchTotalRevenue = async (userId: string) => {
  const res = await fetch("/api/woocommerce/analytics/total-revenue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userid: userId }),
  });
  return res.json();
};

const fetchLtvMetrics = async (userId: string) => {
  const res = await fetch("/api/woocommerce/analytics/ltv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userid: userId }),
  });
  return res.json();
};

const AnalyticsDashboard = () => {
  const { user } = useUser();

  const queryOptions = {
    enabled: !!user?.userId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  };

  const { data: totalRevenueData, isLoading: totalRevenueLoading } = useQuery(
    ["totalRevenue", user?.userId],
    () => fetchTotalRevenue(user?.userId ?? ""),
    queryOptions
  );

  const { data: ltvData, isLoading: ltvLoading } = useQuery(
    ["ltvMetrics", user?.userId],
    () => fetchLtvMetrics(user?.userId ?? ""),
    queryOptions
  );

  const totalRevenue = totalRevenueData?.data?.totalRevenue;
  const orderCount = totalRevenueData?.data?.orderCount;
  const ltvMetrics = ltvData?.data?.metrics;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="flex rounded-lg overflow-hidden border mb-6">
        <KPICard
          title="Total Sales"
          value={totalRevenue ? formatCurrency(totalRevenue) : "-"}
          icon={<DollarSign size={24} />}
          isLoading={totalRevenueLoading}
        />
        <KPICard
          title="Total Orders"
          value={orderCount ?? "-"}
          icon={<ShoppingCart size={24} />}
          isLoading={totalRevenueLoading}
        />
        <KPICard
          title="Avg. Order Value"
          value={
            ltvMetrics?.avgOrderValue
              ? formatCurrency(ltvMetrics.avgOrderValue)
              : "-"
          }
          icon={<DollarSign size={24} />}
          isLoading={ltvLoading}
        />
        <KPICard
          title="Total Customers"
          value={ltvMetrics?.totalCustomers ?? "-"}
          icon={<Users size={24} />}
          isLoading={ltvLoading}
        />
      </div>

      {/* Customer Metrics */}
      <h2 className="text-2xl font-bold mb-4">Customer Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CustomerMetricCard
          title="Average Orders per Customer"
          value={
            ltvMetrics?.avgPurchaseFrequency
              ? ltvMetrics.avgPurchaseFrequency.toFixed(2)
              : "-"
          }
          subvalue="Frequency of purchases"
          icon={<Repeat size={20} />}
          isLoading={ltvLoading}
        />
        <CustomerMetricCard
          title="Average Order Value"
          value={
            ltvMetrics?.avgOrderValue
              ? formatCurrency(ltvMetrics.avgOrderValue)
              : "-"
          }
          subvalue="Typical purchase amount"
          icon={<DollarSign size={20} />}
          isLoading={ltvLoading}
        />
        <CustomerMetricCard
          title="Average Customer Lifetime Value"
          value={
            ltvMetrics?.lifetimeValue
              ? formatCurrency(ltvMetrics.lifetimeValue)
              : "-"
          }
          subvalue={
            ltvMetrics?.avgCustomerLifespan
              ? `Over ${ltvMetrics.avgCustomerLifespan.toFixed(0)} days`
              : "-"
          }
          icon={<Calendar size={20} />}
          isLoading={ltvLoading}
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
