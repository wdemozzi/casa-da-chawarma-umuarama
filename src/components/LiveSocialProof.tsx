import React, { useState, useEffect } from 'react';
import { Flame, X, ShoppingBag } from 'lucide-react';
import { Product } from '../types/menu';
import { sounds } from '../lib/soundEffects';

interface RealOrderItem {
  id: string;
  name: string;
  neighborhood: string;
  productName: string;
  timestamp: number;
  image_url?: string;
}

interface LiveSocialProofProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const LiveSocialProof: React.FC<LiveSocialProofProps> = ({
  products,
  onSelectProduct,
}) => {
  const [realOrder, setRealOrder] = useState<RealOrderItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('chawarma_real_orders');
      if (!stored) return;

      const orders: RealOrderItem[] = JSON.parse(stored);
      if (!Array.isArray(orders) || orders.length === 0) return;

      // Only consider real orders placed within the last 4 hours
      const now = Date.now();
      const recent = orders.find((o) => now - o.timestamp < 4 * 60 * 60 * 1000);

      if (recent) {
        setRealOrder(recent);
        // Show after 6 seconds
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 6000);

        // Auto-hide after 8 seconds (no infinite repetition)
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
        }, 14000);

        return () => {
          clearTimeout(timer);
          clearTimeout(hideTimer);
        };
      }
    } catch {
      setRealOrder(null);
    }
  }, []);

  if (isDismissed || !isVisible || !realOrder) return null;

  // Format relative time for the real order
  const minutesAgo = Math.max(1, Math.floor((Date.now() - realOrder.timestamp) / 60000));
  const timeText = minutesAgo <= 1 ? 'há poucos instantes' : `há ${minutesAgo} min`;

  const matchedProd = products.find((p) =>
    realOrder.productName.toLowerCase().includes(p.name.toLowerCase())
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
        {/* Real Product Image or Badge */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-chawarma-gold to-amber-500 p-[2px]">
            {realOrder.image_url || matchedProd?.image_url ? (
              <img
                src={realOrder.image_url || matchedProd?.image_url}
                alt=""
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-xs font-bold text-chawarma-gold">
                {realOrder.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={handleClickItem}>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            <Flame className="w-3 h-3 text-chawarma-gold" />
            <span>Pedido Real Confirmado • {timeText}</span>
          </div>

          <p className="text-xs font-bold text-white truncate">
            {realOrder.productName}
          </p>

          <p className="text-[10px] text-gray-400 truncate">
            {realOrder.name} • {realOrder.neighborhood}
          </p>
        </div>

        {/* Close button */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-gray-500 hover:text-white p-0.5 rounded transition"
            aria-label="Fechar aviso"
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
