"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { blogArticles } from "@/constants/blog";
import Reveal from "@/components/Reveal";

interface BlogPostPageProps {
  params?: {
    slug?: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const routeParams = useParams();
  const slug = params?.slug || (routeParams?.slug as string);
  const article = blogArticles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const otherArticles = blogArticles.filter((a) => a.slug !== article.slug);

  return (
    <main className="min-h-screen bg-white text-black pt-[104px] pb-24">
      {/* Header Banner */}
      <section className="bg-white border-b border-[#E5E7EB] py-12 sm:py-14">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-8 text-center">
          <Reveal triggerOnLoad delay={0}>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-black tracking-tight mb-4 font-['Work_Sans',sans-serif] leading-tight max-w-3xl mx-auto">
              {article.title}
            </h1>
          </Reveal>
          <Reveal triggerOnLoad delay={80}>
            <p className="text-[#6C757D] text-sm sm:text-base font-normal">
              <Link href="/" className="hover:text-[#5937E0] transition-colors">
                Home
              </Link>{" "}
              /{" "}
              <Link href="/contact" className="hover:text-[#5937E0] transition-colors">
                Contact & News
              </Link>{" "}
              / <span className="text-black font-semibold">{article.title}</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Article Body */}
      <article className="max-w-[900px] mx-auto px-6 sm:px-8 py-12 sm:py-16">
        {/* Featured Image */}
        <Reveal variant="fade-scale" delay={0}>
          <div className="relative w-full aspect-[16/9] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl mb-12">
            <Image
              src={article.image}
              alt={article.title}
              fill
              priority
              unoptimized
              className="object-cover object-center"
            />
          </div>
        </Reveal>

        {/* Author & Date Bar */}
        <Reveal delay={80}>
          <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-[#E5E7EB] mb-10 text-sm text-[#6C757D]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#5937E0] text-white flex items-center justify-center font-bold text-sm">
                {article.author.name.charAt(0)}
              </div>
              <div>
                <span className="font-bold text-black block">{article.author.name}</span>
                <span className="text-xs text-[#6C757D]">{article.author.role}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span>Published: {article.date}</span>
              <span>•</span>
              <span>{article.readTime}</span>
            </div>
          </div>
        </Reveal>

        {/* Intro Paragraph */}
        <Reveal delay={120}>
          <p className="text-lg sm:text-xl font-medium text-black/85 leading-relaxed mb-10">
            {article.content.intro}
          </p>
        </Reveal>

        {/* Content Sections */}
        <div className="space-y-10">
          {article.content.sections.map((section, idx) => (
            <Reveal key={idx} delay={idx * 60}>
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-black font-['Work_Sans',sans-serif] tracking-tight">
                  {section.heading}
                </h2>
                {section.body.map((p, pIdx) => (
                  <p key={pIdx} className="text-base sm:text-lg text-black/75 leading-relaxed font-normal">
                    {p}
                  </p>
                ))}
                {section.tip && (
                  <div className="p-5 rounded-2xl bg-[#EEEDF9] border-l-4 border-[#5937E0] text-[#5937E0] font-medium text-sm sm:text-base leading-relaxed my-4">
                    {section.tip}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        {/* Conclusion Callout */}
        <Reveal delay={100}>
          <div className="mt-14 p-8 sm:p-10 rounded-[24px] bg-[#F8F8FB] border border-[#E5E7EB]">
            <h3 className="text-xl font-bold text-black mb-3 font-['Work_Sans',sans-serif]">
              In Summary
            </h3>
            <p className="text-base sm:text-lg text-[#6C757D] leading-relaxed mb-6">
              {article.content.conclusion}
            </p>
            <Link
              href="/fleet"
              className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[#FFA000] hover:bg-[#FF8F00] text-white font-bold text-sm shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              Browse Available Cars
            </Link>
          </div>
        </Reveal>

        {/* Back Link */}
        <div className="mt-12 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#5937E0] hover:underline"
          >
            <span>← Back to Contact & News</span>
          </Link>
        </div>
      </article>

      {/* Related Articles */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-12 border-t border-[#E5E7EB]">
        <h3 className="text-2xl sm:text-3xl font-bold text-black mb-8 text-center font-['Work_Sans',sans-serif]">
          More from RideList News
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {otherArticles.map((other, idx) => (
            <Reveal key={other.slug} delay={idx * 100}>
              <Link
                href={`/blog/${other.slug}`}
                className="group block bg-white rounded-[20px] border border-[#E5E7EB] overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 p-5"
              >
                <div className="relative w-full aspect-[16/10] rounded-[16px] overflow-hidden mb-4">
                  <Image
                    src={other.image}
                    alt={other.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className="text-xs font-semibold text-[#6C757D] uppercase tracking-wider block mb-2">
                  {other.category} • {other.date}
                </span>
                <h4 className="text-lg font-bold text-black group-hover:text-[#5937E0] transition-colors leading-snug">
                  {other.title}
                </h4>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
