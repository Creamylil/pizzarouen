import { AlertCircle } from 'lucide-react';

export default function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 px-4">
      <AlertCircle className="h-16 w-16 text-red-500" />
      <h2 className="text-xl font-bold text-gray-800">Erreur de chargement</h2>
      <p className="text-gray-600 text-center max-w-md">
        Impossible de charger les pizzerias. Veuillez réessayer plus tard.
      </p>
    </div>
  );
}
