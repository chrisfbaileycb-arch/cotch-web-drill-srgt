const ITEMS = [
  '⚡ Execute Without Excuses',
  '🏆 Own Your Agenda',
  '🚀 Ship Every Block',
  '🌿 Find Your Flow',
  '🎯 Goals Need Calendar Time',
  '🎤 Voice-First Coaching',
  '🤖 AI-Powered Briefings',
  '📅 Smart Daily Planner',
  '🔥 4 Coach Personas',
  '💪 Intensity You Control',
];

export default function TickerBanner() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="relative bg-amber-500 border-y-4 border-amber-600 py-3 overflow-hidden">
      <div className="flex gap-0 animate-ticker whitespace-nowrap" style={{ width: 'max-content' }}>
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-block px-8 text-amber-900 font-black text-sm"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {item}
            <span className="mx-4 opacity-40">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
