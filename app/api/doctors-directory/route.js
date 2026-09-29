import { NextResponse } from "next/server";
import { getActiveDoctors, getSpecialties, toPublicDoctor, toPublicSpecialty } from "@/lib/doctors";
import { getHealthCheckupPage } from "@/lib/healthPackages";

// Registered in proxy.js's PUBLIC_PREFIXES (no auth) and lib/plan.js's PUBLIC_ROUTE_MODULES
// (gated on the "doctors" module, same as /doctors itself) — same pattern as
// /api/gallery-photos. Takes no request params, so without `dynamic = "force-dynamic"` Next
// would happily render this once at build time and serve that frozen snapshot forever.
export const dynamic = "force-dynamic";

// Public directory data for the site-wide doctor-finder chat widget
// (components/DoctorChatWidget.js) — fetched lazily, once, the first time a visitor opens it,
// so every other page's payload is unaffected. Same trimmed shape /doctors itself sends its
// client component.
export async function GET() {
  const [doctors, specialties, checkupPage] = await Promise.all([
    getActiveDoctors(),
    getSpecialties(),
    getHealthCheckupPage(),
  ]);

  return NextResponse.json({
    doctors: doctors.map(toPublicDoctor),
    specialties: specialties.map(toPublicSpecialty),
    // The clinic's appointment hotline — used as the call fallback for a doctor with no serial
    // number of their own, same as the /doctors page.
    hotline: checkupPage?.hotline || "",
  });
}
