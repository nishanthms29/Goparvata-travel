import { Search } from "lucide-react";

export function SearchForm({ compact = false }: { compact?: boolean }) {
  return (
    <form action="/search" className={`search-form${compact ? " search-form-compact" : ""}`}>
      <label><span>Where to?</span><input name="q" placeholder="Destination or experience" maxLength={100} /></label>
      <label><span>Trip style</span><select name="category" defaultValue=""><option value="">Any experience</option><option value="DOMESTIC">India</option><option value="INTERNATIONAL">International</option><option value="ADVENTURE">Adventure</option><option value="HONEYMOON">Honeymoon</option><option value="FAMILY">Family</option></select></label>
      <label><span>Budget per person</span><select name="maxPrice" defaultValue=""><option value="">Any budget</option><option value="30000">Up to ₹30,000</option><option value="60000">Up to ₹60,000</option><option value="120000">Up to ₹1,20,000</option><option value="250000">Up to ₹2,50,000</option></select></label>
      <button className="button button-dark search-submit" type="submit"><Search size={17} /><span className="search-button-text">Find a trip</span></button>
    </form>
  );
}
