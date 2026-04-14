'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import PizzeriaCard from '@/components/pizzeria/PizzeriaCard';
import PriorityBadge from '@/components/pizzeria/PriorityBadge';
import { parseOpeningHours, isOpen, getTodayHours } from '@/utils/openingHours';
import { getPizzeriaFicheUrl } from '@/utils/pizzeriaUrl';
import type { Pizzeria, GeographicSector } from '@/types/pizzeria';
import {
  Star,
  Phone,
  MapPin,
  Navigation,
  ChevronRight,
  Clock,
  UtensilsCrossed,
  Truck,
  ShoppingBag,
  Store,
  Globe,
} from 'lucide-react';

const PizzeriaMap = dynamic(() => import('@/components/map/PizzeriaMap'), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-muted rounded-xl animate-pulse" />,
});

interface PizzeriaDetailClientProps {
  pizzeria: Pizzeria;
  sector: GeographicSector;
  sectors: GeographicSector[];
  cityName: string;
  siteUrl: string;
  mainPostalCodes: string[];
  top10Pizzerias: Pizzeria[];
  centerCoords: [number, number];
}

const DAYS_ORDER = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

function getCurrentDayFr(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    weekday: 'long',
  }).formatToParts(now);
  return parts.find(p => p.type === 'weekday')?.value.toLowerCase() || '';
}

