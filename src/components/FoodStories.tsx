import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, ShoppingBag, Sparkles, ChevronLeft, ChevronRight, Play, Flame } from 'lucide-react';
import { FoodStory, Product } from '../types/menu';
import { formatBRL } from '../lib/currency';

interface FoodStoriesProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const INITIAL_STORIES: (FoodStory & { highlights: string[]; badge: string })[] = [
  {
    id: 'story-1',
    title: 'Chawarma Tradicional',
    tagline: 'Pão sírio enrolado na hora, carne suculenta e creme de alho especial',
    category_name: 'Chawarmas',
    product_id: 'chaw-01',
    poster_url: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=1080&q=85',
    video_url: '', // Aguarda vídeo real do estabelecimento
    price_cents: 3500,
    badge: '🔥 Feito na Hora',
    highlights: ['Pão Sírio Crocante', 'Creme de Alho da Casa', 'Pedaços de Carne Nobre'],
  },
  {
    id: 'story-2',
    title: 'Batata c/ Queijo & Bacon',
    tagline: 'Batata palito crocante coberta com muito queijo derretido e bacon',
    category_name: 'Porções',
    product_id: 'porc-08',
    poster_url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=1080&q=85',
    video_url: '',
    price_cents: 4000,
    badge: '🧀 Queijo Puxando',
    highlights: ['Batata Sequinha', 'Queijo Derretido', 'Bacon Crocante'],
  },
  {
    id: 'story-3',
    title: 'X-Bacon Egg Prensado',
    tagline: 'Pão prensado quentinho com hambúrguer, bacon crocante, ovo e queijo',
    category_name: 'Lanches prensados',
    product_id: 'lan-10',
    poster_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=1080&q=85',
    video_url: '',
    price_cents: 3500,
    badge: '🍔 Na Chapa Quente',
    highlights: ['Hambúrguer Suculento', 'Bacon em Fatias', 'Molho Barbecue Especial'],
  },
  {
    id: 'story-4',
    title: 'Caipirinha Refrescante',
    tagline: 'Preparo tradicional com limão taiti fresco, vodka ou cachaça e muito gelo',
    category_name: 'Drinks e Destilados',
    product_id: 'drk-02',
    poster_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1080&q=85',
    video_url: '',
    price_cents: 1200,
    badge: '❄️ Trincando de Gelada',
    highlights: ['Limão Taiti Fresco', 'Vodka Selecionada', 'Refrescância Pura'],
  },
];

