import Link from "next/link";
import { Share2, Mail, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/validations";

type SiteFooterProps = {
  settings: SiteSettings;
};

export function SiteFooter({ settings }: SiteFooterProps) {
  return (
    <footer className="border-t bg-gradient-to-b from-transparent to-primary/5">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-serif text-xl font-bold">{settings.siteName}</h3>
            <p className="mt-2 text-sm text-muted">{settings.siteTagline}</p>
          </div>
          <div>
            <h4 className="font-medium">দ্রুত লিংক</h4>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
              <Link href="/" className="hover:text-primary">হোম</Link>
              <Link href="/writings" className="hover:text-primary">লেখালেখি</Link>
              <Link href="/about" className="hover:text-primary">আমার সম্পর্কে</Link>
              <Link href="/contact" className="hover:text-primary">যোগাযোগ</Link>
            </div>
          </div>
          <div>
            <h4 className="font-medium">যোগাযোগ</h4>
            <div className="mt-3 space-y-2 text-sm text-muted">
              {settings.contactEmail && (
                <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {settings.contactEmail}</p>
              )}
              {settings.contactPhone && (
                <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {settings.contactPhone}</p>
              )}
            </div>
            <div className="mt-4 flex gap-3">
              {settings.socialLinks.map((link) => (
                <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-primary/10 p-2 text-primary hover:bg-primary/20" title={link.platform}>
                  <Share2 className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center text-sm text-muted">
          {settings.footerText}
        </div>
      </div>
    </footer>
  );
}
