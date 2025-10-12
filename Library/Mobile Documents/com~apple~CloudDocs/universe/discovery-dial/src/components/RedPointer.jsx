/**
 * RedPointer - Small upward triangle at top center of the dial.
 * Absolute positioned inside the RELATIVE dial container.
 */
export default function RedPointer() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 -translate-x-1/2"
      style={{ top: 6, zIndex: 20 }}
      width="18"
      height="12"
      viewBox="0 0 18 12"
    >
      <path d="M9 0 L18 12 H0 Z" fill="#FF3B30" />
    </svg>
  );
}

