import { IconPhone } from "@tabler/icons-react";
import { getContactInfo, primaryPhoneNumber } from "@/lib/contactInfo";
import { getT } from "@/lib/i18n/server";

// Red "call us" icon, stacked with FloatingWhatsApp/DoctorChatWidget — same site-wide floating
// pattern (components/SiteFooter.js), but tied to Contact Us's own phone number rather than the
// Doctors module, so it shows on any site that has a phone number at all, doctors or not.
// Hidden entirely if no number is configured, same as FloatingWhatsApp with no link configured.
export default async function FloatingCallButton() {
  const [contactInfo, { t }] = await Promise.all([getContactInfo(), getT()]);
  const number = primaryPhoneNumber(contactInfo.phone);
  if (!number) return null;

  return (
    <a
      href={`tel:${number.replace(/[^\d+]/g, "")}`}
      aria-label={t("doctors.callHotline", { number })}
      className="fixed bottom-6 right-24 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg hover:brightness-90"
    >
      <IconPhone size={26} />
    </a>
  );
}
