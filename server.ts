import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import dotenv from "dotenv";
import fs from "fs";

// Load local environmental settings
dotenv.config();

let resendInstance: Resend | null = null;

// Lazy initialization of Resend client to avoid module-load crashes
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "MY_RESEND_API_KEY" || apiKey.includes("123456789")) {
    console.warn("⚠️ [Resend SDK] RESEND_API_KEY is not configured or uses standard placeholder. Email delivery will run in HIGH-FIDELITY SIMULATION mode.");
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

// --- SERVER-SIDE SEO METADATA ENGINE FOR SEARCH ENGINES, GPTBOTS, AND LLMS ---
interface SeoMetaPayload {
  title: string;
  desc: string;
  canonical: string;
  schemaJson: any;
}

function getSeoMetadata(urlPath: string): SeoMetaPayload {
  const p = urlPath.toLowerCase().trim();
  
  let title = "Clarity Space | High-Performance Web Design & Digital Growth";
  let desc = "Sydney's elite digital architecture and high-performance web development bureau. We build bespoke custom platforms with 14-day SLA delivery guarantees and interactive ROI models.";
  let canonicalPath = urlPath === "/" ? "" : urlPath.replace(/\/$/, "");
  let canonical = `https://clarityspace.com.au${canonicalPath}`;
  
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

  if (p.includes("/demo") || p.includes("/site")) {
    if (p.includes("swim") || p.includes("swimming")) {
      title = "Live Preview: Swim Academy Scheduler & Rosters | Clarity Space Interactive Demo";
      desc = "Interactive high-fidelity demonstration website for Swim Schools. Test real-time class enrollments, trainer tables, and fluid mobile sizing.";
      schemaObj = {
        "@context": "https://schema.org",
        "@type": "SportsActivityLocation",
        "name": "AquaKids & Squads Swim Academy (Clarity Space Demo)",
        "description": desc,
        "url": canonical,
        "priceRange": "$$"
      };
    } else if (p.includes("portfolio") || p.includes("creative")) {
      title = "Live Preview: Kronos Spatial Bureau | Clarity Space Creative Demo";
      desc = "Minimalist raw concrete-themed portfolio layout for creative studios, designers, and spatial architects. View responsive image galleries and blueprint indices.";
      schemaObj = {
        "@context": "https://schema.org",
        "@type": "ArchitecturalService",
        "name": "Kronos Spatial Bureau (Clarity Space Demo)",
        "description": desc,
        "url": canonical,
        "priceRange": "$$$$"
      };
    } else if (p.includes("trades") || p.includes("builders")) {
      title = "Live Preview: Apex Pro Trades & Dispatch | Clarity Space Contractors Demo";
      desc = "Industrial mechanical trades callout simulator. Calculate standard or emergency priority callouts, select plumbing or electrical profiles, and test SMS driver dispatch logic.";
      schemaObj = {
        "@context": "https://schema.org",
        "@type": "PlumbingService",
        "name": "Apex Pro Trades (Clarity Space Demo)",
        "description": desc,
        "url": canonical,
        "priceRange": "$$"
      };
    } else if (p.includes("restaurant") || p.includes("dining") || p.includes("cafe")) {
      title = "Live Preview: Mesa & Oak Woodfire Bistro | Clarity Space Dining Demo";
      desc = "Atmospheric farm-to-table dining and harvest menu prototype. Features table space scheduling calculators, vintage reserve wine lists, and botanical olive layout themes.";
      schemaObj = {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "name": "Mesa & Oak Woodfire Bistro (Clarity Space Demo)",
        "description": desc,
        "url": canonical,
        "priceRange": "$$$",
        "servesCuisine": "Modern Australian / Harvest"
      };
    } else if (p.includes("local") || p.includes("boutique") || p.includes("retail")) {
      title = "Live Preview: Satin & Cedar luxury Boutique | Clarity Space Retail Demo";
      desc = "Bespoke luxury lifestyle and satin thread ecommerce concept. Experience the interactive shopping bag, stock limit warnings, and localized Sydney store filters.";
      schemaObj = {
        "@context": "https://schema.org",
        "@type": "Store",
        "name": "Satin & Cedar Luxury Boutique (Clarity Space Demo)",
        "description": desc,
        "url": canonical,
        "priceRange": "$$$"
      };
    } else {
      title = "Live Preview: Aegis Global Advisory Strategy | Clarity Space Corporate Demo";
      desc = "Prussian blue Swiss corporate advisory portal concept. Experience our interactive business growth multiplier models and managing director rosters.";
      schemaObj = {
        "@context": "https://schema.org",
        "@type": "AccountingService",
        "name": "Aegis Global Advisory Group (Clarity Space Demo)",
        "description": desc,
        "url": canonical,
        "priceRange": "$$$$$"
      };
    }
  } else {
    if (p.includes("swimming-school-quote")) {
      title = "Swim Academy Scheduler Premium Proposal & SOW | Clarity Space";
      desc = "Detailed interactive digital statement of work detailing customized core scheduler platforms, live rosters, student/coach registries, and guaranteed timelines.";
    } else if (p.includes("consultant")) {
      title = "Corporate Advisory Website Proposal & Spec SOW | Clarity Space";
      desc = "Digital systems proposal for highbrow advisory firms, investment strategists, and enterprise consultants. Formulates security standards and executive rosters.";
    } else if (p.includes("portfolio") || p.includes("creative")) {
      title = "Creative Studio Portfolio Proposal & Spec SOW | Clarity Space";
      desc = "Bespoke architectural gallery and visual creator proposal. Discusses brutalist layout values, light-meter grids, and portfolio systems.";
    } else if (p.includes("trades")) {
      title = "Trades Contractor Service Dispatch Proposal & SOW | Clarity Space";
      desc = "Operational service blueprint proposal for plumbers, general contractors, and electrician networks. Integrates geo-routing systems and emergency quote builders.";
    } else if (p.includes("restaurant") || p.includes("dining") || p.includes("cafe")) {
      title = "Fine Dining Atmospheric Website Proposal & SOW | Clarity Space";
      desc = "Brand proposal for luxury bistros, wineries, and culinary chefs. Discusses interactive booking registers, digital wine lockers, and artisanal menus.";
    } else if (p.includes("local") || p.includes("boutique") || p.includes("retail")) {
      title = "Bespoke Retail E-Commerce Website Proposal & SOW | Clarity Space";
      desc = "Digital expansion SOW for high-end boutique stores and design labels. Details custom shopping engines, branch level inventory, and payments.";
    } else if (p.includes("static-business-quote") || p.includes("cheap-business-quote") || p.includes("business-quote")) {
      title = "Professional Business App & Web Spec SOW | Clarity Space";
      desc = "High-fidelity digital statement of work detailing interactive package scopes, transparent pricing models, and elite system deployment SLAs.";
    }
  }

  // Backlink connection linking demo schemas/subpages back to main parent service
  if (p !== "/" && p !== "") {
    schemaObj.parentOrganization = {
      "@type": "ProfessionalService",
      "name": "Clarity Space",
      "url": "https://clarityspace.com.au"
    };
  }

  return { title, desc, canonical, schemaJson: schemaObj };
}

function injectMetadata(html: string, urlPath: string): string {
  const meta = getSeoMetadata(urlPath);
  
  // Strip any default elements from original standard index.html structure to verify neat, single definitions
  let cleanHtml = html
    .replace(/<title>.*?<\/title>/gi, "")
    .replace(/<meta name="description" content=".*?"\s*\/?>/gi, "")
    .replace(/<link rel="canonical" href=".*?"\s*\/?>/gi, "")
    .replace(/<meta property="og:title" content=".*?"\s*\/?>/gi, "")
    .replace(/<meta property="og:description" content=".*?"\s*\/?>/gi, "")
    .replace(/<meta property="og:url" content=".*?"\s*\/?>/gi, "")
    .replace(/<meta name="twitter:title" content=".*?"\s*\/?>/gi, "")
    .replace(/<meta name="twitter:description" content=".*?"\s*\/?>/gi, "");

  // Compile new highbrow targeting tags + dynamic JSON-LD application schema block
  const injectedTags = `
    <title>${meta.title}</title>
    <meta name="description" content="${meta.desc}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.desc}" />
    <meta property="og:url" content="${meta.canonical}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${meta.title}" />
    <meta name="twitter:description" content="${meta.desc}" />
    <link rel="canonical" href="${meta.canonical}" />
    <script id="sow-seo-schema" type="application/ld+json">${JSON.stringify(meta.schemaJson)}</script>
  `;

  return cleanHtml.replace(/<head>/i, `<head>\n    ${injectedTags.trim()}`);
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON parsing middleware for API routes
  app.use(express.json());

  // Transaction email dispatch proxy API
  app.post("/api/send-email", async (req, res) => {
    try {
      const { name, email, phone, company, message, selectedPackage, selectedAddons, priceEstimate } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          error: "Sender name and email coordinates are required.",
        });
      }

      console.log(`📬 [Email Dispatch request] Received enquiry from ${name} (${email})`);

      // Prepare beautiful transactional email layout
      const emailHtml = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
          <div style="border-bottom: 2px solid #06b6d4; padding-bottom: 16px; margin-bottom: 24px;">
            <h2 style="margin: 0; color: #0f172a; font-size: 22px; font-weight: 700; letter-spacing: -0.025em;">Clarity Space</h2>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">New Digital Growth Consultation Enquiry</p>
          </div>

          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Prospect Coordinates</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b; width: 140px; font-weight: 500;">Prospect Name:</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Email Address:</td>
                <td style="padding: 8px 0; color: #06b6d4; font-weight: 600;"><a href="mailto:${email}" style="color: #06b6d4; text-decoration: none;">${email}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Phone Number:</td>
                <td style="padding: 8px 0; color: #1e293b;">${phone || "Not provided"}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Company/Brand:</td>
                <td style="padding: 8px 0; color: #1e293b;">${company || "Not provided"}</td>
              </tr>
            </table>
          </div>

          ${selectedPackage ? `
          <div style="margin-bottom: 24px; padding: 16px; background-color: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1;">
            <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Configured Price Estimate</h3>
            <p style="margin: 4px 0 2px 0; font-size: 14px; font-weight: 600; color: #0f172a;">Selected Scope Blueprint: <span style="color: #0284c7;">${selectedPackage}</span></p>
            ${priceEstimate ? `<p style="margin: 2px 0 4px 0; font-size: 14px; font-weight: bold; color: #10b981;">Total Estimated: ${priceEstimate}</p>` : ""}
            ${selectedAddons && selectedAddons.length > 0 ? `
              <p style="margin: 8px 0 2px 0; font-size: 12px; font-weight: 600; color: #475569;">Selected Add-on Capacities:</p>
              <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #475569;">
                ${selectedAddons.map((addon: string) => `<li style="margin-bottom: 2px;">${addon}</li>`).join("")}
              </ul>
            ` : ""}
          </div>
          ` : ""}

          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Message / Brief Details</h3>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap; background-color: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">${message || "No custom message provided."}</p>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center;">
            <p style="margin: 0;">Sent automatically by Clarity Space Web System via the Resend API channel.</p>
          </div>
        </div>
      `;

      const resendClient = getResendClient();

      if (resendClient) {
        const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
        const toEmail = process.env.RESEND_TO_EMAIL || process.env.TO_EMAIL || "accounts@clarityspace.com.au";

        // 1. Send Admin Alert
        const { data, error } = await resendClient.emails.send({
          from: fromEmail,
          to: [toEmail],
          replyTo: email,
          subject: `✨ Clarity Space Enquiry - ${name} (${company || "Direct Portfolio"})`,
          html: emailHtml,
        });

        if (error) {
          console.error("❌ [Resend SDK Error]:", error);
          return res.status(502).json({
            success: false,
            simulated: false,
            error: error.message || "Failed to dispatch email via Resend Service.",
          });
        }

        // 2. Send Auto-Reply to Client
        if (email && email.includes('@')) {
          try {
            await resendClient.emails.send({
              from: fromEmail,
              to: [email],
              subject: "Request Received - Clarity Space",
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
                  <h2 style="color: #0f172a;">Hi ${name},</h2>
                  <p>Thanks for reaching out with your project details.</p>
                  <p>We have successfully received your request and are reviewing it now. We usually get back within 1 business day with a clear recommendation and next steps.</p>
                  <p>Best regards,</p>
                  <p><strong>David</strong><br/>Clarity Space</p>
                </div>
              `
            });
            console.log(`✉️ [Auto-reply] Sent client confirmation to ${email}`);
          } catch (autoReplyErr) {
            console.warn("⚠️ [Auto-reply warning]: Could not send auto-reply to client.", autoReplyErr);
          }
        }

        return res.status(200).json({
          success: true,
          simulated: false,
          id: data?.id,
          message: "Enquiry sent securely through Resend dispatch system."
        });
      } else {
        // High-Fidelity Simulator Send when RESEND_API_KEY is not defined
        const simulatedTo = process.env.RESEND_TO_EMAIL || process.env.TO_EMAIL || "accounts@clarityspace.com.au";
        const simulatedFrom = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

        console.log("⚡ [Email Dispatch Simulator] Successfully simulated email transaction:");
        console.log(`  To: ${simulatedTo}`);
        console.log(`  From: ${simulatedFrom}`);
        console.log(`  Subject: ✨ Clarity Space Enquiry - ${name}`);
        console.log(`  Auto-reply: ✨ (Simulated) Auto-reply sent to ${email}`);
        
        return res.status(200).json({
          success: true,
          simulated: true,
          message: `Sandbox Simulation Mode: Send succeeded successfully with high fidelity. (Deploy with RESEND_API_KEY to activate genuine mail deliverability to ${simulatedTo}).`
        });
      }
    } catch (err: any) {
      console.error("❌ Exception during mail dispatch route handler:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Internal server error occurred during transactional email compilation."
      });
    }
  });

  // Health endpoint checks
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", resendConfigured: !!process.env.RESEND_API_KEY });
  });

  // Vite middleware setup for Development & Production fallback
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Fallback for direct browser client-side routing in dev mode
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        template = injectMetadata(template, url);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      try {
        const templatePath = path.join(distPath, "index.html");
        if (fs.existsSync(templatePath)) {
          let template = fs.readFileSync(templatePath, "utf-8");
          template = injectMetadata(template, req.originalUrl);
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
        } else {
          res.sendFile(templatePath);
        }
      } catch (err) {
        res.sendFile(path.join(distPath, "index.html"));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Full-stack Server online on port ${PORT}`);
    console.log(`   - Mode: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
