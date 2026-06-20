import { useEffect } from "react";

interface SEOManagerProps {
  currentPath: string;
}

export default function SEOManager({ currentPath }: SEOManagerProps) {
  useEffect(() => {
    // 1. Identify active page and sub-directories of current path
    const path = currentPath.toLowerCase();
    
    let title = "Clarity Space | High-Performance Web Design & Digital Growth";
    let desc = "Sydney's elite digital architecture and high-performance web development bureau. We build bespoke custom platforms with 14-day SLA delivery guarantees and interactive ROI models.";
    let canonical = "https://clarityspace.com.au";

    // 2. Map path categories to highly targeted professional SEO copy
    if (path.includes("/demo") || path.includes("/site")) {
      // Demo Views
      if (path.includes("swim") || path.includes("swimming")) {
        title = "Live Preview: Swim Academy Scheduler & Rosters | Clarity Space Interactive Demo";
        desc = "Interactive high-fidelity demonstration website for Swim Schools. Test real-time class enrollments, trainer tables, and fluid mobile sizing.";
        canonical = "https://clarityspace.com.au/swimming-school-quote/demo";
      } else if (path.includes("portfolio") || path.includes("creative")) {
        title = "Live Preview: Kronos Spatial Bureau | Clarity Space Creative Demo";
        desc = "Minimalist raw concrete-themed portfolio layout for creative studios, designers, and spatial architects. View responsive image galleries and blueprint indices.";
        canonical = "https://clarityspace.com.au/portfolio-quote/demo";
      } else if (path.includes("trades") || path.includes("builders")) {
        title = "Live Preview: Apex Pro Trades & Dispatch | Clarity Space Contractors Demo";
        desc = "Industrial mechanical trades callout simulator. Calculate standard or emergency priority callouts, select plumbing or electrical profiles, and test SMS driver dispatch logic.";
        canonical = "https://clarityspace.com.au/trades-quote/demo";
      } else if (path.includes("restaurant") || path.includes("dining") || path.includes("cafe")) {
        title = "Live Preview: Mesa & Oak Woodfire Bistro | Clarity Space Dining Demo";
        desc = "Atmospheric farm-to-table dining and harvest menu prototype. Features table space scheduling calculators, vintage reserve wine lists, and botanical olive layout themes.";
        canonical = "https://clarityspace.com.au/restaurant-quote/demo";
      } else if (path.includes("local") || path.includes("boutique") || path.includes("retail")) {
        title = "Live Preview: Satin & Cedar luxury Boutique | Clarity Space Retail Demo";
        desc = "Bespoke luxury lifestyle and satin thread ecommerce concept. Experience the interactive shopping bag, stock limit warnings, and localized Sydney store filters.";
        canonical = "https://clarityspace.com.au/local-quote/demo";
      } else {
        title = "Live Preview: Aegis Global Advisory Strategy | Clarity Space Corporate Demo";
        desc = "Prussian blue Swiss corporate advisory portal concept. Experience our interactive business growth multiplier models and managing director rosters.";
        canonical = "https://clarityspace.com.au/consultant-quote/demo";
      }
    } else {
      // Quote & Spec SOW views
      if (path.includes("swimming-school-quote")) {
        title = "Swim Academy Scheduler Premium Proposal & SOW | Clarity Space";
        desc = "Detailed interactive digital statement of work detailing customized core scheduler platforms, live rosters, student/coach registries, and guaranteed timelines.";
        canonical = "https://clarityspace.com.au/swimming-school-quote";
      } else if (path.includes("consultant")) {
        title = "Corporate Advisory Website Proposal & Spec SOW | Clarity Space";
        desc = "Digital systems proposal for highbrow advisory firms, investment strategists, and enterprise consultants. Formulates security standards and executive rosters.";
        canonical = "https://clarityspace.com.au/consultant-quote";
      } else if (path.includes("portfolio") || path.includes("creative")) {
        title = "Creative Studio Portfolio Proposal & Spec SOW | Clarity Space";
        desc = "Bespoke architectural gallery and visual creator proposal. Discusses brutalist layout values, light-meter grids, and portfolio systems.";
        canonical = "https://clarityspace.com.au/portfolio-quote";
      } else if (path.includes("trades")) {
        title = "Trades Contractor Service Dispatch Proposal & SOW | Clarity Space";
        desc = "Operational service blueprint proposal for plumbers, general contractors, and electrician networks. Integrates geo-routing systems and emergency quote builders.";
        canonical = "https://clarityspace.com.au/trades-quote";
      } else if (path.includes("restaurant") || path.includes("dining") || path.includes("cafe")) {
        title = "Fine Dining Atmospheric Website Proposal & SOW | Clarity Space";
        desc = "Brand proposal for luxury bistros, wineries, and culinary chefs. Discusses interactive booking registers, digital wine lockers, and artisanal menus.";
        canonical = "https://clarityspace.com.au/restaurant-quote";
      } else if (path.includes("local") || path.includes("boutique") || path.includes("retail")) {
        title = "Bespoke Retail E-Commerce Website Proposal & SOW | Clarity Space";
        desc = "Digital expansion SOW for high-end boutique stores and design labels. Details custom shopping engines, branch level inventory, and payments.";
        canonical = "https://clarityspace.com.au/local-quote";
      } else if (path.includes("static-business-quote") || path.includes("cheap-business-quote") || path.includes("business-quote")) {
        title = "Professional Business App & Web Spec SOW | Clarity Space";
        desc = "High-fidelity digital statement of work detailing interactive package scopes, transparent pricing models, and elite system deployment SLAs.";
        canonical = "https://clarityspace.com.au/static-business-quote";
      }
    }

    // 3. Dynamic DOM Injections (Safe Client-Side Meta Updating)
    document.title = title;

    // Helper function to create or update existing meta tags safely
    const updateOrCreateMeta = (attrName: string, attrVal: string, contentVal: string, isProperty = false) => {
      let selector = `${isProperty ? "meta[property" : "meta[name"}=\"${attrVal}\"]`;
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement("meta");
        if (isProperty) {
          meta.setAttribute("property", attrVal);
        } else {
          meta.setAttribute("name", attrVal);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", contentVal);
    };

    // Update standard meta
    updateOrCreateMeta("name", "description", desc);

    // Update Open Graph (og:) Tags
    updateOrCreateMeta("property", "og:title", title, true);
    updateOrCreateMeta("property", "og:description", desc, true);
    updateOrCreateMeta("property", "og:url", canonical, true);

    // Update Twitter Cards
    updateOrCreateMeta("name", "twitter:title", title);
    updateOrCreateMeta("name", "twitter:description", desc);

    if (path.includes("/demo") || path.includes("/site") || path.includes("quote")) {
      updateOrCreateMeta("name", "robots", "noindex, nofollow");
    } else {
      updateOrCreateMeta("name", "robots", "index, follow");
    }

    // Update Canonical link
    let canonicalLink = document.querySelector("link[rel='canonical']");
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonical);

    // 4. Generate & Inject Structured JSON-LD Schema for Traditional and AI Search Engines
    let schemaObj: any = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": "Clarity Space",
      "url": "https://clarityspace.com.au",
      "image": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&h=630&q=80",
      "description": "Sydney's premier web design and digital architecture bureau, offering custom software platforms, high-speed static websites, and custom business portals with a 14-day SLA guarantee.",
      "telephone": "+61-2-9000-0000",
      "priceRange": "$$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Level 34, 100 Barangaroo Avenue",
        "addressLocality": "Sydney",
        "addressRegion": "NSW",
        "postalCode": "2000",
        "addressCountry": "AU"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -33.864,
        "longitude": 151.201
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      },
      "sameAs": [
        "https://linkedin.com/company/clarityspace"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Digital Architecture & Web Development Packages",
        "itemListElement": [
          {
            "@type": "OfferCatalog",
            "name": "Web Design & Development Base Blueprints",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Starter Website Package Blueprint",
                  "description": "Best for simple businesses that need a professional online presence. Includes 5 to 8 custom web pages, fully responsive viewport layout, Google Maps integration, basic local SEO foundation, and 14-day SLA delivery.",
                  "offers": {
                    "@type": "Offer",
                    "price": "5600.00",
                    "priceCurrency": "AUD"
                  }
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Standard Website Package Blueprint",
                  "description": "Best for businesses needing service layouts, CMS edit privileges, Google Analytics systems integration, and lead enquiry management. Includes 8 to 12 responsive pages.",
                  "offers": {
                    "@type": "Offer",
                    "price": "9600.00",
                    "priceCurrency": "AUD"
                  }
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Professional Website Package Blueprint",
                  "description": "Optimal end-to-end framework layout. Includes up to 15 fully custom styled pages, CMS interface, email notifier alerts, full conversion tracking setups, and handbook guidance.",
                  "offers": {
                    "@type": "Offer",
                    "price": "15600.00",
                    "priceCurrency": "AUD"
                  }
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Booking Platform Package Blueprint",
                  "description": "Enterprise-level customer account capabilities. Outfitted with master booking grids, secure Stripe checkout integrations, dynamic calendar schedules, and admin workflow control boards.",
                  "offers": {
                    "@type": "Offer",
                    "price": "24000.00",
                    "priceCurrency": "AUD"
                  }
                }
              }
            ]
          },
          {
            "@type": "OfferCatalog",
            "name": "Specialist Web Engineering Agency Services",
            "itemListElement": [
              {
                "@type": "Service",
                "name": "Business Website Design & UI/UX Architecture",
                "description": "Aesthetic custom UI layout schemes, luxury typeface matching, and clear call-to-actions engineered to foster immediate customer confidence."
              },
              {
                "@type": "Service",
                "name": "Structured Services Layout & Content Blueprints",
                "description": "Highly readable, accessible indexes highlighting services, transparent pricing cards, and interactive calculators optimized for discovery."
              },
              {
                "@type": "Service",
                "name": "Booking & Registrar Platforms",
                "description": "Custom high-fidelity student scheduling grids, contractor dispatcher widgets, table bookings, and multi-currency secure gateway configurations."
              },
              {
                "@type": "Service",
                "name": "Google Ads Campaign Launch & UTM Auditing",
                "description": "Formulating structural keyword planners, asset groups, target bidding bounds, and end-to-end conversion tracking configurations."
              },
              {
                "@type": "Service",
                "name": "W3C compliant Technical SEO Foundation Support",
                "description": "Semantic tag maps, dynamic meta-level tags, structured JSON-LD schemas, automated sitemaps, and robots.txt directives for traditional and AI search crawlers."
              },
              {
                "@type": "Service",
                "name": "Website Support Maintenance & Optimization Support",
                "description": "Ongoing software version updates, core performance evaluations, content layout adjustments, and constant search console auditing."
              }
            ]
          }
        ]
      }
    };

    if (path.includes("/demo") || path.includes("/site")) {
      if (path.includes("swim") || path.includes("swimming")) {
        schemaObj = {
          "@context": "https://schema.org",
          "@type": "SportsActivityLocation",
          "name": "AquaKids & Squads Swim Academy (Clarity Space Demo Portal)",
          "description": "High-fidelity interactive scheduler roster and trainer assignment demo site by Clarity Space.",
          "url": "https://clarityspace.com.au/swimming-school-quote/demo",
          "priceRange": "$$",
          "parentOrganization": {
            "@type": "ProfessionalService",
            "name": "Clarity Space",
            "url": "https://clarityspace.com.au"
          }
        };
      } else if (path.includes("portfolio") || path.includes("creative")) {
        schemaObj = {
          "@context": "https://schema.org",
          "@type": "ArchitecturalService",
          "name": "Kronos Spatial Bureau (Clarity Space Demo Portal)",
          "description": "Minimalist concrete-themed portfolio layout visualizing raw concrete landmarks and light vectors.",
          "url": "https://clarityspace.com.au/portfolio-quote/demo",
          "priceRange": "$$$$",
          "parentOrganization": {
            "@type": "ProfessionalService",
            "name": "Clarity Space",
            "url": "https://clarityspace.com.au"
          }
        };
      } else if (path.includes("trades") || path.includes("builders")) {
        schemaObj = {
          "@context": "https://schema.org",
          "@type": "PlumbingService",
          "name": "Apex Pro Trades (Clarity Space Demo Portal)",
          "description": "Industrial HVAC, electrical, and master plumbing dispatch simulator with fixed SLA callout ranges.",
          "url": "https://clarityspace.com.au/trades-quote/demo",
          "priceRange": "$$",
          "parentOrganization": {
            "@type": "ProfessionalService",
            "name": "Clarity Space",
            "url": "https://clarityspace.com.au"
          }
        };
      } else if (path.includes("restaurant") || path.includes("dining") || path.includes("cafe")) {
        schemaObj = {
          "@context": "https://schema.org",
          "@type": "Restaurant",
          "name": "Mesa & Oak Woodfire Bistro (Clarity Space Demo Portal)",
          "description": "Atmospheric farm-to-table culinary dining menu and table seat scheduling calculator.",
          "url": "https://clarityspace.com.au/restaurant-quote/demo",
          "priceRange": "$$$",
          "servesCuisine": "Modern Australian / Harvest",
          "parentOrganization": {
            "@type": "ProfessionalService",
            "name": "Clarity Space",
            "url": "https://clarityspace.com.au"
          }
        };
      } else if (path.includes("local") || path.includes("boutique") || path.includes("retail")) {
        schemaObj = {
          "@context": "https://schema.org",
          "@type": "Store",
          "name": "Satin & Cedar Luxury Boutique (Clarity Space Demo Portal)",
          "description": "Bespoke fine mulberry threads and organic incense retail e-commerce catalog demo.",
          "url": "https://clarityspace.com.au/local-quote/demo",
          "priceRange": "$$$",
          "parentOrganization": {
            "@type": "ProfessionalService",
            "name": "Clarity Space",
            "url": "https://clarityspace.com.au"
          }
        };
      } else {
        schemaObj = {
          "@context": "https://schema.org",
          "@type": "AccountingService",
          "name": "Aegis Global Advisory Group (Clarity Space Demo Portal)",
          "description": "Prussian blue Swiss advisory corporate strategist roster and interactive value-growth calculator.",
          "url": "https://clarityspace.com.au/consultant-quote/demo",
          "priceRange": "$$$$$",
          "parentOrganization": {
            "@type": "ProfessionalService",
            "name": "Clarity Space",
            "url": "https://clarityspace.com.au"
          }
        };
      }
    }

    let schemaScript = document.querySelector("#sow-seo-schema") as HTMLScriptElement;
    if (!schemaScript) {
      schemaScript = document.createElement("script");
      schemaScript.id = "sow-seo-schema";
      schemaScript.type = "application/ld+json";
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(schemaObj);

    // Clean-up hook to remove script if component unmounts (optional but clean)
    return () => {
      // Keep schema intact for bots but remove redundant nodes during interactive SPAs
    };

  }, [currentPath]);

  return null; // Side-effect wrapper only (zero render noise)
}
