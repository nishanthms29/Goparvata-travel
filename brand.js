const brandScriptUrl = document.currentScript?.src;

if (brandScriptUrl) {
  fetch(new URL("brand.config.json", brandScriptUrl), { headers: { Accept: "application/json" } })
    .then((response) => {
      if (!response.ok) throw new Error(`Brand configuration returned ${response.status}.`);
      return response.json();
    })
    .then((brand) => {
      if (
        typeof brand.name !== "string"
        || typeof brand.tagline !== "string"
        || typeof brand.palette?.forest !== "string"
        || typeof brand.palette?.gold !== "string"
        || typeof brand.palette?.ivory !== "string"
      ) {
        throw new Error("Brand configuration is missing its name, tagline, or palette.");
      }
      document.documentElement.style.setProperty("--bg", brand.palette.ivory);
      document.documentElement.style.setProperty("--surface", "#fffdf7");
      document.documentElement.style.setProperty("--ink", "#1b2d26");
      document.documentElement.style.setProperty("--muted", "#657365");
      document.documentElement.style.setProperty("--line", "#e4ddcd");
      document.documentElement.style.setProperty("--brand", brand.palette.forest);
      document.documentElement.style.setProperty("--on-brand", brand.palette.ivory);
      document.documentElement.style.setProperty("--accent", brand.palette.gold);
      document.documentElement.style.setProperty("--on-accent", "#1b2d26");
      document.querySelectorAll("[data-brand-name]").forEach((element) => {
        element.textContent = brand.name;
      });
      document.querySelectorAll("[data-brand-tagline]").forEach((element) => {
        element.textContent = brand.tagline;
      });
      document.title = document.title.includes("Admin")
        ? `${brand.name} Admin`
        : `${brand.name} | ${brand.tagline}`;
    })
    .catch((error) => console.error("Could not load the shared travel brand configuration.", error));
}
