import express, { type Request, type Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

interface PlanCatalogEntry {
  tier: 'pro' | 'max';
  billingCycle: 'monthly' | 'annual';
  name: string;
  description: string;
  unitAmountCents: number;
  savingsCents: number;
  interval: 'month' | 'year';
  envPriceVar: string;
}

const PLAN_CATALOG: Record<string, PlanCatalogEntry> = {
  pro_monthly: {
    tier: 'pro',
    billingCycle: 'monthly',
    name: 'HeyCoach Pro — Monthly ($5/mo)',
    description: 'All 4 Standard Coach Personas (Drill, Core, Builder, Zen), unlimited goals, 7-day calendar planner, Intensity 1–4.',
    unitAmountCents: 500,
    savingsCents: 0,
    interval: 'month',
    envPriceVar: 'STRIPE_PRICE_PRO_MONTHLY',
  },
  pro_annual: {
    tier: 'pro',
    billingCycle: 'annual',
    name: 'HeyCoach Pro — Annual ($50/yr · Save $10)',
    description: 'All 4 Standard Coach Personas, unlimited goals, 7-day calendar planner — 2 months free.',
    unitAmountCents: 5000,
    savingsCents: 1000,
    interval: 'year',
    envPriceVar: 'STRIPE_PRICE_PRO_ANNUAL',
  },
  max_monthly: {
    tier: 'max',
    billingCycle: 'monthly',
    name: 'HeyCoach Max · Build Your Own Agent — Monthly ($10/mo)',
    description: 'All 4 Standard Coaches + Build 4 Custom AI Coach Agents (Workout, Goal-Setting, Deep Work, Recovery), Level 5 Intensity & Live Voice.',
    unitAmountCents: 1000,
    savingsCents: 0,
    interval: 'month',
    envPriceVar: 'STRIPE_PRICE_MAX_MONTHLY',
  },
  max_annual: {
    tier: 'max',
    billingCycle: 'annual',
    name: 'HeyCoach Max · Build Your Own Agent — Annual ($100/yr · Save $20)',
    description: 'Full year upfront ($100 instead of $120/yr — $20 annual savings). All 4 Standard Coaches + 4 Build-Your-Own Custom Coach Agents.',
    unitAmountCents: 10000,
    savingsCents: 2000,
    interval: 'year',
    envPriceVar: 'STRIPE_PRICE_MAX_ANNUAL',
  },
};

function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    return null;
  }
  return new Stripe(secretKey);
}

