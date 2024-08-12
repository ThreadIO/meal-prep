"use client";
import { useEffect } from "react";
import Dropdown from "@/components/Dropdown";

interface FilterDropdownProps {
  selectedKeys: Set<string>;
  // eslint-disable-next-line no-unused-vars
  setSelectedKeys: (selectedKeys: Set<string>) => void;
  options: { name: string }[];
  preSelectedOptions?: string[];
}

const FilterDropdown = (props: FilterDropdownProps) => {
  const {
    selectedKeys,
    setSelectedKeys,
    options,
    preSelectedOptions = [],
  } = props;

  useEffect(() => {
    // Initialize with "All" or preSelectedOptions
    if (preSelectedOptions.length > 0) {
      setSelectedKeys(new Set(preSelectedOptions));
    } else {
      setSelectedKeys(new Set(["All"]));
    }
  }, []);

  const handleSelectionChange = (keys: Set<string>) => {
    const newSelectedKeys = new Set(keys);

    if (newSelectedKeys.has("All")) {
      if (selectedKeys.has("All")) {
        newSelectedKeys.delete("All");
        setSelectedKeys(newSelectedKeys);
      } else {
        setSelectedKeys(new Set(["All"]));
      }
    } else {
      setSelectedKeys(newSelectedKeys);
    }
  };

  return (
    <Dropdown
      aria_label="Multiple selection example"
      variant="flat"
      closeOnSelect={false}
      disallowEmptySelection
      selectionMode="multiple"
      selectedKeys={selectedKeys}
      onSelectionChange={handleSelectionChange}
      items={[
        { name: "All" },
        ...options.map((option) => ({
          name: option.name,
        })),
      ]}
    />
  );
};

export default FilterDropdown;
