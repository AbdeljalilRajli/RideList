"use client";

import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CustomFilterProps } from "@/types";

export default function CustomFilter<T>({
  options,
  setFilter,
}: CustomFilterProps<T>) {
  const [menu, setMenu] = useState(options[0]);

  return (
    <div className="w-full">
      <Listbox
        value={menu}
        onChange={(e) => {
          setMenu(e);
          setFilter(e.value as unknown as T);
        }}
      >
        <div className="relative w-full z-10">
          {/* Trigger button */}
          <Listbox.Button className="relative w-full flex items-center justify-between gap-2 h-11 px-4 rounded-full bg-[#F1F1F6] border border-[#E5E7EB] text-sm font-medium text-[#0F0F1A] cursor-default focus:outline-none focus:ring-2 focus:ring-[#3730A3] focus:border-[#3730A3] transition-all">
            <span className="block truncate">{menu.title}</span>
            <svg className="w-4 h-4 text-[#9CA3AF] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </Listbox.Button>

          {/* Options dropdown */}
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-[16px] bg-white py-1 text-base shadow-lg ring-1 ring-[#E5E7EB] focus:outline-none sm:text-sm z-50">
              {options.map((option) => (
                <Listbox.Option
                  key={option.title}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2.5 px-4 transition-colors ${
                      active ? "bg-[#EEEDF9] text-[#3730A3]" : "text-[#0F0F1A]"
                    }`
                  }
                  value={option}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate text-sm ${selected ? "font-semibold text-[#3730A3]" : "font-normal"}`}>
                        {option.title}
                      </span>
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
