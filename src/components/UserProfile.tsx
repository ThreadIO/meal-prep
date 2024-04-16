import React from "react";
import { User } from "@propelauth/nextjs/client";
import { UserCircle, RefreshCw } from "lucide-react";
import { Tooltip, Image } from "@nextui-org/react";
interface UserProfileProps {
  user?: User | null; // Update the type to explicitly allow null
  toolTipsToggle?: boolean;
  isLoading?: boolean;
}

const UserProfile = ({ user, toolTipsToggle, isLoading }: UserProfileProps) => {
  if (!user) {
    console.log("No user");
    return (
      <UserCircle
        className="user-icon ml-3"
        style={{
          width: "2rem",
          height: "2rem",
          borderRadius: "50%",
          border: "2px solid #fff",
        }}
      />
    );
  }
  if (isLoading) {
    console.log("Loading user");
    return (
      <RefreshCw
        className="loading-icon ml-3 animate-spin"
        style={{
          width: "2rem",
          height: "2rem",
          borderRadius: "50%",
          border: "2px solid #fff",
        }}
      />
    );
  }
  return (
    <>
      {toolTipsToggle ? (
        <Tooltip
          showArrow={true}
          key={user.userId}
          color={"primary"}
          content={`${user.firstName} ${user.lastName}`}
        >
          <Image
            className="user-icon ml-3"
            src={user.pictureUrl || "https://via.placeholder.com/150"}
            alt="User Picture"
            style={{
              width: "2rem",
              height: "2rem",
              borderRadius: "50%",
              border: "2px solid #fff",
            }}
          />
        </Tooltip>
      ) : (
        <Image
          className="user-icon ml-3"
          src={user.pictureUrl || "https://via.placeholder.com/150"}
          alt="User Picture"
          style={{
            width: "2rem",
            height: "2rem",
            borderRadius: "50%",
            border: "2px solid #fff",
          }}
        />
      )}
    </>
  );
};

export default UserProfile;
