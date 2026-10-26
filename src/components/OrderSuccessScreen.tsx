import React from 'react';
import { Check, MessageCircle, ArrowLeft } from 'lucide-react';
import { useMenu } from '../contexts/MenuContext';
import { formatPhoneDigits } from '../lib/whatsapp';

interface OrderSuccessScreenProps {
  onBackToMenu: () => void;
  onOpenWhatsAppAlert: () => void;
}

export const OrderSuccessScreen: React.FC<OrderSuccessScreenProps> = ({
  onBackToMenu,
  onOpenWhatsAppAlert,
}) => {
  const { settings } = useMenu();

  const handleOpenWhatsAppStatus = () => {
    if (!settings.official_whatsapp || formatPhoneDigits(settings.official_whatsapp).length < 10) {
      onOpenWhatsAppAlert();
      return;
    }
    const cleanPhone = formatPhoneDigits(settings.official_whatsapp);
    const text = encodeURIComponent('Olá! Gostaria de acompanhar o status do meu pedido.');
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-[80vh] max-w-md mx-auto px-6 py-12 flex flex-col items-center justify-center text-center space-y-6 animate-fadeIn">
      {/* Golden check circle badge matching Screen 6 */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-chawarma-gold to-chawarma-goldLight p-1 shadow-gold-glow flex items-center justify-center">
        <div className="w-full h-full bg-[#121217] rounded-full flex items-center justify-center">
          <Check className="w-12 h-12 text-chawarma-gold stroke-[3]" />
        </div>
      </div>

      {/* Headline & Description */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide font-display">
          Pedido enviado!
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 max-w-xs mx-auto leading-relaxed">
          Seu pedido foi encaminhado para o WhatsApp. Em breve, nossa equipe irá confirmar o recebimento.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-3 pt-4">
        {/* Track via WhatsApp */}
        <button
          onClick={handleOpenWhatsAppStatus}
          className="w-full py-3.5 px-4 rounded-2xl bg-chawarma-whatsapp/20 hover:bg-chawarma-whatsapp/30 border border-chawarma-whatsapp/60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition"
        >
          <MessageCircle className="w-5 h-5 text-chawarma-whatsapp" />
          <span>Acompanhe o status do seu pedido pelo WhatsApp</span>
        </button>

        {/* Return to Menu */}
        <button
          onClick={onBackToMenu}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-chawarma-gold to-chawarma-goldLight hover:opacity-95 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-gold-sm transition active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o cardápio</span>
        </button>
      </div>

      {/* Elegant cursive sign-off matching Screen 6 */}
      <p className="text-chawarma-goldLight font-display text-lg tracking-wide pt-4 italic">
        Obrigado pela preferência!
      </p>
    </div>
  );
};
