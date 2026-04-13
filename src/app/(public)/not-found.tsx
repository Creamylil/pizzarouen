import Link from 'next/link';
import { Pizza } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100 px-4">
      <Pizza className="h-24 w-24 text-red-500 mb-6" />
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page non trouvée</h2>
      <p className="text-gray-600 text-center max-w-md mb-8">
        Oups ! Cette page n&apos;existe pas. Retournez à l&apos;accueil pour trouver votre pizza.
      </p>
      <Link
        href="/"
        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
