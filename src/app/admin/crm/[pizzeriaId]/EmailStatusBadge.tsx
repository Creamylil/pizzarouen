'use client';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  sent: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label: 'Envoyé' },
  delivered: { color: 'text-green-700', bg: 'bg-green-50 border-green-200', label: 'Délivré' },
  opened: { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', label: 'Ouvert' },
  bounced: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'Bounced' },
};

const DOT_COLORS: Record<string, string> = {
  sent: 'bg-blue-500',
  delivered: 'bg-green-500',
  opened: 'bg-purple-500',
  bounced: 'bg-red-500',
};

interface EmailStatusBadgeProps {
  events: Record<string, unknown>[];
}

export default function EmailStatusBadge({ events }: EmailStatusBadgeProps) {
  // Trouver le dernier email event avec un statut
  const lastEmail = events.find((e) => {
    return e.event_type === 'email' && e.email_metadata != null;
  });

  if (!lastEmail) return null;

  const metadata = lastEmail.email_metadata as Record<string, unknown>;
  const status = metadata?.status as string;
  const config = STATUS_CONFIG[status];

  if (!config) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${config.bg} ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[status]}`} />
      {config.label}
    </span>
  );
}
