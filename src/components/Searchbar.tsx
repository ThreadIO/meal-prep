"use client";
import React, { useState, useCallback } from "react";
import { Tooltip, Input } from "@nextui-org/react";
import { Search } from "lucide-react";

interface SearchbarProps {
  // eslint-disable-next-line no-unused-vars
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  tooltipContent?: string;
  width?: string;
}

const SearchbarComponent: React.FC<SearchbarProps> = ({
  onSearch,
  placeholder = "Search...",
  tooltipContent = 'Use "name:" followed by comma-separated names to search for multiple customers, or search by order id',
  width = "70%",
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);
      onSearch(value);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    setSearchTerm("");
    onSearch("");
  }, [onSearch]);

  return (
    <div style={{ width: width, marginBottom: "10px", marginTop: "20px" }}>
      <Tooltip
        showArrow={true}
        content={tooltipContent}
        delay={1000}
        closeDelay={0}
        placement="bottom-start"
        color="primary"
      >
        <Input
          size="sm"
          radius="sm"
          startContent={<Search />}
          isClearable
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onClear={handleClear}
        />
      </Tooltip>
    </div>
  );
};

export default SearchbarComponent;
