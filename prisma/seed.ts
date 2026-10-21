import { PrismaClient, ContentStatus, PackageCategory } from "@prisma/client";
import { brand } from "../src/lib/brand";

const prisma = new PrismaClient();

const destinations = [
  { name: "Kerala", slug: "kerala", country: "India", state: "Kerala", kind: PackageCategory.DOMESTIC, description: "Backwaters, tea gardens and a gentler pace along India's southwest coast.", bestTimeToVisit: "October to March", suggestedDuration: "5–7 days", attractions: ["Alleppey backwaters", "Munnar tea gardens", "Fort Kochi"], travelTips: ["Carry light cotton clothing", "Book houseboats in advance"], budgetMinPaise: 2500000, budgetMaxPaise: 6500000, imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=85", published: true },
  { name: "Ladakh", slug: "ladakh", country: "India", state: "Ladakh", kind: PackageCategory.ADVENTURE, description: "High-altitude valleys, monastery towns and big Himalayan skies.", bestTimeToVisit: "June to September", suggestedDuration: "7–9 days", attractions: ["Leh Palace", "Nubra Valley", "Pangong Lake"], travelTips: ["Acclimatize in Leh before driving higher", "Carry prescribed altitude medication"], budgetMinPaise: 3800000, budgetMaxPaise: 8500000, imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85", published: true },
  { name: "Rajasthan", slug: "rajasthan", country: "India", state: "Rajasthan", kind: PackageCategory.DOMESTIC, description: "Historic forts, desert landscapes and richly layered city life.", bestTimeToVisit: "October to March", suggestedDuration: "7–10 days", attractions: ["Jaipur old city", "Jodhpur Fort", "Udaipur lakes"], travelTips: ["Reserve heritage stays early in winter", "Choose licensed local guides"], budgetMinPaise: 3200000, budgetMaxPaise: 9000000, imageUrl: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1600&q=85", published: true },
  { name: "Goa", slug: "goa", country: "India", state: "Goa", kind: PackageCategory.DOMESTIC, description: "Coastal villages, Portuguese-era streets and unhurried beach days.", bestTimeToVisit: "November to February", suggestedDuration: "4–6 days", attractions: ["Fontainhas", "South Goa beaches", "Old Goa"], travelTips: ["Confirm beach access and seasonal conditions locally", "Use licensed taxis or pre-book transfers"], budgetMinPaise: 1800000, budgetMaxPaise: 5000000, imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=85", published: true },
  { name: "Kyoto", slug: "kyoto", country: "Japan", kind: PackageCategory.INTERNATIONAL, description: "Temple paths, neighborhood markets and thoughtful traditions in Japan's old capital.", bestTimeToVisit: "March to May and October to November", suggestedDuration: "5–7 days", attractions: ["Fushimi Inari", "Arashiyama", "Nishiki Market"], travelTips: ["Check visa requirements before booking", "Reserve popular rail and cultural experiences early"], budgetMinPaise: 9500000, budgetMaxPaise: 19000000, imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=85", published: true },
  { name: "Bali", slug: "bali", country: "Indonesia", kind: PackageCategory.HONEYMOON, description: "Volcanic scenery, rice terraces and island stays tailored around your pace.", bestTimeToVisit: "April to October", suggestedDuration: "6–8 days", attractions: ["Ubud", "Uluwatu", "Mount Batur"], travelTips: ["Check current entry requirements", "Plan road transfers with realistic travel times"], budgetMinPaise: 7500000, budgetMaxPaise: 16000000, imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=85", published: true },
];

async function main() {
  for (const destination of destinations) {
    const savedDestination = await prisma.destination.upsert({
      where: { slug: destination.slug },
      update: destination,
      create: destination,
    });

    const packages = packageSeeds.filter((item) => item.destinationSlug === destination.slug);
    for (const item of packages) {
      await prisma.tourPackage.upsert({
        where: { slug: item.slug },
        update: {
          name: item.name,
          destinationId: savedDestination.id,
          category: item.category,
          shortDescription: item.shortDescription,
          description: item.description,
          days: item.days,
          nights: item.nights,
          adultPricePaise: item.adultPricePaise,
          childPricePaise: item.childPricePaise,
          included: item.included,
          excluded: item.excluded,
          featured: item.featured,
          sampleOffer: true,
          status: ContentStatus.PUBLISHED,
          cancellationPolicy: item.cancellationPolicy,
          images: {
            deleteMany: {},
            create: [{ url: destination.imageUrl!, alt: `${destination.name} travel scenery`, displayOrder: 0 }],
          },
          itinerary: {
            deleteMany: {},
            create: item.itinerary.map((day, index) => ({ day: index + 1, ...day })),
          },
        },
        create: {
          slug: item.slug,
          name: item.name,
          destinationId: savedDestination.id,
          category: item.category,
          shortDescription: item.shortDescription,
          description: item.description,
          days: item.days,
          nights: item.nights,
          adultPricePaise: item.adultPricePaise,
          childPricePaise: item.childPricePaise,
          included: item.included,
          excluded: item.excluded,
          featured: item.featured,
          sampleOffer: true,
          status: ContentStatus.PUBLISHED,
          cancellationPolicy: item.cancellationPolicy,
          images: { create: [{ url: destination.imageUrl!, alt: `${destination.name} travel scenery`, displayOrder: 0 }] },
          itinerary: { create: item.itinerary.map((day, index) => ({ day: index + 1, ...day })) },
        },
      });
    }
  }

  await prisma.websiteSetting.upsert({
    where: { key: "brand" },
    update: { value: { name: brand.name, tagline: brand.tagline, city: "Bengaluru", state: "Karnataka" } },
    create: { key: "brand", value: { name: brand.name, tagline: brand.tagline, city: "Bengaluru", state: "Karnataka" } },
  });

  console.info(`Seeded ${destinations.length} sample destinations and ${packageSeeds.length} sample packages.`);
}

const packageSeeds = [
  { slug: "kerala-backwaters-and-hills", name: "Kerala Backwaters & Hills", destinationSlug: "kerala", category: PackageCategory.FAMILY, shortDescription: "A flexible week between Munnar's hills and the Alleppey backwaters.", description: "A sample itinerary for a private Kerala trip. Stays, transport and seasonal availability are confirmed only after a planner reviews your request.", days: 6, nights: 5, adultPricePaise: 2850000, childPricePaise: 1450000, featured: true, included: ["Sample accommodation plan", "Private transfer estimate", "Daily breakfast estimate"], excluded: ["Flights", "Personal expenses", "Unlisted activities"], cancellationPolicy: "Sample policy only. A final cancellation schedule will be provided with a written quotation.", itinerary: [{ title: "Arrive in Kochi", description: "Meet your driver and settle into the historic port city." }, { title: "Kochi to Munnar", description: "Drive through the hills with time for a tea garden visit." }, { title: "Munnar", description: "Explore viewpoints and local markets at a comfortable pace." }, { title: "Munnar to Alleppey", description: "Travel to the backwaters for an overnight stay." }, { title: "Alleppey", description: "Enjoy a relaxed backwater day; boat choice is confirmed by request." }, { title: "Return to Kochi", description: "Transfer to Kochi for your onward journey." }] },
  { slug: "ladakh-highland-trail", name: "Ladakh Highland Trail", destinationSlug: "ladakh", category: PackageCategory.ADVENTURE, shortDescription: "A gradual acclimatization-focused route through Leh, Nubra and Pangong.", description: "Sample small-group land itinerary. Road conditions, permits and accommodation are subject to local confirmation.", days: 8, nights: 7, adultPricePaise: 4950000, childPricePaise: 0, featured: true, included: ["Sample ground transport", "Accommodation estimate", "Permit planning"], excluded: ["Flights to Leh", "Travel insurance", "Personal altitude medication"], cancellationPolicy: "Sample policy only. Mountain itineraries may change with weather and road conditions.", itinerary: [{ title: "Arrive and rest in Leh", description: "Keep the first day light to support acclimatization." }, { title: "Leh", description: "Optional low-intensity town visit after a rest day." }, { title: "Indus Valley", description: "Visit nearby monasteries with a flexible return time." }, { title: "Leh to Nubra", description: "Cross the pass only after local weather and road checks." }, { title: "Nubra Valley", description: "Explore the valley with a locally confirmed activity plan." }, { title: "Nubra to Pangong", description: "Transfer route confirmed according to current conditions." }, { title: "Pangong to Leh", description: "Return to Leh with rest stops as needed." }, { title: "Departure", description: "Transfer to the airport." }] },
  { slug: "rajasthan-heritage-route", name: "Rajasthan Heritage Route", destinationSlug: "rajasthan", category: PackageCategory.GROUP, shortDescription: "A sample Jaipur–Jodhpur–Udaipur route with time for local neighborhoods.", description: "An editable heritage route concept. Guide and hotel availability are not live inventory and need written confirmation.", days: 8, nights: 7, adultPricePaise: 4250000, featured: true, included: ["Accommodation planning", "Intercity transfer estimate", "Local guide planning"], excluded: ["Flights or trains", "Monument tickets", "Meals not listed in final quote"], cancellationPolicy: "Sample policy only. Final terms are shared before any deposit is requested.", itinerary: [{ title: "Jaipur arrival", description: "Settle into Jaipur and meet your trip planner." }, { title: "Jaipur", description: "Explore the old city and key heritage sites." }, { title: "Jaipur to Jodhpur", description: "Travel by pre-confirmed ground transfer." }, { title: "Jodhpur", description: "Visit the fort area and blue city lanes." }, { title: "Jodhpur to Udaipur", description: "A scenic transfer day with optional stops." }, { title: "Udaipur", description: "Explore lakeside neighborhoods and markets." }, { title: "Udaipur", description: "A flexible day for a museum, walk or rest." }, { title: "Departure", description: "Transfer to the airport or railway station." }] },
  { slug: "goa-coast-and-culture", name: "Goa Coast & Culture", destinationSlug: "goa", category: PackageCategory.DOMESTIC, shortDescription: "A short coastal break balancing heritage lanes and quiet beach time.", description: "A sample Goa stay for travelers who prefer an unhurried local itinerary. Seasonal access and stays require confirmation.", days: 5, nights: 4, adultPricePaise: 2250000, featured: false, included: ["Accommodation estimate", "Airport transfer estimate"], excluded: ["Flights", "Meals", "Optional excursions"], cancellationPolicy: "Sample policy only; request a current written quote for booking terms.", itinerary: [{ title: "Arrival", description: "Arrive and transfer to your selected area." }, { title: "Old Goa", description: "Explore heritage sites and nearby neighborhoods." }, { title: "Coastal day", description: "Choose a beach based on your preferred pace." }, { title: "Local day", description: "Optional market visit or free time." }, { title: "Departure", description: "Transfer to the airport." }] },
  { slug: "kyoto-first-look", name: "Kyoto First Look", destinationSlug: "kyoto", category: PackageCategory.INTERNATIONAL, shortDescription: "A sample introduction to Kyoto, with guidance on onward travel planning.", description: "A planning concept only. International flights, visas, hotels and entry requirements need independent confirmation.", days: 6, nights: 5, adultPricePaise: 12400000, featured: true, included: ["Ground itinerary planning", "Local transport guidance"], excluded: ["International flights", "Visa fees", "Accommodation unless itemized"], cancellationPolicy: "Sample policy only; international booking terms depend on confirmed suppliers.", itinerary: [{ title: "Arrive in Kyoto", description: "Transfer into the city and keep the evening open." }, { title: "Eastern Kyoto", description: "Plan a morning visit and a slower neighborhood walk." }, { title: "Arashiyama", description: "Explore the western district, subject to seasonal crowds." }, { title: "Central Kyoto", description: "Visit a market and select a cultural experience." }, { title: "Flexible day", description: "Keep an open day for a museum, rest or local excursion." }, { title: "Departure", description: "Continue to your next destination." }] },
  { slug: "bali-island-escape", name: "Bali Island Escape", destinationSlug: "bali", category: PackageCategory.HONEYMOON, shortDescription: "A customizable island stay mixing Ubud, coastline and downtime.", description: "A sample planning rate only; entry rules, accommodation and transfers must be confirmed before booking.", days: 7, nights: 6, adultPricePaise: 10200000, featured: true, included: ["Sample island route", "Ground transfer planning"], excluded: ["Flights", "Visa or entry charges", "Unlisted activities"], cancellationPolicy: "Sample policy only. Supplier-specific cancellation terms will be shared in a final quote.", itinerary: [{ title: "Arrive in Bali", description: "Transfer to your first selected stay." }, { title: "Ubud", description: "Explore nearby rice terraces and local craft districts." }, { title: "Ubud", description: "Choose a gentle cultural activity or free time." }, { title: "Coastal transfer", description: "Transfer to your selected coastal area." }, { title: "Coast", description: "Plan an open day around your own pace." }, { title: "Island day", description: "Optional excursion subject to local conditions." }, { title: "Departure", description: "Transfer to the airport." }] },
];

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
