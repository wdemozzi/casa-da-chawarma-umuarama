import {
  Utensils,
  MessageCircle,
  MapPin,
  Phone,
  Sparkles,
  Share2,
  Lock,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useMenu } from '../contexts/MenuContext';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface BioPageProps {
  onOpenMenu: () => void;
  onOpenAdmin: () => void;
}

export const BioPage: React.FC<BioPageProps> = ({ onOpenMenu, onOpenAdmin }) => {
  const { settings } = useMenu();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Casa da Chawarma Umuarama',
        text: 'O verdadeiro sabor do Oriente! Chawarmas, lanches e porções em Umuarama.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const whatsappUrl = `https://wa.me/55${settings.official_whatsapp}?text=${encodeURIComponent('Olá! Vim pelo link da Bio e gostaria de fazer um pedido.')}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Av. Londrina, 3464, Umuarama - PR')}`;

  return (
    <div className="min-h-screen bg-[#09090c] bg-radial-glow text-gray-100 flex flex-col justify-between max-w-md mx-auto px-4 py-8 selection:bg-chawarma-gold selection:text-black">
      {/* Top Bar with Share */}
      <div className="flex justify-end w-full">
        <button
          onClick={handleShare}
          className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition active:scale-95"
          aria-label="Compartilhar Bio"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Profile Header */}
      <div className="flex flex-col items-center text-center space-y-4 pt-2">
        {/* Avatar with Golden Ring */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-chawarma-gold via-chawarma-goldLight to-amber-600 shadow-gold-glow animate-pulse">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#121218] flex items-center justify-center border-2 border-[#09090c]">
              <img
                src="https://ugc.production.linktr.ee/Xzp0xiNNTqWSzb2O7oXM_Cfb54RZYVn7cRVx8?io=true&size=avatar-v3_0"
                alt="Casa da Chawarma"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback se imagem externa falhar
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#09090c] flex items-center justify-center text-[10px] text-white font-bold" title="Aberto">
            ✓
          </span>
        </div>

        {/* Brand Name & Verified Badge */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-xl sm:text-2xl font-black text-white font-display tracking-wide">
              Casa da Chawarma
            </h1>
            <span className="text-chawarma-gold" title="Conta Oficial">
              <Sparkles className="w-4 h-4 fill-chawarma-gold" />
            </span>
          </div>

          <p className="text-xs text-chawarma-goldLight font-medium">
            @casadachawarmaumuarama
          </p>
        </div>

        {/* Bio Description (Fiel ao Instagram) */}
        <div className="bg-[#14141c]/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-chawarma-border/40 text-xs text-gray-300 max-w-xs space-y-1">
          <p className="flex items-center justify-center gap-1.5 font-medium text-white">
            <MapPin className="w-3.5 h-3.5 text-chawarma-gold flex-shrink-0" />
            <span>Av. Londrina, 3464 - Ao lado Campus 3</span>
          </p>
          <p className="text-[11px] text-gray-400">
            🌯 + 15 anos o melhor de Umuarama
          </p>
        </div>

        {/* Opening Hours Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px] font-semibold">
          <Clock className="w-3 h-3 text-emerald-400" />
          <span>Atendimento das 18h às 23h30</span>
        </div>
      </div>

      {/* Action Links Stack */}
      <div className="space-y-3 pt-6 pb-8 w-full">
        {/* 1. DESTAQUE PRINCIPAL: Cardápio Digital Interativo */}
        <button
          onClick={onOpenMenu}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-chawarma-gold via-chawarma-goldLight to-amber-500 hover:opacity-95 text-black font-extrabold flex items-center justify-between shadow-gold-glow transition-all transform hover:-translate-y-0.5 active:scale-[0.98] group relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/15 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-black" />
            </div>
            <div className="text-left">
              <span className="block text-sm sm:text-base font-black leading-tight">
                Cardápio Digital Interativo
              </span>
              <span className="block text-[11px] text-black/75 font-semibold">
                Monte seu pedido e calcule na hora
              </span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4 text-black" />
          </div>
        </button>

        {/* 2. WhatsApp para Pedidos */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full p-3.5 rounded-2xl bg-[#161620] hover:bg-[#1a1a26] text-white border border-chawarma-whatsapp/40 hover:border-chawarma-whatsapp flex items-center justify-between transition-all transform hover:-translate-y-0.5 active:scale-[0.98] group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-chawarma-whatsapp/20 text-chawarma-whatsapp flex items-center justify-center">
              <MessageCircle className="w-5 h-5 fill-chawarma-whatsapp stroke-none" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold text-white group-hover:text-chawarma-whatsapp transition">
                WhatsApp para Pedidos
              </span>
              <span className="block text-[11px] text-gray-400">
                (44) 99753-5785 • Atendimento direto
              </span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-chawarma-whatsapp transition">
            <ArrowRight className="w-4 h-4" />
          </div>
        </a>

        {/* 3. Como Chegar (Google Maps) */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full p-3.5 rounded-2xl bg-[#161620] hover:bg-[#1a1a26] text-white border border-chawarma-border hover:border-chawarma-gold/50 flex items-center justify-between transition-all transform hover:-translate-y-0.5 active:scale-[0.98] group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-chawarma-gold/15 text-chawarma-gold flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold text-white group-hover:text-chawarma-goldLight transition">
                Como Chegar (Localização)
              </span>
              <span className="block text-[11px] text-gray-400">
                Av. Londrina, 3464 - Ao lado Campus 3
              </span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-chawarma-gold transition">
            <ArrowRight className="w-4 h-4" />
          </div>
        </a>

        {/* 4. Telefone / Ligação Rápida */}
        <a
          href="tel:44997535785"
          className="w-full p-3.5 rounded-2xl bg-[#161620] hover:bg-[#1a1a26] text-white border border-chawarma-border hover:border-chawarma-gold/50 flex items-center justify-between transition-all transform hover:-translate-y-0.5 active:scale-[0.98] group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold text-white group-hover:text-blue-300 transition">
                Ligar para o Restaurante
              </span>
              <span className="block text-[11px] text-gray-400">
                (44) 99753-5785
              </span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-blue-400 transition">
            <ArrowRight className="w-4 h-4" />
          </div>
        </a>

        {/* 5. Instagram Oficial */}
        <a
          href="https://www.instagram.com/casadachawarmaumuarama/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full p-3.5 rounded-2xl bg-[#161620] hover:bg-[#1a1a26] text-white border border-pink-900/40 hover:border-pink-500/60 flex items-center justify-between transition-all transform hover:-translate-y-0.5 active:scale-[0.98] group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center">
              <InstagramIcon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold text-white group-hover:text-pink-300 transition">
                Siga nosso Instagram
              </span>
              <span className="block text-[11px] text-gray-400">
                @casadachawarmaumuarama
              </span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-pink-400 transition">
            <ArrowRight className="w-4 h-4" />
          </div>
        </a>
      </div>

      {/* Footer & Secret / Discrete Admin Access */}
      <div className="text-center space-y-2 pt-4 border-t border-white/5">
        <p className="text-[11px] text-gray-500">
          Casa da Chawarma Umuarama © {new Date().getFullYear()} • Sabor que vem do Oriente
        </p>

        <div>
          <button
            onClick={onOpenAdmin}
            className="text-[10px] text-gray-600 hover:text-chawarma-gold flex items-center justify-center gap-1 mx-auto transition"
          >
            <Lock className="w-3 h-3" />
            <span>Acesso Administrativo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
