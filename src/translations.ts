import { ValueCard, Service, PricingPackage, Addon, ThirdPartyCost, ProcessStep, FAQItem } from "./types";

export type Language = "en";
export type Currency = "AUD";

// Values are now directly in AUD
export function convertCost(val: number, currency: Currency): number {
  return val;
}

export function formatPrice(val: number, currency: Currency, prefixWithFrom: boolean = false): string {
  const prefix = prefixWithFrom ? "From " : "";
  return `${prefix}${currency} ${val.toLocaleString()}`;
}

export const trans = {
  en: {
    brandName: "Clarity Space",
    brandSubtitle: "Digital Growth",
    ctaQuote: "Get a Website Quote",
    navServices: "Services",
    navPricing: "Work / Examples",
    navProcess: "Process",
    navAddons: "Add-ons",
    navFaq: "FAQ",
    navContact: "Request Quote",
    
    // Hero
    heroTag: "RELIABLE WEB DESIGN & DEVELOPMENT",
    heroTitlePart1: "We build websites that help",
    heroTitlePart2: "grow your business",
    heroDesc: "Clear pricing, professional design, easy CMS updates, and complete support from start to launch.",
    heroCtaCustomizer: "Use Quote Configurator",
    heroCtaContact: "Talk to Us Ready",
    recommendedPlan: "Recommended Plan",
    recommendedPlanPrice: "Professional Website - AUD 15,600",
    recommendedPlanPriceAud: "Professional Website - AUD 15,600",
    
    // Section headers
    valuesTitle: "Why Clients Trust Clarity Space",
    valuesSubtitle: "We focus on transparency, high-quality layout typography, and complete launch support.",
    servicesTitle: "Professional Web Solutions",
    servicesSubtitle: "Tailored digital experiences for local businesses, service providers, and booking platforms.",
    calculatorTitle: "Interactive Website Cost Estimator",
    calculatorSubtitle: "Calculate a clear cost estimate based on your specific pages, forms, and system features.",
    addonsTitle: "Marketing & Growth Add-ons",
    addonsSubtitle: "Optional campaigns and maintenance support to drive visitors and keep your website running smoothly.",
    thirdPartyTitle: "Estimated Third-Party System Costs",
    thirdPartyDesc: "These are standard fees paid directly to the service providers (not us) to run your live website.",
    processTitle: "Our Strategic 5-Step Process",
    processSubtitle: "How we guide your web project smoothly from initial scope definition to successful launch.",
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Got questions? We have clear answers about our process, pricing, and handover support.",
    contactTitle: "Initiate Your Project Proposal",
    contactSubtitle: "Send us your project details or apply your customized estimator selection below to get a formal quote.",
    
    // Calculator steps
    step1Pkg: "1. Select starting package blueprint:",
    step2Custom: "2. Customize with Individual Features (Value Per Item):",
    step3Addons: "3. Layer Optional Growth/marketing Add-ons:",
    priceListBadge: "A La Carte Price List",
    includedInPlan: "Plan Included",
    inclText: "Included",
    addModule: "Add module",
    addedText: "Added",
    extraPages: "Additional Custom Pages",
    extraPagesDesc: "AUD 500 / page",
    extraForms: "Extra Custom Submission Forms",
    extraFormsDesc: "AUD 300 / form",
    langSetup: "Multi-Language Setup",
    langSetupDesc: "AUD 1,000 / initial extra language",
    cmsAdmin: "CMS Admin Console Setup",
    cmsAdminDesc: "AUD 1,600 / setup (Edit content easily)",
    bookingModule: "Interactive Booking & Calendar",
    bookingModuleDesc: "AUD 3,000 / module (Client scheduler)",
    paymentGateway: "Stripe / Card Payment Gateway",
    paymentGatewayDesc: "AUD 2,400 / Integration & testing",
    membersPortal: "Customer Login Portal & Accounts",
    membersPortalDesc: "AUD 3,600 / system (Member database)",
    analyticsSetupText: "Google Analytics G4 Event setup",
    analyticsSetupDesc: "AUD 400 / setup (Sitemap + conversion hooks)",
    
    // Calculator Sidebar
    sidebarSummaryTitle: "Your Configuration Summary",
    selectedBase: "Active Base Package:",
    itemizedCustom: "A-La-Carte Custom Features:",
    noneSelected: "None selected yet",
    growthAddons: "Optional Growth Add-ons:",
    noneSelectedAddon: "None selected",
    estBuildCost: "Est. Project Build Support:",
    estOngoingCost: "Est. Support & Ads fee:",
    applyToFormBtn: "Apply Selection to Request Form",
    loadingEstimation: "estimating...",
    
    // Contact Form
    contactFormName: "Full Name",
    contactFormEmail: "Email Address",
    contactFormCompany: "Business Company Name",
    contactFormBizType: "Business Type",
    contactFormInterest: "Package Category Interest",
    contactFormBudget: "Est. Total Project Budget Scope",
    contactFormMsg: "Your Custom Requirements & Message",
    contactFormSubmit: "Submit Information Request",
    submittingBtn: "Sending details...",
    noObligationBadge: "No Obligations Review",
    noObligationDesc: "Every enquiry includes a 30-minute video or call session to review your goals and sitemap with no obligation.",
    recentQuotesTitle: "Recent Submitted Quotes",
    presetSelectedBadge: "PRESET LOADS DETECTED",
    presetApplied: "applied from customized estimate tool",
    clearPresetBtn: "Clear presets",
    quoteSuccess: "Thank you! Your quote request has been saved securely.",
    quoteSuccessSub: "Our team will reach out at your email to schedule our call.",
    
    // General / Miscellaneous
    backToTop: "Back to top",
    allRightsReserved: "Clarity Space. All rights reserved.",
    valueLabel: "Value",
    setupFee: "Setup:",
    monthlyFee: "Monthly:",
    perYear: "per year",
    perMonth: "per user per month",
    asUsed: "as used",
    perTransaction: "per transaction",
    adsBudgetLabel: "Google Ads advertising budget",
    suggestedBudget: "Suggested budget paid to Google",
  }
};

