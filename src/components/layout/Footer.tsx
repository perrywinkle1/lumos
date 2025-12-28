import Link from "next/link";
import { Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-dark">
      {/* Ambient glows */}
      <div className="footer-glow-left" aria-hidden="true" />
      <div className="footer-glow-right" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Branding and Description */}
          <div className="space-y-8">
            <Link
              href="/"
              className="group relative inline-block text-2xl font-bold tracking-tighter"
            >
              <span className="bg-gradient-to-r from-lumos-accent-primary to-lumos-accent-secondary bg-clip-text text-transparent">Lumos</span>
              <span className="absolute -inset-2 -z-10 rounded-lg bg-gradient-to-r from-lumos-accent-primary/15 to-lumos-accent-secondary/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <p className="max-w-xs text-sm leading-6 text-lumos-text-muted">
              Illuminating the path to digital confidence. Learn technology at your own pace with guides designed for you.
            </p>
            <div className="flex space-x-5">
              {[
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Github, href: "#", label: "GitHub" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="group relative p-2 rounded-full text-lumos-text-dim hover:text-lumos-accent-primary transition-colors"
                >
                  <span className="absolute inset-0 rounded-full bg-lumos-accent-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="sr-only">{item.label}</span>
                  <item.icon className="relative h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-lumos-text-dim">
                  Platform
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {[
                    { name: "Explore", href: "/explore" },
                    { name: "Pricing", href: "/pricing" },
                    { name: "Features", href: "/features" },
                  ].map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-lumos-text-muted hover:text-lumos-accent-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-xs font-bold uppercase tracking-widest text-lumos-text-dim">
                  Company
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {[
                    { name: "About", href: "/about" },
                    { name: "Blog", href: "/blog" },
                    { name: "Careers", href: "/careers" },
                  ].map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-lumos-text-muted hover:text-lumos-accent-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-lumos-text-dim">
                  Support
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {[
                    { name: "Help Center", href: "/help" },
                    { name: "Contact", href: "/contact" },
                    { name: "Status", href: "/status" },
                  ].map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-lumos-text-muted hover:text-lumos-accent-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-xs font-bold uppercase tracking-widest text-lumos-text-dim">
                  Legal
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {[
                    { name: "Privacy", href: "/privacy" },
                    { name: "Terms", href: "/terms" },
                  ].map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-lumos-text-muted hover:text-lumos-accent-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 border-t border-lumos-dark-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-lumos-text-dim">
            &copy; {currentYear} Lumos Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="status-indicator-dark">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lumos-accent-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-lumos-accent-primary to-lumos-accent-secondary"></span>
              </span>
              <span className="text-xs font-medium text-lumos-accent-primary">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
