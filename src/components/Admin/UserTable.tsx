import React from "react";
import { useQuery } from "react-query";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@nextui-org/react";
import { user_columns } from "@/helpers/utils";

interface UserTableProps {
  orgId: string;
}

const fetchUsers = async (orgId: string) => {
  const response = await fetch("/api/user", {
    method: "GET",
    headers: { orgid: orgId },
  });
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

const UserTable: React.FC<UserTableProps> = ({ orgId }) => {
  const { data, isLoading, error } = useQuery(["users", orgId], () =>
    fetchUsers(orgId)
  );

  if (isLoading) return <Spinner />;
  if (error) return <div>Error loading users: {(error as Error).message}</div>;

  // Check if data exists and has the expected structure
  const users = data?.response || [];

  if (!Array.isArray(users)) {
    console.error("Unexpected data structure:", data);
    return <div>Error: Unexpected data structure</div>;
  }

  return (
    <Table aria-label="Users table">
      <TableHeader columns={user_columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody>
        {users.map((user: any) => (
          <TableRow key={user.userId}>
            {user_columns.map((column) => (
              <TableCell key={column.key}>{user[column.key]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;
