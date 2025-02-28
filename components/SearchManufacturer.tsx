"use client";

import { Combobox, ComboboxButton, Transition } from '@headlessui/react';
import Image from 'next/image';
import { useState, Fragment } from 'react';
import { manufacturers } from '@/constants';
import { SearchManuFacturerProps } from '@/types';
import { relative } from 'path';

const SearchManufacturer = ({  selected, setSelected}: 
  SearchManuFacturerProps) => {
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
            <div className='search-manufacturer'>
              <Combobox value={selected} onChange={setSelected}>
                <div className='relative w-full'>
                  {/* Button for the combobox. Click on the icon to see the complete dropdown */}
                  <Combobox.Button className='absolute top-[14px]'>
                    <Image
                      src='/car-logo.svg'
                      width={20}
                      height={20}
                      className='ml-4'
                      alt='car logo'
                    />
                  </Combobox.Button>
        
                  {/* Input field for searching */}
                  <Combobox.Input
                    className='search-manufacturer__input'
                    displayValue={(item: string) => item}
                    onChange={(event) => setQuery(event.target.value)} // Update the search query when the input changes
                    placeholder='Volkswagen...'
                  />
        
                  {/* Transition for displaying the options */}
                  <Transition
                    as={Fragment} // group multiple elements without introducing an additional DOM node i.e., <></>
                    leave='transition ease-in duration-100'
                    leaveFrom='opacity-100'
                    leaveTo='opacity-0'
                    afterLeave={() => setQuery("")} // Reset the search query after the transition completes
                  >
                    <Combobox.Options className='search-manufacturer__options' static>
                      {/* If there are no filtered manufacturers and the query is not empty, show an option to create a new manufacturer */}
                      {filteredManufacturers.length === 0 && query !== "" ? (
                        <Combobox.Option
                          value={query}
                          className='search-manufacturer__option'
                        >
                          Create "{query}"
                        </Combobox.Option>
                      ) : (
                        // Display the filtered manufacturers as options
                        filteredManufacturers.map((item) => (
                          <Combobox.Option
                            key={item}
                            className={({ active }) =>
                              `relative search-manufacturer__option ${
                                active ? "bg-indigo-800 text-white" : "text-gray-900"
                              }`
                            }
                            value={item}
                          >
                            {({ selected, active }) => (
                              <>
                                {/* Display the manufacturer name */}
                                <span
                                  className={`block truncate ${
                                    selected ? "font-medium" : "font-normal"
                                  }`}
                                >
                                  {item}
                                </span>
        
                                {/* Show an active blue background color if the option is selected */}
                                {selected ? (
                                  <span
                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                      active
                                        ? "text-white"
                                        : "text-pribg-primary-purple"
                                    }`}
                                  ></span>
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