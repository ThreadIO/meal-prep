import Link from "next/link";
import { withAuthInfo } from "@propelauth/react";
import AccountModal from "@/components/Modals/AccountModal";
import { useState } from "react";
import UserProfile from "@/components/UserProfile";
import BusinessIcon from "@/components/BusinessIcon";
import { useTheme } from "next-themes";
const Navbar = withAuthInfo((props) => {
  const [openAccount, setOpenAccount] = useState(false);
  const { theme } = useTheme();
  return (
    <div
      className="navbar bg-gray-900"
      style={{
        backgroundColor: theme === "dark" ? "#333333" : "#f5f5f5",
        zIndex: 50,
        textAlign: "right",
        paddingRight: "3vh",
        paddingBottom: "2vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Link
        href="/"
        style={{
          marginRight: "1rem",
          marginTop: "20px",
          textDecoration: "none",
        }}
      >
        <BusinessIcon
          width={100}
          height={100}
          alt="Navigate to home page"
          className="opacity-100 z-0 img-bkgd"
          style={{
            top: "20px",
            right: "20px",
            zIndex: 50,
            paddingLeft: "1rem",
          }}
        />
      </Link>
      <button
        onClick={() => setOpenAccount(true)}
        style={{
          marginLeft: "1rem",
          marginTop: "20px",
          border: "none",
          cursor: "pointer",
        }}
      >
        <UserProfile user={props.user} />
      </button>
      <AccountModal open={openAccount} onClose={() => setOpenAccount(false)} />
    </div>
  );
});

export default Navbar;
