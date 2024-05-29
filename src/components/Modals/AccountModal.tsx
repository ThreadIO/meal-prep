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
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [applicationPassword, setApplicationPassword] = useState("");
  const [oldSettings, setOldSettings] = useState<any>({});
  // const [error, setError] = useState("");
  const [openUpdate, setOpenUpdate] = useState(false);
  const { isLoading: userSettingsAreLoading, data: userData } = useQuery(
    ["users", userid || ""],
    () => getUser(userid || "")
  );

  useEffect(() => {
    if (!userSettingsAreLoading && userData && userData.success !== false) {
      setSettings(userData);
      setClientKey(userData.settings.client_key || "");
      setClientSecret(userData.settings.client_secret || "");
      setUrl(userData.settings.url || "");
      setUsername(userData.settings.username || "");
      setApplicationPassword(userData.settings.application_password || "");
    }
  }, [userData, userSettingsAreLoading]);

  const queryclient = useQueryClient();
  const createMutation = useMutation(
    (data: {
      userId: string;
      settings: {
        client_key: string;
        client_secret: string;
        url: string;
        username: string;
        application_password: string;
      };
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
    console.log("userData: ", userData);
    // if (!clientKey || !clientSecret) {
    //   setError("Please input both Client Key/Client Secret");
    //   return;
    // } else {
    //   setError("");
    // }
    if (!user) {
      console.log("Something weird is happenin");
      return;
    }

    const updateBody: any = {};
    if (clientKey) updateBody.client_key = clientKey;
    if (clientSecret) updateBody.client_secret = clientSecret;
    if (url) updateBody.url = url;
    if (username) updateBody.username = username;
    if (applicationPassword)
      updateBody.application_password = applicationPassword;

    if (userData == 0 || userData == null) {
      console.log("Creating new user settings");
      createMutation.mutate({
        userId: user.userId,
        settings: updateBody,
      });
      setOpenUpdate(false);
    } else {
      console.log("Updating user settings");
      patchMutation.mutate({
        userid: user.userId,
        body: { settings: updateBody },
      });
      setOpenUpdate(false);
    }
    return;
  }

  const renderSettings = () => {
    if (userSettingsAreLoading) {
      console.log("loading user settings...");
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
    }
    if (openUpdate) {
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
          <Input
            value={url}
            placeholder="Company Url"
            onChange={(e) => setUrl(e.target.value)}
          />
          <Input
            value={username}
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            value={applicationPassword}
            placeholder="Application Password"
            onChange={(e) => setApplicationPassword(e.target.value)}
            type={"password"}
          />
          {/* {error && (
            <div style={{ color: "red", marginTop: "10px" }}>{error}</div>
          )} */}
          <Button
            color="primary"
            style={{ margin: "10px" }}
            onClick={() => {
              handleSetSettings();
            }}
          >
            Set Settings
          </Button>
          <Button
            color="primary"
            style={{ margin: "10px" }}
            onClick={() => {
              setSettings(oldSettings);
              setOpenUpdate(false);
            }}
          >
            Close
          </Button>
        </>
      );
    } else {
      return (
        <>
          <Button
            color="primary"
            style={{ margin: "10px" }}
            onClick={() => {
              setOldSettings(settings);
              setSettings([]);
              setOpenUpdate(true);
            }}
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
