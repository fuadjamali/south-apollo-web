import {
  IconUserPlus,
  IconClipboardList,
  IconRocket,
  IconCreditCard,
  IconCalendarCheck,
  IconHeadset,
  IconTruck,
  IconMessageCircle,
  IconCircleCheck,
  IconSettings,
  IconPhoneCall,
  IconMail,
  IconClipboardCheck,
  IconPackage,
  IconThumbUp,
} from "@tabler/icons-react";

// A curated set, not the whole tabler library — narrow enough to browse in a <select>, broad
// enough to cover most "how it works" steps (sign up, book, pay, deliver, support, done). Plain
// components, safe to render from a Server Component (app/page.js) or a client form alike — no
// "use client" needed here, tabler icons have no client-only hooks.
export const HOW_IT_WORKS_ICONS = {
  userPlus: { label: "Sign up", Icon: IconUserPlus },
  clipboardList: { label: "Fill a form", Icon: IconClipboardList },
  calendarCheck: { label: "Book / schedule", Icon: IconCalendarCheck },
  creditCard: { label: "Pay", Icon: IconCreditCard },
  settings: { label: "We set it up", Icon: IconSettings },
  package: { label: "Prepare / package", Icon: IconPackage },
  truck: { label: "Delivery", Icon: IconTruck },
  phoneCall: { label: "We call you", Icon: IconPhoneCall },
  mail: { label: "Email / confirmation", Icon: IconMail },
  messageCircle: { label: "Chat / message", Icon: IconMessageCircle },
  headset: { label: "Support", Icon: IconHeadset },
  clipboardCheck: { label: "Review / approve", Icon: IconClipboardCheck },
  rocket: { label: "Launch / go live", Icon: IconRocket },
  thumbUp: { label: "Enjoy / done", Icon: IconThumbUp },
  circleCheck: { label: "Complete", Icon: IconCircleCheck },
};

export const HOW_IT_WORKS_ICON_KEYS = Object.keys(HOW_IT_WORKS_ICONS);
