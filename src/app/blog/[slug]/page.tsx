import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

const examples: Record<string, { title: string; excerpt: string; image: string; sections: { title: string; body: string }[] }> = {
  "how-to-plan-a-slower-himalayan-trip": { title: "Planning a slower Himalayan route", excerpt: "A planning checklist for acclimatization days, changing road conditions and realistic driving times.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85", sections: [{ title: "Build in rest before the high road", body: "High-altitude travel can affect people differently. Plan a gradual schedule, ask a qualified clinician about personal health questions, and follow current local and official guidance." }, { title: "Keep a route flexible", body: "Road access, permits and weather can change. Treat a sample schedule as a discussion guide, not a promise about current conditions or journey time." }, { title: "Verify every supplier", body: "Confirm accommodation, transport, emergency arrangements, cancellation terms and inclusions in writing before paying." }] },
  "questions-to-ask-before-booking-a-holiday": { title: "Questions to ask before you book", excerpt: "A practical list for checking inclusions, suppliers, cancellation terms and what a quotation actually covers.", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=85", sections: [{ title: "What exactly is included?", body: "Ask for itemized transport, accommodation, meals, entrance tickets, taxes, guide services and anything that is not included." }, { title: "Who provides each service?", body: "Get supplier names, contact details, confirmation references and clear terms for each service in your itinerary." }, { title: "What changes the final price?", body: "Dates, group size, exchange rates, taxes and supplier availability can all affect a quote. Ask when and how the price is held." }] },
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return examples[slug] ? { title: examples[slug].title, description: examples[slug].excerpt } : { title: "Travel guide not found" };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let article = examples[slug];
  if (!article) {
    try {
      const row = await db.blogPost.findFirst({ where: { slug, status: "PUBLISHED", publishedAt: { lte: new Date() } }, select: { title: true, excerpt: true, body: true, coverImage: true } });
      if (row) article = { title: row.title, excerpt: row.excerpt, image: row.coverImage || examples["questions-to-ask-before-booking-a-holiday"].image, sections: [{ title: "Travel guide", body: row.body }] };
    } catch (error) {
      if (process.env.NODE_ENV === "production") throw error;
      console.error("Travel guide lookup unavailable.", error instanceof Error ? error.message : error);
    }
  }
  if (!article) notFound();
  return <article><section className="article-hero"><Image src={article.image} alt="" fill priority sizes="100vw" /><div className="article-shade" /><div className="shell article-title"><p className="eyebrow eyebrow-light"><span /> EDITORIAL PLANNING GUIDE</p><h1>{article.title}</h1><p>{article.excerpt}</p></div></section><section className="article-body shell"><p className="demo-banner">General planning notes only. Verify current safety, entry, health, weather and legal information from official sources and qualified professionals.</p>{article.sections.map((section) => <section key={section.title}><h2>{section.title}</h2><p>{section.body}</p></section>)}</section></article>;
}
