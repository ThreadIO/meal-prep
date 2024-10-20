import React, { useState, ChangeEvent } from "react";
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
import Papa from "papaparse";
import { generateNoOrdersLabelManifest } from "@/helpers/downloads";
import { saveAs } from "file-saver";

interface Order {
  billing: {
    first_name: string;
    last_name: string;
  };
}

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  orders: Order[];
}

interface Client {
  clientName: string;
  allergies: string;
  ordered: boolean;
  team: string;
}

const getNicknames = (name: string): string[] => {
  const lowerName = name.toLowerCase();
  const commonNicknames: { [key: string]: string[] } = {
    alexander: ["alex", "alec", "sandy"],
    william: ["will", "bill", "billy"],
    elizabeth: ["liz", "beth", "betsy", "eliza"],
    catherine: ["cathy", "kate", "kathy"],
    christopher: ["chris", "topher"],
    nicholas: ["nick", "nicky"],
    patricia: ["pat", "patty", "tricia"],
    margaret: ["maggie", "meg", "peggy"],
    jonathan: ["jon", "jonny"],
    theodore: ["ted", "teddy"],
    elijah: ["eli"],
  };

  // Create a reverse mapping
  const reverseNicknames: { [key: string]: string } = {};
  Object.entries(commonNicknames).forEach(([fullName, nicknames]) => {
    nicknames.forEach((nickname) => {
      reverseNicknames[nickname] = fullName;
    });
  });

  // Function to get all related names
  const getRelatedNames = (inputName: string): string[] => {
    if (commonNicknames[inputName]) {
      return [inputName, ...commonNicknames[inputName]];
    } else if (reverseNicknames[inputName]) {
      const fullName = reverseNicknames[inputName];
      return [
        inputName,
        fullName,
        ...commonNicknames[fullName].filter((n) => n !== inputName),
      ];
    }
    return [inputName];
  };

  const relatedNames = getRelatedNames(lowerName);

  // Include capitalized versions
  const capitalizedNames = relatedNames.map(
    (n) => n.charAt(0).toUpperCase() + n.slice(1)
  );

  return Array.from(new Set([name, ...relatedNames, ...capitalizedNames]));
};

const getNameVariations = (name: string): string[] => {
  const parts = name.split(" ");
  let variations: string[] = [name];

  // Get all variations of the first name (including nicknames)
  const firstNameVariations = getNicknames(parts[0]);

  // Generate full name variations
  firstNameVariations.forEach((firstNameVar) => {
    // Full name with each first name variation
    variations.push([firstNameVar, ...parts.slice(1)].join(" "));

    // Name without middle name(s) for each first name variation
    if (parts.length > 2) {
      variations.push(`${firstNameVar} ${parts[parts.length - 1]}`);
    }

    // Variations with initials for middle names
    if (parts.length > 2) {
      const middleInitials = parts
        .slice(1, -1)
        .map((part) => part[0])
        .join(" ");
      variations.push(
        `${firstNameVar} ${middleInitials} ${parts[parts.length - 1]}`
      );
      variations.push(`${firstNameVar} ${parts[parts.length - 1]}`);
    }
  });

  // Generate variations with initials for first name
  const firstInitial = parts[0][0];
  variations.push([firstInitial, ...parts.slice(1)].join(" "));
  if (parts.length > 2) {
    variations.push(`${firstInitial} ${parts[parts.length - 1]}`);
  }

  // Reversed variations
  variations.push(parts.reverse().join(" "));
  variations.push(`${parts[0]} ${parts[parts.length - 1]}`);

  // Remove duplicates and normalize
  const uniqueVariations = new Set(variations.map(normalizeName));
  return Array.from(uniqueVariations);
};

const normalizeName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .split(" ")
    .filter((part) => part.length > 1)
    .join(" ")
    .trim();
};

