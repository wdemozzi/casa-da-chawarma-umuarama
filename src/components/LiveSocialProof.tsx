import React, { useState, useEffect } from 'react';
import { Flame, X, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { Product } from '../types/menu';
import { sounds } from '../lib/soundEffects';

interface SocialProofItem {
  id: string;
  name: string;
  neighborhood: string;
  productName: string;
  timeAgo: string;
  matchedProductName: string;
  avatarText: string;
}

const NOTIFICATIONS: SocialProofItem[] = [
  {
    id: 'sp-1',
    name: 'Carlos M.',
    neighborhood: 'Campus 3',
    productName: '2x Chawarma Especial de Alcatra',
    timeAgo: 'há 3 minutos',
    matchedProductName: 'Chawarma de Alcatra',
    avatarText: 'CM',
  },
  {
    id: 'sp-2',
    name: 'Larissa R.',
    neighborhood: 'Jardim Panorama',
    productName: 'Batata c/ Queijo & Bacon',
    timeAgo: 'há 6 minutos',
    matchedProductName: 'Batata com queijo e bacon',
    avatarText: 'LR',
  },
  {
    id: 'sp-3',
    name: 'Marcos V.',
    neighborhood: 'Centro',
    productName: 'Chawarma Tradicional de Frango',
    timeAgo: 'há 9 minutos',
    matchedProductName: 'Chawarma de Frango',
    avatarText: 'MV',
  },
  {
    id: 'sp-4',
    name: 'Fernanda S.',
    neighborhood: 'Zona 2',
    productName: 'Chawarma Misto com Queijo Extra',
    timeAgo: 'há 12 minutos',
    matchedProductName: 'Chawarma Misto',
    avatarText: 'FS',
  },
  {
    id: 'sp-5',
    name: 'Lucas B.',
    neighborhood: 'Parque San Remo',
    productName: 'X-Bacon Egg Prensado + Refrigerante',
    timeAgo: 'há 15 minutos',
    matchedProductName: 'X-Bacon Egg',
    avatarText: 'LB',
  },
];

interface LiveSocialProofProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const LiveSocialProof: React.FC<LiveSocialProofProps> = ({
  products,
  onSelectProduct,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Initial appearance after 4 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    // Rotate every 15 seconds
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % NOTIFICATIONS.length);
        setIsVisible(true);
      }, 1000);
    }, 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isDismissed]);

  if (isDismissed || !isVisible) return null;

  const current = NOTIFICATIONS[currentIndex];
  const matchedProd = products.find(
    (p) =>
      p.name.toLowerCase().includes(current.matchedProductName.toLowerCase()) ||
      current.matchedProductName.toLowerCase().includes(p.name.toLowerCase())
  );

  const handleClickItem = () => {
    sounds.playCrispClick();
    if (matchedProd) {
      onSelectProduct(matchedProd);
    }
  };

  return (
    <div className="fixed bottom-22 sm:bottom-24 left-3 sm:left-6 z-50 max-w-[320px] animate-fadeIn select-none pointer-events-auto">
      <div className="relative p-3 rounded-2xl bg-[#14141e]/95 backdrop-blur-xl border border-chawarma-gold/30 shadow-2xl flex items-center gap-3">
        {/* Glow indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-chawarma-gold to-amber-500 p-[2px]">
            {matchedProd?.image_url ? (
              <img
                src={matchedProd.image_url}
                alt=""
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-xs font-bold text-chawarma-gold">
                {current.avatarText}
              </div>
            )}
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={handleClickItem}>
          <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
            <Flame className="w-3 h-3 text-chawarma-gold animate-pulse" />
            <span>Fornada Saindo • {current.timeAgo}</span>
          </div>

          <p className="text-xs font-bold text-white truncate">
            {current.productName}
          </p>

          <p className="text-[10px] text-gray-400 truncate">
            {current.name} • {current.neighborhood}
          </p>
        </div>

        {/* Action Button & Dismiss */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-gray-500 hover:text-white p-0.5 rounded transition"
            aria-label="Fechar notificação"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {matchedProd && (
            <button
              type="button"
              onClick={handleClickItem}
              className="text-[10px] bg-chawarma-gold/20 hover:bg-chawarma-gold/30 text-chawarma-gold border border-chawarma-gold/40 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition active:scale-95"
            >
              <ShoppingBag className="w-2.5 h-2.5" />
              <span>Ver</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
