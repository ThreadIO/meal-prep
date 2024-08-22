"use client";
import { useUser } from "@propelauth/nextjs/client";
import { useOrgContext } from "@/components/context/OrgContext";
import {
  Spinner,
  Card,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { createOrg, patchOrg } from "@/helpers/request";
import { getData } from "@/helpers/frontend";
import DeliveryAreaModal from "@/components/Modals/DeliveryAreaModal";
import { renderZipcodes } from "@/components/Renders";

const Delivery = () => {
  const { loading, isLoggedIn, user } = useUser();
  const { currentOrg } = useOrgContext();
  const [org, setOrg] = useState<any>({});
  const [error, setError] = useState<string>("");
  const [orgLoading, setOrgLoading] = useState<boolean>(false);
  const [deliveryAreas, setDeliveryAreas] = useState<
    Array<{ area: string; zipcodes: string[] }>
  >([]);
  const [newArea, setNewArea] = useState({ area: "", zipcodes: "" });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isLoggedIn && !loading && !orgLoading && currentOrg) {
      fetchOrgData(currentOrg);
    }
  }, [currentOrg, isLoggedIn, loading]);

  const fetchOrgData = async (orgId: string) => {
    const url = `/api/org/propelauth/${orgId}`;
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
    };
    getData(
      "org",
      url,
      method,
      headers,
      (data) => {
        setOrg(data || {});
        setDeliveryAreas(data.zipcodeMap || []);
      },
      setError,
      setOrgLoading
    );
  };

  const handleSave = async () => {
    setOrgLoading(true);
    console.log("Org: ", org);
    if (org && Object.keys(org).length > 0) {
      await patchOrg(org.orgid, { zipcodeMap: deliveryAreas });
    } else {
      const body = {
        orgid: currentOrg,
        name: user?.getOrg(currentOrg)?.orgName,
        zipcodeMap: deliveryAreas,
      };
      await createOrg(body);
    }
    fetchOrgData(currentOrg);
    setOrgLoading(false);
  };

  const handleAddArea = () => {
    setNewArea({ area: "", zipcodes: "" });
    setEditingIndex(null);
    onOpen();
  };

  const handleEditArea = (index: number) => {
    const area = deliveryAreas[index];
    setNewArea({ area: area.area, zipcodes: area.zipcodes.join(", ") });
    setEditingIndex(index);
    onOpen();
  };

  const handleDeleteArea = (index: number) => {
    const updatedAreas = deliveryAreas.filter((_, i) => i !== index);
    setDeliveryAreas(updatedAreas);
  };

  const handleSaveArea = () => {
    const zipcodes = newArea.zipcodes.split(",").map((zip) => zip.trim());
    const areaToSave = { area: newArea.area, zipcodes };

    if (editingIndex !== null) {
      const updatedAreas = [...deliveryAreas];
      updatedAreas[editingIndex] = areaToSave;
      setDeliveryAreas(updatedAreas);
    } else {
      setDeliveryAreas([...deliveryAreas, areaToSave]);
    }

    onClose();
  };

  const renderDeliveryPage = () => {
    if (orgLoading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <Spinner label="Loading Delivery" />
        </div>
      );
    } else {
      return (
        <Card className="p-6 m-4">
          <h2 className="text-2xl font-bold mb-4">Store Delivery</h2>
          <div className="mb-4">
            <p>
              <strong>Name:</strong>{" "}
              {org?.name || user?.getOrg(currentOrg)?.orgName || "No Name"}
            </p>
          </div>
          {error && (
            <div className="mb-4 text-red-500">
              <p>{error}</p>
            </div>
          )}
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Delivery Areas</h3>
            <Button color="primary" onClick={handleAddArea}>
              Add Delivery Area
            </Button>
            <Table aria-label="Delivery Areas">
              <TableHeader>
                <TableColumn>AREA</TableColumn>
                <TableColumn>ZIPCODES</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {deliveryAreas.map((area, index) => (
                  <TableRow key={index}>
                    <TableCell>{area.area}</TableCell>
                    <TableCell>{renderZipcodes(area.zipcodes)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEditArea(index)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          onClick={() => handleDeleteArea(index)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button color="primary" onClick={handleSave} isLoading={orgLoading}>
            Save Delivery Areas
          </Button>
        </Card>
      );
    }
  };

  return (
    <>
      {renderDeliveryPage()}
      <DeliveryAreaModal
        isOpen={isOpen}
        onClose={onClose}
        newArea={newArea}
        setNewArea={setNewArea}
        handleSaveArea={handleSaveArea}
        editingIndex={editingIndex}
      />
    </>
  );
};

export default Delivery;
