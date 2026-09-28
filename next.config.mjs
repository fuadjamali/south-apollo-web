/** @type {import('next').NextConfig} */

// Baseline security headers for every response. Vercel already sends Strict-Transport-Security.
// A Content-Security-Policy is deliberately not set here: the site embeds a Google Map, links to
// WhatsApp and serves images from Vercel Blob, and a policy strict enough to be worth having
// needs testing against all of those first.
const SECURITY_HEADERS = [
  // Stop browsers from guessing a file's type (e.g. running an upload as a script).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only this site may frame its pages — blocks clickjacking of the admin and patient logins.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Send only the origin, not the full page URL (which can carry search terms), to other sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The site never needs these device features.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  experimental: {
    serverActions: {
      // Matches lib/blob.js's MAX_UPLOAD_BYTES and Vercel's own hard ceiling for
      // Server Action request bodies — Next.js defaults this to 1MB, which silently
      // rejects any upload above that before the action even runs.
      bodySizeLimit: "4.5mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
