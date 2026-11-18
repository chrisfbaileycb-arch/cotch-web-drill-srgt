import { useNavigate } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useFirebase } from '@/contexts/FirebaseContext';
import { getTierSpec, type CoachPersonaId } from '@/lib/membership';

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

function PersonaCard({
  persona,
  index,
  onSelect,
}: {
  persona: typeof PERSONAS[0];
  index: number;
  onSelect: (id: CoachPersonaId) => void;
}) {
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
        onClick={() => onSelect(persona.id as 'drill' | 'core' | 'builder' | 'zen')}
      >
        Pick {persona.name} →
      </button>
    </div>
  );
}

export default function PersonasSection() {
  const titleRef = useScrollReveal();
  const navigate = useNavigate();
  const { user, account, updateCoachSettings, openCheckoutModal } = useFirebase();

  const handlePickPersona = async (personaId: CoachPersonaId) => {
    if (!user) {
      if (personaId === 'core') {
        navigate('/app');
      } else {
        openCheckoutModal('pro', 'annual');
      }
      return;
    }
    const spec = getTierSpec(account?.tier ?? 'starter');
    if (!spec.allowedPersonas.includes(personaId)) {
      openCheckoutModal('pro', 'annual');
      return;
    }
    await updateCoachSettings({ selectedPersona: personaId });
    navigate('/app');
  };

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
            <PersonaCard
              key={persona.id}
              persona={persona}
              index={i}
              onSelect={(id) => void handlePickPersona(id)}
            />
          ))}
        </div>

        {/* Max Tier: Build Your Own Agent Studio (4 Custom Coach Slots) Banner */}
        <div
          className="mt-10 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(245,158,11,0.10) 100%)',
            border: '2px solid rgba(239,68,68,0.45)',
            boxShadow: '6px 6px 0 #7f1d1d',
          }}
        >
          <div className="max-w-2xl">
            <div className="text-xs font-black uppercase tracking-wider text-red-400 mb-2">
              $10/mo · $100/yr Upfront (Save $20) · Max Tier Exclusive
            </div>
            <h3
              className="text-2xl sm:text-3xl font-black text-white mb-2"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Want a Custom Workout Coach or Goal-Setting Strategist? Build 4 of Your Own Agents.
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              While the $5/mo Pro plan unlocks the 4 standard coaches above, the $10/mo Max plan unlocks the{' '}
              <strong className="text-white">Build Your Own Agent Studio</strong>. Engineer up to{' '}
              <strong className="text-amber-400">4 additional custom persona & accountability coaches</strong> (8 coaches total) with custom specialties, strictness directives, and check-in cadences.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="rounded-xl bg-[#11111a]/90 border border-white/10 px-3 py-2 text-gray-200 font-bold">
                🏋️ Workout & Conditioning Coach
              </div>
              <div className="rounded-xl bg-[#11111a]/90 border border-white/10 px-3 py-2 text-gray-200 font-bold">
                🎯 Goal-Setting Strategist
              </div>
              <div className="rounded-xl bg-[#11111a]/90 border border-white/10 px-3 py-2 text-gray-200 font-bold">
                ⚡ Deep Work Sprint Lead
              </div>
              <div className="rounded-xl bg-[#11111a]/90 border border-white/10 px-3 py-2 text-gray-200 font-bold">
                🥗 Nutrition & Recovery Guard
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => navigate('/app?tab=studio')}
              className="px-6 py-3.5 rounded-xl font-black text-sm text-[#0c0c14] bg-amber-400 hover:bg-amber-300 transition-colors whitespace-nowrap"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Open Agent Studio (4 Custom Slots) →
            </button>
            <button
              onClick={() => openCheckoutModal('max', 'annual')}
              className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-colors whitespace-nowrap"
            >
              Unlock Max ($10/mo · $100/yr Save $20)
            </button>
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-gray-500 text-sm mt-8 font-600" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
          Switch between your 4 standard coaches and 4 custom-built agents any time. Your calendar and goals stay put. 🔄
        </p>
      </div>
    </section>
  );
}
