import { CartItem, Coupon, DeliveryDetails } from '../types/menu';
import { formatBRL } from './currency';

export function buildWhatsAppMessage(
  customerName: string,
  items: CartItem[],
  subtotalCents: number,
  notes?: string,
  coupon?: Coupon | null,
  discountCents: number = 0,
  delivery?: DeliveryDetails
): string {
  let msg = `*NOVO PEDIDO - CASA DA CHAWARMA UMUARAMA*\n\n`;

  if (customerName) {
    msg += `👤 *Cliente:* ${customerName}\n`;
  }
  msg += `📅 *Data/Hora:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n`;
  msg += `─────────────────────────\n`;

  if (delivery) {
    if (delivery.order_type === 'delivery') {
      msg += `🛵 *MODALIDADE: ENTREGA (DELIVERY)*\n`;
      msg += `📍 *Endereço:* ${delivery.street || ''}, ${delivery.number || 'S/N'}\n`;
      if (delivery.neighborhood) {
        msg += `🏙️ *Bairro:* ${delivery.neighborhood}\n`;
      }
      if (delivery.complement) {
        msg += `🏢 *Complemento:* ${delivery.complement}\n`;
      }
      if (delivery.reference) {
        msg += `🧭 *Ponto de Ref:* ${delivery.reference}\n`;
      }
      if (delivery.phone) {
        msg += `📞 *Tel/WhatsApp:* ${delivery.phone}\n`;
      }

      msg += `💳 *Pagamento na Entrega:* `;
      if (delivery.payment_method === 'pix_entrega') {
        msg += `📱 Pix na Entrega\n`;
      } else if (delivery.payment_method === 'cartao_entrega') {
        msg += `💳 Cartão Débito/Crédito (Levar maquininha)\n`;
      } else if (delivery.payment_method === 'dinheiro_entrega') {
        msg += `💵 Dinheiro na Entrega`;
        if (delivery.change_for && delivery.change_for.trim()) {
          msg += ` (Troco para ${delivery.change_for.trim()})\n`;
        } else {
          msg += ` (Sem troco)\n`;
        }
      } else {
        msg += `Acertar na entrega\n`;
      }
    } else {
      msg += `🏪 *MODALIDADE: RETIRADA NO BALCÃO*\n`;
      msg += `📍 *Local:* Av. Londrina, 3464 - Ao lado Campus 3\n`;
      msg += `👤 *Retirar em nome de:* ${delivery.customer_name || customerName}\n`;
      if (delivery.phone) {
        msg += `📞 *Contato:* ${delivery.phone}\n`;
      }
      msg += `💳 *Pagamento:* Acertar na retirada no balcão\n`;
    }
    msg += `─────────────────────────\n`;
  }

  msg += `*ITENS DO PEDIDO:*\n\n`;

  items.forEach((item, index) => {
    const unitPrice = item.selectedVariation ? item.selectedVariation.price_cents : item.product.price_cents;
    const addonsTotal = item.selectedAddons.reduce((acc, a) => acc + a.price_cents, 0);
    const itemTotal = (unitPrice + addonsTotal) * item.quantity;

    msg += `*${item.quantity}x ${item.product.name}*\n`;
    if (item.selectedVariation) {
      msg += `  • *Opção:* ${item.selectedVariation.name} (${formatBRL(item.selectedVariation.price_cents)})\n`;
    }
    if (item.selectedAddons && item.selectedAddons.length > 0) {
      item.selectedAddons.forEach((addon) => {
        msg += `  • *Adicional:* ${addon.name} (+${formatBRL(addon.price_cents)})\n`;
      });
    }
    if (item.notes && item.notes.trim()) {
      msg += `  • *Obs do item:* ${item.notes.trim()}\n`;
    }
    msg += `  • *Subtotal item:* ${formatBRL(itemTotal)}\n\n`;
  });

  msg += `─────────────────────────\n`;
  msg += `💵 *Subtotal:* ${formatBRL(subtotalCents)}\n`;

  if (coupon) {
    msg += `🎁 *Brinde/Cupom Ativo:* ${coupon.title} (Cód: ${coupon.code})\n`;
    if (discountCents > 0) {
      msg += `🏷️ *Desconto Aplicado:* -${formatBRL(discountCents)}\n`;
    }
  }

  const finalTotal = Math.max(0, subtotalCents - discountCents);
  msg += `💰 *TOTAL A PAGAR: ${formatBRL(finalTotal)}*\n`;

  if (notes && notes.trim()) {
    msg += `\n📝 *Observações Gerais:* ${notes.trim()}\n`;
  }

  msg += `\n_Pedido gerado pelo Cardápio Digital Oficial_`;

  return msg;
}

export function formatPhoneDigits(phone: string): string {
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  // If already starts with 55 and has 12 or 13 digits, keep
  if (digits.startsWith('55') && digits.length >= 12) {
    return digits;
  }
  // If Brazilian standard DDD + 8/9 digits (10 or 11 digits)
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

export function getWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = formatPhoneDigits(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
