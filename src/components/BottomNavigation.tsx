import React from 'react';
import { Home, Utensils, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface BottomNavProps {
  currentTab: 'home' | 'menu' | 'cart' | 'bio';
  onSelectTab: (tab: 'home' | 'menu' | 'cart' | 'bio') => void;
}

export const BottomNavigation: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { totalCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0e0e13]/95 backdrop-blur-lg border-t border-chawarma-border/30 safe-area-bottom pb-1 sm:pb-2">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {/* Início */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
            currentTab === 'home'
              ? 'text-chawarma-gold scale-105'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] font-medium mt-1">Início</span>
        </button>

        {/* Cardápio */}
        <button
          onClick={() => onSelectTab('menu')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
            currentTab === 'menu'
              ? 'text-chawarma-gold scale-105'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Utensils className={`w-5 h-5 ${currentTab === 'menu' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] font-medium mt-1">Cardápio</span>
        </button>

        {/* Pedidos / Carrinho */}
        <button
          onClick={() => onSelectTab('cart')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
            currentTab === 'cart'
              ? 'text-chawarma-gold scale-105'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 ${currentTab === 'cart' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-chawarma-gold text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-gold-sm">
                {totalCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium mt-1">Pedidos</span>
        </button>

        {/* Bio Linktree */}
        <button
          onClick={() => onSelectTab('bio')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
            currentTab === 'bio'
              ? 'text-chawarma-gold scale-105'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${currentTab === 'bio' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] font-medium mt-1">Bio Link</span>
        </button>
      </div>
    </nav>
  );
};
