import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const LEVELS = [
  {
    level: 1,
    label: 'Gentle',
    emoji: '🌸',
    color: '#10B981',
    description: 'Soft reminders, no pressure, warm delivery',
    quote: '"Take a breath. What feels right to focus on today?"',
    energy: 'Calm & supportive',
    barWidth: '20%',
  },
  {
    level: 2,
    label: 'Steady',
    emoji: '🌊',
    color: '#06B6D4',
    description: 'Consistent accountability with a gentle touch',
    quote: '"Your 10 AM block is coming up. Let\'s make it count."',
    energy: 'Consistent & reliable',
    barWidth: '40%',
  },
  {
    level: 3,
    label: 'Firm',
    emoji: '🎯',
    color: '#F59E0B',
    description: 'Clear expectations — firm but supportive',
    quote: '"That goal still needs a time block before it counts."',
    energy: 'Balanced & direct',
    barWidth: '60%',
  },
  {
    level: 4,
    label: 'Sharp',
    emoji: '⚡',
    color: '#F97316',
    description: 'Sharp and direct, time-pressure focused',
    quote: '"15 minutes. Deep Work is live. Lock in NOW."',
    energy: 'High pressure & focused',
    barWidth: '80%',
  },
  {
    level: 5,
    label: 'Maximum',
    emoji: '🔥',
    color: '#EF4444',
    description: 'No excuses. Results-only. Maximum intensity.',
    quote: '"Snooze 2. That goal is still live. Next delay costs you."',
    energy: 'Zero tolerance mode',
    barWidth: '100%',
  },
];

export default function IntensitySection() {
  const [selected, setSelected] = useState(3);
  const titleRef = useScrollReveal();
  const activeLevel = LEVELS[selected - 1];

  return (
    <section id="intensity" className="py-24 px-6 relative overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${activeLevel.color}08 0%, transparent 70%)`,
          transition: 'background 0.5s ease',
        }}
      />

      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <div ref={titleRef} className="fade-in-section text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border-2 border-orange-500/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-orange-400 text-sm font-700" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
              🎚 5 Intensity Levels
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Coaching on{' '}
            <span style={{ color: activeLevel.color, transition: 'color 0.3s' }}>Your Terms</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            From a gentle nudge to zero-tolerance boot camp. Adjust anytime — even mid-day.
          </p>
        </div>

        {/* Level selector */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {LEVELS.map((lvl) => (
            <button
              key={lvl.level}
              onClick={() => setSelected(lvl.level)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all duration-200"
                style={{
                  background: selected === lvl.level ? `${lvl.color}25` : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${selected === lvl.level ? lvl.color : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: selected === lvl.level ? `4px 4px 0 ${lvl.color}50` : 'none',
                  transform: selected === lvl.level ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
                }}
              >
                {lvl.emoji}
              </div>
              <span
                className="text-xs font-700 transition-colors"
                style={{
                  color: selected === lvl.level ? lvl.color : '#6b7280',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700,
                }}
              >
                {lvl.label}
              </span>
            </button>
          ))}
        </div>

        {/* Active level detail card */}
        <div
          className="rounded-3xl p-8 text-center transition-all duration-400"
          style={{
            background: `${activeLevel.color}08`,
            border: `3px solid ${activeLevel.color}40`,
            boxShadow: `8px 8px 0 ${activeLevel.color}20`,
          }}
        >
          <div className="text-5xl mb-4">{activeLevel.emoji}</div>
          <div className="flex items-center justify-center gap-3 mb-4">
            {[1,2,3,4,5].map((n) => (
              <div
                key={n}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black transition-all"
                style={{
                  background: n <= selected ? `${activeLevel.color}25` : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${n <= selected ? activeLevel.color : 'rgba(255,255,255,0.1)'}`,
                  color: n <= selected ? activeLevel.color : '#6b7280',
                  fontFamily: 'Nunito, sans-serif',
                }}
              >
                {n}
              </div>
            ))}
          </div>

          <h3 className="text-3xl font-black mb-2 transition-colors" style={{ color: activeLevel.color, fontFamily: 'Nunito, sans-serif' }}>
            Level {activeLevel.level} — {activeLevel.label}
          </h3>
          <p className="text-gray-400 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {activeLevel.description}
          </p>

          {/* Intensity bar */}
          <div className="h-3 bg-[#1c1c2e] rounded-full overflow-hidden mb-6 max-w-md mx-auto">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: activeLevel.barWidth, background: `linear-gradient(90deg, ${activeLevel.color}80, ${activeLevel.color})` }}
            />
          </div>

          {/* Sample quote */}
          <div
            className="rounded-2xl p-4 max-w-lg mx-auto border-l-4 text-left"
            style={{
              background: `${activeLevel.color}0a`,
              borderLeftColor: activeLevel.color,
              border: `1px solid ${activeLevel.color}20`,
            }}
          >
            <div className="text-xs font-700 mb-1 uppercase tracking-wider" style={{ color: activeLevel.color, fontFamily: 'Nunito, sans-serif' }}>
              💬 Sample message at this intensity
            </div>
            <p className="text-sm text-gray-300 italic" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {activeLevel.quote}
            </p>
          </div>

          <div className="mt-4">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-sm font-700"
              style={{
                background: `${activeLevel.color}20`,
                color: activeLevel.color,
                border: `1px solid ${activeLevel.color}40`,
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
              }}
            >
              {activeLevel.energy}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
