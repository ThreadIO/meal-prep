import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
} from "@nextui-org/react";
import { org_columns } from "@/helpers/utils";
import UserTable from "@/components/Admin/UserTable";
import OrgModal from "@/components/Modals/OrgModal";
import { Edit } from "lucide-react";
import { getOrg } from "@/helpers/request";

interface OrgTableProps {
  orgs: any[];
  onUpdate: () => void;
}

const OrgTable: React.FC<OrgTableProps> = ({ orgs, onUpdate }) => {
  const [openOrgModal, setOpenOrgModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [threadOrg, setThreadOrg] = useState<any>(null);

  const handleOpenOrgModal = async (org: any) => {
    setSelectedOrg(org);
    const threadOrg = await getOrg(org.orgId);
    setThreadOrg(threadOrg);
    setOpenOrgModal(true);
  };

  const handleCloseOrgModal = () => {
    setSelectedOrg(null);
    setThreadOrg(null);
    setOpenOrgModal(false);
  };

  const renderTableCell = (org: any, columnKey: string) => {
    if (columnKey === "users") {
      return <UserTable orgId={org.orgId} />;
    } else if (columnKey === "actions") {
      return (
        <Button
          color="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation(); // Prevent row action from triggering
            handleOpenOrgModal(org);
          }}
          isIconOnly
        >
          <Edit />
        </Button>
      );
    } else {
      return org[columnKey];
    }
  };

  return (
    <>
      <Table
        aria-label="Organizations table"
        onRowAction={(key) => {
          const selectedOrg = orgs.find((org) => org.orgId === key);
          if (selectedOrg) {
            handleOpenOrgModal(selectedOrg);
          } else {
            console.error(`Organization with id ${key} not found`);
          }
        }}
      >
        <TableHeader columns={org_columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={orgs}>
          {(org) => (
            <TableRow key={org.orgId}>
              {(columnKey) => (
                <TableCell>
                  {renderTableCell(org, columnKey as string)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <OrgModal
        org={selectedOrg}
        threadOrg={threadOrg}
        open={openOrgModal}
        onClose={handleCloseOrgModal}
        onUpdate={onUpdate}
      />
    </>
  );
};

export default OrgTable;
