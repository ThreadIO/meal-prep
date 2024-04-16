"use client";
import { useUser } from "@propelauth/nextjs/client";
import { AccountModal } from "@/components/Modals/AccountModal";
import { useState } from "react";
import UserProfile from "@/components/UserProfile";
import BusinessIcon from "@/components/BusinessIcon";
import Link from "next/link";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  // NavbarItem,
} from "@nextui-org/react";
const NavbarComponent = () => {
  const { user } = useUser();
  const [openAccount, setOpenAccount] = useState(false);
  return (
    <Navbar maxWidth={"full"}>
      <NavbarBrand>
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
      </NavbarBrand>
      {/* <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="/orders">
            Orders
          </Link> // Removing this for now but will add back later
        </NavbarItem>
      </NavbarContent> */}
      <NavbarContent justify="end">
        <button
          onClick={() => setOpenAccount(true)}
          style={{
            border: "none",
            cursor: "pointer",
          }}
        >
          <UserProfile user={user} />
        </button>
      </NavbarContent>
      <AccountModal open={openAccount} onClose={() => setOpenAccount(false)} />
    </Navbar>
  );
};

export default NavbarComponent;
