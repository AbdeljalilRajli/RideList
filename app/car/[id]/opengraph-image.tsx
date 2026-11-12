import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { getCarForMetadata } from "@/lib/getCarForMetadata";
import { getCarImage } from "@/lib/utils";
import { CarProps } from "@/types";

export const runtime = "nodejs";
export const revalidate = 3600; // Sensible cache: 1 hour
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadCarImageBase64(car: CarProps): Promise<string | null> {
  try {
    const rawUrl = getCarImage(car);
    let buf: Buffer;

    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      const res = await fetch(rawUrl);
      if (!res.ok) return null;
      const arrayBuf = await res.arrayBuffer();
      buf = Buffer.from(arrayBuf);
    } else {
      const cleanPath = decodeURIComponent(rawUrl.replace(/^\//, ""));
      const filePath = path.join(process.cwd(), "public", cleanPath);
      if (!fs.existsSync(filePath)) return null;
      buf = fs.readFileSync(filePath);
    }

    const png = await sharp(buf)
      .resize({ width: 600, height: 380, fit: "inside", withoutEnlargement: true })
      .png({ quality: 85, compressionLevel: 8 })
      .toBuffer();

    return `data:image/png;base64,${png.toString("base64")}`;
  } catch (err) {
    console.error("Error loading car image for OG:", err);
    return null;
  }
}

function getLogoBase64(): string {
  try {
    const filePath = path.join(process.cwd(), "public", "logo.png");
    const buf = fs.readFileSync(filePath);
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return "";
  }
}

export default async function Image({
  params,
}: {
  params: { id: string };
}) {
  const car = await getCarForMetadata(params.id);

  // Hidden or unknown cars must never leak: fall back to default site preview
  if (!car) {
    const defaultPath = path.join(process.cwd(), "app", "opengraph-image.jpg");
    const defaultBuf = fs.readFileSync(defaultPath);
    return new Response(defaultBuf, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  }

  // Load custom Work Sans TTF font files
  const boldFontData = fs.readFileSync(
    path.join(process.cwd(), "app/fonts/WorkSans-Bold.ttf")
  );
  const semiBoldFontData = fs.readFileSync(
    path.join(process.cwd(), "app/fonts/WorkSans-SemiBold.ttf")
  );

  const logoBase64 = getLogoBase64();
  const carImageBase64 = await loadCarImageBase64(car);

  const carName = `${car.make} ${car.model}`;
  const transmission =
    car.transmission === "a" || car.transmission === "automatic"
      ? "Automatic"
      : "Manual";
  const fuel = car.fuel_type
    ? car.fuel_type.charAt(0).toUpperCase() + car.fuel_type.slice(1)
    : "Petrol";
  const seats = `${car.seats || 5} Seats`;
  const price = car.price_per_day || (car as any).price || 500;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #1E1B4B 0%, #0F0C20 100%)",
          padding: "44px 54px",
          fontFamily: "Work Sans",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {logoBase64 ? (
            <div
              style={{
                display: "flex",
                background: "#FFFFFF",
                padding: "8px 20px",
                borderRadius: "14px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
              }}
            >
              <img
                src={logoBase64}
                height="40"
                style={{ objectFit: "contain" }}
                alt="Ridelist"
              />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "32px",
                fontWeight: 700,
                color: "#FFFFFF",
              }}
            >
              Ride<span style={{ color: "#f79761" }}>List</span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(89, 55, 224, 0.25)",
              border: "1px solid rgba(89, 55, 224, 0.6)",
              color: "#C7D2FE",
              padding: "8px 20px",
              borderRadius: "999px",
              fontSize: "17px",
              fontWeight: 600,
            }}
          >
            Morocco Car Rental
          </div>
        </div>

        {/* Center Main Content */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginTop: "16px",
          }}
        >
          {/* Left: Car Title, Specs & Price */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "520px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "46px",
                fontWeight: 700,
                color: "#FFFFFF",
                lineHeight: 1.15,
                letterSpacing: "-0.5px",
              }}
            >
              {carName}
            </div>

            <div
              style={{
                display: "flex",
                fontSize: "20px",
                fontWeight: 600,
                color: "#A5B4FC",
                marginTop: "12px",
              }}
            >
              {seats} • {transmission} • {fuel}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "16px",
                padding: "14px 22px",
                marginTop: "24px",
                maxWidth: "320px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#9CA3AF",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Daily Rental Rate
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  marginTop: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "52px",
                    fontWeight: 700,
                    color: "#f79761",
                  }}
                >
                  {price}
                </span>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    marginLeft: "8px",
                  }}
                >
                  DH
                </span>
                <span
                  style={{
                    fontSize: "18px",
                    color: "#9CA3AF",
                    marginLeft: "6px",
                  }}
                >
                  / day
                </span>
              </div>
            </div>
          </div>

          {/* Right: Car Image */}
          {carImageBase64 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "560px",
                height: "360px",
              }}
            >
              <img
                src={carImageBase64}
                style={{
                  maxWidth: "560px",
                  maxHeight: "360px",
                  objectFit: "contain",
                }}
                alt={carName}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "16px",
            color: "#CBD5E1",
            fontSize: "15px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            WhatsApp Instant Booking • Doorstep & Airport Delivery
          </div>
          <div
            style={{
              color: "#f79761",
              fontWeight: 700,
              fontSize: "16px",
            }}
          >
            ridelist.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Work Sans",
          data: boldFontData,
          weight: 700,
          style: "normal",
        },
        {
          name: "Work Sans",
          data: semiBoldFontData,
          weight: 600,
          style: "normal",
        },
      ],
    }
  );
}
