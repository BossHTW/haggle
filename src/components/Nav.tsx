import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-marigold text-ink shadow-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 12c0-4 3-7 8-7s8 3 8 7-3 7-8 7c-1.2 0-2.3-.2-3.3-.5L5 20l1.2-3.2C4.8 15.5 4 13.9 4 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 11h6M9 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <span className="font-display text-xl font-semibold tracking-tight">Haggle</span>
    </Link>
  );
}

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-ink-2 md:flex">
          <a href="#primer" className="hover:text-ink">Six words</a>
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#room" className="hover:text-ink">The room</a>
          <a href="#pnl" className="hover:text-ink">P&amp;L</a>
          <a href="#stack" className="hover:text-ink">Built on</a>
        </nav>
        <Link
          href="/demo"
          className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream shadow-sm transition hover:bg-ink-2"
        >
          Watch a live deal →
        </Link>
      </div>
    </header>
  );
}
