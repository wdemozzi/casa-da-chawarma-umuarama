import React from 'react';
import { AlertCircle, X, Settings } from 'lucide-react';

interface WhatsAppNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
}

export const WhatsAppNoticeModal: React.FC<WhatsAppNoticeModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-[#16161f] border border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-base font-bold text-white">
            WhatsApp Oficial Não Configurado
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            O documento original do cardápio não possuía o número oficial de WhatsApp registrado.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Para ativar o envio direto de comandas pelo WhatsApp, configure o número no Painel Administrativo.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              onClose();
              onOpenAdmin();
            }}
            className="w-full py-3 px-4 rounded-xl bg-chawarma-gold text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition"
          >
            <Settings className="w-4 h-4" />
            <span>Configurar Número no Painel</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-gray-400 hover:text-white text-xs transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
