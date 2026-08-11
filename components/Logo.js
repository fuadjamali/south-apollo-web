export default function Logo({ className = "h-7 w-7" }) {
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
