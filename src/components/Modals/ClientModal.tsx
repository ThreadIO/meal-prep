import {
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { useState, ChangeEvent } from "react";
import Papa from "papaparse";

interface Order {
  billing: {
    first_name: string;
    last_name: string;
  };
}

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  orders: Order[]; // New prop for the list of orders
}

interface Client {
  clientName: string;
  allergies: string;
  ordered: boolean;
}

export const ClientModal = (props: ClientModalProps) => {
  const { open, onClose, orders } = props;
  const [clients, setClients] = useState<Client[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      Papa.parse(file, {
        complete: (results) => {
          const parsedClients = results.data
            .slice(1) // Skip the first row (header)
            .filter((row: any) => row[0] && row[1])
            .map((row: any) => {
              const lastName = row[0].trim();
              const firstName = row[1].trim();
              const hasOrdered = orders.some(
                (order) =>
                  order.billing.first_name.trim().toLowerCase() ===
                    firstName.toLowerCase() &&
                  order.billing.last_name.trim().toLowerCase() ===
                    lastName.toLowerCase()
              );
              return {
                clientName: `${firstName} ${lastName}`,
                allergies: row[2] || "",
                ordered: hasOrdered,
              };
            });
          setClients(parsedClients);
        },
        header: false,
      });
    }
  };

  const handleClear = () => {
    setClients([]);
    setFileName("");
  };

  return (
    <Modal isOpen={open} onOpenChange={onClose} size="full">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-center">
          Upload Clients as a CSV
        </ModalHeader>
        <div className="p-4">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="mb-4"
          />
          {fileName && <p>File uploaded: {fileName}</p>}
          {clients.length > 0 && (
            <p className="mb-4">{clients.length} client(s) parsed from CSV</p>
          )}

          {clients.length > 0 && (
            <div className="max-h-[50vh] overflow-y-auto">
              <Table aria-label="Clients table" isStriped>
                <TableHeader>
                  <TableColumn>Client Name</TableColumn>
                  <TableColumn>Allergies</TableColumn>
                  <TableColumn>Ordered</TableColumn>
                </TableHeader>
                <TableBody>
                  {clients.map((client, index) => (
                    <TableRow key={index}>
                      <TableCell>{client.clientName}</TableCell>
                      <TableCell>{client.allergies}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded ${
                            client.ordered
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {client.ordered ? "Yes" : "No"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        <ModalFooter>
          <Button
            color="danger"
            onPress={handleClear}
            isDisabled={clients.length === 0}
          >
            Clear
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
