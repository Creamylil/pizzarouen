import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbNavigationProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
  siteName?: string;
}

export default function BreadcrumbNavigation({ items, siteName = "Pizza" }: BreadcrumbNavigationProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
      <Link
        href="/"
        className="flex items-center hover:text-gray-700 transition-colors font-medium"
      >
        {siteName}
      </Link>

      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4" />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="hover:text-gray-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
