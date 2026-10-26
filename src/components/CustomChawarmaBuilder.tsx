import React, { useState } from 'react';
import { X, Sparkles, Check, Plus, Minus, Flame, Utensils, ShoppingBag } from 'lucide-react';
import { Product, ProductVariation, ProductAddon } from '../types/menu';
import { formatBRL } from '../lib/currency';
import { sounds } from '../lib/soundEffects';
import { useCart } from '../contexts/CartContext';

interface CustomChawarmaBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onAddedToCart: () => void;
}

const BREAD_OPTIONS = [
  { id: 'pao-crocante', name: 'Pão Sírio Tostado & Crocante', desc: 'Prensado na chapa com crocância perfeita' },
  { id: 'pao-tradicional', name: 'Pão Sírio Tradicional Macio', desc: 'Enrolado à mão, macio e quentinho' },
];

const SIZE_OPTIONS = [
  { id: 'size-inteiro', name: 'Tamanho Inteiro (Grande)', basePrice: 3500 },
  { id: 'size-meio', name: 'Tamanho Médio (Individual)', basePrice: 2800 },
];

const MEAT_OPTIONS = [
  { id: 'meat-alcatra', name: 'Alcatra Bovina na Chapa', icon: '🥩', tag: 'Mais Pedido' },
  { id: 'meat-frango', name: 'Frango Desfiado Temperado', icon: '🍗', tag: 'Clássico' },
  { id: 'meat-misto', name: 'Misto Nobre (Alcatra + Frango)', icon: '🔥', tag: 'Favorito' },
  { id: 'meat-carneiro', name: 'Carneiro Especial Árabe', icon: '✨', tag: 'Tradição' },
  { id: 'meat-calabresa', name: 'Calabresa Especial Defumada', icon: '🥓', tag: 'Sabor Intenso' },
];

const SAUCE_OPTIONS = [
  { id: 'sauce-alho', name: 'Creme de Alho Libanês da Casa', desc: 'Receita autêntica secreta (O mais amado!)' },
  { id: 'sauce-verde', name: 'Maionese Verde Artesanal Temperada', desc: 'Com ervas frescas e toque cítrico' },
  { id: 'sauce-bbq', name: 'Molho Barbecue Especial', desc: 'Toque levemente adocicado e defumado' },
  { id: 'sauce-sem', name: 'Sem Molho', desc: 'Apenas os temperos naturais da carne' },
];

const SALAD_OPTIONS = [
  { id: 'salad-tomate', name: 'Tomate Fresco em Cubos' },
  { id: 'salad-alface', name: 'Alface Crocante Picadinha' },
  { id: 'salad-picles', name: 'Picles Árabe Especial da Casa' },
  { id: 'salad-cebola', name: 'Cebola Roxa Fininha' },
];

const TURBO_ADDONS = [
  { id: 'addon-queijo', name: 'Queijo Muçarela Derretido Puxando', price_cents: 500 },
  { id: 'addon-bacon', name: 'Fatias de Bacon Super Crocante', price_cents: 500 },
  { id: 'addon-batata', name: 'Batata Palito DENTRO do Chawarma', price_cents: 500 },
  { id: 'addon-cheddar', name: 'Cheddar Cremoso Especial', price_cents: 500 },
  { id: 'addon-catupiry', name: 'Catupiry Original Cremoso', price_cents: 500 },
];

