"use client";
import { useEffect } from "react";
import { useUser } from "@propelauth/nextjs/client";
import { useQuery, useQueryClient } from "react-query";
import { Spinner } from "@nextui-org/react";
import OrgTable from "@/components/Admin/OrgTable";

const fetchOrgs = async () => {
  const response = await fetch("/api/orgs");
  if (!response.ok) throw new Error("Failed to fetch organizations");
  return response.json();
};

const Admin = () => {
  const { loading, isLoggedIn } = useUser();
  const queryClient = useQueryClient();

  const {
    data: orgs,
    isLoading: orgsLoading,
    error: orgsError,
  } = useQuery("orgs", fetchOrgs, {
    enabled: isLoggedIn,
  });

  useEffect(() => {
    if (isLoggedIn && !loading) {
      queryClient.invalidateQueries("orgs");
    }
  }, [isLoggedIn, loading, queryClient]);

  if (loading || orgsLoading) return <Spinner label="Loading..." />;
  if (orgsError) return <div>Error: {(orgsError as Error).message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <OrgTable orgs={orgs.orgs} />
    </div>
  );
};

export default Admin;
