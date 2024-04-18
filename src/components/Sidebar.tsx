import { useState } from "react";
import { Sidebar, SidebarCTA } from "flowbite-react";
import { ShoppingBag } from "lucide-react";
import { useUser } from "@propelauth/nextjs/client";
import BusinessIcon from "@/components/BusinessIcon";
import UserProfile from "@/components/UserProfile";
import { AccountModal } from "@/components/Modals/AccountModal";
const SidebarComponent = () => {
  const { user } = useUser();
  const [openAccount, setOpenAccount] = useState(false);

  return (
    <Sidebar className="h-full w-64 bg-gray-50 dark:bg-gray-800 transition-all duration-300 flex flex-col">
      <div>
        <div className="mt-5 mb-4 flex items-center pl-2.5">
          <BusinessIcon
            width={100}
            height={100}
            alt="Navigate to home page"
            className="opacity-100 z-0 img-bkgd"
            style={{
              zIndex: 50,
            }}
          />
        </div>
        <Sidebar.ItemGroup className="mt-4 space-y-2 border-t border-gray-200 pt-4 first:mt-0 first:border-t-0 first:pt-0 dark:border-gray-700">
          <SidebarCTA>
            <div className="flex items-center">
              <div className="mr-2">{user?.email}</div>
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
          <Sidebar.Item
            href="/orders"
            icon={ShoppingBag}
            className="flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          >
            Orders
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </div>
    </Sidebar>
  );
};

export default SidebarComponent;
