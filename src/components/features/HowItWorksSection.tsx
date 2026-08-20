import { useScrollReveal } from '@/hooks/useScrollReveal';

const STEPS = [
  {
    step: '01',
    emoji: '🎭',
    title: 'Pick Your Coach',
    description: 'Choose from 4 distinct AI personalities — Drill Sergeant, Coach Core, Builder, or Zen Guide. Each has a unique voice, style, and energy.',
    color: '#F59E0B',
    shadowColor: '#78350f',
    detail: 'Takes 10 seconds',
  },
  {
    step: '02',
    emoji: '🎯',
    title: 'Set Your Goals',
    description: 'Add goals with life areas (Work, Health, Creative...) and time horizons. Your coach watches which ones are missing calendar blocks.',
    color: '#EF4444',
    shadowColor: '#7f1d1d',
    detail: 'Build your north star',
  },
  {
    step: '03',
    emoji: '📅',
    title: 'Block Your Time',
    description: 'Use the planner to schedule sessions and link them to goals. The 7-day week view shows your progress at a glance.',
    color: '#8B5CF6',
    shadowColor: '#3b0764',
    detail: 'The calendar is truth',
  },
  {
    step: '04',
    emoji: '🤖',
    title: 'Get AI Briefings',
    description: 'Every morning your coach analyzes your schedule and goals, then delivers a personalized briefing in their signature style.',
    color: '#10B981',
    shadowColor: '#064e3b',
    detail: 'Real AI, real context',
  },
  {
    step: '05',
    emoji: '🎤',
    title: 'Use Your Voice',
    description: 'Talk to your coach hands-free. Check your agenda, snooze sessions, mark things complete, review goals — all by voice.',
    color: '#06B6D4',
    shadowColor: '#164e63',
    detail: 'Truly voice-first',
  },
  {
    step: '06',
    emoji: '📈',
    title: 'Track & Win',
    description: 'Watch your daily progress bar fill, goals move to "completed", and sessions rack up. Your coach celebrates with you — in character.',
    color: '#F97316',
    shadowColor: '#7c2d12',
    detail: 'Compound momentum',
  },
];

function StepCard({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className="fade-in-section relative rounded-2xl p-6 bg-[#141420] group hover:-translate-y-1 transition-all duration-200"
      style={{
        border: `2px solid ${step.color}30`,
        boxShadow: `4px 4px 0 ${step.color}20`,
        animationDelay: `${index * 0.08}s`,
      }}
    >
      {/* Step number */}
      <div
        className="absolute -top-3 -left-3 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-[#0c0c14]"
        style={{
          background: step.color,
          border: `2px solid ${step.shadowColor}`,
          fontFamily: 'Nunito, sans-serif',
        }}
      >
        {step.step}
      </div>

      {/* Emoji */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform"
        style={{
          background: `${step.color}15`,
          border: `2px solid ${step.color}40`,
        }}
      >
        {step.emoji}
      </div>

      <h3
        className="text-lg font-black text-white mb-2"
        style={{ fontFamily: 'Nunito, sans-serif', color: step.color }}
      >
        {step.title}
      </h3>

      <p className="text-sm text-gray-400 leading-relaxed mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        {step.description}
      </p>

      <div
        className="inline-flex items-center gap-1 text-xs font-700 px-2 py-1 rounded-full"
        style={{
          background: `${step.color}15`,
          color: step.color,
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
        }}
      >
        ✓ {step.detail}
      </div>

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ boxShadow: `inset 0 0 30px ${step.color}10` }}
      />
    </div>
  );
}

export default function HowItWorksSection() {
  const titleRef = useScrollReveal();

  return (
    <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
      {/* Dotted background */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(245,158,11,0.6) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div ref={titleRef} className="fade-in-section text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border-2 border-amber-500/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-amber-400 text-sm font-700" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
              📖 Six Simple Steps
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            How HeyCoach{' '}
            <span className="text-amber-400">Works</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            From your first goal to daily accountability — here's exactly how it flows.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <StepCard key={step.step} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
