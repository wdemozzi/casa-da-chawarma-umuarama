import React from 'react';
import { MessageCircle, ArrowRight, Sparkles, Utensils, Star, Clock, MapPin } from 'lucide-react';
import { useMenu } from '../contexts/MenuContext';
import { formatPhoneDigits } from '../lib/whatsapp';
import { FoodStories } from './FoodStories';
import { Product } from '../types/menu';

interface HomeScreenProps {
  onGoToMenu: (categoryId?: string) => void;
  onGoToCart: () => void;
  onOpenWhatsAppAlert: () => void;
  onOpenProductDetails: (product: Product) => void;
  onOpenCustomBuilder: () => void;
  onOpenRewardWheel: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onGoToMenu,
  onOpenWhatsAppAlert,
  onOpenProductDetails,
  onOpenCustomBuilder,
  onOpenRewardWheel,
}) => {
  const { categories, products, settings } = useMenu();

  const handleWhatsAppClick = () => {
    if (!settings.official_whatsapp || formatPhoneDigits(settings.official_whatsapp).length < 10) {
      onOpenWhatsAppAlert();
      return;
    }
    const cleanPhone = formatPhoneDigits(settings.official_whatsapp);
    const text = encodeURIComponent('Olá! Gostaria de fazer um pedido na Casa da Chawarma Umuarama!');
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  // 4 Featured products from the actual menu
  const featuredProducts = products.filter(p => p.is_active).slice(0, 4);

  return (
    <div className="pb-24 max-w-md mx-auto px-4 pt-3 space-y-6">
      {/* 1. HERO BANNER (Directly matching Screen 1 from Reference Mockup) */}
      <div className="relative rounded-3xl overflow-hidden border border-chawarma-border bg-gradient-to-b from-[#181822] to-[#101014] shadow-2xl">
        <div className="relative h-72 w-full overflow-hidden">
          <img
            src={settings.banner_image_url || 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=800&q=85'}
            alt="Chawarma Tradicional Artesanal"
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d11] via-[#0d0d11]/40 to-transparent" />
          
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-chawarma-gold/30 flex items-center gap-1.5 text-xs text-chawarma-goldLight">
            <Sparkles className="w-3.5 h-3.5 text-chawarma-gold" />
            <span className="font-semibold">Original Árabe</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="p-5 -mt-8 relative z-10 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight font-display">
            O verdadeiro sabor do Oriente,{' '}
            <span className="gold-gradient-text">aqui na sua cidade!</span>
          </h1>

          <p className="text-sm text-gray-300 leading-relaxed font-normal">
            {settings.tagline || 'Chawarmas artesanais no pão sírio, lanches prensados, porções caprichadas, bebidas e muito mais. Peça agora e aproveite!'}
          </p>

          {/* Primary Action Button: WhatsApp Order CTA (Matching reference green button) */}
          <button
            onClick={handleWhatsAppClick}
            className="w-full py-3.5 px-4 rounded-2xl bg-chawarma-whatsapp hover:bg-chawarma-whatsappHover text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-whatsapp-glow transition-all active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5 fill-white stroke-none" />
            <span>Fazer pedido pelo WhatsApp</span>
          </button>

          {/* Secondary Action: Ver Cardápio */}
          <button
            onClick={() => onGoToMenu()}
            className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-chawarma-goldLight border border-chawarma-border text-sm font-semibold flex items-center justify-center gap-2 transition"
          >
            <Utensils className="w-4 h-4 text-chawarma-gold" />
            <span>Ver Cardápio Completo</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* 2. REELS / STORIES GASTRONÔMICOS EM VÍDEO */}
      <FoodStories products={products} onSelectProduct={onOpenProductDetails} />

      {/* 3. INTERACTIVE BANNER: MONTE SEU CHAWARMA DOS SONHOS */}
      <div
        onClick={onOpenCustomBuilder}
        className="relative rounded-3xl p-4 bg-gradient-to-r from-amber-950/70 via-[#1f1710] to-[#14141c] border border-amber-500/40 shadow-xl cursor-pointer group hover:border-amber-400 transition-all overflow-hidden active:scale-98"
      >
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-chawarma-gold/15 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="space-y-1 flex-1">
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              <span>Experiência Exclusiva</span>
            </span>
            <h3 className="text-base font-black text-white group-hover:text-amber-300 transition leading-tight">
              Monte seu Chawarma dos Sonhos 🌯
            </h3>
            <p className="text-[11px] text-gray-300 leading-snug">
              Escolha o pão, as carnes nobres, cremes da casa e turbine com queijo e bacon!
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-chawarma-gold to-amber-500 text-black flex items-center justify-center font-bold flex-shrink-0 shadow-gold group-hover:scale-105 transition">
            <Utensils className="w-6 h-6 text-black" />
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE BANNER: ROLETA DA SORTE */}
      <div
        onClick={onOpenRewardWheel}
        className="relative rounded-2xl p-3.5 bg-gradient-to-r from-[#20150b] via-[#1a1215] to-[#12121c] border border-amber-500/35 shadow-lg cursor-pointer group hover:border-amber-400 transition-all active:scale-98"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-xl shadow-sm group-hover:rotate-12 transition">
              🎁
            </div>
            <div>
              <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition">
                Roleta da Sorte • Casa da Chawarma
              </h4>
              <p className="text-[10px] text-gray-400">
                Gire a roleta e ganhe refrigerante, porção ou desconto!
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-xl bg-amber-500/10 whitespace-nowrap group-hover:bg-amber-500 group-hover:text-black transition">
            Girar ❯
          </span>
        </div>
      </div>

      {/* 3. CATEGORIES CAROUSEL/GRID PREVIEW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-wide">
            Categorias Principais
          </h2>
          <button
            onClick={() => onGoToMenu()}
            className="text-xs text-chawarma-gold hover:underline font-semibold flex items-center gap-1"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {categories.slice(0, 4).map((cat) => {
            const count = products.filter(p => p.category_id === cat.id && p.is_active).length;
            return (
              <div
                key={cat.id}
                onClick={() => onGoToMenu(cat.id)}
                className="relative rounded-2xl overflow-hidden border border-chawarma-border bg-[#16161c] hover:border-chawarma-gold/50 transition cursor-pointer group p-3 flex flex-col justify-between h-28"
              >
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-110 group-hover:opacity-35 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-[#121217]/70 to-transparent" />

                <div className="relative z-10 flex justify-end">
                  <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded-full text-chawarma-goldLight border border-chawarma-gold/20 font-medium">
                    {count} {count === 1 ? 'item' : 'opções'}
                  </span>
                </div>

                <div className="relative z-10">
                  <h3 className="font-bold text-sm text-white group-hover:text-chawarma-goldLight transition truncate">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] text-gray-400">Toque para explorar</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. HIGHLIGHTS & POPULAR CHOICES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
            <Star className="w-4 h-4 text-chawarma-gold fill-chawarma-gold" />
            <span>Mais Pedidos</span>
          </h2>
          <span className="text-[11px] text-gray-400">Receitas Tradicionais</span>
        </div>

        <div className="space-y-2.5">
          {featuredProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => onGoToMenu(prod.category_id)}
              className="p-3 rounded-2xl bg-[#16161c] border border-chawarma-border hover:border-chawarma-gold/40 transition cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/5">
                <img
                  src={prod.image_url}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-bold text-sm text-white group-hover:text-chawarma-goldLight transition truncate">
                  {prod.name}
                </h4>
                <p className="text-[11px] text-gray-400 line-clamp-1 leading-snug">
                  {prod.description}
                </p>
                <span className="text-xs font-bold text-chawarma-gold block">
                  R$ {(prod.price_cents / 100).toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className="w-8 h-8 rounded-full bg-chawarma-gold/10 border border-chawarma-gold/30 text-chawarma-gold flex items-center justify-center flex-shrink-0 group-hover:bg-chawarma-gold group-hover:text-black transition">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. RESTAURANT INFO CARD */}
      <div className="p-4 rounded-2xl bg-[#14141a] border border-chawarma-border/40 space-y-2 text-xs text-gray-400">
        <div className="flex items-center gap-2 text-gray-300">
          <MapPin className="w-4 h-4 text-chawarma-gold flex-shrink-0" />
          <span>{settings.address || 'Umuarama - PR'}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Clock className="w-4 h-4 text-chawarma-gold flex-shrink-0" />
          <span>{settings.opening_hours || 'Consulte horários para pedidos'}</span>
        </div>
      </div>
    </div>
  );
};
