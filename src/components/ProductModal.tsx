import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus, Check, Heart, Sparkles } from 'lucide-react';
import { Product, ProductVariation, ProductAddon } from '../types/menu';
import { formatBRL } from '../lib/currency';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedVariation?: ProductVariation,
    selectedAddons?: ProductAddon[],
    notes?: string
  ) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(() => {
    if (product.variations && product.variations.length > 0) {
      return product.variations.find((v) => v.is_default) || product.variations[0];
    }
    return undefined;
  });
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);
  const [notes, setNotes] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);

  const toggleAddon = (addon: ProductAddon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const basePrice = selectedVariation ? selectedVariation.price_cents : product.price_cents;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price_cents, 0);
  const totalItemCents = (basePrice + addonsTotal) * quantity;

  const handleConfirm = () => {
    onAddToCart(product, quantity, selectedVariation, selectedAddons, notes);
    onClose();
  };

  const [showVideo, setShowVideo] = useState(Boolean(product.video_url));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#121217] border border-chawarma-border/50 rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header Bar with Back and Favorite */}
        <div className="relative h-64 w-full overflow-hidden flex-shrink-0 bg-black">
          {showVideo && product.video_url ? (
            <video
              src={product.video_url}
              poster={product.image_url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-black/20 to-black/60 pointer-events-none" />

          {/* Top Actions */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 active:scale-95 transition"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              {product.video_url && (
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-chawarma-goldLight text-xs font-bold border border-chawarma-gold/40 flex items-center gap-1.5 transition active:scale-95"
                >
                  <span>{showVideo ? '📸 Ver Foto' : '🎥 Ver Vídeo'}</span>
                </button>
              )}

              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 active:scale-95 transition"
                aria-label="Favoritar"
              >
                <Heart
                  className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-white'}`}
                />
              </button>
            </div>
          </div>

          {product.needs_real_photo && (
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md text-amber-300 text-[10px] px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Imagem ilustrativa • Aguardando foto real</span>
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Title and Price */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              {product.name}
            </h2>
            <div className="text-lg font-mono font-extrabold text-chawarma-gold">
              {formatBRL(basePrice)}
            </div>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pt-1">
              {product.description}
            </p>
          </div>

          {/* Variations Selector (e.g., Inteira / Meia or Natural / Ao Leite) */}
          {product.has_variations && product.variations && product.variations.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-chawarma-border/30">
              <label className="text-xs font-bold text-chawarma-goldLight uppercase tracking-wider block">
                Escolha o tamanho / opção:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.variations.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariation(v)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                      selectedVariation?.id === v.id
                        ? 'border-chawarma-gold bg-chawarma-gold/15 text-white ring-1 ring-chawarma-gold'
                        : 'border-chawarma-border bg-[#181820] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs text-white">{v.name}</p>
                      <p className="text-[11px] text-chawarma-gold font-mono">{formatBRL(v.price_cents)}</p>
                    </div>
                    {selectedVariation?.id === v.id && (
                      <Check className="w-4 h-4 text-chawarma-gold flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Adicionais (previstos e confirmados no cardápio original) */}
          {product.addons && product.addons.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-chawarma-border/30">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-chawarma-goldLight uppercase tracking-wider block">
                  Adicionais:
                </label>
                <span className="text-[10px] text-gray-400">Opcional</span>
              </div>

              <div className="space-y-2">
                {product.addons.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isChecked
                          ? 'border-chawarma-gold/70 bg-chawarma-gold/10 text-white'
                          : 'border-chawarma-border bg-[#181820] text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                            isChecked
                              ? 'bg-chawarma-gold border-chawarma-gold text-black'
                              : 'border-gray-500 bg-transparent'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs sm:text-sm font-medium">{addon.name}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-chawarma-gold">
                        +{formatBRL(addon.price_cents)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Observations */}
          <div className="space-y-2 pt-2 border-t border-chawarma-border/30">
            <label className="text-xs font-bold text-gray-300 block">
              Observações do item:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: sem cebola, creme de alho à parte, etc."
              className="w-full bg-[#181822] text-xs text-white placeholder-gray-500 rounded-xl px-3.5 py-2.5 border border-chawarma-border focus:outline-none focus:border-chawarma-gold transition"
              maxLength={120}
            />
          </div>
        </div>

        {/* Modal Bottom Bar: Stepper and Add To Cart CTA */}
        <div className="p-4 bg-[#0e0e13] border-t border-chawarma-border/40 flex items-center gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-2 bg-[#1a1a24] border border-chawarma-border rounded-xl px-2 py-1.5 flex-shrink-0">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="p-1 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition"
              aria-label="Diminuir quantidade"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-sm text-white px-1 w-5 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1 rounded-lg text-gray-400 hover:text-white transition"
              aria-label="Aumentar quantidade"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button directly matching Screen 4 of Reference Mockup */}
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-chawarma-gold to-chawarma-goldLight hover:opacity-95 text-black font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-gold-sm transition active:scale-[0.98]"
          >
            <span>Adicionar ao carrinho</span>
            <span className="font-mono font-black">{formatBRL(totalItemCents)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
