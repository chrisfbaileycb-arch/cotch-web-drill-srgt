export default function Footer() {
  return (
    <footer className="bg-[#0a0a12] border-t-2 border-white/5 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-lg font-black text-[#0c0c14] border-2 border-amber-600 shadow-[2px_2px_0_#78350f]">
                🏆
              </div>
              <span className="text-lg font-black text-white" style={{ fontFamily: 'Nunito, sans-serif' }}>
                HEY<span className="text-amber-400">COACH</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Your AI accountability partner. Goals, calendar, coach — all in one.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-700 text-white mb-3" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
              Product
            </h4>
            <ul className="space-y-2">
              {['Features', 'Personas', 'Pricing', 'Changelog'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-xs text-gray-500 hover:text-amber-400 transition-colors" style={{ fontFamily: 'Space Grotesk' }}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-700 text-white mb-3" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
              Company
            </h4>
            <ul className="space-y-2">
              {['About', 'Blog', 'Careers', 'Contact'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-xs text-gray-500 hover:text-amber-400 transition-colors" style={{ fontFamily: 'Space Grotesk' }}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-700 text-white mb-3" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
              Legal
            </h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-xs text-gray-500 hover:text-amber-400 transition-colors" style={{ fontFamily: 'Space Grotesk' }}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600" style={{ fontFamily: 'Space Grotesk' }}>
            © 2026 HeyCoach. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-600" style={{ fontFamily: 'Space Grotesk' }}>Built with ❤️ and accountability</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
