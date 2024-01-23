import { useEffect } from "react";
import { useOrgContext } from "@/components/OrgContext";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
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
