/**
 * Client-side Image Compression & Resizing Utility for RideList
 * Enforces max 5MB input size, resizes down to maxWidth 1600px, and encodes to WebP at 0.8 quality.
 */

export interface CompressionResult {
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

/**
 * Validates and compresses an image file in the browser.
 * 
 * @param file The original File object from <input type="file"> or drop event
 * @param maxWidth Max dimension width in pixels (default: 1600)
 * @param quality Compression quality 0.0 to 1.0 (default: 0.8)
 */
export async function compressAndResizeImage(
  file: File,
  maxWidth = 1600,
  quality = 0.8
): Promise<CompressionResult> {
  // 1. Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error(`"${file.name}" is not a valid image file.`);
  }

  // 2. Validate max file size (5 MB limit)
  const MAX_BYTES = 5 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(`"${file.name}" is ${sizeInMB} MB. Maximum allowed size is 5 MB.`);
  }

  // 3. Load image in an Image element
  return new Promise<CompressionResult>((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let targetWidth = img.naturalWidth || img.width;
      let targetHeight = img.naturalHeight || img.height;

      // Scale down proportionally if wider than maxWidth
      if (targetWidth > maxWidth) {
        const ratio = maxWidth / targetWidth;
        targetWidth = maxWidth;
        targetHeight = Math.round(targetHeight * ratio);
      }

      // Create offscreen canvas
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Unable to create canvas 2D context for image compression."));
        return;
      }

      // Draw with high quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Determine output format: WebP preferred, JPEG fallback
      const outputMime = "image/webp";
      const sanitizedName = file.name.replace(/\.[^/.]+$/, "") + ".webp";

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // Fallback to JPEG if browser fails WebP export
            canvas.toBlob(
              (fallbackBlob) => {
                if (!fallbackBlob) {
                  reject(new Error("Failed to encode compressed image."));
                  return;
                }
                const fallbackFile = new File([fallbackBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve({
                  file: fallbackFile,
                  previewUrl: URL.createObjectURL(fallbackBlob),
                  originalSize: file.size,
                  compressedSize: fallbackBlob.size,
                  width: targetWidth,
                  height: targetHeight,
                });
              },
              "image/jpeg",
              quality
            );
            return;
          }

          const compressedFile = new File([blob], sanitizedName, {
            type: outputMime,
            lastModified: Date.now(),
          });

          resolve({
            file: compressedFile,
            previewUrl: URL.createObjectURL(blob),
            originalSize: file.size,
            compressedSize: blob.size,
            width: targetWidth,
            height: targetHeight,
          });
        },
        outputMime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to decode image file "${file.name}".`));
    };

    img.src = objectUrl;
  });
}

/**
 * Format bytes into human-readable string (e.g. 150 KB, 1.2 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
