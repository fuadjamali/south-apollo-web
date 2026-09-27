import { getContactInfo } from "@/lib/contactInfo";
import { updateContactInfoAction } from "./actions";

export const dynamic = "force-dynamic";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default async function AdminContactPage() {
  const contact = await getContactInfo();

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Contact Us section</h1>
        <p className="mt-1 text-sm text-muted">
          Address, phone, and email shown on the home page. Turn it off entirely without losing
          what you've entered.
        </p>

        <form action={updateContactInfoAction} className="mt-6 space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={contact.enabled}
              className="h-4 w-4 rounded border-border"
            />
            Show this section on the home page
          </label>

          <div>
            <label className="block text-sm font-medium text-foreground">Heading</label>
            <input
              type="text"
              name="heading"
              defaultValue={contact.heading}
              className={fieldClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Subheading</label>
            <input
              type="text"
              name="subheading"
              defaultValue={contact.subheading}
              className={fieldClass}
            />
          </div>

          <fieldset className="space-y-3 rounded-lg border border-border p-4">
            <legend className="px-1 text-sm font-semibold text-foreground">
              <span lang="bn">বাংলা</span>{" "}
              <span className="font-normal text-muted">(optional — blank shows the English text)</span>
            </legend>
            <div>
              <label className="block text-sm font-medium text-foreground">Heading</label>
              <input
                type="text"
                name="headingBn"
                lang="bn"
                defaultValue={contact.translations?.bn?.heading || ""}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Subheading</label>
              <input
                type="text"
                name="subheadingBn"
                lang="bn"
                defaultValue={contact.translations?.bn?.subheading || ""}
                className={fieldClass}
              />
            </div>
          </fieldset>

          <div>
            <label className="block text-sm font-medium text-foreground">Address</label>
            <textarea
              name="address"
              rows={2}
              defaultValue={contact.address}
              placeholder="Leave blank to hide this row"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Phone</label>
            <input
              type="text"
              name="phone"
              defaultValue={contact.phone}
              placeholder="Leave blank to hide this row"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              name="email"
              defaultValue={contact.email}
              placeholder="Leave blank to hide this row"
              className={fieldClass}
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}
