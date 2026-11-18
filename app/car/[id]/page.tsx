import { notFound } from "next/navigation";
import { getCarForMetadata } from "@/lib/getCarForMetadata";
import CarDetailClient from "@/components/car/CarDetailClient";

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await getCarForMetadata(id);

  if (!car || car.status === "hidden") {
    notFound();
  }

  return <CarDetailClient car={car} />;
}
