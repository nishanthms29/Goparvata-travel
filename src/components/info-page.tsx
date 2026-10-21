import Link from "next/link";
import type { ReactNode } from "react";

export function InfoPage({
  eyebrow = "TERN & COMPASS",
  title,
  intro,
  sections,
  action = true,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro: string;
  sections: { title: string; body: string }[];
  action?: boolean;
}) {
  return (
    <>
      <section className="page-hero"><div className="shell"><p className="eyebrow"><span /> {eyebrow}</p><h1>{title}</h1><p>{intro}</p></div></section>
      <section className="content-section shell info-content">
        {sections.map((section) => <article key={section.title}><h2>{section.title}</h2><p>{section.body}</p></article>)}
        {action && <div className="info-cta"><p>Have a specific trip in mind? Start with a conversation.</p><Link className="button button-dark" href="/plan-your-trip">Talk to a planner →</Link></div>}
      </section>
    </>
  );
}
