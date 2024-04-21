import { useEffect, useState } from "react";
import { useOrgContext } from "@/components/OrgContext";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
  // Dropdown,
  // DropdownTrigger,
  // DropdownMenu,
  // DropdownItem,
} from "@nextui-org/react";
import {
  useLogoutFunction,
  useRedirectFunctions,
  useUser,
} from "@propelauth/nextjs/client";
import ThemeComponent from "@/components/ThemeComponent";
import { useQuery, useQueryClient, useMutation } from "react-query";
import { createUser, getUser, patchUser } from "@/helpers/request";

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

export const AccountModal = (props: AccountModalProps) => {
  const open = props.open;
  const onClose = props.onClose;
  const { loading, user } = useUser();
  const { redirectToOrgPage } = useRedirectFunctions();
  const { redirectToAccountPage } = useRedirectFunctions();
  const logoutFn = useLogoutFunction();
  const { currentOrg, setOrg } = useOrgContext();
  const userid = user?.userId;

  const [settings, setSettings] = useState<any>({});
  const [clientKey, setClientKey] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const { isLoading: userSettingsAreLoading, data: userData } = useQuery(
    ["users", userid || ""],
    () => getUser(userid || "")
  );

  useEffect(() => {
    if (!userSettingsAreLoading && userData && userData.success !== false) {
      setSettings(userData);
    }
  }, [userData, userSettingsAreLoading]);

  const queryclient = useQueryClient();
  const createMutation = useMutation(
    (data: {
      userId: string;
      settings: { client_key: string; client_secret: string };
    }) => createUser(data.userId, data.settings),
    {
      onSuccess: () => {
        queryclient.invalidateQueries("users");
      },
    }
  );

  const patchMutation = useMutation(
    ({ userid, body }: { userid: string; body: any }) =>
      patchUser(userid, body),
    {
      onSuccess: () => {
        queryclient.invalidateQueries("users");
      },
    }
  );

  useEffect(() => {
    if (!loading) {
      const orgs = user?.getOrgs();
      setOrg(orgs?.[0]?.orgId || "");
    } else {
      setOrg("");
    }
  }, [loading]);

  const handleLogout = () => {
    logoutFn();
  };

  function getOrg(orgId?: string) {
    if (!orgId) {
      return null;
    }
    return user?.getOrg(orgId);
  }

  function handleSetSettings() {
    if (!user) {
      console.log("Something weird is happenin");
      return;
    } else if (userSettingsAreLoading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Spinner label={"Loading Settings"} />
          </div>
        </div>
      );
    } else if (userData == 0) {
      console.log("Creating new user settings");
      createMutation.mutate({
        userId: user.userId,
        settings: { client_key: clientKey, client_secret: clientSecret },
      });
    } else {
      console.log("Updating user settings");
      patchMutation.mutate({
        userid: user.userId,
        body: {
          settings: { client_key: clientKey, client_secret: clientSecret },
        },
      });
    }
    return;
  }
  const renderSettings = () => {
    if (!settings || settings.length == 0) {
      return (
        <>
          <Input
            value={clientKey}
            placeholder="Client Key"
            onChange={(e) => setClientKey(e.target.value)}
          />
          <Input
            value={clientSecret}
            placeholder="Client Secret"
            onChange={(e) => setClientSecret(e.target.value)}
            type={"password"}
          />
          <Button
            color="primary"
            style={{
              margin: "10px",
            }}
            onClick={() => handleSetSettings()}
          >
            Set Settings
          </Button>
        </>
      );
    } else {
      return (
        <>
          <Button
            color="primary"
            style={{
              margin: "10px",
            }}
            onClick={() => setSettings([])}
          >
            Update Client Key/Secret
          </Button>
        </>
      );
    }
  };

  return (
    <>
      <Modal isOpen={open} onOpenChange={onClose}>
        <ModalContent>
          {
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                Account Information
              </ModalHeader>
              <ModalBody>
                {/* {user?.getOrgs()?.length ??
                  (0 > 1 && (
                  ))} */}
                {renderSettings()}
                <Button
                  color="primary"
                  onClick={() => redirectToOrgPage(currentOrg)}
                  className="mb-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span>Manage Company: {getOrg(currentOrg)?.orgName}</span>
                </Button>
                <ThemeComponent />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={handleLogout}>
                  Logout
                </Button>
                <Button color="primary" onPress={redirectToAccountPage}>
                  Account
                </Button>
              </ModalFooter>
            </>
          }
        </ModalContent>
      </Modal>
    </>
  );
};
