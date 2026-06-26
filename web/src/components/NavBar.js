"use client";

import Link from "next/link";
import { useAuth } from "../lib/auth";

export default function NavBar() {
  const { user, logout, loading } = useAuth();

  return (
    <header className="border-b border-ink-line">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-mono text-sm tracking-tagwide text-signal-gold">SP</span>
          <span className="font-mono text-sm text-bone-dim group-hover:text-bone transition-colors">
            skillpay<span className="text-bone-faint">/ledger</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-bone-dim">
          <Link href="/challenges" className="hover:text-bone transition-colors">
            Challenges
          </Link>
          {user?.role === "mentor" && (
            <Link href="/challenges/new" className="hover:text-bone transition-colors">
              New challenge
            </Link>
          )}
          {user && (
            <Link href="/dashboard" className="hover:text-bone transition-colors">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {loading ? null : user ? (
            <>
              <Link
                href="/profile"
                className="font-mono text-xs text-bone-dim hover:text-signal-gold transition-colors"
              >
                {user.walletAddress?.slice(0, 4)}…{user.walletAddress?.slice(-4)}
              </Link>
              <button
                onClick={logout}
                className="text-xs text-bone-faint hover:text-signal-rust transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-bone-dim hover:text-bone transition-colors">
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm bg-signal-gold text-ink px-4 py-1.5 rounded-sm hover:bg-signal-gold/90 transition-colors font-medium"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
