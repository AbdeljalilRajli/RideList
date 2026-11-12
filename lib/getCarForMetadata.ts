import { supabase } from "@/lib/supabase";
import { cars as staticCars } from "@/constants";
import { CarProps } from "@/types";
import { getCarSlug } from "@/lib/utils";

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

    // 2. Query all cars from Supabase and match clean slug or make/model
    const { data: dbCars, error: dbError } = await supabase
      .from("cars")
      .select("*");

    if (dbCars && !dbError && dbCars.length > 0) {
      const normalizedInput = id
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // 2a. Exact slug match
      const exactMatch = dbCars.find((c: any) => {
        const slug = getCarSlug(c);
        return c.id === id || slug === normalizedInput;
      });

      if (exactMatch) {
        if (exactMatch.status === "hidden") {
          return null;
        }
        return exactMatch as CarProps;
      }

      // 2b. Prefix or fuzzy slug match
      const matched = dbCars.find((c: any) => {
        const slug = getCarSlug(c);
        return (
          normalizedInput.startsWith(slug) ||
          slug.startsWith(normalizedInput) ||
          (c.make &&
            c.model &&
            normalizedInput.includes(
              c.model.toLowerCase().replace(/[^a-z0-9]+/g, "-")
            ))
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
    const normalizedInput = id
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    for (let index = 0; index < staticCars.length; index++) {
      const c = staticCars[index];
      const slug = getCarSlug(c);
      const computedId = `${slug}-${c.year}-${index}`;
      if (
        slug === normalizedInput ||
        computedId === id ||
        normalizedInput.includes(
          c.model.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        )
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
