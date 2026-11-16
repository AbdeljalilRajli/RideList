"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Reveal from "@/components/Reveal";

const brandLogos = [
  { name: "Toyota", src: "/Brands Logos/Toyota.png", alt: "Toyota logo", width: 164, height: 108, query: "Toyota" },
  { name: "Ford", src: "/Brands Logos/Ford.png", alt: "Ford logo", width: 230, height: 88, query: "Ford" },
  { name: "Mercedes-Benz", src: "/Brands Logos/Mercides.png", alt: "Mercedes-Benz logo", width: 110, height: 108, query: "Mercedes" },
  { name: "Jeep", src: "/Brands Logos/Jeep.png", alt: "Jeep logo", width: 218, height: 88, query: "Jeep" },
  { name: "BMW", src: "/Brands Logos/BMW.png", alt: "BMW logo", width: 110, height: 108, query: "BMW" },
  { name: "Audi", src: "/Brands Logos/Audi.png", alt: "Audi logo", width: 248, height: 84, query: "Audi" },
];

export default function ContactPage() {
  const router = useRouter();

  // Contact Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate contact form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 600);
  };

  return (
    <main className="min-h-screen bg-white text-black overflow-hidden pt-[104px]">
      {/* =========================================================================
          1. HERO HEADER BANNER (Figma Frame matching About & Fleet)
         ========================================================================= */}
      <section className="bg-white border-b border-[#E5E7EB] py-12 sm:py-14">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 text-center">
          <Reveal triggerOnLoad delay={0}>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-black tracking-tight mb-3 font-['Work_Sans',sans-serif]">
              Contact Us
            </h1>
          </Reveal>
          <Reveal triggerOnLoad delay={80}>
            <p className="text-[#6C757D] text-sm sm:text-base font-normal">
              <Link href="/" className="hover:text-[#5937E0] transition-colors">
                Home
              </Link>{" "}
              / <span className="text-black font-semibold">Contact Us</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* =========================================================================
          2. CONTACT FORM & HERO PHOTOGRAPHY SPLIT SECTION
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Purple "Get in touch" Contact Form Card */}
          <div className="lg:col-span-5 w-full flex">
            <Reveal delay={0} className="w-full h-full">
              <div className="w-full h-full rounded-[28px] sm:rounded-[32px] bg-[#5937E0] text-white p-6 sm:p-9 shadow-xl flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl sm:text-[26px] font-bold text-white text-center mb-2 font-['Work_Sans',sans-serif]">
                    Get in touch
                  </h2>
                  <p className="text-white/80 text-xs sm:text-sm text-center mb-6">
                    Have a question or special request? Send us a message and our team will get back to you promptly.
                  </p>

                  {isSubmitted ? (
                    <div className="bg-white/15 border border-white/30 rounded-2xl p-6 text-center my-6 animate-fadeIn">
                      <div className="w-12 h-12 rounded-full bg-[#FFA000] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">Message Sent!</h3>
                      <p className="text-xs sm:text-sm text-white/90">
                        Thank you for reaching out. We will contact you shortly.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsSubmitted(false)}
                        className="mt-4 px-6 py-2 rounded-full bg-white text-[#5937E0] text-xs font-bold hover:bg-white/90 transition-colors cursor-pointer"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                      {/* Name */}
                      <div>
                        <label htmlFor="contact-name" className="block text-xs font-semibold text-white/90 mb-1.5">
                          Full Name <span className="text-[#FFA000]">*</span>
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          name="name"
                          required
                          placeholder="e.g. John Doe"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full h-12 px-4 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-[16px] sm:text-sm font-medium text-white placeholder:text-white/60 focus:outline-none focus:border-white transition-colors"
                        />
                      </div>

                      {/* Email & Phone 2-col on sm+ */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="contact-email" className="block text-xs font-semibold text-white/90 mb-1.5">
                            Email Address <span className="text-[#FFA000]">*</span>
                          </label>
                          <input
                            id="contact-email"
                            type="email"
                            name="email"
                            required
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full h-12 px-4 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-[16px] sm:text-sm font-medium text-white placeholder:text-white/60 focus:outline-none focus:border-white transition-colors"
                          />
                        </div>
                        <div>
                          <label htmlFor="contact-phone" className="block text-xs font-semibold text-white/90 mb-1.5">
                            Phone Number
                          </label>
                          <input
                            id="contact-phone"
                            type="tel"
                            name="phone"
                            placeholder="+212 6 000 000 00"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full h-12 px-4 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-[16px] sm:text-sm font-medium text-white placeholder:text-white/60 focus:outline-none focus:border-white transition-colors"
                          />
                        </div>
                      </div>

                      {/* Subject */}
                      <div>
                        <label htmlFor="contact-subject" className="block text-xs font-semibold text-white/90 mb-1.5">
                          Subject <span className="text-[#FFA000]">*</span>
                        </label>
                        <input
                          id="contact-subject"
                          type="text"
                          name="subject"
                          required
                          placeholder="Rental inquiry, partnership, question..."
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="w-full h-12 px-4 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-[16px] sm:text-sm font-medium text-white placeholder:text-white/60 focus:outline-none focus:border-white transition-colors"
                        />
                      </div>

                      {/* Message */}
                      <div>
                        <label htmlFor="contact-message" className="block text-xs font-semibold text-white/90 mb-1.5">
                          Your Message <span className="text-[#FFA000]">*</span>
                        </label>
                        <textarea
                          id="contact-message"
                          name="message"
                          required
                          rows={3}
                          placeholder="How can we assist you today? Feel free to provide details..."
                          value={formData.message}
                          onChange={handleInputChange}
                          className="w-full p-4 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-[16px] sm:text-sm font-medium text-white placeholder:text-white/60 focus:outline-none focus:border-white transition-colors resize-none min-h-[96px]"
                        ></textarea>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 mt-1 rounded-full bg-[#FFA000] hover:bg-[#FF8F00] text-white font-bold text-sm shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center cursor-pointer disabled:opacity-60"
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right: Rounded Feature Image */}
          <div className="lg:col-span-7 flex">
            <Reveal variant="fade-scale" delay={120} className="w-full h-full min-h-[380px] sm:min-h-[460px]">
              <div className="relative w-full h-full rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-xl group border border-[#E5E7EB]">
                <Image
                  src="/contact-hero.jpg"
                  alt="Customer enjoying RideList premium road trip"
                  fill
                  priority
                  unoptimized
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Subtle soft gradient highlight */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SUPPORTED AUTOMOBILE BRANDS STRIP (Exact Figma Component)
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 pb-20 sm:pb-28">
        <Reveal delay={0}>
          <div className="bg-white rounded-[24px] py-10 px-6 sm:px-12 border border-[#E5E7EB] shadow-sm text-center">
            <p className="text-xs font-bold text-[#6C757D] uppercase tracking-widest mb-8">
              Supported Automobile Brands
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-8 sm:gap-10 lg:gap-14 px-2 sm:px-6">
              {brandLogos.map((brand) => (
                <button
                  key={brand.name}
                  type="button"
                  onClick={() => router.push(`/fleet?query=${encodeURIComponent(brand.query)}`)}
                  title={`Filter by ${brand.name}`}
                  className="h-10 sm:h-12 flex items-center justify-center group transition-transform hover:-translate-y-0.5 focus:outline-none cursor-pointer"
                >
                  <Image
                    src={brand.src}
                    alt={brand.alt}
                    width={brand.width}
                    height={brand.height}
                    unoptimized
                    className="max-h-7 sm:max-h-9 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
