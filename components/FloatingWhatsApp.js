import { IconBrandWhatsapp } from "@tabler/icons-react";
import { getSocialSettings, getWhatsappHref } from "@/lib/socialSettings";
import { getT } from "@/lib/i18n/server";

// Admin-editable at /admin/social — hidden entirely if no number or group link is configured.
export default async function FloatingWhatsApp() {
  const [settings, { t }] = await Promise.all([getSocialSettings(), getT()]);
  const href = getWhatsappHref(settings);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("common.chatOnWhatsapp")}
      className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600"
    >
      <IconBrandWhatsapp size={26} />
    </a>
  );
}