export const CustomChawarmaBuilder: React.FC<CustomChawarmaBuilderProps> = ({
  isOpen,
  onClose,
  onAddedToCart,
}) => {
  const { addItem } = useCart();

  const [selectedSize, setSelectedSize] = useState(SIZE_OPTIONS[0]);
  const [selectedBread, setSelectedBread] = useState(BREAD_OPTIONS[0]);
  const [selectedMeat, setSelectedMeat] = useState(MEAT_OPTIONS[0]);
  const [selectedSauce, setSelectedSauce] = useState(SAUCE_OPTIONS[0]);
  const [selectedSalads, setSelectedSalads] = useState<string[]>([
    'salad-tomate',
    'salad-alface',
    'salad-picles',
  ]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['addon-queijo']);
  const [customNotes, setCustomNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  // Toggle Salads
  const toggleSalad = (id: string) => {
    sounds.playCrispClick();
    setSelectedSalads((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Toggle Addons
  const toggleAddon = (id: string) => {
    sounds.playCrispClick();
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Calculate Total Price
  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const item = TURBO_ADDONS.find((a) => a.id === addonId);
    return sum + (item?.price_cents || 0);
  }, 0);

  const unitPrice = selectedSize.basePrice + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    sounds.playSizzle(); // Hot sizzling sound effect!

    const saladNames = selectedSalads
      .map((sId) => SALAD_OPTIONS.find((s) => s.id === sId)?.name)
      .filter(Boolean)
      .join(', ');

    const addonsObjects: ProductAddon[] = selectedAddons
      .map((aId) => {
        const found = TURBO_ADDONS.find((a) => a.id === aId);
        return found ? { id: found.id, name: found.name, price_cents: found.price_cents, is_available: true } : null;
      })
      .filter(Boolean) as ProductAddon[];

    const customProduct: Product = {
      id: 'prod-custom-chawarma',
      category_id: 'cat-chawa',
      name: `Chawarma Personalizado (${selectedSize.name.split(' ')[0]})`,
      description: `${selectedBread.name} com ${selectedMeat.name}, ${selectedSauce.name}. Saladas: ${saladNames || 'Nenhuma'}.`,
      price_cents: selectedSize.basePrice,
      image_url: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=600&q=80',
      is_active: true,
      sort_order: 1,
    };

    const variation: ProductVariation = {
      id: `var-${selectedSize.id}-${selectedMeat.id}`,
      name: `${selectedBread.name} • ${selectedMeat.name}`,
      price_cents: selectedSize.basePrice,
    };

    const notes = [
      `Molho: ${selectedSauce.name}`,
      `Saladas: ${saladNames || 'Sem salada'}`,
      customNotes.trim() ? `Obs: ${customNotes.trim()}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    addItem(customProduct, quantity, variation, addonsObjects, notes);
    onAddedToCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#12121a] border border-chawarma-gold/40 rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Monte seu Chawarma dos Sonhos</h3>
              <p className="text-[10px] text-chawarma-gold">Escolha carnes, pães, molhos e queijos do seu jeito</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Builder Steps Container */}
        <div className="p-4 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Step 1: Tamanho & Pão */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
              1. Escolha o Tamanho & Preço Base:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {SIZE_OPTIONS.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => {
                    sounds.playCrispClick();
                    setSelectedSize(size);
                  }}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    selectedSize.id === size.id
                      ? 'bg-chawarma-gold/15 border-chawarma-gold text-white font-bold shadow-gold-sm'
                      : 'bg-[#181824] border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs">{size.name}</span>
                  <span className="text-sm font-black text-chawarma-gold font-mono mt-1">
                    {formatBRL(size.basePrice)}
                  </span>
                </button>
              ))}
            </div>

            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block pt-2">
              Estilo do Pão Sírio:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BREAD_OPTIONS.map((bread) => (
                <button
                  key={bread.id}
                  type="button"
                  onClick={() => {
                    sounds.playCrispClick();
                    setSelectedBread(bread);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    selectedBread.id === bread.id
                      ? 'bg-chawarma-gold/15 border-chawarma-gold text-white font-bold'
                      : 'bg-[#181824] border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <p className="text-xs text-white">{bread.name}</p>
                  <p className="text-[10px] text-gray-400">{bread.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Carnes / Proteínas */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
              2. Escolha a Proteína Principal:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MEAT_OPTIONS.map((meat) => (
                <button
                  key={meat.id}
                  type="button"
                  onClick={() => {
                    sounds.playCrispClick();
                    setSelectedMeat(meat);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                    selectedMeat.id === meat.id
                      ? 'bg-chawarma-gold/15 border-chawarma-gold text-white font-bold shadow-sm'
                      : 'bg-[#181824] border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{meat.icon}</span>
                    <span className="text-xs text-white">{meat.name}</span>
                  </div>
                  <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-chawarma-gold">
                    {meat.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Molhos & Cremes */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
              3. Molho / Creme Especial da Casa:
            </span>
            <div className="space-y-1.5">
              {SAUCE_OPTIONS.map((sauce) => (
                <button
                  key={sauce.id}
                  type="button"
                  onClick={() => {
                    sounds.playCrispClick();
                    setSelectedSauce(sauce);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                    selectedSauce.id === sauce.id
                      ? 'bg-chawarma-gold/15 border-chawarma-gold text-white font-bold'
                      : 'bg-[#181824] border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <div>
                    <p className="text-xs text-white">{sauce.name}</p>
                    <p className="text-[10px] text-gray-400">{sauce.desc}</p>
                  </div>
                  {selectedSauce.id === sauce.id && (
                    <Check className="w-4 h-4 text-chawarma-gold" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Saladas Árabes */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
              4. Saladas Tradicionais (Marque as que você quer):
            </span>
            <div className="grid grid-cols-2 gap-2">
              {SALAD_OPTIONS.map((salad) => {
                const isSelected = selectedSalads.includes(salad.id);
                return (
                  <button
                    key={salad.id}
                    type="button"
                    onClick={() => toggleSalad(salad.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-white font-medium'
                        : 'bg-[#181824] border-white/5 text-gray-500'
                    }`}
                  >
                    <span className="text-xs">{salad.name}</span>
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                        isSelected
                          ? 'bg-emerald-500 text-black font-bold'
                          : 'border border-gray-600'
                      }`}
                    >
                      {isSelected && '✓'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 5: Turbinar com Adicionais */}
          <div className="space-y-2 p-3 bg-gradient-to-br from-amber-950/20 to-black/60 rounded-2xl border border-amber-500/30">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                5. Turbinar Meu Chawarma (+R$ 5,00 cada):
              </span>
            </div>
            <div className="space-y-1.5 pt-1">
              {TURBO_ADDONS.map((addon) => {
                const isChecked = selectedAddons.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                      isChecked
                        ? 'bg-amber-500/20 border-amber-500 text-white font-bold shadow-sm'
                        : 'bg-[#181824] border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs text-white">{addon.name}</span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      +{formatBRL(addon.price_cents)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1">
            <label className="text-[11px] text-gray-400 block">Alguma observação especial para a cozinha?</label>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Ex: sem cebola, bem tostado, pimenta à parte..."
              className="w-full bg-[#181824] text-xs text-white placeholder-gray-500 rounded-xl px-3 py-2 border border-white/10 outline-none focus:border-chawarma-gold"
            />
          </div>
        </div>

        {/* Bottom Total & Add to Cart Action */}
        <div className="p-4 bg-[#0e0e14] border-t border-white/10 flex items-center gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center bg-[#181824] border border-white/10 rounded-xl p-1">
            <button
              type="button"
              onClick={() => {
                sounds.playCrispClick();
                setQuantity((q) => Math.max(1, q - 1));
              }}
              className="w-8 h-8 rounded-lg text-gray-300 hover:text-white flex items-center justify-center font-bold"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 text-center font-bold text-sm text-white font-mono">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => {
                sounds.playCrispClick();
                setQuantity((q) => q + 1);
              }}
              className="w-8 h-8 rounded-lg text-gray-300 hover:text-white flex items-center justify-center font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-chawarma-gold via-chawarma-goldLight to-amber-500 hover:opacity-95 text-black font-extrabold text-xs flex items-center justify-between shadow-gold-sm transition active:scale-95"
          >
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-black" />
              <span>Adicionar Chawarma</span>
            </div>
            <span className="font-mono font-black text-sm">
              {formatBRL(totalPrice)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
