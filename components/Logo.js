"use client";

import { useLogoUrls } from "@/components/LogoContext";

function DefaultMark({ className }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
      fillRule="evenodd"
      aria-hidden="true"
    >
      <path d="M50,10 L85,20 L92,50 L80,80 L55,92 L40,92 L48,70 L35,66 L12,72 L25,56 L5,48 L25,38 L18,26 L32,18 Z M38,34 A6,6 0 1,1 37.99,34 Z" />
    </svg>
  );
}

// variant "auto" (default): always the light logo, unaffected by site theme — what every plain
// <Logo /> call site across the ~20 pages that render one wants.
// variant "theme": swaps to the dark-background logo when the site is in dark mode (header,
// whose background actually changes with the theme), via a CSS-only dark: swap so there's no
// hydration flash. Falls back to variant "auto" behavior if no dark logo has been uploaded.
// variant "dark": always the dark-background logo (footer, whose background is dark regardless
// of site theme — bg-gray-900/black either way), falling back to the light logo if none is set.
export default function Logo({ className = "h-7 w-7", variant = "auto" }) {
  const { light: logoUrl, dark: logoDarkUrl } = useLogoUrls();

  if (variant === "dark") {
    const src = logoDarkUrl || logoUrl;
    return src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className={`${className} object-contain`} />
    ) : (
      <DefaultMark className={className} />
    );
  }

  if (variant === "theme" && logoDarkUrl) {
    return (
      <>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className={`${className} object-contain dark:hidden`} />
        ) : (
          <DefaultMark className={`${className} dark:hidden`} />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoDarkUrl}
          alt=""
          className={`${className} hidden object-contain dark:block`}
        />
      </>
    );
  }

  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt="" className={`${className} object-contain`} />;
  }

  return <DefaultMark className={className} />;
}
