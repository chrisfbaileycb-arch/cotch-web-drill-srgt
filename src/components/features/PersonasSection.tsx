import { useScrollReveal } from '@/hooks/useScrollReveal';

const PERSONAS = [
  {
    id: 'drill',
    emoji: '⚡',
    name: 'Drill Sergeant',
    tagline: 'No excuses. Results only.',
    color: '#EF4444',
    bgColor: 'rgba(239,68,68,0.08)',
    borderColor: '#EF4444',
    shadowColor: '#7f1d1d',
    intensity: 'MAX',
    quote: '"Eyes up. Clock is running. What are we shipping today?"',
    traits: ['Zero tolerance for drift', 'Blunt & direct', 'Time-pressure focused', 'Maximum intensity'],
    badge: '🔴 Military Precision',
  },
  {
    id: 'core',
    emoji: '🏆',
    name: 'Coach Core',
    tagline: 'Firm, warm, and direct.',
    color: '#F59E0B',
    bgColor: 'rgba(245,158,11,0.08)',
    borderColor: '#F59E0B',
    shadowColor: '#78350f',
    intensity: 'BALANCED',
    quote: '"The day is already moving. Let\'s stay ahead of it."',
    traits: ['Encouraging but firm', 'Mentor-style guidance', 'Celebrates wins', 'Default hero mode'],
    badge: '🟡 The Classic Coach',
  },
  {
    id: 'builder',
    emoji: '🚀',
    name: 'Builder',
    tagline: 'Ship progress every block.',
    color: '#8B5CF6',
    bgColor: 'rgba(139,92,246,0.08)',
    borderColor: '#8B5CF6',
    shadowColor: '#3b0764',
    intensity: 'FOCUSED',
    quote: '"Each block is a commit. What ships today?"',
    traits: ['Systems-minded', 'Every block = output', 'Scope-cuts welcome', 'Ship culture'],
    badge: '🟣 Engineering Mode',
  },
  {
    id: 'zen',
    emoji: '🌿',
    name: 'Zen Guide',
    tagline: 'Presence leads to depth.',
    color: '#10B981',
    bgColor: 'rgba(16,185,129,0.08)',
    borderColor: '#10B981',
    shadowColor: '#064e3b',
    intensity: 'CALM',
    quote: '"Today is open. What needs your clearest attention?"',
    traits: ['Calm & minimal', 'Deep work focused', 'No rushing', 'Clarity over noise'],
    badge: '🟢 Deep Focus Mode',
  },
];

function PersonaCard({ persona, index }: { persona: typeof PERSONAS[0]; index: number }) {
  return (
    <div
      className="relative rounded-3xl p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-2 cursor-pointer fade-in-section"
      style={{
        background: persona.bgColor,
        border: `3px solid ${persona.borderColor}`,
        boxShadow: `8px 8px 0 ${persona.shadowColor}`,
        animationDelay: `${index * 0.1}s`,
      }}
    >
      {/* Top badge */}
      <div className="flex items-start justify-between">
        <div
          className="px-3 py-1 rounded-full text-xs font-black"
          style={{
            background: `${persona.color}22`,
            color: persona.color,
            border: `2px solid ${persona.color}55`,
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          {persona.badge}
        </div>
        <div
          className="text-xs font-black px-2 py-1 rounded-lg"
          style={{ background: `${persona.color}22`, color: persona.color, fontFamily: 'Nunito, sans-serif' }}
        >
          ⚡ {persona.intensity}
        </div>
      </div>

      {/* Emoji + Name */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 animate-float"
          style={{
            background: `${persona.color}20`,
            border: `3px solid ${persona.color}`,
            animationDelay: `${index * 0.5}s`,
          }}
        >
          {persona.emoji}
        </div>
        <div>
          <h3 className="text-xl font-black text-white" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {persona.name}
          </h3>
          <p className="text-sm font-600" style={{ color: persona.color, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
            {persona.tagline}
          </p>
        </div>
      </div>

      {/* Quote */}
      <div
        className="rounded-xl p-3 text-sm italic text-gray-300 border-l-4"
        style={{
          background: `${persona.color}0a`,
          borderLeftColor: persona.color,
          fontFamily: 'Space Grotesk, sans-serif',
        }}
      >
        {persona.quote}
      </div>

      {/* Traits */}
      <div className="flex flex-wrap gap-2">
        {persona.traits.map((trait) => (
          <span
            key={trait}
            className="text-xs px-2 py-1 rounded-full font-700"
            style={{
              background: `${persona.color}15`,
              color: persona.color,
              border: `1px solid ${persona.color}40`,
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
            }}
          >
            {trait}
          </span>
        ))}
      </div>

      {/* Select button */}
      <button
        className="w-full py-2.5 rounded-xl font-black text-sm mt-auto transition-all hover:brightness-110"
        style={{
          background: persona.color,
          color: '#0c0c14',
          fontFamily: 'Nunito, sans-serif',
          border: `2px solid ${persona.borderColor}`,
          boxShadow: `3px 3px 0 ${persona.shadowColor}`,
        }}
        onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
      >
        Pick {persona.name} →
      </button>
    </div>
  );
}

export default function PersonasSection() {
  const titleRef = useScrollReveal();

  return (
    <section id="personas" className="py-24 px-6 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={titleRef} className="fade-in-section text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border-2 border-purple-500/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-purple-400 text-sm font-700" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
              🎭 Choose Your Style
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            4 Coaches.{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #EF4444, #F59E0B, #8B5CF6, #10B981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              One Mission.
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Pick the persona that matches your energy today. Every message, every nudge, every briefing adapts — in style and intensity.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PERSONAS.map((persona, i) => (
            <PersonaCard key={persona.id} persona={persona} index={i} />
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-gray-500 text-sm mt-8 font-600" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
          Switch personas any time. Your calendar and goals stay put. 🔄
        </p>
      </div>
    </section>
  );
}
