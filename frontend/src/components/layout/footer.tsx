import Link from "next/link";
import { Linkedin, Twitter, Mail } from "lucide-react";

const footerLinks = {
  Events: [
    { href: "/events", label: "All Events" },
    { href: "/events?filter=upcoming", label: "Upcoming" },
    { href: "/events?filter=past", label: "Past Events" },
    { href: "/admin", label: "Admin" },
  ],
  Vedam: [
    { href: "https://vedam.org", label: "About Vedam" },
    { href: "https://vedam.org", label: "Admissions" },
    { href: "https://vedam.org", label: "Programs" },
  ],
  Connect: [
    { href: "mailto:events@vedam.org", label: "events@vedam.org" },
    { href: "https://linkedin.com/company/vedam", label: "LinkedIn" },
    { href: "https://twitter.com/vedam", label: "Twitter" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-vedam-orange to-vedam-purple">
                <span className="font-bold text-white">V</span>
              </div>
              <div>
                <div className="font-semibold">Vedam Events</div>
                <div className="text-xs text-muted-foreground">School of Technology</div>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Learn tech by building it. Premium events for builders, founders, and AI enthusiasts.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4 text-sm">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Vedam School of Technology. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground">
              <Twitter className="h-4 w-4" />
            </Link>
            <Link href="https://linkedin.com" className="text-muted-foreground hover:text-foreground">
              <Linkedin className="h-4 w-4" />
            </Link>
            <Link href="mailto:events@vedam.org" className="text-muted-foreground hover:text-foreground">
              <Mail className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
