"use client"

import { ShowMoreProps } from "@/types"

const ShowMore = ({ pageNumber, isNext, setLimit }: ShowMoreProps) => {
  const handleNavigation = () => {
    const newLimit = (pageNumber + 1) * 10;
    setLimit(newLimit);
  }

  return (
    <div className="w-full flex items-center justify-center gap-5 mt-10">
      {!isNext && (
        <button
          onClick={handleNavigation}
          className="h-12 px-8 rounded-full bg-[#3730A3] text-white font-semibold text-sm hover:bg-[#312E81] active:scale-[0.98] transition-all shadow-sm"
        >
          Show More
        </button>
      )}
    </div>
  )
}

export default ShowMore
