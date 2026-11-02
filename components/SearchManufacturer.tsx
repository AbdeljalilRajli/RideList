"use client";

import { Combobox, ComboboxButton, Transition } from '@headlessui/react';
import Image from 'next/image';
import { useState, Fragment } from 'react';
import { manufacturers } from '@/constants';
import { SearchManuFacturerProps } from '@/types';

const SearchManufacturer = ({ selected, setSelected }: SearchManuFacturerProps) => {
  const [query, setQuery] = useState('');

  const filteredManufacturers =
    query === ""
      ? manufacturers
      : manufacturers.filter((item) => (
          item.toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        ));

  return (
    <div className="w-full">
      <Combobox value={selected} onChange={setSelected}>
        <div className="relative w-full">
          {/* Car logo icon */}
          <ComboboxButton className="absolute top-1/2 -translate-y-1/2 left-3 z-10">
            <Image
              src="/car-logo.svg"
              width={18}
              height={18}
              className="ml-1 opacity-50"
              alt="car logo"
            />
          </ComboboxButton>

          {/* Input */}
          <Combobox.Input
            className="w-full h-11 px-4 pl-11 rounded-full border border-[#E5E7EB] bg-[#F1F1F6] text-sm text-[#0F0F1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3730A3] focus:border-[#3730A3] transition-all"
            displayValue={(item: string) => item}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Select manufacturer..."
          />

          {/* Options */}
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-[16px] bg-white py-1 text-base shadow-lg ring-1 ring-[#E5E7EB] focus:outline-none sm:text-sm">
              {filteredManufacturers.length === 0 && query !== "" ? (
                <Combobox.Option
                  value={query}
                  className="cursor-default select-none py-2.5 pl-10 pr-4 text-[#6B7280] text-sm"
                >
                  Search &quot;{query}&quot;
                </Combobox.Option>
              ) : (
                filteredManufacturers.map((item) => (
                  <Combobox.Option
                    key={item}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2.5 pl-10 pr-4 transition-colors ${
                        active ? "bg-[#EEEDF9] text-[#3730A3]" : "text-[#0F0F1A]"
                      }`
                    }
                    value={item}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={`block truncate text-sm ${selected ? "font-semibold text-[#3730A3]" : "font-normal"}`}>
                          {item}
                        </span>
                        {selected ? (
                          <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? "text-[#3730A3]" : "text-[#3730A3]"}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
};

export default SearchManufacturer;
