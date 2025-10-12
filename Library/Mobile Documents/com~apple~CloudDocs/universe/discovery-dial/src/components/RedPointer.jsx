/**
 * RedPointer - Prominent upward triangle at top center of the dial.
 * Absolute positioned inside the RELATIVE dial container.
 */
export default function RedPointer() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 -translate-x-1/2"
      style={{ top: 4, zIndex: 30 }}
      width="24"
      height="16"
      viewBox="0 0 24 16"
      focusable="false"
    >
      <path d="M12 0 L24 16 H0 Z" fill="#E63946" />
    </svg>
  );
}

