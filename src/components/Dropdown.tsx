"use client";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Pagination,
} from "@nextui-org/react";
import { useMemo, useState } from "react";
interface DropdownProps {
  // eslint-disable-next-line no-unused-vars
  onSelectionChange: (selectedKeys: any) => void;
  aria_label: string;
  variant:
    | "shadow"
    | "solid"
    | "bordered"
    | "light"
    | "faded"
    | "flat"
    | undefined;
  items: any[];
  closeOnSelect?: boolean;
  selectionMode?: "single" | "multiple";
  disallowEmptySelection?: boolean;
  selectedKeys?: any;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | undefined;
}

const ITEMS_PER_PAGE = 15;

const DropdownComponent = (props: DropdownProps) => {
  const {
    onSelectionChange,
    items,
    aria_label,
    variant,
    selectionMode,
    closeOnSelect = false,
    disallowEmptySelection,
    selectedKeys = "default",
    color = "default",
  } = props;
  const [currentPage, setCurrentPage] = useState(1);
  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
    [selectedKeys]
  );

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return items.slice(startIndex, endIndex);
  }, [currentPage, items]);

  const renderDropdownTrigger = () => {
    if (totalPages == 1) {
      return (
        <Button variant="bordered" className="capitalize" color={color}>
          {selectedValue}
        </Button>
      );
    }
    return (
      <Button variant="bordered" className="capitalize" color={color}>
        {selectedValue}
        <Pagination
          total={totalPages}
          page={currentPage}
          onChange={(page: number) => setCurrentPage(page)}
          isCompact
        />
      </Button>
    );
  };
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  return (
    <Dropdown>
      <DropdownTrigger>{renderDropdownTrigger()}</DropdownTrigger>
      <DropdownMenu
        aria-label={aria_label}
        variant={variant}
        closeOnSelect={closeOnSelect}
        disallowEmptySelection={disallowEmptySelection}
        selectionMode={selectionMode}
        selectedKeys={selectedKeys}
        onSelectionChange={(selectedKeys) => onSelectionChange(selectedKeys)}
      >
        {paginatedItems.map((item: any) => (
          <DropdownItem key={item.name}>{item.name}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};
export default DropdownComponent;
