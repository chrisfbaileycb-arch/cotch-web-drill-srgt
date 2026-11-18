import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useFirebase } from '@/contexts/FirebaseContext';
import { MEMBERSHIP_TIERS } from '@/lib/membership';
import { Check } from 'lucide-react';

const COMPARISON_ROWS = [
  {
    capability: 'Monthly Billing',
    starter: '$0 / mo',
    pro: '$5 / mo',
    max: '$10 / mo',
  },
  {
    capability: 'Annual Upfront Option',
    starter: '$0 / yr',
    pro: '$50 / yr (Save $10)',
    max: '$100 / yr (Save $20)',
  },
  {
    capability: 'Standard AI Coach Personas',
    starter: '1 (Coach Core)',
    pro: 'All 4 Standard Coaches',
    max: 'All 4 Standard Coaches',
  },
  {
    capability: 'Build Your Own Agent Studio',
    starter: '—',
    pro: '—',
    max: '4 Custom Persona & Accountability Coaches (8 Total)',
  },
  {
    capability: 'Custom Coach Specialties & Protocols',
    starter: '—',
    pro: 'Standard presets only',
    max: 'Workout, Goal-Setting, Deep Work, Recovery & Custom',
  },
  {
    capability: 'Active Accountability Goals',
    starter: 'Up to 5 goals',
    pro: 'Unlimited goals',
    max: 'Unlimited goals',
  },
  {
    capability: 'Coaching Intensity Range',
    starter: 'Levels 1–2 (Calm)',
    pro: 'Levels 1–4 (Sharp)',
    max: 'All 5 Levels (incl. Maximum)',
  },
  {
    capability: '7-Day Calendar Grid & Drift Alerts',
    starter: 'Daily view only',
    pro: 'Full 7-day planner + alerts',
    max: 'Full planner + snooze guardrails',
  },
  {
    capability: 'Hands-Free Live Voice Coaching',
    starter: 'Text check-ins',
    pro: 'Text check-ins',
    max: 'Live Mic + Spoken Dispatch',
  },
];

