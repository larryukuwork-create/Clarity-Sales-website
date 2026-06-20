import { ValueCard, Service, PricingPackage, Addon, ThirdPartyCost, ProcessStep, FAQItem } from "./types";

export const valueCards: ValueCard[] = [
  {
    id: "clear-pricing",
    title: "Clear Pricing",
    description: "Know the project cost before development starts.",
    iconName: "DollarSign",
  },
  {
    id: "professional-design",
    title: "Professional Design",
    description: "A clean website that helps customers trust your business.",
    iconName: "Layout",
  },
  {
    id: "easy-updates",
    title: "Easy Updates",
    description: "CMS editing can be included so the client can update content.",
    iconName: "Edit3",
  },
  {
    id: "launch-support",
    title: "Launch Support",
    description: "Support with setup, testing, deployment and handover.",
    iconName: "Rocket",
  },
];

export const services: Service[] = [
  {
    id: "business-website-design",
    title: "Business Website Design",
    description: "Professional websites for local businesses, service providers and growing brands.",
    iconName: "Palette",
    benefits: ["Custom layout layout", "Highly readable typography", "Trust building visual hierarchy"],
  },
  {
    id: "service-website",
    title: "Service Website",
    description: "Structured pages for services, pricing, FAQs, contact forms and customer enquiries.",
    iconName: "Layers",
    benefits: ["Content layout blueprint", "Form and call-to-actions", "Service landing templates"],
  },
  {
    id: "booking-registration-website",
    title: "Booking & Registration Website",
    badge: "Advanced",
    description: "Websites with booking flow, enquiry forms, registration pages and optional admin tools.",
    iconName: "CalendarRange",
    benefits: ["Direct scheduling flow", "Flexible registration views", "Simple operator controls"],
  },
  {
    id: "google-ads-setup",
    title: "Google Ads Setup",
    description: "Campaign setup, landing page tracking and basic conversion tracking.",
    iconName: "TrendingUp",
    benefits: ["Keyword planning structure", "Conversion attribution", "Analytics registration"],
  },
  {
    id: "seo-foundation-setup",
    title: "SEO Foundation Setup",
    description: "Page titles, meta descriptions, sitemap, search-friendly structure and basic technical SEO.",
    iconName: "Search",
    benefits: ["Optimized page layouts", "XML sitemap generation", "Page loading optimization"],
  },
  {
    id: "website-maintenance",
    title: "Website Maintenance",
    description: "Ongoing support for small updates, checks, improvements and future changes.",
    iconName: "ShieldCheck",
    benefits: ["Software upgrades", "Performance health audits", "Content adjustments assistance"],
  },
];

export const packages: PricingPackage[] = [
  {
    id: "landing_page",
    name: "Landing Page",
    price: "AUD 1,500",
    priceValue: 1500,
    description: "Perfect for single marketing campaigns, new offers, or testing a business idea.",
    includes: [
      "1 long-form scrolling page",
      "Mobile-responsive design",
      "Clear offer and call-to-action sections",
      "Simple contact/enquiry form",
      "Basic SEO setup",
      "Fast turnaround"
    ],
  },
  {
    id: "small_business_website",
    name: "Small Business Website",
    price: "AUD 3,500",
    priceValue: 3500,
    description: "Ideal for local services, trades, consultants, and established small businesses.",
    isRecommended: true,
    includes: [
      "Up to 5 pages: Home, Services, About, Contact, FAQ/Gallery",
      "Mobile-responsive design",
      "Service-specific layouts",
      "Advanced quote/enquiry form",
      "Google Analytics setup",
      "Local SEO foundation"
    ],
  },
  {
    id: "growth_website_client_workflow",
    name: "Growth Website & Client Workflow",
    price: "AUD 5,500",
    priceValue: 5500,
    description: "For businesses that want a stronger online presence, better enquiries, booking support, and smoother client follow-up.",
    includes: [
      "Up to 8–10 website pages",
      "Multi-step enquiry/intake forms",
      "Booking calendar setup",
      "Automated email notifications",
      "Simple lead tracking dashboard",
      "Analytics, SEO foundation & launch handover"
    ],
  },
];

