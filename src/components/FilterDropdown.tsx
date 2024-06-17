"use client";
import Dropdown from "@/components/Dropdown";
interface FilterDropdownProps {
  selectedKeys: any;
  // eslint-disable-next-line no-unused-vars
  setSelectedKeys: (selectedKeys: any) => void;
  options: any[];
}

const FilterDropdown = (props: FilterDropdownProps) => {
  const { selectedKeys, setSelectedKeys, options } = props;
  const handleSelectionChange = (keys: Set<any>) => {
    // Convert set to array for easier manipulation
    const newSelectedKeys = new Set(keys);
    // Check if "All" is selected and there are other selections
    if (newSelectedKeys.has("All")) {
      // Only keep "All" in the selection
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
