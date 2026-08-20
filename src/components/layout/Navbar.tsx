import { useState, useEffect } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0c0c14]/95 backdrop-blur-md border-b-2 border-amber-500/30 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500 border-2 border-amber-300 flex items-center justify-center text-xl font-black text-[#0c0c14] shadow-[3px_3px_0_#92400e] group-hover:shadow-[5px_5px_0_#92400e] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
            🏆
          </div>
          <span className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>
            HEY<span className="text-amber-400">COACH</span>
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Coaches', id: 'personas' },
            { label: 'Features', id: 'features' },
            { label: 'How It Works', id: 'how-it-works' },
            { label: 'Intensity', id: 'intensity' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-sm font-700 text-gray-300 hover:text-amber-400 transition-colors relative group"
              style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-200" />
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => scrollTo('cta')}
            className="chunky-btn text-[#0c0c14] bg-amber-400 text-amber-900 px-5 py-2.5 rounded-xl text-sm"
            style={{ borderColor: '#92400e', boxShadow: '4px 4px 0 #92400e' }}
          >
            Get Started Free 🚀
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className={`w-6 h-0.5 bg-white transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-6 h-0.5 bg-white transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`w-6 h-0.5 bg-white transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0c0c14]/98 border-t-2 border-amber-500/30 px-6 py-4 flex flex-col gap-4">
          {[
            { label: 'Coaches', id: 'personas' },
            { label: 'Features', id: 'features' },
            { label: 'How It Works', id: 'how-it-works' },
            { label: 'Intensity', id: 'intensity' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-left text-lg font-800 text-gray-200 hover:text-amber-400 transition-colors"
              style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800 }}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo('cta')}
            className="chunky-btn bg-amber-400 text-amber-900 px-5 py-3 rounded-xl text-base w-full mt-2"
            style={{ borderColor: '#92400e', boxShadow: '4px 4px 0 #92400e' }}
          >
            Get Started Free 🚀
          </button>
        </div>
      )}
    </nav>
  );
}
