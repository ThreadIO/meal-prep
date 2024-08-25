import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { decodeHtmlEntities } from "@/helpers/frontend";
interface MealSumTableProps {
  mealSum: { [key: string]: number };
  showCosts: boolean;
}

const MealSumTable = ({ mealSum, showCosts }: MealSumTableProps) => {
  const baseColumns = [
    { key: "name", label: "Meal Name" },
    { key: "quantity", label: "Quantity" },
  ];

  const costColumns = [
    { key: "sysco", label: "Sysco" },
    { key: "usfoods", label: "US Foods" },
  ];

  const columns = showCosts ? [...baseColumns, ...costColumns] : baseColumns;

  const getPriceRange = (name: string): [number, number] => {
    const lowerName = name.toLowerCase();
    if (
      lowerName.includes("beef") ||
      lowerName.includes("steak") ||
      lowerName.includes("pork")
    ) {
      return [6, 8];
    } else if (lowerName.includes("chicken") || lowerName.includes("shrimp")) {
      return [4, 6];
    } else {
      return [2, 4];
    }
  };

  const generatePrice = (name: string, quantity: number): number => {
    const [min, max] = getPriceRange(name);
    const basePrice = Math.random() * (max - min) + min;
    return basePrice * quantity;
  };

  const mealSumArray = Object.entries(mealSum).map(([name, quantity]) => {
    const baseItem = { name, quantity };
    if (showCosts) {
      const sysco = generatePrice(name, quantity);
      const usfoods = generatePrice(name, quantity);
      return { ...baseItem, sysco, usfoods };
    }
    return baseItem;
  });

  const renderCostCell = (value: number, otherValue: number) => {
    const isLower = value <= otherValue;
    return (
      <TableCell>
        <span style={{ color: isLower ? "green" : "inherit" }}>
          ${value.toFixed(2)}
        </span>
      </TableCell>
    );
  };

  return (
    <div className="mt-4 mr-4 ml-4 max-h-[50vh] overflow-y-auto">
      <Table isHeaderSticky isStriped aria-label="Table of Meal Quantities">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No meals to display."} items={mealSumArray}>
          {(item: any) => (
            <TableRow key={decodeHtmlEntities(item.name)}>
              {(columnKey) => {
                switch (columnKey) {
                  case "name":
                    return (
                      <TableCell>{decodeHtmlEntities(item.name)}</TableCell>
                    );
                  case "quantity":
                    return <TableCell>{item.quantity}</TableCell>;
                  case "sysco":
                    return showCosts ? (
                      renderCostCell(item.sysco, item.usfoods)
                    ) : (
                      <TableCell> </TableCell>
                    );
                  case "usfoods":
                    return showCosts ? (
                      renderCostCell(item.usfoods, item.sysco)
                    ) : (
                      <TableCell> </TableCell>
                    );
                  default:
                    return <TableCell> </TableCell>;
                }
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default MealSumTable;
