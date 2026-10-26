import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../types/menu';
import { formatBRL } from '../lib/currency';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="p-3 sm:p-3.5 rounded-2xl bg-[#16161c] border border-chawarma-border hover:border-chawarma-gold/50 transition cursor-pointer flex items-center justify-between gap-3 shadow-md group relative overflow-hidden"
    >
      {/* Product Image */}
      <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/5 relative">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {product.needs_real_photo && (
          <span className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-sm text-[9px] text-amber-300 px-1 rounded font-medium border border-amber-500/20">
            Foto ref.
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-chawarma-goldLight transition truncate">
          {product.name}
        </h4>

        <p className="text-[11px] sm:text-xs text-gray-400 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center gap-2 pt-0.5">
          <span className="font-mono text-sm sm:text-base font-extrabold text-chawarma-gold">
            {product.has_variations ? `A partir de ${formatBRL(product.price_cents)}` : formatBRL(product.price_cents)}
          </span>
        </div>
      </div>

      {/* Circular Gold Add Button (+) directly matching Reference Screen 3 */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetails(product);
        }}
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-chawarma-gold text-black flex items-center justify-center flex-shrink-0 shadow-gold-sm hover:scale-110 active:scale-95 transition-transform"
        aria-label={`Ver detalhes de ${product.name}`}
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  );
};
