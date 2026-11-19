import { notFound } from "next/navigation";
import { getCarForMetadata } from "@/lib/getCarForMetadata";
import CarDetailClient from "@/components/car/CarDetailClient";

export default async function CarDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ preview_equipment?: string }>;
}) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const car = await getCarForMetadata(id);

  if (!car || car.status === "hidden") {
    notFound();
  }

  if (sp?.preview_equipment === "3") {
    car.equipment = [
      "Air Conditioning",
      "Bluetooth & USB",
      "GPS Navigation",
    ];
  } else if (sp?.preview_equipment === "12") {
    car.equipment = [
      "Air Conditioning",
      "Bluetooth & USB",
      "GPS Navigation",
      "Cruise Control",
      "Keyless Entry",
      "Parking Sensors",
      "Heated Seats",
      "Apple CarPlay / Android Auto",
      "Reversing Camera",
      "Sunroof",
      "USB-C Charging",
      "Child Seat Anchors",
    ];
  }

  return <CarDetailClient car={car} />;
}
