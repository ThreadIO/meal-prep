import { useEffect } from "react";
import { useOrgContext } from "@/components/OrgContext";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import {
  useLogoutFunction,
  withAuthInfo,
  useRedirectFunctions,
  WithLoggedInAuthInfoProps,
} from "@propelauth/react";

import Link from "next/link";
import ThemeComponent from "@/components/ThemeComponent";
interface AccountModalProps extends WithLoggedInAuthInfoProps {
  open: boolean;
  onClose: () => void;
}

const AccountModal = withAuthInfo((props: AccountModalProps) => {
  const open = props.open;
  const onClose = props.onClose;
  const { redirectToOrgPage } = useRedirectFunctions();
  const { redirectToAccountPage } = useRedirectFunctions();
  const logoutFn = useLogoutFunction();
  const { currentOrg, setOrg } = useOrgContext();

  useEffect(() => {
    const orgIds = props.orgHelper?.getOrgIds();
    setOrg(orgIds[0] || "");
  }, []);

  const handleLogout = () => {
    logoutFn(true);
  };

  function getOrg(orgId?: string) {
    if (!orgId) {
      return null;
    }
    return props.orgHelper?.getOrg(orgId);
  }

  function getRole() {
    const org = getOrg(currentOrg);
    return org?.userAssignedRole;
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
                {props.orgHelper?.getOrgs()?.length > 1 && (
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        color="primary"
                        className="mb-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        Choose Department
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Dynamic Actions"
                      items={props.orgHelper.getOrgs()}
                      className="rounded-md shadow-lg"
                      onAction={(key) => {
                        setOrg(key.toString());
                      }}
                      color="primary"
                    >
                      {(item) => (
                        <DropdownItem key={item.orgId}>
                          {item.orgName}
                        </DropdownItem>
                      )}
                    </DropdownMenu>
                  </Dropdown>
                )}
                <Button
                  color="primary"
                  onClick={() => redirectToOrgPage(currentOrg)}
                  className="mb-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span>Manage Department: {getOrg(currentOrg)?.orgName}</span>
                </Button>
                {getRole() === "Owner" || getRole() === "Admin" ? (
                  <Link href="/documents">
                    <Button
                      className="mb-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      color="primary"
                    >
                      Documents
                    </Button>
                  </Link>
                ) : null}
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
});
export default AccountModal;
