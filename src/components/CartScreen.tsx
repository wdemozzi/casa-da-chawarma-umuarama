import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  X,
  MessageCircle,
  ArrowLeft,
  ShoppingBag,
  Gift,
  Bike,
  Store,
  CreditCard,
  Banknote,
  QrCode,
  MapPin,
  Phone as PhoneIcon,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useMenu } from '../contexts/MenuContext';
import { formatBRL } from '../lib/currency';
import { buildWhatsAppMessage, getWhatsAppUrl, formatPhoneDigits } from '../lib/whatsapp';
import { sounds } from '../lib/soundEffects';
import { DeliveryDetails } from '../types/menu';

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

  // Order Details State
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');

  // Delivery Address State
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [reference, setReference] = useState('');

  // Payment on Delivery / Counter State
  const [paymentMethod, setPaymentMethod] = useState<
    'pix_entrega' | 'cartao_entrega' | 'dinheiro_entrega' | 'pix_balcao' | 'cartao_balcao' | 'dinheiro_balcao'
  >('pix_entrega');
  const [changeFor, setChangeFor] = useState('');
  
  // Validation State
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Brazilian Phone Mask helper: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    if (digits.length > 7) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    setPhone(formatted);
    if (fieldErrors.phone) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy.phone;
        return copy;
      });
    }
  };

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
    if (errorMessage) setErrorMessage('');
  };

  const validateOrder = (): boolean => {
    const errors: Record<string, string> = {};

    // 1. Customer Name Validation
    const cleanName = customerName.trim();
    if (!cleanName) {
      errors.customerName = 'Informe seu nome completo';
    } else if (cleanName.length < 3) {
      errors.customerName = 'O nome deve ter no mínimo 3 letras';
    } else if (/^\d+$/.test(cleanName)) {
      errors.customerName = 'O nome não pode ser composto apenas por números';
    }

    // 2. Phone Validation
    const phoneDigits = phone.replace(/\D/g, '');
    if (orderType === 'delivery') {
      if (!phoneDigits) {
        errors.phone = 'Telefone/WhatsApp é obrigatório para a entrega';
      } else if (phoneDigits.length < 10) {
        errors.phone = 'Telefone incompleto com DDD (mínimo 10 dígitos)';
      }
    } else if (phoneDigits && phoneDigits.length < 10) {
      errors.phone = 'Telefone incompleto com DDD (mínimo 10 dígitos)';
    }

    // 3. Delivery Address Validation
    if (orderType === 'delivery') {
      if (!street.trim()) {
        errors.street = 'Informe a Rua / Avenida';
      } else if (street.trim().length < 3) {
        errors.street = 'Nome da rua muito curto (mínimo 3 letras)';
      }

      if (!number.trim()) {
        errors.number = 'Informe o número ou "S/N"';
      }

      if (!neighborhood.trim()) {
        errors.neighborhood = 'Informe o Bairro';
      } else if (neighborhood.trim().length < 2) {
        errors.neighborhood = 'Nome do bairro muito curto';
      }
    }

    // 4. Change (Troco) Validation
    if (paymentMethod === 'dinheiro_entrega' && changeFor.trim()) {
      const parsedChange = parseFloat(changeFor.replace(/[^\d,.]/g, '').replace(',', '.'));
      const totalReais = totalCents / 100;
      if (!isNaN(parsedChange) && parsedChange <= totalReais) {
        errors.changeFor = `O valor para troco (R$ ${parsedChange.toFixed(2)}) deve ser maior que o total do pedido (${formatBRL(totalCents)})`;
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      setErrorMessage(firstError);
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const handleFinishOrder = () => {
    if (items.length === 0) return;

    // Check if WhatsApp is configured
    if (!settings.official_whatsapp || formatPhoneDigits(settings.official_whatsapp).length < 10) {
      onOpenWhatsAppAlert();
      return;
    }

    // Perform full data validation
    if (!validateOrder()) {
      sounds.playCrispClick();
      return;
    }

    sounds.playCelebration();
    setIsSubmitting(true);

    const deliveryDetails: DeliveryDetails = {
      order_type: orderType,
      customer_name: customerName.trim(),
      phone: phone.trim() || undefined,
      street: orderType === 'delivery' ? street.trim() : undefined,
      number: orderType === 'delivery' ? number.trim() : undefined,
      neighborhood: orderType === 'delivery' ? neighborhood.trim() : undefined,
      complement: orderType === 'delivery' && complement.trim() ? complement.trim() : undefined,
      reference: orderType === 'delivery' && reference.trim() ? reference.trim() : undefined,
      payment_method: paymentMethod,
      change_for: paymentMethod === 'dinheiro_entrega' && changeFor.trim() ? changeFor.trim() : undefined,
    };

    const message = buildWhatsAppMessage(
      customerName.trim(),
      items,
      subtotalCents,
      generalNotes,
      coupon,
      discountCents,
      deliveryDetails
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
      <div className="p-4 rounded-2xl bg-[#14141a] border border-chawarma-border/60 space-y-4">
        {/* Modalidade de Atendimento: Entrega vs Balcão */}
        <div>
          <label className="text-[11px] font-bold text-chawarma-gold uppercase tracking-wider block mb-2">
            Como deseja receber seu pedido?
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#1a1a24] rounded-xl border border-chawarma-border">
            <button
              type="button"
              onClick={() => {
                setOrderType('delivery');
                if (paymentMethod.endsWith('_balcao')) {
                  setPaymentMethod('pix_entrega');
                }
              }}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                orderType === 'delivery'
                  ? 'bg-chawarma-gold text-black shadow-gold-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>🛵 Entrega</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderType('pickup');
                if (paymentMethod.endsWith('_entrega')) {
                  setPaymentMethod('pix_balcao');
                }
              }}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                orderType === 'pickup'
                  ? 'bg-chawarma-gold text-black shadow-gold-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>🏪 Retirar no Balcão</span>
            </button>
          </div>
        </div>

        {/* Informações Pessoais */}
        <div className="space-y-2.5">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] text-gray-300 block font-medium">
                {orderType === 'delivery' ? 'Seu Nome Completo:' : 'Nome para Retirada no Balcão:'} <span className="text-red-400">*</span>
              </label>
              {fieldErrors.customerName && (
                <span className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.customerName}
                </span>
              )}
            </div>
            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                clearFieldError('customerName');
              }}
              placeholder="Ex: João da Silva"
              className={`w-full bg-[#1a1a24] text-xs text-white placeholder-gray-500 rounded-xl px-3 py-2.5 border transition outline-none ${
                fieldErrors.customerName
                  ? 'border-red-500/80 bg-red-950/20 focus:border-red-500'
                  : 'border-chawarma-border focus:border-chawarma-gold'
              }`}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] text-gray-300 block font-medium">
                WhatsApp / Telefone para Contato: {orderType === 'delivery' && <span className="text-red-400">*</span>}
              </label>
              {fieldErrors.phone && (
                <span className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.phone}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="Ex: (44) 99999-8888"
                maxLength={15}
                className={`w-full bg-[#1a1a24] text-xs text-white placeholder-gray-500 rounded-xl pl-9 pr-3 py-2.5 border transition font-mono outline-none ${
                  fieldErrors.phone
                    ? 'border-red-500/80 bg-red-950/20 focus:border-red-500'
                    : 'border-chawarma-border focus:border-chawarma-gold'
                }`}
              />
              <PhoneIcon className={`w-4 h-4 absolute left-3 top-2.5 ${fieldErrors.phone ? 'text-red-400' : 'text-gray-500'}`} />
            </div>
          </div>
        </div>

        {/* Campos Específicos para Entrega (Delivery) */}
        {orderType === 'delivery' ? (
          <div className="space-y-2.5 pt-2 border-t border-chawarma-border/40">
            <div className="flex items-center gap-1.5 text-chawarma-gold">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wide">Endereço de Entrega</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label className="text-[11px] text-gray-300 block font-medium">
                  Rua / Avenida: <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => {
                    setStreet(e.target.value);
                    clearFieldError('street');
                  }}
                  placeholder="Ex: Av. Paraná"
                  className={`w-full bg-[#1a1a24] text-xs text-white placeholder-gray-500 rounded-xl px-3 py-2 border transition outline-none ${
                    fieldErrors.street
                      ? 'border-red-500/80 bg-red-950/20 focus:border-red-500'
                      : 'border-chawarma-border focus:border-chawarma-gold'
                  }`}
                />
                {fieldErrors.street && (
                  <p className="text-[9px] text-red-400 font-semibold">{fieldErrors.street}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 block font-medium">
                  Número: <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => {
                    setNumber(e.target.value);
                    clearFieldError('number');
                  }}
                  placeholder="Ex: 1234"
                  className={`w-full bg-[#1a1a24] text-xs text-white placeholder-gray-500 rounded-xl px-3 py-2 border transition font-mono outline-none ${
                    fieldErrors.number
                      ? 'border-red-500/80 bg-red-950/20 focus:border-red-500'
                      : 'border-chawarma-border focus:border-chawarma-gold'
                  }`}
                />
                {fieldErrors.number && (
                  <p className="text-[9px] text-red-400 font-semibold">{fieldErrors.number}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 block font-medium">
                  Bairro: <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => {
                    setNeighborhood(e.target.value);
                    clearFieldError('neighborhood');
                  }}
                  placeholder="Ex: Centro / Zona 2"
                  className={`w-full bg-[#1a1a24] text-xs text-white placeholder-gray-500 rounded-xl px-3 py-2 border transition outline-none ${
                    fieldErrors.neighborhood
                      ? 'border-red-500/80 bg-red-950/20 focus:border-red-500'
                      : 'border-chawarma-border focus:border-chawarma-gold'
                  }`}
                />
                {fieldErrors.neighborhood && (
                  <p className="text-[9px] text-red-400 font-semibold">{fieldErrors.neighborhood}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 block font-medium">
                  Complemento (opcional):
                </label>
                <input
                  type="text"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  placeholder="Ex: Apto 102, Bloco B"
                  className="w-full bg-[#1a1a24] text-xs text-white placeholder-gray-500 rounded-xl px-3 py-2 border border-chawarma-border focus:outline-none focus:border-chawarma-gold transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-gray-300 block font-medium">
                Ponto de Referência (opcional):
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ex: Próximo à praça / Ao lado da padaria"
                className="w-full bg-[#1a1a24] text-xs text-white placeholder-gray-500 rounded-xl px-3 py-2 border border-chawarma-border focus:outline-none focus:border-chawarma-gold transition"
              />
            </div>
          </div>
        ) : (
          /* Informações para Retirada no Balcão */
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 space-y-1">
            <div className="flex items-center gap-1.5 text-chawarma-gold text-xs font-bold">
              <MapPin className="w-4 h-4" />
              <span>Endereço para Retirada:</span>
            </div>
            <p className="text-xs text-white font-medium">
              Av. Londrina, 3464 - Ao lado do Campus 3 (Umuarama - PR)
            </p>
            <p className="text-[10px] text-gray-400">
              Seu pedido começará a ser preparado assim que você confirmar pelo WhatsApp!
            </p>
          </div>
        )}

        {/* Seção Forma de Pagamento */}
        <div className="space-y-2 pt-2 border-t border-chawarma-border/40">
          <label className="text-[11px] font-bold text-chawarma-gold uppercase tracking-wider block">
            {orderType === 'delivery' ? 'Como vai acertar na entrega?' : 'Forma de pagamento no balcão:'}
          </label>

          {orderType === 'delivery' ? (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('pix_entrega');
                  clearFieldError('changeFor');
                }}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                  paymentMethod === 'pix_entrega'
                    ? 'bg-amber-500/15 border-chawarma-gold text-white font-bold shadow-sm'
                    : 'bg-[#1a1a24] border-chawarma-border/60 text-gray-400 hover:text-white'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] leading-tight">📱 Pix na Entrega</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('cartao_entrega');
                  clearFieldError('changeFor');
                }}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                  paymentMethod === 'cartao_entrega'
                    ? 'bg-amber-500/15 border-chawarma-gold text-white font-bold shadow-sm'
                    : 'bg-[#1a1a24] border-chawarma-border/60 text-gray-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5 text-cyan-400" />
                <span className="text-[10px] leading-tight">💳 Levar Maquininha</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('dinheiro_entrega')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                  paymentMethod === 'dinheiro_entrega'
                    ? 'bg-amber-500/15 border-chawarma-gold text-white font-bold shadow-sm'
                    : 'bg-[#1a1a24] border-chawarma-border/60 text-gray-400 hover:text-white'
                }`}
              >
                <Banknote className="w-5 h-5 text-chawarma-gold" />
                <span className="text-[10px] leading-tight">💵 Dinheiro</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix_balcao')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                  paymentMethod === 'pix_balcao'
                    ? 'bg-amber-500/15 border-chawarma-gold text-white font-bold shadow-sm'
                    : 'bg-[#1a1a24] border-chawarma-border/60 text-gray-400 hover:text-white'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] leading-tight">📱 Pix Balcão</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cartao_balcao')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                  paymentMethod === 'cartao_balcao'
                    ? 'bg-amber-500/15 border-chawarma-gold text-white font-bold shadow-sm'
                    : 'bg-[#1a1a24] border-chawarma-border/60 text-gray-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5 text-cyan-400" />
                <span className="text-[10px] leading-tight">💳 Cartão Balcão</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('dinheiro_balcao')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                  paymentMethod === 'dinheiro_balcao'
                    ? 'bg-amber-500/15 border-chawarma-gold text-white font-bold shadow-sm'
                    : 'bg-[#1a1a24] border-chawarma-border/60 text-gray-400 hover:text-white'
                }`}
              >
                <Banknote className="w-5 h-5 text-chawarma-gold" />
                <span className="text-[10px] leading-tight">💵 Dinheiro Balcão</span>
              </button>
            </div>
          )}

          {/* Campo de Troco caso pague em dinheiro na entrega */}
          {paymentMethod === 'dinheiro_entrega' && (
            <div className="p-3 bg-[#1a1a24] rounded-xl border border-chawarma-border/80 space-y-2 mt-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] text-gray-300 block font-medium">
                  Precisa de troco para quanto? (Deixe em branco se tiver o valor exato)
                </label>
              </div>
              <input
                type="text"
                value={changeFor}
                onChange={(e) => {
                  setChangeFor(e.target.value);
                  clearFieldError('changeFor');
                }}
                placeholder="Ex: R$ 50,00 ou R$ 100,00"
                className={`w-full bg-[#14141c] text-xs text-white placeholder-gray-500 rounded-xl px-3 py-2 border transition font-mono outline-none ${
                  fieldErrors.changeFor
                    ? 'border-red-500/80 bg-red-950/20 focus:border-red-500'
                    : 'border-chawarma-border focus:border-chawarma-gold'
                }`}
              />
              {fieldErrors.changeFor && (
                <p className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {fieldErrors.changeFor}
                </p>
              )}
              <div className="flex gap-1.5 pt-1">
                {['Não preciso de troco', 'R$ 50,00', 'R$ 100,00'].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      setChangeFor(sug === 'Não preciso de troco' ? '' : sug);
                      clearFieldError('changeFor');
                    }}
                    className="text-[10px] px-2 py-1 rounded-lg bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 border border-white/10 transition"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Observações Gerais */}
        <div className="space-y-1 pt-2 border-t border-chawarma-border/40">
          <label className="text-[11px] text-gray-300 block font-medium">
            Observações Gerais do Pedido (opcional):
          </label>
          <input
            type="text"
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            placeholder="Ex: Tocar o interfone, embalar bem quente..."
            className="w-full bg-[#1a1a24] text-xs text-white placeholder-gray-500 rounded-xl px-3 py-2 border border-chawarma-border focus:outline-none focus:border-chawarma-gold transition"
          />
        </div>

        {/* Alerta de Validação */}
        {errorMessage && (
          <div className="p-3 bg-red-950/70 border border-red-500/60 rounded-xl flex items-center gap-2 text-red-300 text-xs font-semibold animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}
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
          <span className="text-chawarma-goldLight">
            {orderType === 'delivery' ? 'A combinar no WhatsApp' : 'Retirada Grátis'}
          </span>
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
        <span>{isSubmitting ? 'Gerando pedido no WhatsApp...' : 'Confirmar e Enviar Pedido'}</span>
      </button>

      <p className="text-[11px] text-gray-500 text-center">
        {orderType === 'delivery'
          ? '🛵 O motoboy levará a maquininha ou chave Pix conforme escolhido!'
          : '🏪 Seu pedido será preparado para retirada rápida no balcão!'}
      </p>
    </div>
  );
};

