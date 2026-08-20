import { useScrollReveal } from '@/hooks/useScrollReveal';

const PLANS = [
  {
    name: 'Free',
    emoji: '🌱',
    price: '$0',
    period: 'forever',
    color: '#10B981',
    shadowColor: '#064e3b',
    features: [
      '1 Coach Persona',
      'Up to 10 goals',
      'Basic planner',
      'Voice commands',
      'Daily briefings',
    ],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Pro',
    emoji: '🚀',
    price: '$9',
    period: 'per month',
    color: '#F59E0B',
    shadowColor: '#78350f',
    features: [
      'All 4 Coach Personas',
      'Unlimited goals',
      'Full calendar planner',
      'Voice coaching',
      'AI briefings daily',
      '5 intensity levels',
      'Priority sync',
    ],
    cta: 'Go Pro',
    highlight: true,
  },
  {
    name: 'Max',
    emoji: '⚡',
    price: '$19',
    period: 'per month',
    color: '#EF4444',
    shadowColor: '#7f1d1d',
    features: [
      'Everything in Pro',
      'Team accountability',
      'Custom coach tone',
      'Advanced analytics',
      'Priority support',
    ],
    cta: 'Go Maximum',
    highlight: false,
  },
];

export default function CTASection() {
  const titleRef = useScrollReveal();

  return (
    <section id="cta" className="py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 animate-gradient pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #0c0c14 0%, #1a1030 50%, #0c0c14 100%)',
          backgroundSize: '200% 200%',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div ref={titleRef} className="fade-in-section text-center mb-16">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Ready to Get{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Coached?
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Pick your plan. Pick your persona. Your first goal is waiting for a calendar block.
          </p>
        </div>

        {/* Plans */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-2 ${plan.highlight ? 'scale-105' : ''}`}
              style={{
                background: plan.highlight ? `${plan.color}12` : '#141420',
                border: `3px solid ${plan.color}${plan.highlight ? '' : '50'}`,
                boxShadow: `8px 8px 0 ${plan.shadowColor}`,
              }}
            >
              {plan.highlight && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black whitespace-nowrap"
                  style={{
                    background: plan.color,
                    color: '#0c0c14',
                    fontFamily: 'Nunito, sans-serif',
                    border: `2px solid ${plan.shadowColor}`,
                  }}
                >
                  ⭐ MOST POPULAR
                </div>
              )}

              <div className="text-3xl mb-3">{plan.emoji}</div>
              <h3 className="text-xl font-black text-white mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-black" style={{ color: plan.color, fontFamily: 'Nunito, sans-serif' }}>
                  {plan.price}
                </span>
                <span className="text-gray-500 text-sm" style={{ fontFamily: 'Space Grotesk' }}>/{plan.period}</span>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300" style={{ fontFamily: 'Space Grotesk' }}>
                    <span className="font-black" style={{ color: plan.color }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className="w-full py-3 rounded-xl font-black text-sm transition-all hover:brightness-110"
                style={{
                  background: plan.highlight ? plan.color : 'transparent',
                  color: plan.highlight ? '#0c0c14' : plan.color,
                  fontFamily: 'Nunito, sans-serif',
                  border: `2px solid ${plan.color}`,
                  boxShadow: `3px 3px 0 ${plan.shadowColor}`,
                }}
              >
                {plan.cta} →
              </button>
            </div>
          ))}
        </div>

        {/* Bottom trust line */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4" style={{ fontFamily: 'Space Grotesk' }}>
            No credit card required • Cancel anytime • iOS, Android, Web
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600">
            {[
              '🔒 SOC 2 Compliant',
              '🌍 Available Worldwide',
              '📱 iOS & Android',
              '💬 24/7 Coach',
              '⚡ Instant Setup',
            ].map((t) => (
              <span key={t} className="flex items-center gap-1.5" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
