import { IconBrandWhatsapp } from "@tabler/icons-react";
import { getSocialSettings } from "@/lib/socialSettings";

// Admin-editable at /admin/social — hidden entirely if no number is configured.
export default async function FloatingWhatsApp() {
  const { whatsapp_number: whatsappNumber, whatsapp_message: whatsappMessage } =
    await getSocialSettings();
  if (!whatsappNumber) return null;

  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage || "")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600"
    >
      <IconBrandWhatsapp size={26} />
    </a>
  );
}
