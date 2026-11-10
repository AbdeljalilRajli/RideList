import { supabase } from "@/lib/supabase";

const BUCKET_NAME = "car-images";

/**
 * Extracts the storage object path inside 'car-images' bucket from a full public URL.
 * Example URL:
 * https://tbobbdlyuvmtbveedlmc.supabase.co/storage/v1/object/public/car-images/cars/abc-123/img.webp
 * Returns: "cars/abc-123/img.webp"
 */
export function extractStoragePath(imageUrl: string): string | null {
  if (!imageUrl) return null;

  // Check if it's a Supabase storage URL for our bucket
  const bucketMarker = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const index = imageUrl.indexOf(bucketMarker);
  if (index !== -1) {
    return decodeURIComponent(imageUrl.substring(index + bucketMarker.length));
  }

  // Also handle relative or short format
  if (imageUrl.startsWith(`${BUCKET_NAME}/`)) {
    return imageUrl.substring(BUCKET_NAME.length + 1);
  }

  return null;
}

/**
 * Uploads a single compressed image file to the 'car-images' bucket.
 * Returns the permanent public URL.
 */
export async function uploadCarImage(
  file: File,
  folderPrefix: string = "cars"
): Promise<string> {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const cleanFileName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "-")
    .replace(/-+/g, "-");

  const filePath = `${folderPrefix}/${timestamp}-${randomSuffix}-${cleanFileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type || "image/webp",
    });

  if (error || !data) {
    throw new Error(`Upload failed for "${file.name}": ${error?.message || "Unknown error"}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Removes one or more images from the 'car-images' bucket given their public URLs.
 * Local paths (e.g. starting with '/ridelist cars images/') are ignored safely.
 */
export async function deleteCarImages(imageUrls: string[]): Promise<void> {
  if (!imageUrls || imageUrls.length === 0) return;

  const pathsToDelete: string[] = [];

  for (const url of imageUrls) {
    const path = extractStoragePath(url);
    if (path) {
      pathsToDelete.push(path);
    }
  }

  if (pathsToDelete.length === 0) return;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(pathsToDelete);

  if (error) {
    console.error("Error deleting car images from storage:", error);
    // Non-fatal, log warning
  }
}

/**
 * Migrates a local image (e.g. "/ridelist cars images/BMW 3 Series.webp")
 * to the Supabase 'car-images' bucket and returns the new public URL.
 */
export async function migrateLocalImageToSupabase(
  localPath: string
): Promise<string> {
  // Fetch local image file as Blob
  const encodedPath = encodeURI(localPath);
  const response = await fetch(encodedPath);

  if (!response.ok) {
    throw new Error(`Could not read local image at ${localPath}`);
  }

  const blob = await response.blob();
  const filename = localPath.split("/").pop() || "car.webp";
  const cleanName = filename.toLowerCase().replace(/[^a-z0-9.]/g, "-");
  const filePath = `seed/${cleanName}`;

  // Upload to Supabase bucket
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, blob, {
      cacheControl: "31536000",
      upsert: true,
      contentType: "image/webp",
    });

  if (error || !data) {
    throw new Error(`Migration upload failed for "${filename}": ${error?.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
