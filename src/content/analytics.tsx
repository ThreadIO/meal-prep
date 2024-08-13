import React, { useState, useEffect } from "react";
import { Card, CardBody, Spinner } from "@nextui-org/react";
import { useUser } from "@propelauth/nextjs/client";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Repeat,
  Calendar,
} from "lucide-react";

const formatCurrency = (value: any) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value as number);
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

const AnalyticsDashboard = () => {
  const { user } = useUser();
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [ltvMetrics, setLtvMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userId = user?.userId;
        const currentDate = new Date();
        const startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        const endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );

        const [totalRevenueRes, ltvRes] = await Promise.all([
          fetch("/api/woocommerce/analytics/total-revenue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userid: userId }),
          }),
          fetch("/api/woocommerce/analytics/ltv", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userid: userId }),
          }),
          fetch("/api/woocommerce/analytics/month-revenue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userid: userId,
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
            }),
          }),
        ]);

        const totalRevenueData = await totalRevenueRes.json();
        const ltvData = await ltvRes.json();

        setTotalRevenue(totalRevenueData.data.totalRevenue);
        setOrderCount(totalRevenueData.data.orderCount);
        setLtvMetrics(ltvData.data.metrics);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="flex rounded-lg overflow-hidden border mb-6">
        <KPICard
          title="Total Sales"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign size={24} />}
          isLoading={loading}
        />
        <KPICard
          title="Total Orders"
          value={orderCount}
          icon={<ShoppingCart size={24} />}
          isLoading={loading}
        />
        <KPICard
          title="Avg. Order Value"
          value={formatCurrency(ltvMetrics?.avgOrderValue)}
          icon={<DollarSign size={24} />}
          isLoading={loading}
        />
        <KPICard
          title="Total Customers"
          value={ltvMetrics?.totalCustomers}
          icon={<Users size={24} />}
          isLoading={loading}
        />
      </div>

      {/* Customer Metrics */}
      <h2 className="text-2xl font-bold mb-4">Customer Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CustomerMetricCard
          title="Average Orders per Customer"
          value={ltvMetrics?.avgPurchaseFrequency.toFixed(2)}
          subvalue="Frequency of purchases"
          icon={<Repeat size={20} />}
          isLoading={loading}
        />
        <CustomerMetricCard
          title="Average Order Value"
          value={formatCurrency(ltvMetrics?.avgOrderValue.toFixed(2))}
          subvalue="Typical purchase amount"
          icon={<DollarSign size={20} />}
          isLoading={loading}
        />
        <CustomerMetricCard
          title="Average Customer Lifetime Value"
          value={formatCurrency(ltvMetrics?.lifetimeValue.toFixed(2))}
          subvalue={`Over ${ltvMetrics?.avgCustomerLifespan.toFixed(0)} days`}
          icon={<Calendar size={20} />}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
