import React, { useState } from 'react';
import { X, Sparkles, Gift, Check } from 'lucide-react';
import { Coupon, WheelPrize } from '../types/menu';
import { sounds } from '../lib/soundEffects';
import { useCart } from '../contexts/CartContext';
import { useMenu } from '../contexts/MenuContext';
import { DEFAULT_WHEEL_PRIZES } from '../data/initialMenu';

interface RewardWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCouponApplied: (coupon: Coupon) => void;
}

export const RewardWheelModal: React.FC<RewardWheelModalProps> = ({
  isOpen,
  onClose,
  onCouponApplied,
}) => {
  const { coupon: activeCoupon, applyCoupon } = useCart();
  const { settings } = useMenu();

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(activeCoupon);
  const [, setHasSpun] = useState(Boolean(activeCoupon));

  // Use configured prizes from admin panel, or fallback to default discounts
  const rawPrizes: WheelPrize[] =
    settings.wheel_prizes && settings.wheel_prizes.length >= 2
      ? settings.wheel_prizes.filter((p) => p.is_active)
      : DEFAULT_WHEEL_PRIZES;

  const slices = rawPrizes.map((p, idx) => ({
    code: p.code,
    title: p.title,
    label: p.label,
    discount_cents: p.discount_type === 'fixed' ? p.discount_value : undefined,
    discount_percent: p.discount_type === 'percent' ? p.discount_value : undefined,
    icon: p.icon || '🏷️',
    bg: idx % 2 === 0 ? '#1a1811' : '#251e10',
  }));

  const totalSlices = slices.length;
  const sliceAngle = 360 / totalSlices;

  const handleSpin = () => {
    if (isSpinning) return;

    sounds.playCrispClick();
    setIsSpinning(true);
    setWonCoupon(null);

    // Pick a winning index
    const winningIndex = Math.floor(Math.random() * totalSlices);
    const selected = slices[winningIndex];

    const extraSpins = 360 * 6;
    const sliceCenter = winningIndex * sliceAngle + sliceAngle / 2;
    const targetRotation = rotation + extraSpins + (360 - sliceCenter);

    setRotation(targetRotation);

    let tickCount = 0;
    const tickInterval = setInterval(() => {
      tickCount++;
      sounds.playWheelTick();
      if (tickCount > 35) {
        clearInterval(tickInterval);
      }
    }, 110);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      const couponObj: Coupon = {
        code: selected.code,
        title: selected.title,
        discount_cents: selected.discount_cents,
        discount_percent: selected.discount_percent,
      };
      setWonCoupon(couponObj);
      setHasSpun(true);
      applyCoupon(couponObj);
      onCouponApplied(couponObj);
      sounds.playCelebration();
    }, 4500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#13131c] border border-chawarma-gold/40 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center space-y-4 select-none overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-chawarma-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-chawarma-gold/15 border border-chawarma-gold/30 text-chawarma-gold text-[11px] font-bold uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5" />
            <span>Roleta da Sorte • Casa da Chawarma</span>
          </div>
          <h3 className="text-lg font-black text-white">Gire & Ganhe Seu Desconto</h3>
          <p className="text-[11px] text-gray-300">
            Cada cliente ganha um cupom de desconto exclusivo para aplicar no pedido pelo WhatsApp!
          </p>
        </div>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 my-1 flex items-center justify-center">
          {/* Top Gold Pointer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center drop-shadow-lg">
            <div className="w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[18px] border-t-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-300 -mt-1 shadow" />
          </div>

          {/* Outer Ring */}
          <div className="w-full h-full rounded-full p-2 bg-gradient-to-tr from-amber-600 via-chawarma-gold to-yellow-200 shadow-gold border-2 border-amber-300/40 relative">
            {/* Spinning Wheel */}
            <div
              className="w-full h-full rounded-full relative overflow-hidden transition-transform duration-[4500ms] cubic-bezier"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.2, 1)',
              }}
            >
              {slices.map((slice, i) => {
                const angle = i * sliceAngle;
                return (
                  <div
                    key={slice.code}
                    className="absolute w-1/2 h-full top-0 right-0 origin-left flex items-center justify-end pr-3 border-b border-amber-500/20"
                    style={{
                      transform: `rotate(${angle}deg)`,
                      background: slice.bg,
                    }}
                  >
                    <div
                      className="text-right flex items-center gap-1.5"
                      style={{
                        transform: `rotate(${sliceAngle / 2}deg)`,
                        transformOrigin: 'left center',
                      }}
                    >
                      <span className="text-xs">{slice.icon}</span>
                      <span className="text-[10px] font-black text-amber-300 tracking-tight">
                        {slice.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Center Golden Knob */}
            <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-chawarma-gold to-yellow-200 border-2 border-white shadow-xl flex items-center justify-center z-20">
              <Sparkles className="w-5 h-5 text-black animate-pulse" />
            </div>
          </div>
        </div>

        {/* Winning Result Card or Spin Button */}
        {wonCoupon ? (
          <div className="w-full p-3.5 bg-gradient-to-br from-amber-950/60 to-black/80 border border-amber-500/50 rounded-2xl space-y-2 animate-fadeIn">
            <div className="flex items-center justify-center gap-1.5 text-chawarma-gold font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Parabéns! Você Ganhou:</span>
            </div>
            <p className="text-sm font-extrabold text-white">
              {wonCoupon.title}
            </p>
            <div className="py-1 px-3 bg-black/60 rounded-xl border border-white/10 text-[11px] font-mono font-bold text-amber-300 inline-block">
              CÓDIGO: {wonCoupon.code}
            </div>
            <p className="text-[10px] text-emerald-400 font-semibold flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Aplicado automaticamente no seu carrinho!</span>
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-chawarma-gold hover:opacity-90 text-black font-extrabold text-xs rounded-xl shadow-gold-sm transition active:scale-95 mt-1"
            >
              Aproveitar Meu Brinde no Cardápio
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSpin}
            disabled={isSpinning}
            className={`w-full py-3.5 px-4 rounded-xl text-black font-black text-sm uppercase tracking-wider shadow-gold transition active:scale-95 flex items-center justify-center gap-2 ${
              isSpinning
                ? 'bg-gray-600 opacity-60 cursor-not-allowed'
                : 'bg-gradient-to-r from-chawarma-gold via-yellow-400 to-amber-500 hover:opacity-95'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Girando a Roleta...' : 'GIRAR ROLETA DA SORTE!'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
