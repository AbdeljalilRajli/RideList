"use client";

import React, { useEffect } from 'react';
import SearchManufacturer from './SearchManufacturer';
import { SearchBarProps } from '@/types';

const SearchBar = ({ setManuFacturer, setModel }: SearchBarProps) => {
  const handleManufacturerChange = (manufacturer: string) => {
    setManuFacturer(manufacturer);
    setModel('');
  };

  return (
    <div className="w-full">
      <SearchManufacturer
        selected=""
        setSelected={handleManufacturerChange}
      />
    </div>
  );
};

export default SearchBar;