async function startServer() {
  const app = express();

  // Raw body parser exclusively for Stripe webhook signature verification
  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    async (req: Request, res: Response) => {
      const stripe = getStripeClient();
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

      if (!stripe || !webhookSecret) {
        res.status(200).json({
          received: true,
          mode: 'sandbox_preview',
          message: 'Webhook endpoint ready. Configure STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to verify live Stripe events.',
        });
        return;
      }

      const signature = req.headers['stripe-signature'];
      if (!signature || typeof signature !== 'string') {
        res.status(400).json({ error: 'Missing stripe-signature header' });
        return;
      }

      try {
        const event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
        res.status(200).json({ received: true, type: event.type });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid signature';
        res.status(400).json({ error: `Webhook Error: ${message}` });
      }
    }
  );

  app.use(express.json({ limit: '64kb' }));

  // Health & Stripe Connection Status Endpoint
  app.get('/api/stripe/status', (_req: Request, res: Response) => {
    const stripe = getStripeClient();
    res.json({
      configured: Boolean(stripe),
      mode: stripe ? 'live_stripe' : 'sandbox_preview',
      webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim()),
      catalog: Object.entries(PLAN_CATALOG).map(([key, item]) => ({
        key,
        tier: item.tier,
        billingCycle: item.billingCycle,
        unitAmountCents: item.unitAmountCents,
        savingsCents: item.savingsCents,
        priceIdConfigured: Boolean(process.env[item.envPriceVar]?.trim()),
      })),
    });
  });

  // Create Stripe Checkout Session (or return Sandbox Preview payload when STRIPE_SECRET_KEY is not yet set)
  app.post('/api/stripe/create-checkout-session', async (req: Request, res: Response) => {
    try {
      const { tier, billingCycle, userId, email, intentId } = req.body as {
        tier?: string;
        billingCycle?: string;
        userId?: string;
        email?: string;
        intentId?: string;
      };

      if (!tier || !billingCycle || !userId) {
        res.status(400).json({ error: 'Missing required fields: tier, billingCycle, userId' });
        return;
      }

      if (tier === 'starter') {
        res.json({
          mode: 'free_tier',
          tier: 'starter',
          billingCycle: 'free',
          amountCents: 0,
          savingsCents: 0,
        });
        return;
      }

      const planKey = `${tier}_${billingCycle}`;
      const plan = PLAN_CATALOG[planKey];
      if (!plan) {
        res.status(400).json({ error: `Invalid membership plan combination: ${planKey}` });
        return;
      }

      const stripe = getStripeClient();
      const originHeader = req.headers.origin;
      const baseUrl =
        (typeof originHeader === 'string' && originHeader.startsWith('http')
          ? originHeader
          : process.env.APP_URL?.trim()) || `http://localhost:${PORT}`;

      if (!stripe) {
        // Stripe secret key intentionally deferred — return structured sandbox preview session
        const previewSessionId = `cs_preview_${planKey}_${Date.now()}`;
        res.json({
          mode: 'sandbox_preview',
          configured: false,
          sessionId: previewSessionId,
          url: null,
          plan: {
            name: plan.name,
            description: plan.description,
            tier: plan.tier,
            billingCycle: plan.billingCycle,
            unitAmountCents: plan.unitAmountCents,
            savingsCents: plan.savingsCents,
            interval: plan.interval,
          },
          message:
            'Stripe Checkout wiring is ready. Add STRIPE_SECRET_KEY in your environment variables when ready to process live cards.',
        });
        return;
      }

      const configuredPriceId = process.env[plan.envPriceVar]?.trim();

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: email || undefined,
        client_reference_id: userId,
        metadata: {
          userId,
          tier: plan.tier,
          billingCycle: plan.billingCycle,
          intentId: intentId || '',
        },
        line_items: configuredPriceId
          ? [{ price: configuredPriceId, quantity: 1 }]
          : [
              {
                quantity: 1,
                price_data: {
                  currency: 'usd',
                  unit_amount: plan.unitAmountCents,
                  recurring: { interval: plan.interval },
                  product_data: {
                    name: plan.name,
                    description: plan.description,
                  },
                },
              },
            ],
        success_url: `${baseUrl}/app?tab=membership&checkout=success&tier=${plan.tier}&cycle=${plan.billingCycle}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/app?tab=membership&checkout=canceled`,
      });

      res.json({
        mode: 'live_stripe',
        configured: true,
        sessionId: session.id,
        url: session.url,
        plan: {
          name: plan.name,
          description: plan.description,
          tier: plan.tier,
          billingCycle: plan.billingCycle,
          unitAmountCents: plan.unitAmountCents,
          savingsCents: plan.savingsCents,
          interval: plan.interval,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create checkout session';
      res.status(500).json({ error: message });
    }
  });

  // Create Stripe Customer Billing Portal Session
  app.post('/api/stripe/create-portal-session', async (req: Request, res: Response) => {
    try {
      const { stripeCustomerId } = req.body as { stripeCustomerId?: string };
      const stripe = getStripeClient();
      const originHeader = req.headers.origin;
      const baseUrl =
        (typeof originHeader === 'string' && originHeader.startsWith('http')
          ? originHeader
          : process.env.APP_URL?.trim()) || `http://localhost:${PORT}`;

      if (!stripe || !stripeCustomerId) {
        res.json({
          mode: 'sandbox_preview',
          configured: Boolean(stripe),
          url: null,
          message:
            'Billing portal runs in local Firebase preview mode until STRIPE_SECRET_KEY and a live Stripe Customer ID are connected.',
        });
        return;
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${baseUrl}/app?tab=membership`,
      });

      res.json({
        mode: 'live_stripe',
        configured: true,
        url: portalSession.url,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create portal session';
      res.status(500).json({ error: message });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use((_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HeyCoach full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start HeyCoach server:', err);
  process.exit(1);
});