export const ClientModal: React.FC<ClientModalProps> = (props) => {
  const { open, onClose, orders } = props;
  const [clients, setClients] = useState<Client[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "yes" | "no">("all");
  const [testName, setTestName] = useState<string>("");
  const [testOrderName, setTestOrderName] = useState<string>("");
  const [testResult, setTestResult] = useState<string>("");
  const [defaultMeal, setDefaultMeal] = useState<string>("");
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
              const fullName = `${firstName} ${lastName}`;
              const nameVariations = getNameVariations(fullName);

              const hasOrdered = orders.some((order) => {
                const orderFullName = `${order.billing.first_name} ${order.billing.last_name}`;
                const normalizedOrderName = normalizeName(orderFullName);

                // Check variations
                return nameVariations.some(
                  (variation) => normalizedOrderName === variation
                );
              });

              return {
                clientName: fullName,
                allergies: row[2] || "",
                ordered: hasOrdered,
                team: row[3] || "", // Add team information
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

  const handleDefaultMealChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newDefaultMeal = e.target.value;
    setDefaultMeal(newDefaultMeal);
  };

  const filteredClients = clients.filter((client) => {
    if (filter === "all") return true;
    return filter === "yes" ? client.ordered : !client.ordered;
  });

  const handleGenerateNoOrdersLabel = () => {
    if (!defaultMeal) {
      alert(
        "Please enter a default meal before generating the label manifest."
      );
      return;
    }

    const noOrderClients = clients.filter((client) => !client.ordered);
    const csvData = generateNoOrdersLabelManifest(noOrderClients, defaultMeal);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "no_orders_label_manifest.csv");
  };

  const testNameMatching = () => {
    const csvNameVariations = getNameVariations(testName);
    const normalizedOrderName = normalizeName(testOrderName);

    const matchFound = csvNameVariations.some(
      (variation) => variation === normalizedOrderName
    );

    setTestResult(
      matchFound
        ? `Match found!\nVariations tested: ${csvNameVariations.join(", ")}`
        : `No match found\nVariations tested: ${csvNameVariations.join(", ")}`
    );
  };

  const testMode = false;

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
          <Input
            type="text"
            label="Default Meal for 'No' Orders"
            placeholder="Enter default meal"
            value={defaultMeal}
            onChange={handleDefaultMealChange}
            className="mb-4"
          />
          {clients.length > 0 && (
            <>
              <div className="mb-4 flex gap-2">
                <Button
                  onPress={() => setFilter("all")}
                  color={filter === "all" ? "primary" : "default"}
                >
                  All
                </Button>
                <Button
                  onPress={() => setFilter("yes")}
                  color={filter === "yes" ? "primary" : "default"}
                >
                  Ordered (Yes)
                </Button>
                <Button
                  onPress={() => setFilter("no")}
                  color={filter === "no" ? "primary" : "default"}
                >
                  Not Ordered (No)
                </Button>
              </div>
              <div className="max-h-[50vh] overflow-y-auto">
                <Table aria-label="Clients table" isStriped>
                  <TableHeader>
                    <TableColumn>Client Name</TableColumn>
                    <TableColumn>Allergies</TableColumn>
                    <TableColumn>Team</TableColumn>
                    <TableColumn>Ordered</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client, index) => (
                      <TableRow key={index}>
                        <TableCell>{client.clientName}</TableCell>
                        <TableCell>{client.allergies}</TableCell>
                        <TableCell>{client.team}</TableCell>
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
            </>
          )}
          {testMode && ( // Add this condition
            <div className="mt-8 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">
                Manual Name Matching Test
              </h3>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="CSV Name (e.g., Alex Lin Lundberg)"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                />
                <Input
                  placeholder="Order Name (e.g., Alexander Lundberg)"
                  value={testOrderName}
                  onChange={(e) => setTestOrderName(e.target.value)}
                />
                <Button onClick={testNameMatching}>Test Match</Button>
              </div>
              {testResult && (
                <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
                  {testResult}
                </pre>
              )}
            </div>
          )}
        </div>
        <ModalFooter>
          <Button
            onClick={handleGenerateNoOrdersLabel}
            disabled={clients.length === 0 || !defaultMeal}
            color="primary"
          >
            Generate &apos;No Orders&apos; Label Manifest
          </Button>
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
