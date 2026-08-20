import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const TABS = [
  {
    id: 'today',
    label: "📅 Today View",
    headline: "Your Day at a Glance",
    color: '#F59E0B',
    description: "Wake up to a color-coded agenda. Morning, midday, and evening blocks. Progress bar showing how your day is moving. Coach greeting sets the tone.",
    points: [
      "Daily progress tracker (completed / scheduled / pending)",
      "AI-generated morning briefing — in your coach's voice",
      "One-tap session complete or snooze",
      "Goals-needing-time alert so nothing falls through",
    ],
    mockup: (
      <div className="rounded-2xl bg-[#141420] border-2 border-amber-500/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 font-600 uppercase tracking-widest" style={{ fontFamily: 'Nunito, sans-serif' }}>Wednesday, Aug 19</div>
            <div className="text-2xl font-black text-white" style={{ fontFamily: 'Nunito, sans-serif' }}>Hey Coach</div>
          </div>
          <div className="px-2 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs text-amber-400 font-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
            🏆 Coach Core
          </div>
        </div>
        <div className="bg-[#1c1c2e] border border-amber-500/20 rounded-xl p-3 border-l-4 border-l-amber-500">
          <div className="text-xs text-amber-400 font-700 mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>⚡ AI BRIEFING</div>
          <div className="text-xs text-gray-300 leading-relaxed">Deep Work is your anchor block today. Three goals still need time — put them on the board before noon.</div>
        </div>
        <div className="bg-[#1c1c2e] border border-white/5 rounded-xl p-3">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Day Progress</span>
            <span className="text-amber-400 font-700">4/6</span>
          </div>
          <div className="h-1.5 bg-[#2c2c44] rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '66%' }} />
          </div>
        </div>
        {[
          { time: '9:00 AM', title: 'Deep Work Block', cat: 'morning', done: true },
          { time: '2:00 PM', title: 'Client Review', cat: 'midday', done: false },
          { time: '6:00 PM', title: 'Workout', cat: 'evening', done: false },
        ].map((s) => (
          <div key={s.title} className={`flex items-center gap-3 p-2 rounded-lg border ${s.done ? 'opacity-50 border-white/5' : 'border-white/10'} bg-[#1c1c2e]`}>
            <div className={`w-1 h-8 rounded-full flex-shrink-0 ${s.cat === 'morning' ? 'bg-orange-500' : s.cat === 'midday' ? 'bg-green-500' : 'bg-indigo-400'}`} />
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-700 ${s.done ? 'line-through text-gray-500' : 'text-white'}`} style={{ fontFamily: 'Nunito, sans-serif' }}>{s.title}</div>
              <div className="text-xs text-gray-500">{s.time}</div>
            </div>
            {s.done ? <span className="text-green-500 text-xs">✓</span> : <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Do it</span>}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'planner',
    label: "🗓 Planner",
    headline: "The Calendar Is Truth",
    color: '#8B5CF6',
    description: "A proper time-grid planner with week strip navigation. Tap any hour to add a session. Link sessions to goals. Watch your week fill with intent.",
    points: [
      "7-day week strip with completion % per day",
      "Tap-to-add sessions on any time slot",
      "Color-coded by morning / midday / evening",
      "Session detail with coach message + complete/snooze",
    ],
    mockup: (
      <div className="rounded-2xl bg-[#141420] border-2 border-purple-500/30 p-4 space-y-3">
        <div className="grid grid-cols-7 gap-1">
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="text-xs text-gray-500 font-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{d}</div>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-700 ${i === 2 ? 'bg-purple-500 text-white' : 'text-gray-400'}`} style={{ fontFamily: 'Nunito, sans-serif' }}>{14+i}</div>
              <div className={`w-1.5 h-1.5 rounded-full ${i < 3 ? 'bg-green-500' : i < 5 ? 'bg-purple-500' : 'bg-gray-600'}`} />
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-3 space-y-2">
          {[
            { time: '8 AM', title: 'Morning Review', color: '#F97316', h: 44 },
            { time: '10 AM', title: 'Product Sprint', color: '#8B5CF6', h: 88 },
            { time: '1 PM', title: 'Lunch + Walk', color: '#10B981', h: 44 },
            { time: '3 PM', title: 'Code Review', color: '#8B5CF6', h: 60 },
          ].map((block) => (
            <div key={block.title} className="flex items-start gap-2">
              <div className="text-xs text-gray-500 w-12 pt-1 text-right" style={{ fontFamily: 'Space Grotesk' }}>{block.time}</div>
              <div
                className="flex-1 rounded-lg px-2 py-1 text-xs font-700"
                style={{
                  background: `${block.color}20`,
                  borderLeft: `3px solid ${block.color}`,
                  color: block.color,
                  fontFamily: 'Nunito, sans-serif',
                  minHeight: `${block.h / 2}px`,
                }}
              >
                {block.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'goals',
    label: "🎯 Goals",
    headline: "Goals Backed by Calendar",
    color: '#EF4444',
    description: "Every goal needs a time block or it doesn't count. HeyCoach alerts you to unscheduled goals, tracks completion by life area, and helps you see real progress.",
    points: [
      "6 life areas: Work, Health, Learning, Finance, Creative, Relationships",
      "Time horizons: daily, weekly, monthly",
      "Progress tracked through linked sessions",
      '"Needs time placement" alerts — no goal left behind',
    ],
    mockup: (
      <div className="rounded-2xl bg-[#141420] border-2 border-red-500/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-lg font-black text-white" style={{ fontFamily: 'Nunito, sans-serif' }}>Goals</div>
          <div className="text-xs text-red-400 font-700" style={{ fontFamily: 'Nunito, sans-serif' }}>⚠ 2 need time</div>
        </div>
        {[
          { title: 'Launch MVP Feature', area: 'Work', color: '#3B82F6', progress: 75, sessions: '3/4', ok: true },
          { title: 'Run 3x per week', area: 'Health', color: '#10B981', progress: 60, sessions: '3/5', ok: true },
          { title: 'Learn TypeScript', area: 'Learning', color: '#F59E0B', progress: 0, sessions: '0/0', ok: false },
          { title: 'Read 2 books', area: 'Creative', color: '#8B5CF6', progress: 50, sessions: '1/2', ok: true },
        ].map((goal) => (
          <div
            key={goal.title}
            className="bg-[#1c1c2e] rounded-xl p-3 border"
            style={{ borderColor: goal.ok ? `${goal.color}30` : '#ef444440', borderLeft: `3px solid ${goal.ok ? goal.color : '#ef4444'}` }}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-xs font-700 text-white" style={{ fontFamily: 'Nunito, sans-serif' }}>{goal.title}</div>
                <div className="text-xs font-600" style={{ color: goal.color, fontFamily: 'Nunito, sans-serif' }}>{goal.area}</div>
              </div>
              {!goal.ok && <span className="text-xs text-red-400 font-700" style={{ fontFamily: 'Nunito, sans-serif' }}>No block ⚠</span>}
              {goal.ok && <span className="text-xs text-gray-400" style={{ fontFamily: 'Nunito, sans-serif' }}>{goal.sessions}</span>}
            </div>
            {goal.ok && (
              <div className="h-1 bg-[#2c2c44] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${goal.progress}%`, background: goal.color }} />
              </div>
            )}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'voice',
    label: "🎤 Voice",
    headline: "Talk to Your Coach",
    color: '#06B6D4',
    description: "Speak naturally and your coach responds in character. Check the agenda, snooze a session, review goals — all hands-free with voice recognition built in.",
    points: [
      '"What\'s on my agenda?" — instant briefing by voice',
      '"Snooze" or "Complete" — coach responds in character',
      '"Goal review" — which goals need attention',
      'Animated pulse rings while listening',
    ],
    mockup: (
      <div className="rounded-2xl bg-[#141420] border-2 border-cyan-500/30 p-4 space-y-3">
        <div className="flex justify-center py-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping" />
            <div className="absolute inset-[-8px] rounded-full border border-cyan-500/20 animate-pulse" />
            <div className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center text-3xl font-black text-cyan-400" style={{ fontFamily: 'Nunito, sans-serif' }}>
              🎤
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { role: 'user', text: "What's on my agenda?" },
            { role: 'coach', text: 'You have 6 sessions today — 4 done, 2 pending. Next: Client Review at 2 PM. Lock in.' },
            { role: 'user', text: 'Goal review' },
            { role: 'coach', text: '"Learn TypeScript" has no block. Schedule it or kill it. No more middle.' },
          ].map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[80%] px-3 py-2 rounded-xl text-xs"
                style={{
                  background: msg.role === 'user' ? '#06B6D420' : '#1c1c2e',
                  color: msg.role === 'user' ? '#06B6D4' : '#d1d5db',
                  border: `1px solid ${msg.role === 'user' ? '#06B6D440' : '#2c2c44'}`,
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-[#1c1c2e] rounded-xl px-3 py-2 border border-white/10">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400 flex-1" style={{ fontFamily: 'Space Grotesk' }}>Listening...</span>
          <span className="text-xs text-cyan-400 font-700" style={{ fontFamily: 'Nunito, sans-serif' }}>TAP TO SPEAK</span>
        </div>
      </div>
    ),
  },
];

export default function FeaturesSection() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const titleRef = useScrollReveal();
  const active = TABS.find((t) => t.id === activeTab)!;

  return (
    <section id="features" className="py-24 px-6 relative overflow-hidden bg-[#0e0e1a]">
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div ref={titleRef} className="fade-in-section text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border-2 border-blue-500/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-blue-400 text-sm font-700" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
              🛠 App Features
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Everything You Need to{' '}
            <span className="text-purple-400">Stay Accountable</span>
          </h2>
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2.5 rounded-xl font-700 text-sm transition-all duration-200"
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                background: activeTab === tab.id ? tab.color : 'transparent',
                color: activeTab === tab.id ? '#0c0c14' : '#9ca3af',
                border: `2px solid ${activeTab === tab.id ? tab.color : '#2c2c44'}`,
                boxShadow: activeTab === tab.id ? `3px 3px 0 ${tab.color}50` : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left — info */}
          <div>
            <h3
              className="text-3xl font-black text-white mb-4"
              style={{ fontFamily: 'Nunito, sans-serif', color: active.color }}
            >
              {active.headline}
            </h3>
            <p className="text-base text-gray-400 mb-6 leading-relaxed" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {active.description}
            </p>
            <ul className="space-y-3">
              {active.points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-black"
                    style={{ background: `${active.color}20`, color: active.color }}
                  >
                    ✓
                  </span>
                  <span className="text-sm text-gray-300" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {point}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-8 px-6 py-3 rounded-xl font-black text-sm transition-all hover:brightness-110"
              style={{
                background: active.color,
                color: '#0c0c14',
                fontFamily: 'Nunito, sans-serif',
                border: `2px solid ${active.color}`,
                boxShadow: `4px 4px 0 ${active.color}50`,
              }}
            >
              Try This Feature →
            </button>
          </div>

          {/* Right — mockup */}
          <div className="transition-all duration-300">
            {active.mockup}
          </div>
        </div>
      </div>
    </section>
  );
}
