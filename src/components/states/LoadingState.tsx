export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="text-6xl animate-bounce">🍕</div>
      <p className="text-gray-600 text-lg font-medium">Chargement des pizzerias...</p>
    </div>
  );
}
