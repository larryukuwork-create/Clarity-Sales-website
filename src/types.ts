/**
 * Types modeling Clarity Space's service catalog, packages, add-ons, 
 * process steps, values, and quote request telemetry.
 */

export interface ValueCard {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  badge?: string;
  iconName: string;
  benefits: string[];
}

export interface PricingPackage {
  id: string;
  name: string;
  price: string;
  priceValue: number; // For the interactive calculator
  description: string;
  isRecommended?: boolean;
  includes: string[];
}

export interface Addon {
  id: string;
  name: string;
  feeSuffix: string;
  setupFeeRange: string;
  setupFeeMin: number;
  monthlyRange?: string;
  monthlyMin?: number;
  isMonthly?: boolean;
  note?: string;
}

export interface ThirdPartyCost {
  id: string;
  name: string;
  cost: string;
  billing: string;
}

export interface ProcessStep {
  stepNumber: number;
  title: string;
  description: string;
  detail: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface QuoteRequest {
  name: string;
  email: string;
  businessName: string;
  businessType: string;
  packageInterest: string;
  addonsInterest: string[];
  budgetRange: string;
  message: string;
}
