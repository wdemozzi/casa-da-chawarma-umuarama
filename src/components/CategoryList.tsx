import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, LayoutGrid } from 'lucide-react';
import { Category, Product } from '../types/menu';
import { ProductCard } from './ProductCard';

interface CategoryListProps {
  categories: Category[];
  products: Product[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onOpenProductDetails: (product: Product) => void;
  searchQuery: string;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  products,
  selectedCategoryId,
  onSelectCategory,
  onOpenProductDetails,
  searchQuery,
}) => {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position to show/hide arrows
  const checkScroll = () => {
    if (railRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = railRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  // Handle smooth slide
  const scrollRail = (direction: 'left' | 'right') => {
    if (railRef.current) {
      const offset = direction === 'left' ? -200 : 200;
      railRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  // Wheel listener to scroll horizontally with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (railRef.current && e.deltaY !== 0) {
      railRef.current.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  // Scroll active item into view
  const handleSelect = (id: string | null, e?: React.MouseEvent<HTMLButtonElement>) => {
    onSelectCategory(id);
    if (e?.currentTarget) {
      e.currentTarget.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
      setTimeout(checkScroll, 300);
    }
  };

  // Filter active categories
  const activeCategories = categories.filter((c) => c.is_active);

  // Filter products by active, category and search
  const filteredProducts = products.filter((p) => {
    if (!p.is_active) return false;
    if (selectedCategoryId && p.category_id !== selectedCategoryId) return false;
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      return matchName || matchDesc;
    }
    return true;
  });

  return (
    <div className="pb-24 max-w-md mx-auto px-4 space-y-4 pt-3">
      {/* 1. HORIZONTAL CATEGORY PILL TABS WITH INTERACTIVE CONTROLS */}
      <div className="sticky top-16 z-20 bg-[#0d0d11]/95 backdrop-blur-md border-b border-white/5 py-1 -mx-4 px-2">
        <div className="relative flex items-center">
          {/* Left Arrow Button (visible when scrolled right) */}
          {canScrollLeft && (
            <button
              onClick={() => scrollRail('left')}
              className="absolute left-0 z-30 w-7 h-7 rounded-full bg-black/90 border border-chawarma-gold/50 text-chawarma-gold flex items-center justify-center shadow-lg active:scale-95 transition"
              aria-label="Rolar para a esquerda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Scrollable Pills Rail */}
          <div
            ref={railRef}
            onScroll={checkScroll}
            onWheel={handleWheel}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-3 w-full scroll-smooth select-none cursor-grab active:cursor-grabbing"
          >
            <button
              onClick={(e) => handleSelect(null, e)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 flex-shrink-0 ${
                selectedCategoryId === null
                  ? 'bg-chawarma-gold text-black shadow-gold-sm ring-2 ring-chawarma-goldLight'
                  : 'bg-[#181820] text-gray-400 hover:text-white border border-chawarma-border'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Todos</span>
            </button>

            {activeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={(e) => handleSelect(cat.id, e)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex-shrink-0 ${
                  selectedCategoryId === cat.id
                    ? 'bg-chawarma-gold text-black shadow-gold-sm ring-2 ring-chawarma-goldLight'
                    : 'bg-[#181820] text-gray-400 hover:text-white border border-chawarma-border'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Right Arrow Button (visible when more items to the right) */}
          {canScrollRight && (
            <button
              onClick={() => scrollRail('right')}
              className="absolute right-0 z-30 w-7 h-7 rounded-full bg-black/90 border border-chawarma-gold/50 text-chawarma-gold flex items-center justify-center shadow-lg active:scale-95 transition"
              aria-label="Rolar para a direita"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Visual scroll helper note */}
        <div className="flex justify-between items-center text-[10px] text-gray-500 px-3 pt-1">
          <span>Deslize ou use as setas para ver todas as opções 👉</span>
          <span>{activeCategories.length} categorias</span>
        </div>
      </div>

      {/* 2. CATEGORY CARDS OVERVIEW (When "Todos" is selected and no search, shows Screen 2 cards) */}
      {selectedCategoryId === null && !searchQuery ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Explore as especialidades da casa:</span>
            <span>{activeCategories.length} categorias</span>
          </div>

          <div className="space-y-3">
            {activeCategories.map((cat) => {
              const catProducts = products.filter(
                (p) => p.category_id === cat.id && p.is_active
              );
              return (
                <div
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className="p-3 rounded-2xl bg-[#16161c] border border-chawarma-border hover:border-chawarma-gold/50 transition cursor-pointer flex items-center justify-between gap-3 group shadow-md"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/5 relative">
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-white group-hover:text-chawarma-goldLight transition truncate">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {catProducts.length} {catProducts.length === 1 ? 'opção' : 'opções'}
                    </p>
                    {cat.description && (
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-1">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-chawarma-gold group-hover:bg-chawarma-gold/10 transition flex-shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 3. PRODUCT LISTING (When category or search is active, directly matching Screen 3) */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
            <span>
              {searchQuery
                ? `Resultados para "${searchQuery}"`
                : activeCategories.find((c) => c.id === selectedCategoryId)?.name}
            </span>
            <span>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center bg-[#14141a] rounded-2xl border border-chawarma-border space-y-2">
              <Sparkles className="w-8 h-8 text-chawarma-gold mx-auto opacity-50" />
              <p className="text-sm font-bold text-white">Nenhum produto encontrado</p>
              <p className="text-xs text-gray-400">
                Tente buscar com outro termo ou selecionar outra categoria.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onOpenDetails={onOpenProductDetails}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