export const FoodStories: React.FC<FoodStoriesProps> = ({
  products,
  onSelectProduct,
}) => {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Horizontal scroll rail controls
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // Dynamically generate stories from products marked with is_story
  const storyProducts = products.filter((p) => p.is_active && p.is_story);
  const activeStoriesList =
    storyProducts.length > 0
      ? storyProducts.map((p) => ({
          id: `story-${p.id}`,
          title: p.name,
          tagline: p.story_tagline || p.description,
          category_name: p.name,
          product_id: p.id,
          poster_url: p.image_url,
          video_url: p.video_url || '',
          price_cents: p.price_cents,
          badge: p.story_badge || '🔥 Destaque',
          highlights: p.description
            .split(',')
            .map((s) => s.trim().replace(/^\(|\)$/g, ''))
            .filter(Boolean)
            .slice(0, 3),
        }))
      : INITIAL_STORIES;

  // Check scroll position to show/hide arrows
  const checkScroll = () => {
    if (railRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = railRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [activeStoriesList]);

  // Smooth slide buttons
  const scrollRail = (direction: 'left' | 'right') => {
    if (railRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      railRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  // Mouse wheel horizontal scroll
  const handleWheel = (e: React.WheelEvent) => {
    if (railRef.current && e.deltaY !== 0) {
      railRef.current.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  // Mouse drag-to-scroll support for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!railRef.current) return;
    isDownRef.current = true;
    startXRef.current = e.pageX - railRef.current.offsetLeft;
    scrollLeftRef.current = railRef.current.scrollLeft;
  };

  const handleMouseLeaveOrUp = () => {
    isDownRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDownRef.current || !railRef.current) return;
    e.preventDefault();
    const x = e.pageX - railRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    railRef.current.scrollLeft = scrollLeftRef.current - walk;
    checkScroll();
  };

  // Auto advance story timer (5.5s per slide)
  useEffect(() => {
    if (activeStoryIndex === null) return;

    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeStoryIndex < activeStoriesList.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
          } else {
            setActiveStoryIndex(null);
          }
          return 0;
        }
        return prev + 1.8;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryIndex, activeStoriesList.length]);

  const handleNext = () => {
    if (activeStoryIndex !== null && activeStoryIndex < activeStoriesList.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setProgress(0);
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handlePrev = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setProgress(0);
    }
  };

  // Keyboard navigation for active story
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeStoryIndex === null) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        setActiveStoryIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStoryIndex, activeStoriesList.length]);

  const currentStory = activeStoryIndex !== null ? activeStoriesList[activeStoryIndex] : null;

  // Format distinct readable label for stories
  const formatStoryLabel = (title: string) => {
    const stripped = title.replace(/^Chawarma\s+(de\s+)?/i, '').trim();
    return stripped || title;
  };

  return (
    <div className="w-full">
      {/* 1. HORIZONTAL STORIES BAR (Instagram Style with Interactive Slide Controls) */}
      <div className="space-y-1.5 py-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-chawarma-goldLight flex items-center gap-1 uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-chawarma-gold animate-pulse" />
            <span>Destaques da Cozinha (Stories)</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 hidden sm:inline">Arraste ou use as setas</span>
            <span className="text-[10px] text-gray-500">Toque para ver</span>
          </div>
        </div>

        <div className="relative group/rail">
          {/* Left Arrow Button (visible when scrolled right) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollRail('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/90 border border-chawarma-gold/60 text-chawarma-gold flex items-center justify-center shadow-gold-sm hover:scale-110 active:scale-95 transition"
              aria-label="Voltar stories"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Arrow Button (visible when more items to the right) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollRail('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/90 border border-chawarma-gold/60 text-chawarma-gold flex items-center justify-center shadow-gold-sm hover:scale-110 active:scale-95 transition"
              aria-label="Avançar stories"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Horizontal Rail Container */}
          <div
            ref={railRef}
            onScroll={checkScroll}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeaveOrUp}
            onMouseUp={handleMouseLeaveOrUp}
            onMouseMove={handleMouseMove}
            className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth select-none cursor-grab active:cursor-grabbing"
          >
            {activeStoriesList.map((story, idx) => (
              <div
                key={story.id}
                onClick={() => setActiveStoryIndex(idx)}
                className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 group"
              >
                {/* Outer Golden Gradient Ring */}
                <div className="relative w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-chawarma-gold via-amber-400 to-amber-700 shadow-gold-sm group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden bg-black p-[2px] relative">
                    <img
                      src={story.poster_url}
                      alt={story.title}
                      className="w-full h-full object-cover rounded-full group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-white drop-shadow" />
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-gray-200 group-hover:text-chawarma-gold transition truncate max-w-[76px] text-center leading-tight">
                  {formatStoryLabel(story.title)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. FULLSCREEN / REELS MODAL PLAYER */}
      {currentStory && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="relative w-full max-w-sm h-full sm:h-[85vh] bg-[#0c0c10] sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border border-white/10 select-none">
            {/* Story Top Progress Bars */}
            <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1">
              {activeStoriesList.map((_, i) => (
                <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-chawarma-gold transition-all duration-100 ease-linear"
                    style={{
                      width:
                        i < activeStoryIndex!
                          ? '100%'
                          : i === activeStoryIndex
                          ? `${progress}%`
                          : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Story Top Header Controls */}
            <div className="absolute top-7 left-4 right-4 z-30 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-chawarma-gold/30">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-chawarma-gold">
                  <img src={currentStory.poster_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">{currentStory.title}</p>
                  <p className="text-[9px] text-chawarma-goldLight">{currentStory.category_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition"
                  aria-label="Mudo"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setActiveStoryIndex(null)}
                  className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cinematic Motion Food Presentation Area */}
            <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
              {/* If user provided a real video for this story, play it */}
              {currentStory.video_url ? (
                <video
                  ref={videoRef}
                  src={currentStory.video_url}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover relative z-10"
                />
              ) : (
                /* High-End Motion Food Reel with Ken Burns camera zoom and atmospheric ambient steam */
                <div className="relative w-full h-full overflow-hidden">
                  <img
                    src={currentStory.poster_url}
                    alt={currentStory.title}
                    className="w-full h-full object-cover animate-kenburns scale-110"
                  />

                  {/* Sizzling steam rising layer */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-black/80 pointer-events-none animate-steam" />

                  {/* Sizzling Badge floating on top */}
                  <div className="absolute top-20 left-4 z-20">
                    <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-chawarma-gold/60 text-chawarma-gold text-xs font-bold shadow-lg flex items-center gap-1.5 animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 text-chawarma-gold" />
                      <span>{currentStory.badge}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Tap zones for Prev / Next navigation */}
              <div onClick={handlePrev} className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer" />
              <div onClick={handleNext} className="absolute right-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer" />

              {/* Navigation Chevrons */}
              {activeStoryIndex! > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-2 z-30 w-9 h-9 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center hover:bg-black/90 active:scale-95 transition shadow-lg"
                  aria-label="Story Anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {activeStoryIndex! < activeStoriesList.length - 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-2 z-30 w-9 h-9 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center hover:bg-black/90 active:scale-95 transition shadow-lg"
                  aria-label="Próximo Story"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Bottom Floating Order Action Card */}
            <div className="absolute bottom-4 sm:bottom-6 left-3 sm:left-4 right-3 sm:right-4 z-30 p-3.5 sm:p-4 rounded-3xl bg-black/90 backdrop-blur-xl border border-chawarma-gold/30 shadow-2xl space-y-2.5">
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-base text-white">{currentStory.title}</h3>
                  <span className="font-mono text-base font-black text-chawarma-gold">
                    {formatBRL(currentStory.price_cents)}
                  </span>
                </div>
                <p className="text-xs text-gray-300 line-clamp-1 mt-0.5">{currentStory.tagline}</p>
              </div>

              {/* Ingredients highlights tags neatly placed inside the card */}
              {currentStory.highlights && currentStory.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {currentStory.highlights.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-white/10 backdrop-blur-md border border-white/10 px-2.5 py-0.5 rounded-lg text-gray-200 font-medium flex items-center gap-1"
                    >
                      <span className="text-chawarma-gold font-bold">✓</span>
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  const targetProd = products.find((p) => p.id === currentStory.product_id);
                  if (targetProd) {
                    onSelectProduct(targetProd);
                    setActiveStoryIndex(null);
                  }
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-chawarma-gold via-chawarma-goldLight to-amber-500 hover:opacity-95 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-gold-sm transition active:scale-98"
              >
                <ShoppingBag className="w-4 h-4 text-black" />
                <span>Quero Esse! (Ver Detalhes & Pedir)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
