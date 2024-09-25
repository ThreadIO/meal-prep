"use client";
import { useState } from "react";
import { Sidebar, SidebarCTA } from "flowbite-react";
import {
  // BarChart,
  ClipboardList,
  CookingPot,
  ShoppingBag,
  ShoppingCart,
  Users,
  Settings,
  SquarePercent,
  Shield,
  Truck,
} from "lucide-react";
import { useUser } from "@propelauth/nextjs/client";
import BusinessIcon from "@/components/BusinessIcon";
import UserProfile from "@/components/UserProfile";
import { AccountModal } from "@/components/Modals/AccountModal";
import Link from "next/link";
import { useNavigationContext } from "@/components/context/NavigationContext";
import { useOrgContext } from "@/components/context/OrgContext";
const betaMode = false; // Set to true to enable beta mode, false to disable

const SidebarComponent = () => {
  const { user } = useUser();
  const { setCurrentPage } = useNavigationContext();
  const { currentOrg } = useOrgContext();
  const [openAccount, setOpenAccount] = useState(false);
  const org = user?.getOrg(currentOrg);
  const isOwner = org?.isRole("Owner");
  return (
    <Sidebar className="h-full w-64 bg-gray-50 dark:bg-gray-800 transition-all duration-300 flex flex-col">
      <div>
        <div className="mt-5 mb-4 flex items-center pl-2.5">
          <Link
            href="/"
            style={{
              textDecoration: "none",
            }}
          >
            <BusinessIcon
              width={100}
              height={100}
              alt="Navigate to home page"
              className="opacity-100 z-0 img-bkgd"
              style={{
                zIndex: 50,
              }}
            />
          </Link>
        </div>
        <Sidebar.ItemGroup className="mt-4 space-y-2 border-t border-gray-200 pt-4 first:mt-0 first:border-t-0 first:pt-0 dark:border-gray-700">
          <SidebarCTA>
            <div className="flex items-center">
              <div
                onClick={() => setOpenAccount(true)}
                className="mr-2 focus:outline-none"
              >
                {user?.email}
              </div>
              <button
                onClick={() => setOpenAccount(true)}
                className="focus:outline-none"
              >
                <UserProfile user={user} />
              </button>
            </div>
          </SidebarCTA>
          <AccountModal
            open={openAccount}
            onClose={() => setOpenAccount(false)}
          />
        </Sidebar.ItemGroup>
        <Sidebar.ItemGroup className="mt-4 space-y-2 border-t border-gray-200 pt-4 first:mt-0 first:border-t-0 first:pt-0 dark:border-gray-700">
          {betaMode && (
            <Sidebar.Item
              href="/customers"
              icon={Users}
              className="flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              Customers
            </Sidebar.Item>
          )}
          {/* <Sidebar.Item
            icon={BarChart}
            onClick={() => setCurrentPage("analytics")}
            className="flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          >
            Analytics
          </Sidebar.Item> */}
          <Sidebar.Item
            icon={CookingPot}
            onClick={() => setCurrentPage("meals")}
            className="flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          >
            Meals
          </Sidebar.Item>
          <Sidebar.Item
            onClick={() => setCurrentPage("orders")}
            icon={ShoppingBag}
            className="flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          >
            Orders
          </Sidebar.Item>
          {betaMode && (
            <Sidebar.Item
              href="/pricing"
              icon={ShoppingCart}
              className="flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              Pricing
            </Sidebar.Item>
          )}
          {betaMode && (
            <Sidebar.Item
              href="/deposit-report"
              icon={ClipboardList}
              className="flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              Reports
            </Sidebar.Item>
          )}
          <Sidebar.Item
            onClick={() => setCurrentPage("delivery")}
            icon={Truck}
            className="flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          >
            Delivery
          </Sidebar.Item>
          <Sidebar.Item
            onClick={() => setCurrentPage("coupons")}
            icon={SquarePercent}
            className="flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          >
            Coupons
          </Sidebar.Item>
        </Sidebar.ItemGroup>
        <Sidebar.ItemGroup className="mt-4 space-y-2 border-t border-gray-200 pt-4 first:mt-0 first:border-t-0 first:pt-0 dark:border-gray-700">
          <Sidebar.Item
            onClick={() => setCurrentPage("settings")}
            icon={Settings}
            className="flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          >
            Settings
          </Sidebar.Item>
          {isOwner && (
            <Sidebar.Item
              onClick={() => setCurrentPage("admin")}
              icon={Shield}
              className="flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              Admin Panel
            </Sidebar.Item>
          )}
        </Sidebar.ItemGroup>
      </div>
    </Sidebar>
  );
};

export default SidebarComponent;
