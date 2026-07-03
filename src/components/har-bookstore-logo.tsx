/**
 * 山書房 Har Bookstore mark — an open book whose pages form a single
 * mountain peak (山 = mountain / "Har" = Hebrew for mountain), with the
 * spine as the peak's centerline and short strokes suggesting pages.
 * Uses currentColor so it can be recolored via a text-color class.
 */
export function HarBookstoreLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M14 92 L60 24 L106 92"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <line
        x1="60"
        y1="24"
        x2="60"
        y2="92"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="26"
        y1="74"
        x2="52"
        y2="74"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="34"
        y1="62"
        x2="53"
        y2="62"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="68"
        y1="62"
        x2="87"
        y2="62"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="68"
        y1="74"
        x2="94"
        y2="74"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
