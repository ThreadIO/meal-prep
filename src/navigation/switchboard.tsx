import React from "react";
import { useNavigationContext } from "@/components/context/NavigationContext";
import MealContent from "@/content/meals";
import OrderContent from "@/content/orders";
import Settings from "@/content/settings";
import Coupons from "@/content/coupons";
import Admin from "@/content/admin";
const SwitchContent: React.FC = () => {
  const { currentPage } = useNavigationContext();

  const renderContent = () => {
    switch (currentPage) {
      case "meals":
        return <MealContent />;
      case "orders":
        return <OrderContent />;
      // Add more cases for other pages
      case "settings":
        return <Settings />;
      case "coupons":
        return <Coupons />;
      case "admin":
        return <Admin />;
      default:
        return <div></div>;
    }
  };

  return renderContent();
};

export default SwitchContent;
