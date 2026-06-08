"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn, LayoutDashboard, Plus } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { VedamLogo } from "@/components/shared/vedam-logo";
import { createClient } from "@/lib/supabase/client";
const navLinks = [
  { href: "/events", label: "Events" },
  { href: "/#categories", label: "Categories" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signInButton = (
    <Button variant="outline" size="sm" className="shrink-0" asChild>
      <Link href="/admin/login" className="inline-flex items-center gap-2">
        <LogIn className="h-4 w-4" />
        Sign In
      </Link>
    </Button>
  );

  const loggedInActions = (
    <>
      <Button variant="outline" size="sm" className="shrink-0" asChild>
        <Link href="/admin/events/new" className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden lg:inline">Create Event</span>
          <span className="lg:hidden">Create</span>
        </Link>
      </Button>
      <Button size="sm" className="shrink-0" asChild>
        <Link href="/admin" className="inline-flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden lg:inline">Dashboard</span>
        </Link>
      </Button>
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mt-4 flex items-center gap-4 rounded-2xl glass px-4 sm:px-6 py-3">
          <Link href="/" className="flex shrink-0 items-center">
            <VedamLogo size="lg" priority />
          </Link>

          <div className="hidden md:flex flex-1 items-center justify-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" className="shrink-0" asChild>
                <Link href="https://vedam.org" target="_blank">
                  Vedam.org
                </Link>
              </Button>
              {user ? loggedInActions : signInButton}
            </div>

            <div className="flex md:hidden items-center gap-2">
              {!user && signInButton}
              <button
                type="button"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mx-4 mt-2 rounded-2xl glass p-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 space-y-2">
              {user && (
                <>
                  <Button className="w-full" variant="outline" asChild>
                    <Link
                      href="/admin/events/new"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Plus className="h-4 w-4" />
                      Create Event
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/admin" onClick={() => setMobileOpen(false)}>
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
