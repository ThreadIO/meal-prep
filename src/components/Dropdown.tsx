"use client";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { useMemo } from "react";
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
  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
    [selectedKeys]
  );
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered" className="capitalize" color={color}>
          {selectedValue}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={aria_label}
        variant={variant}
        closeOnSelect={closeOnSelect}
        disallowEmptySelection={disallowEmptySelection}
        selectionMode={selectionMode}
        selectedKeys={selectedKeys}
        onSelectionChange={(selectedKeys) => onSelectionChange(selectedKeys)}
      >
        {items.map((item: any) => (
          <DropdownItem key={item.name}>{item.name}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};
export default DropdownComponent;