// Rich dynamic translated datasets
export function getValueCards(lang: Language): ValueCard[] {
  return [
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
}

export function getServices(lang: Language): Service[] {
  return [
    {
      id: "website-redesign",
      title: "Website Redesign & Auditing",
      description: "Modernizing your existing site to improve trust, speed, and conversion rates.",
      iconName: "Palette",
      benefits: ["Modern typographic pairings", "Responsive code optimization", "Migration support without downtime"],
    },
    {
      id: "business-website-design",
      title: "New business website",
      description: "Custom modern websites built to make your business look like a premium option.",
      iconName: "Palette",
      benefits: ["Visual strategy & page hierarchy", "Typography custom matching", "High visitor trust signals"],
    },
    {
      id: "booking-registration-website",
      title: "Quote / enquiry / booking form setup",
      badge: "Popular Solution",
      description: "Custom online forms to qualify leads, capture details, and register clients easily.",
      iconName: "CalendarRange",
      benefits: ["Interactive timeline slots", "Self-managed client bookings", "Email & SMS reminders ready"],
    },
  ];
}

export function getPackages(lang: Language, currency: Currency): PricingPackage[] {
  return [
    {
      id: "landing_page",
      name: "Starter Website",
      price: `${currency} ${formatPrice(1500, currency)}`,
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
      name: "Business Website",
      price: `${currency} ${formatPrice(3500, currency)}`,
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
      name: "Growth Website",
      price: `${currency} ${formatPrice(5500, currency)}+`,
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
    }
  ];
}

export function getAddons(lang: Language, currency: Currency): Addon[] {
  return [
    {
      id: "google-ads",
      name: "Google Ads Setup",
      feeSuffix: "Setup + Monthly Management",
      setupFeeRange: `${currency} ${convertCost(1200, currency).toLocaleString()} to ${currency} ${convertCost(2400, currency).toLocaleString()} setup`,
      setupFeeMin: 1200,
      monthlyRange: `${currency} ${convertCost(600, currency).toLocaleString()} to ${currency} ${convertCost(1600, currency).toLocaleString()} per month`,
      monthlyMin: 600,
      isMonthly: true,
      note: "Google Ads budget is paid directly by the client.",
    },
    {
      id: "maintenance",
      name: "Monthly Website Maintenance",
      feeSuffix: "Monthly Support Plans",
      setupFeeRange: `${currency} ${convertCost(160, currency).toLocaleString()} to ${currency} ${convertCost(300, currency).toLocaleString()}/mo (Basic)`,
      setupFeeMin: 160,
      monthlyRange: `${currency} ${convertCost(400, currency).toLocaleString()} to ${currency} ${convertCost(800, currency).toLocaleString()}/mo (Managed)`,
      monthlyMin: 400,
      isMonthly: true,
      note: "Covers ongoing updates, checks, hosting monitoring, and design additions.",
    },
  ];
}

export function getThirdPartyCosts(lang: Language, currency: Currency): ThirdPartyCost[] {
  return [
    {
      id: "domain",
      name: "Domain registration (.com, .com.au, etc.)",
      cost: `${currency} ${convertCost(20, currency).toLocaleString()} - ${currency} ${convertCost(60, currency).toLocaleString()}`,
      billing: "per year",
    },
    {
      id: "hosting",
      name: "Cloud hosting service (Vercel, AWS, Cloudflare)",
      cost: `${currency} ${convertCost(160, currency).toLocaleString()} - ${currency} ${convertCost(600, currency).toLocaleString()}`,
      billing: "per year",
    },
    {
      id: "email",
      name: "Google Workspace Business Email",
      cost: `${currency} ${convertCost(10, currency).toLocaleString()} - ${currency} ${convertCost(30, currency).toLocaleString()}`,
      billing: "per user per month",
    },
    {
      id: "sms-email-provider",
      name: "Transactional SMS or mail template APIs",
      cost: "Depends on volume",
      billing: "as used",
    },
    {
      id: "payment-gateway",
      name: "Stripe / VISA Merchant transaction fee",
      cost: "Depends on card volume (approx 1.7% + 30c for domestic cards)",
      billing: "per transaction",
    },
    {
      id: "ads-budget",
      name: "Google Search Ads promotion budget",
      cost: `Suggested ${currency} ${convertCost(600, currency).toLocaleString()} to ${currency} ${convertCost(3000, currency).toLocaleString()}+`,
      billing: "per month",
    },
  ];
}

export function getProcessSteps(lang: Language): ProcessStep[] {
  return [
    {
      stepNumber: 1,
      title: "Request website quote",
      description: "Fill out the simple intake form",
      detail: "Tell us about your business, current website or Facebook page, and what you need built.",
    },
    {
      stepNumber: 2,
      title: "We review your business",
      description: "Manual assessment of your needs",
      detail: "We review your goals, your current online presence, and figure out the best approach to get you more enquiries.",
    },
    {
      stepNumber: 3,
      title: "You receive a plan and price",
      description: "Clear proposal and fixed quote",
      detail: "You get a straightforward plan explaining what we'll build, how much it costs, and how long it will take.",
    },
    {
      stepNumber: 4,
      title: "Design Draft & Approval",
      description: "Review and approve the initial design",
      detail: "We create an initial design draft. Once you are happy and approve the draft, the deposit is paid to officially start the main build.",
    },
    {
      stepNumber: 5,
      title: "Website is built",
      description: "Main development and testing",
      detail: "We handle the main build, write the code, set up your forms, and make sure everything works perfectly on mobile.",
    },
    {
      stepNumber: 6,
      title: "Launch and support",
      description: "Going live and beyond",
      detail: "We help you connect your domain, launch the site, and are available for ongoing support when you need it.",
    },
  ];
}

export function getFaqs(lang: Language): FAQItem[] {
  return [
    {
      id: "zero-risk",
      question: "Is there any risk? Why is it considered 'zero-risk'?",
      answer: "There path is 100% zero-risk. We create and present a bespoke high-fidelity layout draft of your website first. You review and revise it with zero obligation. You only pay your mobilization milestone invoice once you approve the draft to commence framework engineering.",
    },
    {
      id: "payment-terms",
      question: "What are your payment terms?",
      answer: "We ensure you are 100% happy with the initial design draft before you pay a single cent of setup deposit. Once you approve the draft, the mobilization payment is processed to officially start core framework configuration. A remainder is paid once development is approved and active.",
    },
    {
      id: "cost",
      question: "How much does a small business website cost?",
      answer: "Every project is different, but simple landing pages start around $1,500, while complete service or e-commerce websites usually range from $3,500 to $7,500 based on the features you need.",
    },
    {
      id: "timeline",
      question: "How long does it take?",
      answer: "Most small business websites launch within 2 to 6 weeks, depending on how quickly you can provide text and photos and the complexity of the features.",
    },
    {
      id: "redesign",
      question: "Can you redesign my current website?",
      answer: "Yes, we regularly redesign outdated websites to make them mobile-friendly, faster, and better at converting visitors into leads.",
    },
    {
      id: "quote-form",
      question: "Can you add a quote form?",
      answer: "Absolutely. Setting up custom enquiry, booking, and quote forms is a core part of what we do to help you collect the right details from clients.",
    },
    {
      id: "domain-selection",
      question: "How do I choose and secure the right domain name?",
      answer: "We recommend choosing a short, memorable .com or .com.au domain that matches your business name. We assist in researching availability, configuring dns parameters, domain mapping, and setting up secure lockups so your brand stays completely protected.",
    },
    {
      id: "maintenance",
      question: "What should I expect for ongoing website maintenance?",
      answer: "Websites run on server infrastructure that needs periodic health, performance, and form status checks. We offer flexible ongoing maintenance plans starting at $160/mo covering routine updates, form routing checks, analytics tracking verification, and minor visual or copy additions.",
    },
    {
      id: "privacy-data",
      question: "How are security, privacy, and visitor data handled?",
      answer: "We ensure every website is built with HTTPS/SSL certificates, protected form inputs (with spam validation), and serverless structures that do not store credit card credentials directly. Client lead data is processed via secure channels, and we include standard privacy notices block templates to help you comply with GDPR or local privacy acts.",
    },
    {
      id: "domain-hosting",
      question: "Do I need hosting/domain already?",
      answer: "No, you don't. We can help you register a new domain name and set up the cloud hosting during the build process.",
    },
    {
      id: "facebook-only",
      question: "Do you work with businesses that only have Facebook?",
      answer: "Yes! Many of our clients start with only an Instagram or Facebook page, and we help them establish a professional standalone website to build more trust.",
    },
  ];
}
