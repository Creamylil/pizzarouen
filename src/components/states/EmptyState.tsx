import { Pizza } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 px-4">
      <Pizza className="h-16 w-16 text-gray-400" />
      <h2 className="text-xl font-bold text-gray-800">Aucune pizzeria trouvée</h2>
      <p className="text-gray-600 text-center max-w-md">
        Essayez de modifier vos filtres ou de changer de zone géographique.
      </p>
    </div>
  );
}