export default function PizzeriaDetailClient({
  pizzeria,
  sector,
  sectors,
  cityName,
  siteUrl,
  mainPostalCodes,
  top10Pizzerias,
  centerCoords,
}: PizzeriaDetailClientProps) {
  const sectorName = sector.display_name || sector.name;
  const isCenterSector = mainPostalCodes.includes(sector.postal_code || '');
  const [isCurrentlyOpen, setIsCurrentlyOpen] = useState(false);
  const [todayHours, setTodayHours] = useState('');
  const [hasOpeningHours, setHasOpeningHours] = useState(false);
  const [currentDay, setCurrentDay] = useState('');

  useEffect(() => {
    setCurrentDay(getCurrentDayFr());
    if (pizzeria.openingHours) {
      const hours = parseOpeningHours(pizzeria.openingHours);
      setIsCurrentlyOpen(isOpen(hours));
      setTodayHours(getTodayHours(hours));
      setHasOpeningHours(true);
    }
  }, [pizzeria.openingHours]);

  // Parse opening hours pour le tableau
  const parsedHours = useMemo(() => {
    if (!pizzeria.openingHours) return null;
    try {
      return JSON.parse(pizzeria.openingHours) as Record<string, string>;
    } catch {
      return null;
    }
  }, [pizzeria.openingHours]);

  const isPremium = pizzeria.priorityLevel === 'niveau_2';
  const isFeatured = pizzeria.priorityLevel === 'niveau_1';

  // Service type icons
  const serviceIcons: Record<string, { icon: React.ReactNode; label: string }> = {
    'sur-place': { icon: <Store className="h-3.5 w-3.5" />, label: 'Sur place' },
    'emporter': { icon: <ShoppingBag className="h-3.5 w-3.5" />, label: 'À emporter' },
    'livraison': { icon: <Truck className="h-3.5 w-3.5" />, label: 'Livraison' },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <nav className="mb-5" aria-label="Fil d'Ariane">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Accueil
            </Link>
          </li>
          <li><ChevronRight className="h-3.5 w-3.5" /></li>
          <li>
            <Link href={isCenterSector ? '/' : `/${sector.slug}`} className="hover:text-gray-900 transition-colors">
              {isCenterSector ? `Pizzerias à ${cityName}` : sectorName}
            </Link>
          </li>
          <li><ChevronRight className="h-3.5 w-3.5" /></li>
          <li className="text-gray-900 font-medium truncate max-w-[200px]">
            {pizzeria.name}
          </li>
        </ol>
      </nav>

      {/* Hero image */}
      <div className="relative h-56 sm:h-72 md:h-80 rounded-xl overflow-hidden mb-6 bg-muted">
        {pizzeria.image ? (
          <Image
            src={pizzeria.image}
            alt={pizzeria.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 896px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50">
            <UtensilsCrossed className="h-16 w-16 text-orange-300" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Price badge — top right */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-md px-2.5 py-1 shadow-sm">
          <span className="font-bold text-sm text-foreground">{pizzeria.priceRange}</span>
        </div>

        {/* Halal badge */}
        {pizzeria.halal && (
          <div className="absolute top-3 right-16 bg-emerald-700 text-white rounded-md px-2.5 py-1 shadow-sm">
            <span className="font-bold text-xs tracking-wide uppercase">Halal</span>
          </div>
        )}

        {/* Priority badge — top left */}
        <PriorityBadge priorityLevel={pizzeria.priorityLevel} pizzeriaName={pizzeria.name} />

        {/* Rating — bottom left */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5">
            <Star className="h-4 w-4 text-amber-400 fill-current" />
            <span className="text-white text-sm font-semibold">{pizzeria.rating}</span>
            <span className="text-white/60 text-sm">({pizzeria.reviews} avis)</span>
          </div>
          {pizzeria.reviewsLink && (
            <a
              href={pizzeria.reviewsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black/70 backdrop-blur-sm hover:bg-black/80 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            >
              Voir les avis
            </a>
          )}
        </div>
      </div>

      {/* Main info card */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-5 sm:p-6 mb-6">
        {/* Name */}
        <h1
          className="text-2xl sm:text-3xl font-bold text-foreground mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {pizzeria.name}
        </h1>

        {/* Open/Close status + Today hours */}
        {hasOpeningHours && (
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isCurrentlyOpen
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isCurrentlyOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {isCurrentlyOpen ? 'Ouvert' : 'Fermé'}
            </span>
            <span className="text-sm text-muted-foreground">{todayHours}</span>
          </div>
        )}

        {/* Address */}
        {pizzeria.address && (
          <div className="flex items-start gap-2 mb-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
            <span>{pizzeria.address}</span>
          </div>
        )}

        {/* Phone */}
        {pizzeria.phone && (
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0 text-gray-400" />
            <a href={`tel:${pizzeria.phone}`} className="hover:text-foreground transition-colors">
              {pizzeria.phone}
            </a>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-0">
          {pizzeria.phone && (
            <a
              href={`tel:${pizzeria.phone}`}
              className={`inline-flex items-center gap-2 px-5 h-12 rounded-lg font-semibold text-sm transition-all ${
                isPremium
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200'
                  : isFeatured
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200'
              }`}
            >
              <Phone className="h-4 w-4" />
              Appeler
            </a>
          )}
          {pizzeria.googleMapsLink && (
            <a
              href={pizzeria.googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 h-12 rounded-lg font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition-all"
            >
              <Navigation className="h-4 w-4" />
              Y aller
            </a>
          )}
          {pizzeria.websiteUrl && (
            <a
              href={pizzeria.websiteUrl}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 h-12 rounded-lg font-semibold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-all"
            >
              <Globe className="h-4 w-4" />
              Site web
            </a>
          )}
        </div>
      </div>

      {/* Description */}
      {pizzeria.description && (
        <div className="bg-card rounded-xl shadow-sm border border-border p-5 sm:p-6 mb-6">
          <h2
            className="text-lg font-bold text-foreground mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            À propos
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {pizzeria.description}
          </p>
        </div>
      )}

      {/* Specialties & Services */}
      {(pizzeria.specialties.length > 0 || pizzeria.types.length > 0 || pizzeria.services.length > 0) && (
        <div className="bg-card rounded-xl shadow-sm border border-border p-5 sm:p-6 mb-6">
          {/* Types de service */}
          {pizzeria.types.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Services</h3>
              <div className="flex flex-wrap gap-2">
                {pizzeria.types.map(type => {
                  const service = serviceIcons[type];
                  if (!service) return null;
                  return (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                    >
                      {service.icon}
                      {service.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Spécialités */}
          {pizzeria.specialties.length > 0 && (
            <div className="mb-4 last:mb-0">
              <h3 className="text-sm font-semibold text-foreground mb-2">Spécialités</h3>
              <div className="flex flex-wrap gap-2">
                {pizzeria.specialties.map(specialty => (
                  <span
                    key={specialty}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Services additionnels */}
          {pizzeria.services.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Équipements</h3>
              <div className="flex flex-wrap gap-2">
                {pizzeria.services.map(service => (
                  <span
                    key={service}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Opening hours table */}
      {parsedHours && (
        <div className="bg-card rounded-xl shadow-sm border border-border p-5 sm:p-6 mb-6">
          <h2
            className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <Clock className="h-5 w-5 text-gray-400" />
            Horaires d&apos;ouverture
          </h2>
          <div className="divide-y divide-border">
            {DAYS_ORDER.map(day => {
              const schedule = parsedHours[day];
              const isToday = day === currentDay;
              const isClosed = !schedule || schedule.toLowerCase() === 'fermé';

              return (
                <div
                  key={day}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-md ${
                    isToday ? 'bg-amber-50/70 font-semibold' : ''
                  }`}
                >
                  <span className={`text-sm capitalize ${isToday ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {day}
                    {isToday && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-amber-600 font-bold">
                        Aujourd&apos;hui
                      </span>
                    )}
                  </span>
                  <span className={`text-sm ${isClosed ? 'text-red-500' : isToday ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {isClosed ? 'Fermé' : schedule.replace(',', ' / ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Map */}
      {pizzeria.latitude && pizzeria.longitude && (
        <div className="mb-6">
          <PizzeriaMap
            pizzerias={[pizzeria]}
            center={[pizzeria.latitude, pizzeria.longitude]}
            zoom={16}
            showAll
          />
        </div>
      )}

      {/* Top 10 section */}
      {top10Pizzerias.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-amber-500 text-white">
              {top10Pizzerias.length}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              Meilleures Pizzerias à proximité de {pizzeria.name}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {top10Pizzerias.map(p => (
              <PizzeriaCard
                key={p.id}
                pizzeria={p}
                ficheUrl={getPizzeriaFicheUrl(p, sectors, mainPostalCodes)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
