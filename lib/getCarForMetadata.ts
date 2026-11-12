import { supabase } from "@/lib/supabase";
import { cars as staticCars } from "@/constants";
import { CarProps } from "@/types";

/**
 * Loads a car by UUID or slug using the public anon client.
 * Returns null if the car does not exist OR is marked as hidden,
 * ensuring hidden/unknown cars never leak details in metadata or OG images.
 */
export async function getCarForMetadata(id: string): Promise<CarProps | null> {
  if (!id) return null;

  try {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      );

    // 1. Direct UUID lookup
    if (isUuid) {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (data && !error) {
        if (data.status === "hidden") {
          return null;
        }
        return data as CarProps;
      }
    }

    // 2. Query all cars from Supabase and match slug or make/model
    const { data: dbCars, error: dbError } = await supabase
      .from("cars")
      .select("*");

    if (dbCars && !dbError && dbCars.length > 0) {
      const matched = dbCars.find((c: any) => {
        const slugPrefix = `${c.make?.toLowerCase()}-${c.model?.toLowerCase().replace(/\s+/g, "-")}`;
        return (
          c.id === id ||
          id.toLowerCase().startsWith(slugPrefix) ||
          (id.toLowerCase().includes(c.make?.toLowerCase()) &&
            id.toLowerCase().includes(c.model?.toLowerCase().replace(/\s+/g, "-")))
        );
      });

      if (matched) {
        if (matched.status === "hidden") {
          return null;
        }
        return matched as CarProps;
      }
    }

    // 3. Fallback: check static cars (legacy slug match)
    for (let index = 0; index < staticCars.length; index++) {
      const c = staticCars[index];
      const computedId = `${c.make.toLowerCase()}-${c.model.toLowerCase().replace(/\s+/g, "-")}-${c.year}-${index}`;
      if (
        computedId === id ||
        id.toLowerCase().includes(c.model.toLowerCase().replace(/\s+/g, "-"))
      ) {
        if ((c as any).status === "hidden") {
          return null;
        }
        return c as CarProps;
      }
    }
  } catch (err) {
    console.warn("Could not query car for metadata:", err);
  }

  return null;
}
