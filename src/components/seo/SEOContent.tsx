'use client';

export default function SEOContent() {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50 py-16 mt-12">
      <div className="w-full">
        <div className="bg-white shadow-lg p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Pizzerias à Rouen : trouvez votre pizza maintenant
              </h2>
              <div className="space-y-4 text-gray-700 text-base md:text-lg leading-relaxed">
                <p>
                  Envie d&apos;une pizza à Rouen ? Vous êtes au bon endroit. Que vous cherchiez une adresse ouverte maintenant,
                  une pizzeria halal, ou simplement la meilleure pizza du coin, on vous aide à trouver ce qu&apos;il vous faut
                  sans perdre de temps.
                </p>
                <p>
                  Parce qu&apos;une envie de pizza, ça n&apos;attend pas. Voici <strong>les pizzerias ouvertes en ce moment à Rouen</strong> rive
                  droite, rive gauche, centre-ville.
                </p>
                <p>
                  Certaines adresses assurent même <strong>24h/24 à emporter</strong> pour les couche-tard.
                </p>
              </div>
              <div className="mt-8 text-center">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span>Voir les Pizzerias</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Pizza à Rouen : rive droite, rive gauche, centre-ville
              </h2>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl">🏘️</div>
                    <h3 className="text-xl md:text-2xl font-bold text-blue-900">Rive droite</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Du côté de la <strong>rive droite</strong>, vous avez plusieurs adresses qui font le job. Entre les
                    classiques napolitaines et les pizzas plus généreuses, le choix ne manque pas. Certaines proposent
                    la <strong>livraison jusqu&apos;à tard le soir</strong>.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-2xl">🏛️</div>
                    <h3 className="text-xl md:text-2xl font-bold text-amber-900">Centre-ville</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    En plein <strong>centre-ville de Rouen</strong>, entre deux pavés et une balade au bord de la Seine,
                    les pizzerias jouent la carte de la rapidité sans compromis sur la qualité. Pâte croustillante,
                    garnitures généreuses, cuisson au feu de bois pour certaines.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-2xl">🌳</div>
                    <h3 className="text-xl md:text-2xl font-bold text-green-900">Rive gauche</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Côté <strong>rive gauche</strong>, l&apos;offre est tout aussi riche. Vous avez les adresses familiales
                    où le patron vous reconnaît à la troisième commande, et les spots plus modernes avec leurs apps de
                    livraison ultra-rapides.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 md:p-10 mb-16 border border-purple-200 shadow-lg">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-3xl flex-shrink-0">🕌</div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-purple-900 mb-4">
                    Pizza halal à Rouen : les adresses à connaître
                  </h2>
                  <div className="space-y-4 text-gray-700 text-base md:text-lg leading-relaxed">
                    <p>
                      <strong>Oui, il existe plusieurs pizzerias halal à Rouen</strong>. Et non, vous n&apos;aurez pas à sacrifier le goût ou le choix.
                    </p>
                    <p>
                      De la rive droite à la rive gauche, plusieurs établissements proposent des cartes entièrement halal
                      avec une vraie diversité : classiques margherita et regina, pizzas viande et merguez, options
                      végétariennes... La pizza halal à Rouen, c&apos;est devenu une vraie offre structurée.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-slate-100 rounded-2xl p-8 md:p-10 mb-12 border border-gray-200 shadow-lg">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center text-3xl flex-shrink-0">ℹ️</div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Comment utiliser ce site ?</h2>
                  <div className="space-y-4 text-gray-700 text-base md:text-lg leading-relaxed">
                    <p>
                      Pas de chichi : on référence les pizzerias de Rouen en vérifiant leurs horaires, leurs options
                      (halal, livraison, à emporter), et leur localisation précise.
                    </p>
                    <p>
                      Utilisez les filtres en haut de page pour trouver exactement ce que vous cherchez : pizzeria ouverte
                      à proximité, livraison disponible, options halal…
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-center">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span>Voir les Pizzerias</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
