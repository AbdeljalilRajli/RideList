"use client"

import { ShowMoreProps } from "@/types"
import { CustomButton } from "./CustomButton";

const ShowMore = ({ pageNumber, isNext, setLimit }: ShowMoreProps) => {
  const handleNavigation = () => {
    const newLimit = (pageNumber + 1) * 10;
    
    setLimit(newLimit);
  }

  return (
    <div className="w-full flex-center gap-5 mt-10">
        {!isNext && (
            <CustomButton 
                title="Show More"
                btnType="button"
                containerStyles="bg-blue-900 [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.5),rgba(255,255,255,0))] rounded-full text-white"
                handleClick={handleNavigation}          
            />
        )}
    </div>
  )
}

export default ShowMore