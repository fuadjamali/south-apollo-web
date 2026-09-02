import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_BYTES = 8 * 1024 * 1024;

// Authorizes direct browser-to-Blob uploads for product gallery photos. Unlike every other
// image field in the admin (a plain <input type=file> inside a Server Action), this bypasses
// the Server Action request body altogether — Vercel caps that at 4.5MB total per request
// (see next.config.mjs), which several full-size gallery photos in one submission would blow
// past easily. The file goes straight from the browser to Blob storage; only the resulting URL
// comes back through the server (see components/ProductPhotoManager.js).
export async function POST(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const session = await getServerSession(authOptions);
        if (!session) {
          throw new Error("Not authorized.");
        }
        if (!pathname.startsWith("product-photos/")) {
          throw new Error("Invalid upload path.");
        }
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
