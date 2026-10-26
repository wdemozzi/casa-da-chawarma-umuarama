import React, { useState } from 'react';
import { Flame, ArrowLeft, Search, X, Volume2, VolumeX, Gift } from 'lucide-react';
import { sounds } from '../lib/soundEffects';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onOpenAdmin?: () => void;
  onOpenRewardWheel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack,
  onBack,
  showSearch,
  searchQuery,
  onSearchChange,
  onOpenAdmin,
  onOpenRewardWheel,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [soundActive, setSoundActive] = useState<boolean>(() => sounds.isEnabled());

  const handleToggleSound = () => {
    const next = sounds.toggleSound();
    setSoundActive(next);
  };

  const handleLogoTap = () => {
    setTapCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        if (onOpenAdmin) onOpenAdmin();
        return 0;
      }
      return next;
    });
    setTimeout(() => setTapCount(0), 3000);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0d0d11]/90 backdrop-blur-md border-b border-chawarma-border/30">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {showBack ? (
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full text-gray-300 hover:text-white hover:bg-white/5 active:scale-95 transition"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5 text-gray-200" />
            </button>
            <h1 className="text-lg font-bold text-white tracking-wide truncate">
              {title || 'Cardápio'}
            </h1>
          </div>
        ) : (
          /* Brand Logo & Tagline with 5-tap secret admin trigger */
          <div
            onClick={handleLogoTap}
            className="flex items-center gap-2.5 cursor-pointer select-none"
            title="Casa da Chawarma Umuarama"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-chawarma-gold to-chawarma-goldDark p-0.5 shadow-gold-sm flex items-center justify-center">
              <div className="w-full h-full bg-[#121217] rounded-[10px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-chawarma-gold animate-pulse" />
              </div>
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-sm sm:text-base text-white block uppercase leading-none font-display">
                Casa da Chawarma
              </span>
              <span className="text-[10px] text-chawarma-goldLight tracking-widest uppercase font-medium">
                Sabor que vem do Oriente
              </span>
            </div>
          </div>
        )}

        {/* Right Action Icons: Search, Reward Wheel & ASMR Audio */}
        <div className="flex items-center gap-1">
          {onOpenRewardWheel && (
            <button
              onClick={onOpenRewardWheel}
              className="p-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition active:scale-90"
              title="Roleta de Brindes"
              aria-label="Roleta de Brindes"
            >
              <Gift className="w-4 h-4 text-amber-300 animate-bounce" />
            </button>
          )}

          <button
            onClick={handleToggleSound}
            className="p-1.5 rounded-full text-gray-400 hover:text-chawarma-gold transition"
            title={soundActive ? 'Efeitos sonoros ativados (clique para silenciar)' : 'Efeitos sonoros desativados'}
            aria-label="Som"
          >
            {soundActive ? (
              <Volume2 className="w-4 h-4 text-chawarma-gold" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {showSearch && onSearchChange && (
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 rounded-full transition ${
                isSearchOpen ? 'text-chawarma-gold bg-chawarma-gold/10' : 'text-gray-400 hover:text-white'
              }`}
              aria-label="Pesquisar"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Search Bar */}
      {isSearchOpen && onSearchChange && (
        <div className="px-4 pb-3 max-w-md mx-auto animate-fadeIn">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar chawarmas, lanches, porções..."
              className="w-full bg-[#181822] text-sm text-white placeholder-gray-500 rounded-xl pl-9 pr-9 py-2.5 border border-chawarma-border focus:outline-none focus:border-chawarma-gold transition"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
