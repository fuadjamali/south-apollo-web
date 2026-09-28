import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getEnquiries() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    const result = await db.query(
      "SELECT id, name, email, phone, message, created_at FROM enquiries ORDER BY created_at DESC LIMIT 100"
    );
    return result.rows;
  } catch {
    return [];
  }
}

export default async function EnquiriesPage() {
  const enquiries = await getEnquiries();

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Enquiries</h1>
        <p className="mt-1 text-sm text-muted">
          {enquiries.length === 0
            ? "No enquiries yet."
            : `${enquiries.length} enquir${enquiries.length === 1 ? "y" : "ies"} received.`}
        </p>

        {enquiries.length > 0 && (
          <div className="mt-6 space-y-4">
            {enquiries.map((enquiry) => (
              <div key={enquiry.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="font-semibold text-foreground">{enquiry.name}</p>
                  <p className="text-xs text-muted">
                    {new Date(enquiry.created_at).toLocaleString()}
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {[enquiry.phone, enquiry.email].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-3 text-sm text-foreground">{enquiry.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
