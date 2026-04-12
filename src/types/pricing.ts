export interface PricingPlan {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
  icon: 'star' | 'zap' | 'crown';
  color: 'blue' | 'amber' | 'purple';
  isPopular: boolean;
  displayOrder: number;
}
