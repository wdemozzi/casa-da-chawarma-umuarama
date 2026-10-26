import React, { useState } from 'react';
import { X, Sparkles, Gift, Check, Flame } from 'lucide-react';
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

  // Use configured prizes from admin panel, or fallback to default 5% and 10% discounts
  const rawPrizes: WheelPrize[] =
    settings.wheel_prizes && settings.wheel_prizes.length >= 2
      ? settings.wheel_prizes.filter((p) => p.is_active)
      : DEFAULT_WHEEL_PRIZES;

  const totalSlices = rawPrizes.length;
  const sliceAngle = 360 / totalSlices;

  // Casino alternating colors: Ruby Red & Midnight Onyx with golden highlights
  const sliceColors = [
    { bg: '#b91c1c', border: '#f59e0b', text: '#ffffff', sub: '#fef08a' }, // Ruby Red
    { bg: '#161622', border: '#f59e0b', text: '#ffd700', sub: '#ffffff' }, // Midnight Jet
    { bg: '#991b1b', border: '#f59e0b', text: '#ffffff', sub: '#fef08a' }, // Deep Crimson
    { bg: '#1a1829', border: '#f59e0b', text: '#ffd700', sub: '#ffffff' }, // Obsidian
    { bg: '#b91c1c', border: '#f59e0b', text: '#ffffff', sub: '#fef08a' }, // Ruby Red
    { bg: '#161622', border: '#f59e0b', text: '#ffd700', sub: '#ffffff' }, // Midnight Jet
  ];

  const handleSpin = () => {
    if (isSpinning) return;

    sounds.playCrispClick();
    setIsSpinning(true);
    setWonCoupon(null);

    // Pick a winning index
    const winningIndex = Math.floor(Math.random() * totalSlices);
    const selected = rawPrizes[winningIndex];

    // Calculate exact rotation so slice center lands exactly under the top 12 o'clock pointer
    const extraSpins = 360 * 6; // 6 full turns
    const sliceMid = winningIndex * sliceAngle + sliceAngle / 2;
    // Current offset within 360
    const currentModulo = rotation % 360;
    // Difference needed to align sliceMid at 0 deg (top)
    let needed = (360 - sliceMid) - currentModulo;
    if (needed < 0) needed += 360;
    const targetRotation = rotation + extraSpins + needed;

    setRotation(targetRotation);

    let tickCount = 0;
    const tickInterval = setInterval(() => {
      tickCount++;
      sounds.playWheelTick();
      if (tickCount > 38) {
        clearInterval(tickInterval);
      }
    }, 110);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      const couponObj: Coupon = {
        code: selected.code,
        title: selected.title,
        discount_cents: selected.discount_type === 'fixed' ? selected.discount_value : undefined,
        discount_percent: selected.discount_type === 'percent' ? selected.discount_value : 5,
      };
      setWonCoupon(couponObj);
      setHasSpun(true);
      applyCoupon(couponObj);
      onCouponApplied(couponObj);
      sounds.playCelebration();
    }, 4500);
  };

  if (!isOpen) return null;

  // Geometry for SVG Pie Wedges
  const cx = 160;
  const cy = 160;
  const radius = 135;

  // Generate 24 casino light bulbs around the bezel
  const bulbs = Array.from({ length: 24 }).map((_, i) => {
    const angle = (i * 360) / 24;
    const rad = (angle * Math.PI) / 180;
    const bx = cx + 150 * Math.sin(rad);
    const by = cy - 150 * Math.cos(rad);
    return { bx, by, i };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#111118] border border-amber-500/40 rounded-3xl p-5 shadow-[0_0_40px_rgba(217,119,6,0.3)] flex flex-col items-center text-center space-y-3.5 select-none overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-white p-1.5 rounded-xl bg-white/5 border border-white/10 transition z-40"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1 pt-0.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-black uppercase tracking-wider shadow-sm">
            <Gift className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Roleta da Sorte • 5% ou 10% OFF</span>
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">
            Gire e Ganhe Seu Desconto!
          </h3>
          <p className="text-[11px] text-gray-300 max-w-xs mx-auto">
            Gire a roleta oficial e ganhe <strong>5%</strong> ou <strong>10% OFF</strong> aplicado diretamente no seu pedido!
          </p>
        </div>

        {/* REAL CASINO PRIZE WHEEL */}
        <div className="relative w-[290px] h-[290px] my-1 flex items-center justify-center">
          {/* Top Casino Pointer (Ticker / Flapper) */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
            {/* Pointer Pivot Screw */}
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-200 to-amber-500 border border-black shadow-md flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-red-600 border border-white/50" />
            </div>
            {/* Triangular Downward Arrow */}
            <div className={`w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-amber-400 -mt-1 ${isSpinning ? 'animate-bounce' : ''}`} />
          </div>

          {/* Outer Casino Golden Bezel with Glowing Bulbs */}
          <div className="absolute inset-0 rounded-full p-2.5 bg-gradient-to-tr from-amber-700 via-yellow-300 to-amber-600 shadow-[0_0_25px_rgba(245,158,11,0.5),inset_0_2px_4px_rgba(255,255,255,0.6)] border-2 border-amber-200/50 flex items-center justify-center">
            {/* SVG Bulbs Layer */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              viewBox="0 0 320 320"
            >
              {bulbs.map((b) => (
                <circle
                  key={b.i}
                  cx={b.bx}
                  cy={b.by}
                  r="4"
                  fill={b.i % 2 === 0 ? '#ffea75' : '#ffffff'}
                  stroke="#b45309"
                  strokeWidth="1"
                  filter="drop-shadow(0 0 4px #fbbf24)"
                />
              ))}
            </svg>

            {/* Rotatable Wheel Face */}
            <div
              className="w-full h-full rounded-full relative overflow-hidden transition-transform shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionDuration: '4500ms',
                transitionTimingFunction: 'cubic-bezier(0.12, 0.85, 0.15, 1)',
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 320 320">
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.8" />
                  </filter>
                  <radialGradient id="goldRimGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="70%" stopColor="transparent" />
                    <stop offset="98%" stopColor="rgba(0,0,0,0.4)" />
                    <stop offset="100%" stopColor="#d97706" />
                  </radialGradient>
                </defs>

                {/* Slices */}
                {rawPrizes.map((prize, idx) => {
                  const startAngle = idx * sliceAngle - 90;
                  const endAngle = (idx + 1) * sliceAngle - 90;
                  const midAngle = idx * sliceAngle + sliceAngle / 2;

                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;

                  const x1 = cx + radius * Math.cos(startRad);
                  const y1 = cy + radius * Math.sin(startRad);
                  const x2 = cx + radius * Math.cos(endRad);
                  const y2 = cy + radius * Math.sin(endRad);

                  const pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
                  const colorScheme = sliceColors[idx % sliceColors.length];

                  return (
                    <g key={prize.id || idx}>
                      {/* Wedge Background */}
                      <path
                        d={pathD}
                        fill={colorScheme.bg}
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                      />

                      {/* Content rotated radially from wheel center */}
                      <g transform={`rotate(${midAngle}, ${cx}, ${cy})`}>
                        {/* Icon */}
                        <text
                          x={cx}
                          y={cy - 92}
                          fontSize="18"
                          textAnchor="middle"
                          dominantBaseline="central"
                          filter="url(#shadow)"
                        >
                          {prize.icon}
                        </text>

                        {/* Main Discount Label (e.g. 5% OFF or 10% OFF) */}
                        <text
                          x={cx}
                          y={cy - 68}
                          fontSize="15"
                          fontWeight="900"
                          fontFamily="sans-serif"
                          fill={colorScheme.text}
                          textAnchor="middle"
                          dominantBaseline="central"
                          filter="url(#shadow)"
                          letterSpacing="0.5"
                        >
                          {prize.label}
                        </text>

                        {/* Subtitle tag */}
                        <text
                          x={cx}
                          y={cy - 50}
                          fontSize="7.5"
                          fontWeight="800"
                          fontFamily="sans-serif"
                          fill={colorScheme.sub}
                          textAnchor="middle"
                          dominantBaseline="central"
                          letterSpacing="1"
                        >
                          DESCONTO
                        </text>
                      </g>

                      {/* Perimeter Golden Pin */}
                      <circle
                        cx={x1}
                        cy={y1}
                        r="3.5"
                        fill="#fef08a"
                        stroke="#78350f"
                        strokeWidth="1"
                        filter="drop-shadow(0 1px 2px rgba(0,0,0,0.7))"
                      />
                    </g>
                  );
                })}

                {/* Inner Bevel Overlay */}
                <circle cx={cx} cy={cy} r={radius} fill="url(#goldRimGrad)" pointerEvents="none" />
              </svg>
            </div>

            {/* 3D Center Golden Hub / Spin Button */}
            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-200 to-amber-500 border-4 border-[#161622] shadow-[0_0_15px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.8)] flex flex-col items-center justify-center z-30 transition transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-90"
              title="Clique para Girar!"
            >
              <Sparkles className="w-4 h-4 text-amber-950 animate-spin" />
              <span className="text-[10px] font-black tracking-tight text-amber-950 uppercase leading-none mt-0.5">
                {isSpinning ? '...' : 'GIRAR'}
              </span>
            </button>
          </div>
        </div>

        {/* Won Prize Card or Spin Action Button */}
        {wonCoupon ? (
          <div className="w-full p-4 bg-gradient-to-br from-[#1e1509] via-[#14141e] to-black border-2 border-amber-500/60 rounded-2xl space-y-2 animate-fadeIn shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <div className="flex items-center justify-center gap-1.5 text-chawarma-gold font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Parabéns! Você Ganhou:</span>
            </div>
            <p className="text-base font-black text-white tracking-tight">
              {wonCoupon.title}
            </p>
            <div className="py-1 px-4 bg-amber-500/20 border border-amber-500/50 rounded-xl text-xs font-mono font-black text-amber-300 inline-block shadow-inner">
              CÓDIGO: {wonCoupon.code}
            </div>
            <p className="text-[11px] text-emerald-400 font-bold flex items-center justify-center gap-1 pt-0.5">
              <Check className="w-4 h-4" />
              <span>Desconto de {wonCoupon.discount_percent || 5}% ativado no carrinho!</span>
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 bg-gradient-to-r from-chawarma-gold to-yellow-400 hover:opacity-95 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-gold transition active:scale-95 mt-1"
            >
              Aproveitar Meu Desconto no Cardápio ➔
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
                : 'bg-gradient-to-r from-chawarma-gold via-yellow-400 to-amber-500 hover:opacity-95 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Girando a Roleta Oficial...' : 'GIRAR ROLETA DA SORTE!'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
