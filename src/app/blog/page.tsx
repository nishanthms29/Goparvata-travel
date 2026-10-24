import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { brand } from "@/lib/brand";

export const metadata: Metadata = { title: "Travel notes", description: `Adventurous travel guides from ${brand.name}.` };
export const dynamic = "force-dynamic";

const editorialExamples = [
  { slug: "how-to-plan-a-slower-himalayan-trip", title: "Planning a slower Himalayan route", excerpt: "A planning checklist for acclimatization days, changing road conditions and realistic driving times.", coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85" },
  { slug: "questions-to-ask-before-booking-a-holiday", title: "Questions to ask before you book", excerpt: "A practical list for checking inclusions, suppliers, cancellation terms and what a quotation actually covers.", coverImage: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=85" },
];

export default async function BlogPage() {
  let posts: typeof editorialExamples = [];
  let sample = true;
  try {
    const result = await db.blogPost.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() } }, orderBy: { publishedAt: "desc" }, take: 30, select: { slug: true, title: true, excerpt: true, coverImage: true } });
    posts = result.map((post) => ({ ...post, coverImage: post.coverImage || editorialExamples[0].coverImage }));
    sample = false;
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    console.error("Travel guide database unavailable; showing editorial examples.", error instanceof Error ? error.message : error);
    posts = editorialExamples;
  }
  return <><section className="page-hero"><div className="shell"><p className="eyebrow"><span /> NOTES FOR THE WAY THERE</p><h1>Thoughts for<br />the <em>long way round.</em></h1><p>Practical questions and route-planning ideas, not real-time safety or travel advisories.</p></div></section><section className="content-section shell">{sample && <p className="demo-banner">Editorial examples only. Confirm current travel, entry and safety information with official sources before departure.</p>}<div className="blog-grid">{posts.map((post) => <article className="blog-card" key={post.slug}><Link href={`/blog/${post.slug}`}><span className="blog-cover"><Image src={post.coverImage!} alt="" fill sizes="(max-width: 650px) 100vw, 50vw" /></span><span className="blog-copy"><small>TRAVEL PLANNING · EDITORIAL GUIDE</small><strong>{post.title}</strong><span>{post.excerpt}</span><em>Read the guide →</em></span></Link></article>)}</div></section></>;
}
