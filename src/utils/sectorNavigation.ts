// Mapping des secteurs vers leurs pages dédiées (uniquement par slug)
export const SECTOR_PAGE_MAPPING: Record<string, string> = {
  'bihorel': '/bihorel',
  'le-petit-quevilly': '/le-petit-quevilly',
  'le-grand-quevilly': '/le-grand-quevilly', 
  'sotteville-les-rouen': '/sotteville-les-rouen',
  'deville-les-rouen': '/deville-les-rouen',
};

// Mapping slug vers code postal pour les filtres URL
export const SECTOR_TO_POSTAL_CODE: Record<string, string> = {
  'bihorel': '76420',
  'le-petit-quevilly': '76140',
  'le-grand-quevilly': '76120',
  'sotteville-les-rouen': '76300',
  'deville-les-rouen': '76250',
  '76000': '76000',
  '76100': '76100',
};

export function getSectorPageUrl(sectorSlug: string | null): string | null {
  if (!sectorSlug) return '/';
  return SECTOR_PAGE_MAPPING[sectorSlug] || null;
}

export function hasDedicatedPage(sectorId: string): boolean {
  return sectorId in SECTOR_PAGE_MAPPING;
}

export function getDedicatedPageUrl(sectorId: string): string | null {
  return SECTOR_PAGE_MAPPING[sectorId] || null;
}
