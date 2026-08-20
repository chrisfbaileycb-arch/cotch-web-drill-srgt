import { useScrollReveal } from '@/hooks/useScrollReveal';

const STATS = [
  { value: '4', label: 'Coach Personas', emoji: '🎭', color: '#F59E0B' },
  { value: '5', label: 'Intensity Levels', emoji: '⚡', color: '#EF4444' },
  { value: '6', label: 'Life Areas', emoji: '🎯', color: '#8B5CF6' },
  { value: '∞', label: 'Goal Blocks', emoji: '📅', color: '#10B981' },
];

const FEATURES = [
  { emoji: '🎤', title: 'Voice-First', desc: 'Speak to your coach naturally — no tapping required' },
  { emoji: '🤖', title: 'Real AI', desc: 'GPT-powered briefings that know your actual schedule' },
  { emoji: '🔒', title: 'Private & Secure', desc: 'Your data lives in your Supabase instance' },
  { emoji: '🌙', title: 'Dark-Neon Design', desc: 'Built for focus — beautiful and distraction-free' },
  { emoji: '📱', title: 'Mobile Native', desc: 'iOS & Android app with silky smooth performance' },
  { emoji: '🔄', title: 'Always Synced', desc: 'Real-time sync across all your devices' },
];

export default function StatsSection() {
  const ref1 = useScrollReveal();
  const ref2 = useScrollReveal();

  return (
    <section className="py-20 px-6 bg-[#0e0e1a] relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      <div className="max-w-7xl mx-auto">

        {/* Stats row */}
        <div ref={ref1} className="fade-in-section grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="relative rounded-2xl p-6 text-center group hover:-translate-y-1 transition-transform"
              style={{
                background: `${stat.color}08`,
                border: `2px solid ${stat.color}30`,
              }}
            >
              <div className="text-3xl mb-2">{stat.emoji}</div>
              <div
                className="text-5xl font-black mb-1"
                style={{ color: stat.color, fontFamily: 'Nunito, sans-serif' }}
              >
                {stat.value}
              </div>
              <div className="text-sm text-gray-400 font-600" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Feature grid */}
        <div ref={ref2} className="fade-in-section">
          <h3 className="text-3xl font-black text-white text-center mb-8" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Built Different 🏗️
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="flex items-start gap-4 bg-[#141420] rounded-xl p-4 border border-white/5 hover:border-white/15 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl flex-shrink-0">
                  {f.emoji}
                </div>
                <div>
                  <div className="text-sm font-700 text-white mb-1" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
                    {f.title}
                  </div>
                  <div className="text-xs text-gray-500 leading-relaxed" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
