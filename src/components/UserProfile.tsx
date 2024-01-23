import React from "react";
import { User } from "@propelauth/react";
import { UserCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "@nextui-org/react";
interface UserProfileProps {
  user?: User | null; // Update the type to explicitly allow null
  toolTipsToggle?: boolean;
  isLoading?: boolean;
}

const UserProfile = ({ user, toolTipsToggle, isLoading }: UserProfileProps) => {
  if (!user) {
    console.log("No user");
    return (
      <UserCircleIcon
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
      <ArrowPathIcon
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
          <img
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
        <img
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