export const addons: Addon[] = [
  {
    id: "google-ads",
    name: "Google Ads Setup",
    feeSuffix: "Setup + Monthly Management",
    setupFeeRange: "AUD 1,200 to AUD 2,400 setup",
    setupFeeMin: 1200,
    monthlyRange: "AUD 600 to AUD 1,600 per month",
    monthlyMin: 600,
    isMonthly: true,
    note: "Google Ads budget is paid directly by the client.",
  },
  {
    id: "maintenance",
    name: "Website Maintenance",
    feeSuffix: "Monthly Support Support Plans",
    setupFeeRange: "AUD 160 to AUD 300/mo (Basic)",
    setupFeeMin: 160,
    monthlyRange: "AUD 400 to AUD 800/mo (Managed)",
    monthlyMin: 400,
    isMonthly: true,
    note: "Covers ongoing updates, checks, hosting monitoring, and design additions.",
  },
];

export const thirdPartyCosts: ThirdPartyCost[] = [
  {
    id: "domain",
    name: "Domain registration",
    cost: "AUD 20 to AUD 60",
    billing: "per year",
  },
  {
    id: "hosting",
    name: "Cloud hosting service",
    cost: "AUD 160 to AUD 600",
    billing: "per year",
  },
  {
    id: "email",
    name: "Business email system",
    cost: "AUD 10 to AUD 30",
    billing: "per user per month",
  },
  {
    id: "sms-email-provider",
    name: "SMS or email provider",
    cost: "Depends on volume",
    billing: "as used",
  },
  {
    id: "payment-gateway",
    name: "Payment gateway transaction fee",
    cost: "Depends on card volume",
    billing: "per transaction",
  },
  {
    id: "ads-budget",
    name: "Google Ads advertising budget",
    cost: "Suggested AUD 600 to AUD 3,000+",
    billing: "per month",
  },
];

export const processSteps: ProcessStep[] = [
  {
    stepNumber: 1,
    title: "Scope & Quote",
    description: "Goal Definition & Pricing",
    detail: "We confirm the website goals, pages, features and pricing.",
  },
  {
    stepNumber: 2,
    title: "Structure",
    description: "Sitemap & Page Flows",
    detail: "We plan the website pages, content flow and main user actions.",
  },
  {
    stepNumber: 3,
    title: "Design Preview",
    description: "Visual Direction Blueprint",
    detail: "We create a clean visual direction before full development.",
  },
  {
    stepNumber: 4,
    title: "Development & Testing",
    description: "Responsive Build & QA checks",
    detail: "We build the website, check mobile layout, forms, links and basic SEO.",
  },
  {
    stepNumber: 5,
    title: "Launch & Support",
    description: "DNS connection & Handover",
    detail: "We help connect the domain, launch the website and provide basic handover.",
  },
];

export const faqs: FAQItem[] = [
  {
    id: "domain-hosting",
    question: "Is domain and hosting included?",
    answer: "Setup help is included, but domain, hosting and other third-party fees are paid directly by the client.",
  },
  {
    id: "google-ads-help",
    question: "Can you help with Google Ads?",
    answer: "Yes. We can help set up Google Ads, landing page tracking and basic conversion tracking. The advertising budget is separate.",
  },
  {
    id: "client-edit",
    question: "Can the client edit the website?",
    answer: "Yes. CMS editing can be included depending on the package.",
  },
  {
    id: "timeline",
    question: "How long does a website take?",
    answer: "Most projects take around 3 to 8 weeks depending on the scope and how ready the content is.",
  },
  {
    id: "booking-systems",
    question: "Do you build booking systems?",
    answer: "Yes. Booking, payment, login and admin features are available in the Booking Platform package because they require more planning, development and testing.",
  },
  {
    id: "fixed-prices",
    question: "Are prices fixed?",
    answer: "The prices are package starting points. Final pricing depends on the exact number of pages, features, content, integrations and launch requirements.",
  },
];
