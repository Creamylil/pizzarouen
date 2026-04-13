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
  changement_statut: 'Changement statut',
  note: 'Note',
  lien_paiement: 'Lien de paiement',
};

interface TimelineProps {
  events: Record<string, unknown>[];
}

export default function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-gray-400 text-sm py-4">Aucun événement enregistré.</p>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
      <div className="space-y-4">
        {events.map((event) => {
          const type = event.event_type as string;
          const Icon = ICON_MAP[type] ?? FileText;
          const date = new Date(event.created_at as string);

          return (
            <div key={event.id as string} className="relative flex gap-4 pl-10">
              <div className="absolute left-2 top-1 w-5 h-5 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
                <Icon className="h-3 w-3 text-gray-500" />
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-700">
                    {TYPE_LABELS[type] ?? type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {date.toLocaleDateString('fr-FR')} à {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{event.description as string}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
