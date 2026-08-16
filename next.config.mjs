/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Matches lib/blob.js's MAX_UPLOAD_BYTES and Vercel's own hard ceiling for
      // Server Action request bodies — Next.js defaults this to 1MB, which silently
      // rejects any upload above that before the action even runs.
      bodySizeLimit: "4.5mb",
    },
  },
};

export default nextConfig;
