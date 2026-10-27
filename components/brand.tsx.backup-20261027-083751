import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={`brand${compact ? " brand--compact" : ""}`} href="/" aria-label="Claudvia home">
      <svg className="brand__mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path d="M31.5 8.5H18L8.5 18v12L18 39.5h13.5" />
        <path d="M18.5 14.5 29 34l10.5-20" />
      </svg>
      <span className="brand__word">CLAUDVIA</span>
    </Link>
  );
}