export default function CTASection() {
  const titleRef = useScrollReveal();
  const { user, account, stripeStatus, openCheckoutModal } = useFirebase();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <section id="cta" className="py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #0c0c14 0%, #161028 50%, #0c0c14 100%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div ref={titleRef} className="fade-in-section text-center mb-12">
          <p className="text-sm font-bold text-amber-400 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
            3-Tier Accountability Platform · Firebase Synced · {stripeStatus.configured ? 'Stripe Live' : 'Stripe Checkout Ready'}
          </p>
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4"
            style={{ fontFamily: 'Nunito, sans-serif', textWrap: 'balance' }}
          >
            Simple Membership Built for{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Daily Execution
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Start free with Coach Core, step up to $5/mo for all 4 standard coaches, or unlock the $10/mo Build Your Own Agent tier ($100/yr upfront — save $20) to engineer 4 custom AI persona & accountability coaches.
          </p>

          {/* Interactive Monthly / Annual Segmented Control */}
          <div className="inline-flex items-center gap-1 p-1.5 rounded-xl bg-[#141420] border border-white/15">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${
                billingCycle === 'monthly'
                  ? 'bg-white text-[#0c0c14]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly Billing ($5 / $10)
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${
                billingCycle === 'annual'
                  ? 'bg-amber-400 text-[#0c0c14]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Annual Upfront · $100/yr (Save $20)
            </button>
          </div>
        </div>

        {/* 3-Tier Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 items-stretch">
          {MEMBERSHIP_TIERS.map((plan) => {
            const isStarter = plan.tier === 'starter';
            const displayPrice = isStarter
              ? '$0'
              : billingCycle === 'annual'
              ? `$${plan.annualPriceDollars}`
              : `$${plan.monthlyPriceDollars}`;
            const periodLabel = isStarter
              ? 'forever'
              : billingCycle === 'annual'
              ? 'per year upfront'
              : 'per month';

            const isCurrentUserPlan =
              Boolean(user) &&
              account?.tier === plan.tier &&
              (isStarter || account?.billingCycle === billingCycle);

            return (
              <div
                key={plan.tier}
                className="relative rounded-3xl p-7 flex flex-col transition-transform duration-200 hover:-translate-y-1"
                style={{
                  background: plan.highlight ? '#181322' : '#141420',
                  border: `2px solid ${plan.highlight ? plan.accentColor : 'rgba(255,255,255,0.12)'}`,
                  boxShadow: plan.highlight ? `6px 6px 0 ${plan.borderColor}` : 'none',
                }}
              >
                <div className="text-xs text-gray-400 mb-1">{plan.audience}</div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3
                    className="text-2xl font-black text-white"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    {plan.name}
                  </h3>
                  {plan.highlight && (
                    <span className="text-xs font-bold text-amber-400 whitespace-nowrap">
                      Recommended
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1.5 mb-1 tabular-nums">
                  <span
                    className="text-4xl sm:text-5xl font-black"
                    style={{ color: plan.accentColor, fontFamily: 'Nunito, sans-serif' }}
                  >
                    {displayPrice}
                  </span>
                  <span className="text-gray-400 text-sm">/ {periodLabel}</span>
                </div>

                <div className="text-xs text-gray-400 mb-5 min-h-[20px] tabular-nums">
                  {!isStarter && billingCycle === 'annual' ? (
                    <span className="text-emerald-400 font-semibold">
                      Save ${plan.annualSavingsDollars}/year vs ${plan.monthlyPriceDollars * 12}/yr (${plan.annualEffectiveMonthlyDollars}/mo)
                    </span>
                  ) : !isStarter ? (
                    <span>
                      Or pay ${plan.annualPriceDollars}/yr upfront & save ${plan.annualSavingsDollars}
                    </span>
                  ) : (
                    <span>Free entry tier · Instant Google Sign-In</span>
                  )}
                </div>

                <p className="text-xs text-gray-400 leading-relaxed mb-5">
                  {plan.tagline}
                </p>

                <ul className="space-y-2.5 mb-7 flex-1 border-t border-white/10 pt-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-200">
                      <Check
                        className="w-4 h-4 shrink-0 mt-0.5"
                        style={{ color: plan.accentColor }}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => openCheckoutModal(plan.tier, billingCycle)}
                  className="w-full py-3.5 rounded-xl font-black text-sm transition-all hover:brightness-110 whitespace-nowrap"
                  style={{
                    background: plan.highlight ? plan.accentColor : 'transparent',
                    color: plan.highlight ? '#0c0c14' : plan.accentColor,
                    fontFamily: 'Nunito, sans-serif',
                    border: `2px solid ${plan.accentColor}`,
                  }}
                >
                  {isCurrentUserPlan
                    ? 'Current Active Plan ✓'
                    : isStarter
                    ? 'Start Free ($0) →'
                    : billingCycle === 'annual'
                    ? `Choose ${plan.name} ($${plan.annualPriceDollars}/yr · Save $${plan.annualSavingsDollars}) →`
                    : `Choose ${plan.name} ($${plan.monthlyPriceDollars}/mo) →`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Concrete Comparison Matrix */}
        <div className="rounded-2xl bg-[#141420] border border-white/10 overflow-hidden mb-10">
          <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-base font-black text-white">3-Tier Feature & Quota Matrix</h3>
            <span className="text-xs text-gray-400">
              Upgrade, downgrade, or switch to the $100/yr annual plan anytime
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm tabular-nums">
              <thead className="bg-[#0e0e18] text-gray-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Capability</th>
                  <th className="px-6 py-3.5 font-semibold text-emerald-400">Starter ($0)</th>
                  <th className="px-6 py-3.5 font-semibold text-amber-400">Pro Coach ($5/mo)</th>
                  <th className="px-6 py-3.5 font-semibold text-red-400">Max ($10/mo · $100/yr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.capability} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-3 font-medium text-white">{row.capability}</td>
                    <td className="px-6 py-3">{row.starter}</td>
                    <td className="px-6 py-3">{row.pro}</td>
                    <td className="px-6 py-3 font-semibold text-white">{row.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-gray-500 text-xs">
          Firebase Authentication & Firestore Real-Time Sync · Cancel anytime · Stripe Checkout connection pre-wired
        </p>
      </div>
    </section>
  );
}
