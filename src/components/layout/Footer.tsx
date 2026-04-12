import Link from "next/link";
import { Pizza, Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Pizza className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold">Pizza Rouen</span>
            </Link>
            <p className="text-gray-300 text-sm">
              L&apos;annuaire des meilleures pizzerias de Rouen. Trouvez et
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
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Pizza par secteur</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/bihorel"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Pizza Bihorel
                </Link>
              </li>
              <li>
                <Link
                  href="/le-petit-quevilly"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Pizza Le Petit-Quevilly
                </Link>
              </li>
              <li>
                <Link
                  href="/le-grand-quevilly"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Pizza Le Grand-Quevilly
                </Link>
              </li>
              <li>
                <Link
                  href="/sotteville-les-rouen"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Pizza Sotteville-lès-Rouen
                </Link>
              </li>
              <li>
                <Link
                  href="/deville-les-rouen"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Pizza Déville-lès-Rouen
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span>contact@pizzarouen.fr</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp : +33 7 67 02 81 61</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-700" />

        <div className="text-center text-sm text-gray-400">
          <p>&copy; 2024 Pizza Rouen. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
