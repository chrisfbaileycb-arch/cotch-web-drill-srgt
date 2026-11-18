import { Link } from 'react-router-dom';

export default function Footer() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0a0a12] border-t border-white/10 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-black text-white" style={{ fontFamily: 'Nunito, sans-serif' }}>
                HEY<span className="text-amber-400">COACH</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Your AI accountability partner. Goals, calendar, and coach synced in real time with Firebase.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Product</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button onClick={() => scrollTo('personas')} className="hover:text-amber-400 transition-colors">
                  Coach Personas
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('features')} className="hover:text-amber-400 transition-colors">
                  Planner & Goals
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('intensity')} className="hover:text-amber-400 transition-colors">
                  Intensity Levels
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('cta')} className="hover:text-amber-400 transition-colors">
                  3-Tier Membership
                </button>
              </li>
            </ul>
          </div>

          {/* Workspace */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Workspace</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link to="/app?tab=today" className="hover:text-amber-400 transition-colors">
                  Today Agenda
                </Link>
              </li>
              <li>
                <Link to="/app?tab=planner" className="hover:text-amber-400 transition-colors">
                  7-Day Calendar
                </Link>
              </li>
              <li>
                <Link to="/app?tab=coach" className="hover:text-amber-400 transition-colors">
                  Voice Check-In
                </Link>
              </li>
              <li>
                <Link to="/app?tab=membership" className="hover:text-amber-400 transition-colors">
                  Billing & Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Membership Summary */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Plans</h4>
            <ul className="space-y-2 text-xs text-gray-400 tabular-nums">
              <li>Starter — $0 Forever</li>
              <li>Pro Coach — $5/mo or $50/yr</li>
              <li className="text-amber-400 font-semibold">Max — $10/mo or $100/yr (Save $20)</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© 2026 HeyCoach. All rights reserved.</p>
          <p className="text-xs text-gray-600">Firebase Auth · Firestore Security Rules · Stripe Checkout Ready</p>
        </div>
      </div>
    </footer>
  );
}
