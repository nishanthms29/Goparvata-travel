"use client";

import Link from "next/link";
import { Compass, Menu, X } from "lucide-react";
import { brand } from "@/lib/brand";
import { useState } from "react";

const links = [
  ["Destinations", "/destinations"],
  ["Tours", "/packages"],
  ["Our approach", "/about"],
  ["Travel guides", "/blog"],
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="nav-inner shell">
        <Link className="brand" href="/" aria-label={`${brand.name} home`} onClick={() => setOpen(false)}>
          <span className="brand-mark"><Compass size={19} aria-hidden="true" /></span>
          <span className="brand-type"><strong>{brand.name}</strong><small>{brand.tagline}</small></span>
        </Link>
        <button className="mobile-menu" type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={`main-nav${open ? " is-open" : ""}`} aria-label="Main navigation">
          {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
          <Link href="/plan-your-trip" className="button button-dark nav-cta" onClick={() => setOpen(false)}>Plan a trip <span aria-hidden="true">↗</span></Link>
        </nav>
      </div>
    </header>
  );
}
