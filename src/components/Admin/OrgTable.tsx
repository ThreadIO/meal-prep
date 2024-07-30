import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { org_columns } from "@/helpers/utils";
import UserTable from "@/components/Admin/UserTable";

interface OrgTableProps {
  orgs: any[];
}

const OrgTable: React.FC<OrgTableProps> = ({ orgs }) => {
  console.log(orgs);
  return (
    <Table aria-label="Organizations table">
      <TableHeader columns={org_columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody>
        {orgs.map((org) => (
          <TableRow key={org.orgId}>
            {org_columns.map((column) => (
              <TableCell key={column.key}>
                {column.key === "users" ? (
                  <UserTable orgId={org.orgId} />
                ) : (
                  org[column.key]
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default OrgTable;
