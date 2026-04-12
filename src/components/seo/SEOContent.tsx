'use client';

import type { SeoContentData } from '@/types/city';

interface SEOContentProps {
  seoContent: SeoContentData | null;
  cityName: string;
}

function replacePlaceholders(text: string, cityName: string): string {
  return text.replace(/\{city\}/g, cityName);
}

const COLOR_MAP: Record<string, { bg: string; border: string; iconBg: string; heading: string }> = {
  blue: { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', iconBg: 'bg-blue-500', heading: 'text-blue-900' },
  amber: { bg: 'from-amber-50 to-amber-100', border: 'border-amber-200', iconBg: 'bg-amber-500', heading: 'text-amber-900' },
  green: { bg: 'from-green-50 to-green-100', border: 'border-green-200', iconBg: 'bg-green-500', heading: 'text-green-900' },
  purple: { bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', iconBg: 'bg-purple-500', heading: 'text-purple-900' },
  red: { bg: 'from-red-50 to-red-100', border: 'border-red-200', iconBg: 'bg-red-500', heading: 'text-red-900' },
};

export default function SEOContent({ seoContent, cityName }: SEOContentProps) {
  if (!seoContent || !seoContent.sections || seoContent.sections.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50 py-16 mt-12">
      <div className="w-full">
        <div className="bg-white shadow-lg p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            {seoContent.sections.map((section, idx) => {
              const title = replacePlaceholders(section.title, cityName);

              if (section.type === 'intro') {
                return (
                  <div key={idx} className="mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{title}</h2>
                    <div className="space-y-4 text-gray-700 text-base md:text-lg leading-relaxed">
                      {section.paragraphs?.map((p, i) => (
                        <p key={i}>{replacePlaceholders(p, cityName)}</p>
                      ))}
                    </div>
                    <div className="mt-8 text-center">
                      <ScrollToTopButton />
                    </div>
                  </div>
                );
              }

              if (section.type === 'grid' && section.cards) {
                return (
                  <div key={idx} className="mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">{title}</h2>
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      {section.cards.map((card, i) => {
                        const colors = COLOR_MAP[card.color] || COLOR_MAP.blue;
                        return (
                          <div key={i} className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-6 border ${colors.border} shadow-md hover:shadow-xl transition-shadow duration-300`}>
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-12 h-12 ${colors.iconBg} rounded-full flex items-center justify-center text-2xl`}>{card.icon}</div>
                              <h3 className={`text-xl md:text-2xl font-bold ${colors.heading}`}>{card.heading}</h3>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{replacePlaceholders(card.text, cityName)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              if (section.type === 'highlight') {
                return (
                  <div key={idx} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 md:p-10 mb-16 border border-purple-200 shadow-lg">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-3xl flex-shrink-0">{section.icon}</div>
                      <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-purple-900 mb-4">{title}</h2>
                        <div className="space-y-4 text-gray-700 text-base md:text-lg leading-relaxed">
                          {section.paragraphs?.map((p, i) => (
                            <p key={i}>{replacePlaceholders(p, cityName)}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              if (section.type === 'info') {
                return (
                  <div key={idx} className="bg-gradient-to-r from-gray-50 to-slate-100 rounded-2xl p-8 md:p-10 mb-12 border border-gray-200 shadow-lg">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center text-3xl flex-shrink-0">{section.icon}</div>
                      <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
                        <div className="space-y-4 text-gray-700 text-base md:text-lg leading-relaxed">
                          {section.paragraphs?.map((p, i) => (
                            <p key={i}>{replacePlaceholders(p, cityName)}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 text-center">
                      <ScrollToTopButton />
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScrollToTopButton() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <span>Voir les Pizzerias</span>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}
