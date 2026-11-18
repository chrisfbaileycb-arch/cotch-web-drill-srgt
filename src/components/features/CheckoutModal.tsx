import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase, type PendingCheckoutPreview } from '@/contexts/FirebaseContext';
import { getTierSpec, type MembershipTier } from '@/lib/membership';
import { Check, Lock, ShieldCheck, X } from 'lucide-react';

export default function CheckoutModal() {
  const {
    user,
    account,
    stripeStatus,
    checkoutModalState,
    closeCheckoutModal,
    startPlanCheckout,
    confirmSandboxPlanActivation,
  } = useFirebase();

  const navigate = useNavigate();

  const [selectedTier, setSelectedTier] = useState<MembershipTier>(checkoutModalState.tier);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(checkoutModalState.cycle);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewSession, setPreviewSession] = useState<PendingCheckoutPreview | null>(null);
  const [activatedSuccess, setActivatedSuccess] = useState(false);

  useEffect(() => {
    if (checkoutModalState.open) {
      setSelectedTier(checkoutModalState.tier);
      setBillingCycle(checkoutModalState.cycle);
      setError(null);
      setPreviewSession(null);
      setActivatedSuccess(false);
    }
  }, [checkoutModalState.open, checkoutModalState.tier, checkoutModalState.cycle]);

  if (!checkoutModalState.open) return null;

  const spec = getTierSpec(selectedTier);
  const isStarter = selectedTier === 'starter';
  const unitAmountDollars = isStarter
    ? 0
    : billingCycle === 'annual'
    ? spec.annualPriceDollars
    : spec.monthlyPriceDollars;
  const standardAnnualDollars = spec.monthlyPriceDollars * 12;
  const savingsDollars = !isStarter && billingCycle === 'annual' ? spec.annualSavingsDollars : 0;

  const handleContinue = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const result = await startPlanCheckout(selectedTier, billingCycle);
      if (result === 'activated_free') {
        setActivatedSuccess(true);
      } else if (result === 'redirecting') {
        // Browser is navigating to Stripe Hosted Checkout
      } else {
        setPreviewSession(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start checkout');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivatePreview = async () => {
    if (!previewSession) return;
    setError(null);
    setSubmitting(true);
    try {
      await confirmSandboxPlanActivation(previewSession);
      setActivatedSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate membership in Firebase');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToWorkspace = () => {
    closeCheckoutModal();
    navigate('/app');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#141420] border border-white/15 p-6 sm:p-8 text-white shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          onClick={closeCheckoutModal}
          aria-label="Close membership dialog"
          className="absolute top-5 right-5 w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/25 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {activatedSuccess ? (
          <div className="space-y-5 py-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">
                {spec.name} Membership Active
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Synced to Firebase Firestore (`users/{user?.uid.slice(0, 8)}…/private/account`).
              </p>
            </div>
            <div className="rounded-xl bg-[#0e0e18] border border-white/10 p-4 text-left space-y-2 text-sm tabular-nums">
              <div className="flex justify-between">
                <span className="text-gray-400">Active Plan</span>
                <span className="font-bold text-white">{spec.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Billing Cadence</span>
                <span className="font-bold text-amber-400 capitalize">
                  {isStarter ? 'Free Forever' : billingCycle}
                </span>
              </div>
              {savingsDollars > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Upfront Annual Savings</span>
                  <span className="font-bold text-emerald-400">${savingsDollars}.00 saved/yr</span>
                </div>
              )}
            </div>
            <button
              onClick={handleGoToWorkspace}
              className="w-full py-3.5 rounded-xl bg-amber-400 text-[#0c0c14] font-black text-sm hover:brightness-110 transition-all"
            >
              Open Coaching Workspace →
            </button>
          </div>
        ) : previewSession ? (
          <div className="space-y-5">
            <div>
              <p className="text-xs text-amber-400 font-semibold">
                Stripe Checkout Wiring · Sandbox Preview Mode
              </p>
              <h3 className="text-2xl font-black text-white mt-1">
                Confirm {spec.name} Plan
              </h3>
              <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                {previewSession.message}
              </p>
            </div>

            <div className="rounded-xl bg-[#0e0e18] border border-white/10 p-4 space-y-2.5 text-sm tabular-nums">
              <div className="flex justify-between">
                <span className="text-gray-400">Firestore Intent ID</span>
                <span className="font-mono text-xs text-gray-300">{previewSession.intentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Plan Tier</span>
                <span className="font-semibold text-white">{previewSession.planName}</span>
              </div>
              {billingCycle === 'annual' && !isStarter && (
                <>
                  <div className="flex justify-between text-gray-400">
                    <span>12 Months @ ${spec.monthlyPriceDollars}/mo</span>
                    <span className="line-through">${standardAnnualDollars}.00</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Upfront Annual Discount</span>
                    <span>-${savingsDollars}.00</span>
                  </div>
                </>
              )}
              <div className="border-t border-white/10 pt-2.5 flex justify-between text-base font-black">
                <span className="text-white">Total Configured</span>
                <span className="text-amber-400">
                  ${(previewSession.amountCents / 100).toFixed(2)} / {billingCycle === 'annual' ? 'yr' : 'mo'}
                </span>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewSession(null)}
                disabled={submitting}
                className="px-4 py-3 rounded-xl border border-white/15 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleActivatePreview}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-amber-400 text-[#0c0c14] font-black text-sm hover:brightness-110 transition-all disabled:opacity-50"
              >
                {submitting ? 'Syncing Firebase…' : 'Activate Plan in Firebase'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-xs text-gray-400">
                HeyCoach 3-Tier Membership · {stripeStatus.configured ? 'Stripe Live Connected' : 'Stripe Endpoint Ready'}
              </p>
              <h3 className="text-2xl font-black text-white mt-1">
                Choose Your Coaching Membership
              </h3>
            </div>

            {/* Tier Switcher */}
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-[#0e0e18] border border-white/10">
              {(['starter', 'pro', 'max'] as MembershipTier[]).map((t) => {
                const item = getTierSpec(t);
                const active = selectedTier === t;
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedTier(t)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-amber-400 text-[#0c0c14]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>

            {/* Billing Cadence Switcher */}
            {!isStarter && (
              <div className="flex items-center justify-between rounded-xl bg-[#0e0e18] border border-white/10 p-3">
                <div>
                  <div className="text-sm font-bold text-white">Billing Cadence</div>
                  <div className="text-xs text-gray-400">
                    {selectedTier === 'max'
                      ? 'Pay $100 upfront for the year and save $20 vs $10/mo'
                      : 'Pay $50 upfront for the year and save $10 vs $5/mo'}
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-[#141420] p-1 rounded-lg border border-white/10 shrink-0">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
                      billingCycle === 'monthly'
                        ? 'bg-white text-[#0c0c14]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
                      billingCycle === 'annual'
                        ? 'bg-emerald-400 text-[#0c0c14]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Annual · Save ${spec.annualSavingsDollars}
                  </button>
                </div>
              </div>
            )}

            {/* Selected Plan Summary */}
            <div className="rounded-xl bg-[#0e0e18] border border-white/10 p-5 space-y-4">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <div className="text-lg font-black text-white">{spec.name}</div>
                  <div className="text-xs text-gray-400">{spec.audience}</div>
                </div>
                <div className="text-right tabular-nums">
                  <span className="text-3xl font-black text-white">${unitAmountDollars}</span>
                  <span className="text-xs text-gray-400 ml-1">
                    {isStarter ? '/ forever' : billingCycle === 'annual' ? '/ year' : '/ month'}
                  </span>
                  {!isStarter && billingCycle === 'annual' && (
                    <div className="text-xs text-emerald-400 font-semibold">
                      ${spec.annualEffectiveMonthlyDollars}/mo effective · Save ${savingsDollars}/yr
                    </div>
                  )}
                </div>
              </div>

              <ul className="space-y-2 border-t border-white/10 pt-4">
                {spec.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-xs text-gray-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {account && account.tier === selectedTier && (isStarter || account.billingCycle === billingCycle) && (
              <p className="text-xs text-emerald-400 text-center">
                This is already your active membership plan.
              </p>
            )}

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleContinue}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-amber-400 text-[#0c0c14] font-black text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Connecting…'
                  : !user
                  ? `Sign In with Google & Select ${spec.name}`
                  : isStarter
                  ? 'Switch to Free Starter Tier'
                  : stripeStatus.configured
                  ? `Proceed to Stripe Checkout ($${unitAmountDollars})`
                  : `Review & Activate ${spec.name} ($${unitAmountDollars}/${billingCycle === 'annual' ? 'yr' : 'mo'})`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
