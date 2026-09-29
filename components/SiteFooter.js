import Logo from "@/components/Logo";
import SocialLinks from "@/components/SocialLinks";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import FloatingCallButton from "@/components/FloatingCallButton";
import DoctorChatWidget from "@/components/DoctorChatWidget";
import BackToTopButton from "@/components/BackToTopButton";
import { getT } from "@/lib/i18n/server";
import { getSectionHeadings } from "@/lib/sectionHeadings";
import { getSocialSettings, getWhatsappHref } from "@/lib/socialSettings";
import { getBusinessInfo } from "@/lib/businessInfo";
import { getAllLegalPages } from "@/lib/legalPages";
import { getModuleStates, isEnabled } from "@/lib/plan";

// The site-wide closing footer (WhatsApp CTA, social links, copyright, published legal pages)
// plus the floating WhatsApp button — both tied to Feature Config's "Footer" toggle — and the
// back-to-top button. Shared by the home page and the other public pages so they stay identical.
//
// onHomePage: the home footer is the #contact jump target ("Get in touch"), so it's at least a
// viewport tall — being the last element, it otherwise can't scroll far enough to sit under the
// sticky header — and takes order 999 in home's flex column. Elsewhere it's a normal-height
// footer.
export default async function SiteFooter({ onHomePage = false }) {
  const { locale, t } = await getT();
  const [moduleStates, headings, socialSettings, business, legalPages] = await Promise.all([
    getModuleStates(),
    getSectionHeadings(locale),
    getSocialSettings(),
    getBusinessInfo(),
    getAllLegalPages(),
  ]);
  // Back-to-top isn't part of the Footer toggle — it stays even with the footer switched off.
  if (!isEnabled("footer", moduleStates)) return <BackToTopButton />;

  const { footer } = headings;
  const whatsappHref = getWhatsappHref(
    socialSettings,
    socialSettings.footer_whatsapp_message || socialSettings.whatsapp_message
  );
  const publishedLegalPages = legalPages.filter((page) => page.enabled);

  return (
    <>
      <footer
        id={onHomePage ? "contact" : undefined}
        className={`flex flex-col items-center justify-center bg-gray-900 py-16 text-center text-white dark:bg-black ${
          onHomePage ? "min-h-[calc(100vh-88px)]" : ""
        }`}
        style={onHomePage ? { order: 999 } : undefined}
      >
        <h2 className="text-2xl font-bold">{footer.heading}</h2>
        <p className="mt-2 text-gray-300">{footer.subheading}</p>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-200"
          >
            {t("common.chatOnWhatsapp")}
          </a>
        )}

        <SocialLinks />

        <p className="mt-10 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Logo className="h-4 w-4" variant="dark" />
          {t("footer.copyright", { year: new Date().getFullYear(), name: business.name })}
        </p>
        {/* Only pages an admin has actually published at /admin/legal get linked. */}
        {publishedLegalPages.length > 0 && (
          <p className="mt-2 flex items-center justify-center gap-3 text-xs text-gray-400">
            {publishedLegalPages.map((page) => (
              <a key={page.slug} href={`/${page.slug}`} className="hover:text-white">
                {page.title}
              </a>
            ))}
          </p>
        )}
      </footer>

      <FloatingWhatsApp />
      {/* Stacked left of WhatsApp, same corner, same row: the red call icon (any site with a
          phone number, hidden if none is set), then the Doctor Finder bubble further left
          (gated on the Doctors module rather than a toggle of its own). */}
      <FloatingCallButton />
      {isEnabled("doctors", moduleStates) && <DoctorChatWidget />}
      <BackToTopButton />
    </>
  );
}
