import { IconBrandWhatsapp } from "@tabler/icons-react";
import siteConfig from "@/config/site";

export default function FloatingWhatsApp() {
  const { whatsappNumber, whatsappMessage } = siteConfig.contact;
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

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
