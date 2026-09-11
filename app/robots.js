export default function robots() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /admin and /api are already unreachable to a crawler without a session (proxy.js), but
        // disallowing them here too keeps a stray external link from ever surfacing one in
        // results. /member, /cart, /checkout, and the two *-confirmation routes are reachable
        // and public, but personal/transactional — nothing there is meant to rank, and the two
        // confirmation routes specifically carry a real customer's order/booking details.
        disallow: [
          "/admin",
          "/api",
          "/member",
          "/cart",
          "/checkout",
          "/booking-confirmation",
          "/order-confirmation",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
