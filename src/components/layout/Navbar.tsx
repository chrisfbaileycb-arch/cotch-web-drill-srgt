import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '@/contexts/FirebaseContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const navItems = [
    { label: 'Coaches', id: 'personas' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Features', id: 'features' },
    { label: 'Intensity', id: 'intensity' },
    { label: 'Membership', id: 'cta' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        scrolled
          ? 'bg-[#0c0c14]/95 backdrop-blur-md border-b border-white/10 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-xl font-black text-white tracking-tight whitespace-nowrap shrink-0"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          HEY<span className="text-amber-400">COACH</span>
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <div className="hidden md:flex items-center gap-7">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-sm font-bold text-gray-300 hover:text-amber-400 transition-colors relative group whitespace-nowrap shrink-0"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-200" />
            </button>
          ))}
        </div>

        {/* Zone 3: 1 Primary Action */}
        <div className="hidden md:flex items-center shrink-0">
          <button
            onClick={() => navigate('/app')}
            className="chunky-btn bg-amber-400 text-[#0c0c14] px-5 py-2.5 rounded-xl text-sm whitespace-nowrap shrink-0"
            style={{ borderColor: '#92400e', boxShadow: '4px 4px 0 #92400e' }}
          >
            {user ? 'Open Workspace' : 'Launch Workspace'}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          aria-label="Toggle navigation menu"
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
        <div className="md:hidden bg-[#0c0c14]/98 border-t border-white/10 px-6 py-4 flex flex-col gap-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-left text-base font-extrabold text-gray-200 hover:text-amber-400 transition-colors"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              navigate('/app');
            }}
            className="chunky-btn bg-amber-400 text-[#0c0c14] px-5 py-3 rounded-xl text-sm w-full mt-2"
            style={{ borderColor: '#92400e', boxShadow: '4px 4px 0 #92400e' }}
          >
            {user ? 'Open Workspace' : 'Launch Workspace'}
          </button>
        </div>
      )}
    </nav>
  );
}
