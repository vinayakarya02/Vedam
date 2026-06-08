"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  QrCode,
  LogOut,
  Menu,
  X,
  Plus,
  Tags,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { VedamLogo } from "@/components/shared/vedam-logo";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/event-types", label: "Event Types", icon: Tags },
  { href: "/admin/registrations", label: "Registrations", icon: Users },
  { href: "/admin/scan", label: "QR Scanner", icon: QrCode },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/events") {
    return (
      pathname === "/admin/events" ||
      pathname === "/admin/events/new" ||
      /^\/admin\/events\/[^/]+\/edit$/.test(pathname)
    );
  }
  if (href === "/admin/event-types") {
    return pathname === "/admin/event-types";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/admin/login") return null;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const NavContent = () => (
    <>
      <div className="shrink-0 border-b border-white/5 p-5 lg:p-6">
        <Link
          href="/admin"
          className="flex items-center gap-3 lg:items-start"
        >
          <VedamLogo
            size="sm"
            className="hidden shrink-0 lg:inline-flex !py-1"
          />
          <span className="text-xs text-muted-foreground leading-snug lg:pt-1.5">
            Events Platform
          </span>
        </Link>
      </div>

      <div className="px-4 pt-4">
        <Button asChild className="w-full">
          <Link href="/admin/events/new" onClick={() => setMobileOpen(false)}>
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-vedam-orange/10 text-vedam-orange"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 glass">
        <VedamLogo size="sm" />
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 flex h-full w-64 flex-col border-r border-white/5 bg-[#0a0a0a] transition-transform lg:translate-x-0",
          "pt-[4.75rem] lg:pt-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent />
      </aside>
    </>
  );
}
