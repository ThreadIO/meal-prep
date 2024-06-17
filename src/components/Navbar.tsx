"use client";
import { useUser } from "@propelauth/nextjs/client";
import { AccountModal } from "@/components/Modals/AccountModal";
import { useState } from "react";
import UserProfile from "@/components/UserProfile";
// import BusinessIcon from "@/components/BusinessIcon";
import { Navbar, NavbarContent } from "@nextui-org/react";
const NavbarComponent = () => {
  const { user } = useUser();
  const [openAccount, setOpenAccount] = useState(false);
  return (
    <Navbar maxWidth={"full"}>
      <NavbarContent
        className="hidden sm:flex gap-4"
        justify="center"
      ></NavbarContent>
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
