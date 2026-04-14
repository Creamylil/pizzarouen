export const PERMISSION_KEYS = [
  'cities',
  'pizzerias',
  'sectors',
  'redirects',
  'pricing',
  'fiches',
  'pipeline',
  'team',
  'simulateur',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];
export type Permissions = Record<PermissionKey, boolean>;

export const DEFAULT_PERMISSIONS: Permissions = {
  cities: false,
  pizzerias: false,
  sectors: false,
  redirects: false,
  pricing: false,
  fiches: true,
  pipeline: true,
  team: false,
  simulateur: true,
};

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  cities: 'Villes',
  pizzerias: 'Pizzerias',
  sectors: 'Secteurs',
  redirects: 'Redirections',
  pricing: 'Formules',
  fiches: 'Fiches commerciales',
  pipeline: 'Pipeline CRM',
  team: 'Équipe',
  simulateur: 'Simulateur',
};

export const PERMISSION_GROUPS = [
  { label: 'Données', keys: ['cities', 'pizzerias', 'sectors', 'redirects', 'pricing'] as PermissionKey[] },
  { label: 'Commercial', keys: ['fiches', 'pipeline', 'team', 'simulateur'] as PermissionKey[] },
];

export function parsePermissions(raw: unknown): Permissions {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PERMISSIONS };
  const obj = raw as Record<string, unknown>;
  const result = { ...DEFAULT_PERMISSIONS };
  for (const key of PERMISSION_KEYS) {
    if (typeof obj[key] === 'boolean') {
      result[key] = obj[key] as boolean;
    }
  }
  return result;
}

export function hasPermission(
  role: 'admin' | 'commercial',
  permissions: Permissions | null,
  key: PermissionKey
): boolean {
  if (role === 'admin') return true;
  if (!permissions) return false;
  return permissions[key] === true;
}
