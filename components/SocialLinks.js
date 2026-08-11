import {
  IconBrandX,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandLinkedin,
  IconBrandYoutube,
} from "@tabler/icons-react";
import siteConfig from "@/config/site";

const ICONS = {
  "ti-brand-x": IconBrandX,
  "ti-brand-facebook": IconBrandFacebook,
  "ti-brand-instagram": IconBrandInstagram,
  "ti-brand-tiktok": IconBrandTiktok,
  "ti-brand-linkedin": IconBrandLinkedin,
  "ti-brand-youtube": IconBrandYoutube,
};

export default function SocialLinks() {
  const { social } = siteConfig;
  if (!social?.length) return null;

  return (
    <div className="mt-8 flex justify-center gap-5 text-gray-300">
      {social.map((item) => {
        const Icon = ICONS[item.icon];
        return (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            className="hover:text-white"
          >
            <Icon size={20} stroke={1.75} />
          </a>
        );
      })}
    </div>
  );
}
