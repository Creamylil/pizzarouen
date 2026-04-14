import React from 'react';
import { Phone, Mail, MapPin, Bell, CreditCard, RefreshCw, FileText, Link2 } from 'lucide-react';

const ICON_MAP: Record<string, typeof Phone> = {
  appel: Phone,
  email: Mail,
  visite: MapPin,
  relance: Bell,
  paiement: CreditCard,
  changement_statut: RefreshCw,
  note: FileText,
  lien_paiement: Link2,
};

const TYPE_LABELS: Record<string, string> = {
  appel: 'Appel',
  email: 'Email',
  visite: 'Visite',
  relance: 'Relance',
  paiement: 'Paiement',
  changement_statut: 'Statut',
  note: 'Note',
  lien_paiement: 'Lien paiement',
};

const EMAIL_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  sent: { color: 'text-blue-600', label: 'Envoyé' },
  delivered: { color: 'text-green-600', label: 'Délivré' },
  opened: { color: 'text-purple-600', label: 'Ouvert' },
  bounced: { color: 'text-red-600', label: 'Bounced' },
};

function EmailStatusInline({ event }: { event: Record<string, unknown> }) {
  if (event.event_type !== 'email' || !event.email_metadata) return null;
  const meta = event.email_metadata as Record<string, unknown>;
  const status = meta?.status as string;
  const cfg = EMAIL_STATUS_CONFIG[status];
  if (!cfg) return null;
  return (
    <span className={`ml-1.5 text-[11px] font-medium ${cfg.color}`}>
      • {cfg.label}
    </span>
  );
}

interface TimelineProps {
  events: Record<string, unknown>[];
}

export default function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-gray-400 text-xs py-2">Aucun événement.</p>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[9px] top-0 bottom-0 w-px bg-gray-200" />
      <div className="space-y-1.5">
        {events.map((event) => {
          const type = event.event_type as string;
          const Icon = ICON_MAP[type] ?? FileText;
          const date = new Date(event.created_at as string);

          return (
            <div key={event.id as string} className="relative flex gap-2.5 pl-6">
              <div className="absolute left-0 top-0.5 w-[18px] h-[18px] rounded-full bg-white border border-gray-300 flex items-center justify-center">
                <Icon className="h-2.5 w-2.5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0 py-0.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[11px] font-medium text-gray-600">
                    {TYPE_LABELS[type] ?? type}
                  </span>
                  <span className="text-[10px] text-gray-400 tabular-nums">
                    {date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <EmailStatusInline event={event} />
                </div>
                {(event.description as string) && (
                  <p className="text-xs text-gray-500 truncate">
                    {event.description as string}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
