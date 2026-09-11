import { ImageResponse } from "next/og";
import { getBusinessInfo } from "@/lib/businessInfo";

// Replaces the old public/og-image.svg, which was a static placeholder that literally shipped
// the words "YOUR_BUSINESS_NAME" / "YOUR_TAGLINE_HERE" to anyone who shared a link — nobody
// ever wired it up to real content, and SVG isn't reliably rendered as a social preview image
// by Facebook/LinkedIn/WhatsApp/X anyway (PNG/JPG only, in practice). This is Next's file-
// convention dynamic OG image instead: real admin-edited business name/tagline, rendered as a
// real PNG at request time. Used as the site-wide default image (lib/seo.js references
// "/opengraph-image" as the fallback for any page that doesn't have its own more specific
// content image, e.g. a product photo or blog post image).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const business = await getBusinessInfo();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111827",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 96,
            height: 96,
            borderRadius: 24,
            backgroundColor: "#ffffff",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", fontSize: 48, fontWeight: 700, color: "#111827" }}>
            {business.name?.[0]?.toUpperCase() || "F"}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: "#ffffff" }}>
          {business.name}
        </div>
        {business.tagline && (
          <div style={{ display: "flex", fontSize: 28, color: "#9ca3af", marginTop: 16 }}>
            {business.tagline}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
