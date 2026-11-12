import { notFound } from "next/navigation";
import { getCarForMetadata } from "@/lib/getCarForMetadata";
import CarDetailClient from "@/components/car/CarDetailClient";

export default async function CarDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const car = await getCarForMetadata(params.id);

  if (!car || car.status === "hidden") {
    notFound();
  }

  return <CarDetailClient car={car} />;
}
