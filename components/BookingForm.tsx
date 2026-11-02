"use client";

import React from "react";
import { CarProps } from "@/types";
import ReservationCheckout from "./ReservationCheckout";

interface BookingFormProps {
  car: CarProps;
  isOpen: boolean;
  onClose?: () => void;
  closeModal?: () => void;
  initialPickupDate?: string;
  initialReturnDate?: string;
  initialPickupLocation?: string;
}

const BookingForm: React.FC<BookingFormProps> = ({
  car,
  isOpen,
  onClose,
  closeModal,
  initialPickupDate,
  initialReturnDate,
  initialPickupLocation,
}) => {
  const handleClose = onClose || closeModal || (() => {});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0F0F1A]/70 backdrop-blur-md flex items-start justify-center p-2 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-[#E5E7EB] overflow-hidden my-4 sm:my-8">
        <ReservationCheckout
          car={car}
          isModal={true}
          onClose={handleClose}
          initialPickupDate={initialPickupDate}
          initialReturnDate={initialReturnDate}
          initialPickupLocation={initialPickupLocation}
        />
      </div>
    </div>
  );
};

export default BookingForm;
