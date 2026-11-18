import { useNavigate } from 'react-router-dom';

const FLOATING_WORDS = [
  { text: '⚡ Execute.', color: 'text-red-400', delay: '0s', x: '8%', y: '20%' },
  { text: '🏆 Win.', color: 'text-amber-400', delay: '0.8s', x: '85%', y: '15%' },
  { text: '🚀 Ship.', color: 'text-purple-400', delay: '1.6s', x: '90%', y: '70%' },
  { text: '🌿 Flow.', color: 'text-green-400', delay: '2.4s', x: '5%', y: '75%' },
];

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden noise-bg pt-24 pb-16">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 animate-gradient"
        style={{
          background: 'linear-gradient(135deg, #0c0c14 0%, #1a0a2e 25%, #0c1a14 50%, #1a0c0a 75%, #0c0c14 100%)',
          backgroundSize: '400% 400%',
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(245,158,11,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating words */}
      {FLOATING_WORDS.map((w) => (
        <div
          key={w.text}
          className={`absolute animate-float hidden lg:block ${w.color} font-black text-xl select-none pointer-events-none`}
          style={{ left: w.x, top: w.y, animationDelay: w.delay, fontFamily: 'Nunito, sans-serif' }}
        >
          {w.text}
        </div>
      ))}

      {/* Decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left — copy */}
        <div>
          {/* Kicker */}
          <p className="text-amber-300 text-sm font-bold mb-4 animate-slide-up" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Voice-First · 4 AI Coach Personas · Synced in Real Time
          </p>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none mb-6 animate-slide-up delay-100"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            <span className="text-white block">Your Goals</span>
            <span className="text-white block">Need A</span>
            <span
              className="block animate-gradient"
              style={{
                background: 'linear-gradient(90deg, #F59E0B, #EF4444, #8B5CF6, #10B981, #F59E0B)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Real Coach.
            </span>
          </h1>

          {/* Sub */}
          <p className="text-lg text-gray-300 mb-8 max-w-lg leading-relaxed animate-slide-up delay-200" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            HeyCoach gives you a personal AI accountability partner who knows your goals, owns your calendar, and never lets you drift — starting at $0, $5/mo Pro, or $10/mo Max ($100/yr saves $20).
          </p>

          {/* CTA row */}
          <div className="flex flex-wrap items-center gap-4 mb-8 animate-slide-up delay-300">
            <button
              onClick={() => navigate('/app')}
              className="chunky-btn bg-amber-400 text-amber-950 px-8 py-4 rounded-2xl text-lg whitespace-nowrap"
              style={{ borderColor: '#92400e', boxShadow: '5px 5px 0 #92400e' }}
            >
              Start Coaching Free 🏆
            </button>
            <button
              onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-gray-300 hover:text-white font-bold flex items-center gap-2 transition-colors group whitespace-nowrap"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              <span className="w-10 h-10 rounded-full border-2 border-gray-600 group-hover:border-amber-400 flex items-center justify-center transition-colors">→</span>
              View 3-Tier Plans
            </button>
          </div>

          {/* Social proof pills */}
          <div className="flex flex-wrap gap-3 animate-slide-up delay-400">
            {[
              { icon: '🎤', text: 'Voice Commands' },
              { icon: '🎯', text: 'Goal Tracking' },
              { icon: '📅', text: 'Smart Planner' },
              { icon: '🤖', text: 'AI Briefings' },
            ].map((pill) => (
              <div
                key={pill.text}
                className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-sm text-gray-300"
              >
                <span>{pill.icon}</span>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>{pill.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — hero image */}
        <div className="relative flex items-center justify-center animate-slide-up delay-200">
          {/* Pulse rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-72 h-72 rounded-full border-2 border-amber-500/20 animate-pulse" />
            <div className="absolute w-80 h-80 rounded-full border border-amber-500/10 animate-pulse delay-300" />
          </div>

          <div
            className="relative rounded-3xl overflow-hidden border-4 border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.2)] bg-[#12121f] p-5 w-full max-w-xl"
            style={{ transform: 'rotate(-1.5deg)' }}
          >
            {/* Header in showcase */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-black text-white tracking-wide uppercase" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Live Coach Roster
                </span>
              </div>
              <span className="text-[11px] font-700 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full" style={{ fontFamily: 'Nunito, sans-serif' }}>
                4 AI Personas
              </span>
            </div>

            {/* 4 Personas Mini Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#1a1426] border-2 border-red-500/40 rounded-2xl p-3.5 shadow-[3px_3px_0_#7f1d1d]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl">⚡</span>
                  <span className="text-[10px] font-black text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded">MAX</span>
                </div>
                <div className="text-sm font-black text-white" style={{ fontFamily: 'Nunito, sans-serif' }}>Drill Sergeant</div>
                <div className="text-[11px] text-red-300/80 italic line-clamp-1">"No excuses. Results only."</div>
              </div>

              <div className="bg-[#1f1a14] border-2 border-amber-500/40 rounded-2xl p-3.5 shadow-[3px_3px_0_#78350f]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl">🏆</span>
                  <span className="text-[10px] font-black text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">HERO</span>
                </div>
                <div className="text-sm font-black text-white" style={{ fontFamily: 'Nunito, sans-serif' }}>Coach Core</div>
                <div className="text-[11px] text-amber-300/80 italic line-clamp-1">"Stay ahead of the clock."</div>
              </div>

              <div className="bg-[#181428] border-2 border-purple-500/40 rounded-2xl p-3.5 shadow-[3px_3px_0_#3b0764]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl">🚀</span>
                  <span className="text-[10px] font-black text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded">DEV</span>
                </div>
                <div className="text-sm font-black text-white" style={{ fontFamily: 'Nunito, sans-serif' }}>Builder</div>
                <div className="text-[11px] text-purple-300/80 italic line-clamp-1">"Ship progress every block."</div>
              </div>

              <div className="bg-[#121f1a] border-2 border-emerald-500/40 rounded-2xl p-3.5 shadow-[3px_3px_0_#064e3b]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl">🌿</span>
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">ZEN</span>
                </div>
                <div className="text-sm font-black text-white" style={{ fontFamily: 'Nunito, sans-serif' }}>Zen Guide</div>
                <div className="text-[11px] text-emerald-300/80 italic line-clamp-1">"Clarity over noise."</div>
              </div>
            </div>

            {/* Simulated Live Audio Dispatch */}
            <div className="bg-[#0e0e18] border border-amber-500/30 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500 flex items-center justify-center text-sm">
                  🎤
                </div>
                <div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Voice Dispatch Active</div>
                  <div className="text-xs text-gray-300">"Your 2:00 PM sprint is locked in."</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce" />
                <span className="w-1 h-5 bg-amber-400 rounded-full animate-bounce delay-100" />
                <span className="w-1 h-2 bg-amber-400 rounded-full animate-bounce delay-200" />
                <span className="w-1 h-4 bg-amber-400 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          </div>

          {/* Floating stat cards */}
          <div
            className="absolute -top-4 -right-4 bg-[#1c1c2e] border-2 border-amber-500 rounded-2xl px-4 py-2 animate-float shadow-[4px_4px_0_#92400e]"
          >
            <div className="text-xs text-gray-400 font-600" style={{ fontFamily: 'Nunito, sans-serif' }}>Today's Progress</div>
            <div className="text-xl font-black text-amber-400" style={{ fontFamily: 'Nunito, sans-serif' }}>4/6 ✓</div>
          </div>

          <div
            className="absolute -bottom-4 -left-4 bg-[#1c1c2e] border-2 border-green-500 rounded-2xl px-4 py-2 animate-float shadow-[4px_4px_0_#065f46]"
            style={{ animationDelay: '1.2s' }}
          >
            <div className="text-xs text-gray-400 font-600" style={{ fontFamily: 'Nunito, sans-serif' }}>Active Goals</div>
            <div className="text-xl font-black text-green-400" style={{ fontFamily: 'Nunito, sans-serif' }}>7 🎯</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-gray-500 font-600" style={{ fontFamily: 'Nunito, sans-serif' }}>Scroll to explore</span>
        <div className="w-6 h-10 rounded-full border-2 border-gray-600 flex items-start justify-center p-1">
          <div className="w-1.5 h-3 bg-amber-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
