export interface PackageConfig {
  id: string;
  label: string;
  basePrice: number;
  includedPages: number;
  recommendedMaxPages: number;
  description: string;
  inclusions: string[];
  isRecommended?: boolean;
}

export interface AddonConfig {
  id: string;
  label: string;
  price: number;
  includedIn: string[];
  isPerItem?: boolean;
  note?: string;
}

export const packages: Record<string, PackageConfig> = {
  landing_page: {
    id: "landing_page",
    label: "Landing Page",
    basePrice: 1500,
    includedPages: 1,
    recommendedMaxPages: 1,
    description: "Perfect for single marketing campaigns, new offers, or testing a business idea.",
    inclusions: [
      "1 long-form scrolling page",
      "Mobile-responsive design",
      "Clear offer and call-to-action sections",
      "Simple contact/enquiry form",
      "Basic SEO setup",
      "Fast turnaround"
    ]
  },
  small_business_website: {
    id: "small_business_website",
    label: "Small Business Website",
    basePrice: 3500,
    includedPages: 5,
    recommendedMaxPages: 7,
    description: "Ideal for local services, trades, consultants, and established small businesses.",
    inclusions: [
      "Up to 5 pages: Home, Services, About, Contact, FAQ/Gallery",
      "Mobile-responsive design",
      "Service-specific layouts",
      "Advanced quote/enquiry form",
      "Google Analytics setup",
      "Local SEO foundation"
    ],
    isRecommended: true
  },
  growth_website_client_workflow: {
    id: "growth_website_client_workflow",
    label: "Growth Website & Client Workflow",
    basePrice: 5500,
    includedPages: 10,
    recommendedMaxPages: 10,
    description: "For businesses that want a stronger online presence, better enquiries, booking support, and smoother client follow-up.",
    inclusions: [
      "Up to 8–10 website pages",
      "Multi-step enquiry/intake forms",
      "Booking calendar setup",
      "Automated email notifications",
      "Simple lead tracking dashboard",
      "Analytics, SEO foundation & launch handover"
    ]
  }
};

export const standardPageOptions: string[] = [
  "Home",
  "About",
  "Services",
  "Contact",
  "FAQ",
  "Gallery",
  "Testimonials",
  "Portfolio / Projects",
  "Pricing",
  "Locations / Service Areas"
];

export const addonOptions: AddonConfig[] = [
  {
    id: "booking_calendar_page",
    label: "Booking / Calendar Page",
    price: 450,
    includedIn: ["growth_website_client_workflow"]
  },
  {
    id: "advanced_quote_form",
    label: "Advanced Quote / Enquiry Form",
    price: 500,
    includedIn: ["small_business_website", "growth_website_client_workflow"]
  },
  {
    id: "multi_step_intake_form",
    label: "Multi-step Client Intake Form",
    price: 750,
    includedIn: ["growth_website_client_workflow"]
  },
  {
    id: "email_notification_automation",
    label: "Email Notifications / Follow-up Automation",
    price: 450,
    includedIn: ["growth_website_client_workflow"]
  },
  {
    id: "simple_lead_tracking_dashboard",
    label: "Simple Lead Tracking Dashboard",
    price: 900,
    includedIn: ["growth_website_client_workflow"]
  },
  {
    id: "blog_or_news_setup",
    label: "Blog / News Setup",
    price: 650,
    includedIn: []
  },
  {
    id: "service_area_pages",
    label: "Extra Service Area / Location Pages",
    price: 250,
    includedIn: [],
    isPerItem: true
  },
  {
    id: "basic_booking_embed",
    label: "Basic Booking Embed",
    price: 250,
    includedIn: []
  },
  {
    id: "ecommerce_or_payment_setup",
    label: "Simple Payment / Product Setup",
    price: 1200,
    includedIn: [],
    note: "requires final quote"
  }
];

export const EXTRA_STANDARD_PAGE_PRICE = 350;

export function getAddonById(id: string): AddonConfig | undefined {
  return addonOptions.find(a => a.id === id);
}

export function isAddonIncludedInPackage(addonId: string, packageId: string): boolean {
  const addon = getAddonById(addonId);
  if (!addon) return false;
  return addon.includedIn.includes(packageId);
}

export function calculateQuote(
  packageId: string, 
  selectedStandardPagesCount: number, 
  selectedAddonIds: string[], 
  extraServiceAreaCount: number = 0
) {
  const pkg = packages[packageId];
  if (!pkg) return { total: 0, extraPagesCost: 0, addonCost: 0, upgradesRecommended: [] };

  const extraStandardPages = Math.max(0, selectedStandardPagesCount - pkg.includedPages);
  const extraPagesCost = extraStandardPages * EXTRA_STANDARD_PAGE_PRICE;

  let addonCost = 0;
  for (const addonId of selectedAddonIds) {
    if (!isAddonIncludedInPackage(addonId, packageId)) {
      const addon = getAddonById(addonId);
      if (addon) {
        if (addon.id === "service_area_pages") {
           addonCost += addon.price * Math.max(1, extraServiceAreaCount);
        } else {
           addonCost += addon.price;
        }
      }
    }
  }

  const upgradesRecommended: string[] = [];
  if (packageId === "landing_page" && selectedStandardPagesCount > 1) {
    upgradesRecommended.push("Based on your selected pages, we strongly recommend upgrading to the Small Business Website package.");
  } else if (packageId === "small_business_website" && selectedStandardPagesCount > 7) {
    upgradesRecommended.push("Based on your selected pages, consider upgrading to the Growth Website & Client Workflow.");
  } else if (packageId === "growth_website_client_workflow" && selectedStandardPagesCount > 10) {
    upgradesRecommended.push("Custom quote may be required for a project of this size.");
  }
  
  if (selectedAddonIds.includes("ecommerce_or_payment_setup")) {
    upgradesRecommended.push("Simple Payment / Product Setup starts from $1,200 and requires a final custom quote.");
  }

  return {
    packageBasePrice: pkg.basePrice,
    extraPagesCost,
    addonCost,
    total: pkg.basePrice + extraPagesCost + addonCost,
    upgradesRecommended
  };
}
