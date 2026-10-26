import React, { useState } from 'react';
import { Trash2, Plus, Minus, X, MessageCircle, ArrowLeft, ShoppingBag, Gift, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useMenu } from '../contexts/MenuContext';
import { formatBRL } from '../lib/currency';
import { buildWhatsAppMessage, getWhatsAppUrl, formatPhoneDigits } from '../lib/whatsapp';
import { sounds } from '../lib/soundEffects';

interface CartScreenProps {
  onBackToMenu: () => void;
  onOrderSuccess: () => void;
  onOpenWhatsAppAlert: () => void;
  onOpenRewardWheel?: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  onBackToMenu,
  onOrderSuccess,
  onOpenWhatsAppAlert,
  onOpenRewardWheel,
}) => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotalCents,
    discountCents,
    totalCents,
    coupon,
    removeCoupon,
    totalCount,
  } = useCart();
  const { settings } = useMenu();

  const [customerName, setCustomerName] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinishOrder = () => {
    if (items.length === 0) return;

    // Check if WhatsApp is configured
    if (!settings.official_whatsapp || formatPhoneDigits(settings.official_whatsapp).length < 10) {
      onOpenWhatsAppAlert();
      return;
    }

    sounds.playCelebration();
    setIsSubmitting(true);

    const message = buildWhatsAppMessage(
      customerName,
      items,
      subtotalCents,
      generalNotes,
      coupon,
      discountCents
    );
    const url = getWhatsAppUrl(settings.official_whatsapp, message);

    // Open WhatsApp in new tab/app
    window.open(url, '_blank');

    // Notify success and transition to Screen 6
    setTimeout(() => {
      clearCart();
      setIsSubmitting(false);
      onOrderSuccess();
    }, 600);
  };

  if (items.length === 0) {
    return (
      <div className="pb-24 max-w-md mx-auto px-4 pt-10 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#161620] border border-chawarma-border flex items-center justify-center mx-auto text-chawarma-gold">
          <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
        </div>
        <h2 className="text-xl font-bold text-white">Sua sacola está vazia</h2>
        <p className="text-xs text-gray-400 max-w-xs mx-auto">
          Adicione deliciosos chawarmas, porções e bebidas para fazer seu pedido pelo WhatsApp!
        </p>
        <button
          onClick={onBackToMenu}
          className="py-3 px-6 rounded-xl bg-chawarma-gold text-black font-extrabold text-xs shadow-gold-sm hover:scale-105 transition"
        >
          Explorar Cardápio
        </button>
      </div>
    );
  }

  return (
    <div className="pb-28 max-w-md mx-auto px-4 pt-3 space-y-4">
      {/* Header bar of Cart matching Screen 5 */}
      <div className="flex items-center justify-between border-b border-chawarma-border/30 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMenu}
            className="p-1.5 -ml-1 text-gray-400 hover:text-white"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-white">Meu carrinho</h2>
          <span className="text-xs bg-chawarma-gold/15 text-chawarma-gold px-2 py-0.5 rounded-full font-bold">
            {totalCount} {totalCount === 1 ? 'item' : 'itens'}
          </span>
        </div>

        <button
          onClick={clearCart}
          className="text-gray-400 hover:text-red-400 p-1.5 transition"
          title="Limpar carrinho"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Active Coupon Banner */}
      {coupon ? (
        <div className="p-3 bg-gradient-to-r from-amber-950/60 to-[#1c1810] border border-amber-500/40 rounded-2xl flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-sm">
              🎁
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">{coupon.title}</p>
              <p className="text-[10px] text-amber-400 font-mono">CÓD: {coupon.code}</p>
            </div>
          </div>
          <button
            onClick={removeCoupon}
            className="text-gray-400 hover:text-red-400 p-1"
            title="Remover cupom"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : onOpenRewardWheel ? (
        <button
          type="button"
          onClick={onOpenRewardWheel}
          className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-between text-left hover:bg-amber-500/20 transition"
        >
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-amber-300">Tem um cupom ou brinde da roleta?</span>
          </div>
          <span className="text-[11px] font-bold text-chawarma-gold">Girar Roleta ❯</span>
        </button>
      ) : null}

      {/* Cart Items List */}
      <div className="space-y-3">
        {items.map((item) => {
          const unitBase = item.selectedVariation ? item.selectedVariation.price_cents : item.product.price_cents;
          const addonsSum = item.selectedAddons.reduce((s, a) => s + a.price_cents, 0);
          const itemTotal = (unitBase + addonsSum) * item.quantity;

          return (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-[#16161c] border border-chawarma-border flex items-center justify-between gap-3 shadow-md"
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/5">
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="font-bold text-sm text-white truncate">
                    {item.product.name}
                  </h4>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-500 hover:text-red-400 p-0.5"
                    aria-label="Remover item"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-[11px] text-gray-400 space-y-0.5">
                  {item.selectedVariation && (
                    <p className="text-chawarma-goldLight font-medium">
                      Opção: {item.selectedVariation.name}
                    </p>
                  )}
                  {item.selectedAddons.length > 0 && (
                    <p className="text-gray-300">
                      + {item.selectedAddons.map((a) => a.name).join(', ')}
                    </p>
                  )}
                  {item.notes && (
                    <p className="italic text-gray-400">Obs: "{item.notes}"</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-xs font-bold text-chawarma-gold">
                    {formatBRL(itemTotal)}
                  </span>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-[#1f1f28] rounded-lg px-2 py-0.5 border border-chawarma-border">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="text-gray-400 hover:text-white p-0.5"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold text-white px-1">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="text-gray-400 hover:text-white p-0.5"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Form Details */}
      <div className="p-4 rounded-2xl bg-[#14141a] border border-chawarma-border/60 space-y-3">
        <h3 className="text-xs font-bold text-chawarma-gold uppercase tracking-wider">
          Dados para Identificação
        </h3>

        <div className="space-y-1">
          <label className="text-[11px] text-gray-300 block font-medium">
            Seu Nome (para a comanda no balcão):
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Ex: João da Silva"
            className="w-full bg-[#1a1a24] text-xs text-white placeholder-gray-500 rounded-xl px-3 py-2 border border-chawarma-border focus:outline-none focus:border-chawarma-gold transition"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-gray-300 block font-medium">
            Observações Gerais do Pedido (opcional):
          </label>
          <input
            type="text"
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            placeholder="Ex: Pedido para viagem, talheres descartáveis..."
            className="w-full bg-[#1a1a24] text-xs text-white placeholder-gray-500 rounded-xl px-3 py-2 border border-chawarma-border focus:outline-none focus:border-chawarma-gold transition"
          />
        </div>
      </div>

      {/* Subtotal & Total with Discount matching Screen 5 */}
      <div className="p-4 rounded-2xl bg-[#14141a] border border-chawarma-border/60 space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Subtotal</span>
          <span className="font-mono">{formatBRL(subtotalCents)}</span>
        </div>

        {discountCents > 0 && (
          <div className="flex justify-between text-xs text-emerald-400 font-bold">
            <span>Desconto ({coupon?.code})</span>
            <span className="font-mono">-{formatBRL(discountCents)}</span>
          </div>
        )}

        {coupon?.freebie_name && (
          <div className="flex justify-between text-xs text-amber-400 font-bold">
            <span>Brinde da Roleta</span>
            <span>{coupon.freebie_name} (Grátis)</span>
          </div>
        )}

        <div className="flex justify-between text-xs text-gray-400">
          <span>Taxa de entrega / Retirada</span>
          <span className="text-chawarma-goldLight">A combinar no WhatsApp</span>
        </div>
        <div className="border-t border-chawarma-border/40 pt-2 flex justify-between items-center">
          <span className="font-bold text-sm text-white">Total a Pagar</span>
          <span className="font-mono text-xl font-black text-chawarma-gold">
            {formatBRL(totalCents)}
          </span>
        </div>
      </div>

      {/* WhatsApp Finalize Button matching Screen 5 */}
      <button
        onClick={handleFinishOrder}
        disabled={isSubmitting}
        className="w-full py-3.5 px-4 rounded-2xl bg-chawarma-whatsapp hover:bg-chawarma-whatsappHover text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-whatsapp-glow transition-all active:scale-[0.98] disabled:opacity-60"
      >
        <MessageCircle className="w-5 h-5 fill-white stroke-none" />
        <span>{isSubmitting ? 'Gerando mensagem...' : 'Finalizar pedido pelo WhatsApp'}</span>
      </button>

      <p className="text-[11px] text-gray-500 text-center">
        Você será redirecionado para o WhatsApp oficial para envio automático da sua comanda com seu brinde!
      </p>
    </div>
  );
};

