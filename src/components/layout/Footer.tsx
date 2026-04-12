import Link from "next/link";
import { Pizza, Mail, MessageCircle } from "lucide-react";
import type { GeographicSector } from "@/types/pizzeria";

interface FooterProps {
  cityDisplayName: string;
  contactEmail: string;
  contactWhatsapp: string | null;
  sectors: GeographicSector[];
}

export default function Footer({ cityDisplayName, contactEmail, contactWhatsapp, sectors }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Pizza className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold">{cityDisplayName}</span>
            </Link>
            <p className="text-gray-300 text-sm">
              L&apos;annuaire des meilleures pizzerias. Trouvez et
              commandez vos pizzas préférées en quelques clics.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/conditions-generales"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/partenaire"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Devenir partenaire
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span>{contactEmail}</span>
              </div>
              {contactWhatsapp && (
                <div className="flex items-center gap-2 text-gray-300">
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp : {contactWhatsapp}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-700" />

        <div className="text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} {cityDisplayName}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
