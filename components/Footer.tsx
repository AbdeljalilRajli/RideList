import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="w-full bg-[#F1F2F8] border-t border-[#E5E7EB]">
      <div className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand & Mission Column */}
          <div className="md:col-span-2 flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="RideList Logo"
                width={124}
                height={22}
                className="object-contain"
              />
            </Link>
            <p className="text-sm text-[#6B7280] max-w-sm leading-relaxed">
              Elevated automotive mobility and bespoke car rental services designed for modern discerning travelers. Transparent pricing, zero friction.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                aria-label="Global Mobility Network"
                className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:text-[#3730A3] hover:border-[#3730A3] transition-colors"
                href="#"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </a>
              <a
                aria-label="Location Services"
                className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:text-[#3730A3] hover:border-[#3730A3] transition-colors"
                href="#"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </a>
              <a
                aria-label="Direct Inquiries"
                className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:text-[#3730A3] hover:border-[#3730A3] transition-colors"
                href="#contact"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Column 1: About */}
          <div className="flex flex-col gap-3">
            <span className="font-bold text-sm text-[#0F0F1A] uppercase tracking-wider">About</span>
            <Link className="text-sm text-[#6B7280] hover:text-[#3730A3] transition-colors" href="/#advantages">Our Story</Link>
            <Link className="text-sm text-[#6B7280] hover:text-[#3730A3] transition-colors" href="/#advantages">The Experience</Link>
            <Link className="text-sm text-[#6B7280] hover:text-[#3730A3] transition-colors" href="/fleet">Electric & Sustainability</Link>
            <Link className="text-sm text-[#6B7280] hover:text-[#3730A3] transition-colors" href="/fleet">Airport Stations</Link>
          </div>

          {/* Links Column 2: Company */}
          <div className="flex flex-col gap-3">
            <span className="font-bold text-sm text-[#0F0F1A] uppercase tracking-wider">Company</span>
            <Link className="text-sm text-[#6B7280] hover:text-[#3730A3] transition-colors" href="/fleet">Fleet Directory</Link>
            <Link className="text-sm text-[#6B7280] hover:text-[#3730A3] transition-colors" href="/#deals">Corporate Accounts</Link>
            <Link className="text-sm text-[#6B7280] hover:text-[#3730A3] transition-colors" href="/#contact">Careers</Link>
            <Link className="text-sm text-[#6B7280] hover:text-[#3730A3] transition-colors" href="/#contact">Newsroom</Link>
          </div>

          {/* Links Column 3: Community */}
          <div className="flex flex-col gap-3">
            <span className="font-bold text-sm text-[#0F0F1A] uppercase tracking-wider">Community</span>
            <Link className="text-sm text-[#6B7280] hover:text-[#3730A3] transition-colors" href="/#contact">Driver Community</Link>
            <Link className="text-sm text-[#6B7280] hover:text-[#3730A3] transition-colors" href="/#deals">Concierge Club</Link>
            <Link className="text-sm text-[#6B7280] hover:text-[#3730A3] transition-colors" href="/#advantages">Affiliate Network</Link>
            <Link className="text-sm text-[#6B7280] hover:text-[#3730A3] transition-colors" href="/#contact">Support Desk</Link>
          </div>
        </div>

        {/* Bottom Legal Strip */}
        <div className="mt-14 pt-8 border-t border-[#E5E7EB] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#6B7280]">
          <p>© 2026 RideList. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link className="hover:text-[#3730A3] transition-colors" href="/">Privacy Policy</Link>
            <Link className="hover:text-[#3730A3] transition-colors" href="/">Terms of Service</Link>
            <Link className="hover:text-[#3730A3] transition-colors" href="/">Rental Agreement</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
