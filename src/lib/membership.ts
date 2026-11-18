export type MembershipTier = 'starter' | 'pro' | 'max';
export type BillingCycle = 'free' | 'monthly' | 'annual';
export type BuiltInPersonaId = 'drill' | 'core' | 'builder' | 'zen';
export type CoachPersonaId = string; // BuiltInPersonaId or custom agentId ('custom_*')
export type LifeArea = 'Work' | 'Health' | 'Learning' | 'Finance' | 'Creative' | 'Relationships';
export type GoalHorizon = 'daily' | 'weekly' | 'monthly';
export type DayPart = 'morning' | 'midday' | 'evening';

export type CustomAgentSpecialty =
  | 'Workout & Fitness'
  | 'Goal Setting & Strategy'
  | 'Deep Work & Output'
  | 'Nutrition & Recovery'
  | 'Finance & Wealth'
  | 'Custom Accountability';

export type CustomAgentStyle =
  | 'Tactical & Direct'
  | 'High-Energy Athletic'
  | 'Socratic & Strategic'
  | 'Calm & Analytical';

export type CustomAgentAccentColor =
  | '#EF4444'
  | '#F59E0B'
  | '#10B981'
  | '#06B6D4'
  | '#8B5CF6'
  | '#EC4899';

export const CUSTOM_AGENT_SPECIALTIES: CustomAgentSpecialty[] = [
  'Workout & Fitness',
  'Goal Setting & Strategy',
  'Deep Work & Output',
  'Nutrition & Recovery',
  'Finance & Wealth',
  'Custom Accountability',
];

export const CUSTOM_AGENT_STYLES: CustomAgentStyle[] = [
  'Tactical & Direct',
  'High-Energy Athletic',
  'Socratic & Strategic',
  'Calm & Analytical',
];

export const CUSTOM_AGENT_COLORS: { hex: CustomAgentAccentColor; label: string }[] = [
  { hex: '#EF4444', label: 'Crimson' },
  { hex: '#F59E0B', label: 'Amber' },
  { hex: '#10B981', label: 'Emerald' },
  { hex: '#06B6D4', label: 'Cyan' },
  { hex: '#8B5CF6', label: 'Violet' },
  { hex: '#EC4899', label: 'Rose' },
];

export interface CustomAgentBlueprintPreset {
  id: string;
  label: string;
  name: string;
  specialty: CustomAgentSpecialty;
  tagline: string;
  coachingStyle: CustomAgentStyle;
  accountabilityProtocol: string;
  signaturePhrase: string;
  accentColor: CustomAgentAccentColor;
  defaultIntensity: number;
}

export const CUSTOM_AGENT_PRESETS: CustomAgentBlueprintPreset[] = [
  {
    id: 'workout',
    label: 'Workout & Strength Coach',
    name: 'Iron Rep Coach',
    specialty: 'Workout & Fitness',
    tagline: 'Progressive overload, zero skipped training blocks.',
    coachingStyle: 'High-Energy Athletic',
    accountabilityProtocol:
      'Hold me to 4 training sessions per week. Verify warm-up, main compound lifts, and post-workout mobility before marking any fitness block complete.',
    signaturePhrase: 'The bar is loaded and your training window is open. Let us get the reps in.',
    accentColor: '#EF4444',
    defaultIntensity: 4,
  },
  {
    id: 'goal_setting',
    label: 'Goal-Setting Strategist',
    name: 'North Star Architect',
    specialty: 'Goal Setting & Strategy',
    tagline: 'Break 90-day milestones into non-negotiable daily blocks.',
    coachingStyle: 'Socratic & Strategic',
    accountabilityProtocol:
      'Audit every active goal for a clear definition of done and force at least 2 calendar blocks per week for my highest-leverage milestone.',
    signaturePhrase: 'An unscheduled goal is just a wish. Which block moves the needle today?',
    accentColor: '#F59E0B',
    defaultIntensity: 3,
  },
  {
    id: 'deep_work',
    label: 'Deep Work Sprint Lead',
    name: 'Zero-Context Switcher',
    specialty: 'Deep Work & Output',
    tagline: 'Protect 90-minute maker blocks from shallow noise.',
    coachingStyle: 'Tactical & Direct',
    accountabilityProtocol:
      'Enforce single-task focus during morning blocks. Flag any session snoozed more than once and demand a shipped artifact before noon.',
    signaturePhrase: 'Close the tabs. Your 90-minute deep work sprint starts right now.',
    accentColor: '#8B5CF6',
    defaultIntensity: 5,
  },
  {
    id: 'recovery',
    label: 'Nutrition & Recovery Coach',
    name: 'Metabolic & Sleep Guard',
    specialty: 'Nutrition & Recovery',
    tagline: 'Fuel performance, protect sleep wind-down, prevent burnout.',
    coachingStyle: 'Calm & Analytical',
    accountabilityProtocol:
      'Check hydration, protein targets, and evening wind-down cutoffs so high output stays sustainable across the full week.',
    signaturePhrase: 'Recovery is where adaptation happens. Honor your evening cutoff tonight.',
    accentColor: '#10B981',
    defaultIntensity: 2,
  },
];

export interface MembershipPlanSpec {
  tier: MembershipTier;
  name: string;
  audience: string;
  tagline: string;
  accentColor: string;
  borderColor: string;
  monthlyPriceDollars: number;
  annualPriceDollars: number;
  annualEffectiveMonthlyDollars: string;
  annualSavingsDollars: number;
  monthlyCents: number;
  annualCents: number;
  annualSavingsCents: number;
  maxActiveGoals: number | null; // null = unlimited
  allowedPersonas: BuiltInPersonaId[];
  maxCustomAgents: number;
  maxIntensityLevel: number;
  voiceCoachingIncluded: boolean;
  driftAlertsIncluded: boolean;
  highlight?: boolean;
  badgeText?: string;
  features: string[];
}

export const MEMBERSHIP_TIERS: MembershipPlanSpec[] = [
  {
    tier: 'starter',
    name: 'Starter',
    audience: 'For daily habit starters',
    tagline: 'Build consistent daily execution with Coach Core and structured goal tracking.',
    accentColor: '#10B981',
    borderColor: '#064e3b',
    monthlyPriceDollars: 0,
    annualPriceDollars: 0,
    annualEffectiveMonthlyDollars: '0.00',
    annualSavingsDollars: 0,
    monthlyCents: 0,
    annualCents: 0,
    annualSavingsCents: 0,
    maxActiveGoals: 5,
    allowedPersonas: ['core'],
    maxCustomAgents: 0,
    maxIntensityLevel: 2,
    voiceCoachingIncluded: false,
    driftAlertsIncluded: false,
    features: [
      '1 Standard Coach Persona (Coach Core)',
      'Up to 5 active goals',
      'Intensity Levels 1–2 (Gentle & Steady)',
      'Today agenda & daily session check-offs',
      'Text coach check-ins',
    ],
  },
  {
    tier: 'pro',
    name: 'Pro Coach',
    audience: 'For all 4 standard AI coaches',
    tagline: 'Unlock all 4 standard AI Coach Personas, unlimited goals across 6 life areas, and the 7-day planner.',
    accentColor: '#F59E0B',
    borderColor: '#78350f',
    monthlyPriceDollars: 5,
    annualPriceDollars: 50,
    annualEffectiveMonthlyDollars: '4.17',
    annualSavingsDollars: 10,
    monthlyCents: 500,
    annualCents: 5000,
    annualSavingsCents: 1000,
    maxActiveGoals: null,
    allowedPersonas: ['drill', 'core', 'builder', 'zen'],
    maxCustomAgents: 0,
    maxIntensityLevel: 4,
    voiceCoachingIncluded: false,
    driftAlertsIncluded: true,
    features: [
      'All 4 Standard Coach Personas (Drill, Core, Builder, Zen)',
      'Unlimited goals across all 6 life areas',
      'Intensity Levels 1–4 (up to Sharp)',
      'Full 7-day time-grid calendar planner',
      'Unscheduled goal placement alerts',
    ],
  },
  {
    tier: 'max',
    name: 'Max · Build Your Own Agent',
    audience: '4 standard coaches + 4 custom-built agents',
    tagline:
      'Build up to 4 custom AI persona coaches (Workout Coach, Goal-Setting Coach, Deep Work Lead) with custom accountability protocols — $100/yr saves $20 upfront.',
    accentColor: '#EF4444',
    borderColor: '#7f1d1d',
    monthlyPriceDollars: 10,
    annualPriceDollars: 100,
    annualEffectiveMonthlyDollars: '8.33',
    annualSavingsDollars: 20,
    monthlyCents: 1000,
    annualCents: 10000,
    annualSavingsCents: 2000,
    maxActiveGoals: null,
    allowedPersonas: ['drill', 'core', 'builder', 'zen'],
    maxCustomAgents: 4,
    maxIntensityLevel: 5,
    voiceCoachingIncluded: true,
    driftAlertsIncluded: true,
    highlight: true,
    badgeText: 'Build Your Own Agents · Save $20/yr',
    features: [
      'Everything in Pro ($5 tier — all 4 standard coaches)',
      'Build Your Own Agent Studio: create 4 additional custom coaches (8 total roster)',
      'Custom Workout, Goal-Setting, Deep Work, or Recovery accountability protocols',
      'Level 5 "Maximum" Zero-Tolerance Intensity & snooze guardrails',
      'Hands-free live Voice Coaching & spoken dispatch in your custom agent’s persona',
      '$100/yr upfront option ($20 annual savings vs $10/mo)',
    ],
  },
];

export function getTierSpec(tier: MembershipTier): MembershipPlanSpec {
  return MEMBERSHIP_TIERS.find((t) => t.tier === tier) ?? MEMBERSHIP_TIERS[0];
}

export function getPricingTuple(
  tier: MembershipTier,
  cycle: 'monthly' | 'annual'
): {
  billingCycle: BillingCycle;
  priceCents: number;
  annualSavingsCents: number;
  displayPrice: string;
  cadenceLabel: string;
} {
  const spec = getTierSpec(tier);
  if (tier === 'starter') {
    return {
      billingCycle: 'free',
      priceCents: 0,
      annualSavingsCents: 0,
      displayPrice: '$0',
      cadenceLabel: 'forever free',
    };
  }
  if (cycle === 'annual') {
    return {
      billingCycle: 'annual',
      priceCents: spec.annualCents,
      annualSavingsCents: spec.annualSavingsCents,
      displayPrice: `$${spec.annualPriceDollars}`,
      cadenceLabel: `per year (save $${spec.annualSavingsDollars})`,
    };
  }
  return {
    billingCycle: 'monthly',
    priceCents: spec.monthlyCents,
    annualSavingsCents: 0,
    displayPrice: `$${spec.monthlyPriceDollars}`,
    cadenceLabel: 'per month',
  };
}

export interface PersonaInfo {
  id: string;
  name: string;
  tagline: string;
  color: string;
  emoji: string;
  defaultGreeting: string;
  isCustom?: boolean;
  specialty?: CustomAgentSpecialty;
  coachingStyle?: CustomAgentStyle;
  accountabilityProtocol?: string;
}

export const PERSONA_MAP: Record<BuiltInPersonaId, PersonaInfo> = {
  drill: {
    id: 'drill',
    name: 'Drill Sergeant',
    tagline: 'No excuses. Results only.',
    color: '#EF4444',
    emoji: '⚡',
    defaultGreeting: 'Eyes up. The clock is running — every unscheduled goal is drift.',
  },
  core: {
    id: 'core',
    name: 'Coach Core',
    tagline: 'Firm, warm, and direct.',
    color: '#F59E0B',
    emoji: '🏆',
    defaultGreeting: 'The day is moving. Let us lock your anchor blocks and stay ahead of the clock.',
  },
  builder: {
    id: 'builder',
    name: 'Builder',
    tagline: 'Ship progress every block.',
    color: '#8B5CF6',
    emoji: '🚀',
    defaultGreeting: 'Every calendar block is a commit. Cut scope if needed, but ship output today.',
  },
  zen: {
    id: 'zen',
    name: 'Zen Guide',
    tagline: 'Presence leads to depth.',
    color: '#10B981',
    emoji: '🌿',
    defaultGreeting: 'Clear the noise. Choose one high-clarity block and give it your undivided presence.',
  },
};

export interface CustomAgentSummary {
  agentId: string;
  slotIndex: number;
  name: string;
  specialty: CustomAgentSpecialty;
  tagline: string;
  coachingStyle: CustomAgentStyle;
  accountabilityProtocol: string;
  signaturePhrase: string;
  accentColor: CustomAgentAccentColor;
  defaultIntensity: number;
}

export function resolvePersonaInfo(
  personaId: string | undefined,
  customAgents: CustomAgentSummary[] = []
): PersonaInfo {
  if (personaId && personaId in PERSONA_MAP) {
    return PERSONA_MAP[personaId as BuiltInPersonaId];
  }
  const foundCustom = customAgents.find((a) => a.agentId === personaId);
  if (foundCustom) {
    return {
      id: foundCustom.agentId,
      name: foundCustom.name,
      tagline: `${foundCustom.specialty} · ${foundCustom.tagline}`,
      color: foundCustom.accentColor,
      emoji: '🛠',
      defaultGreeting: `${foundCustom.signaturePhrase} [Protocol: ${foundCustom.accountabilityProtocol}]`,
      isCustom: true,
      specialty: foundCustom.specialty,
      coachingStyle: foundCustom.coachingStyle,
      accountabilityProtocol: foundCustom.accountabilityProtocol,
    };
  }
  return PERSONA_MAP.core;
}

export const INTENSITY_LABELS: Record<number, { label: string; color: string; summary: string }> = {
  1: { label: 'Gentle', color: '#10B981', summary: 'Warm reminders, zero pressure' },
  2: { label: 'Steady', color: '#06B6D4', summary: 'Consistent cadence, calm tone' },
  3: { label: 'Firm', color: '#F59E0B', summary: 'Clear expectations & direct nudges' },
  4: { label: 'Sharp', color: '#F97316', summary: 'High urgency & time-box discipline' },
  5: { label: 'Maximum', color: '#EF4444', summary: 'Zero-tolerance accountability' },
};

export const LIFE_AREAS: { name: LifeArea; color: string }[] = [
  { name: 'Work', color: '#3B82F6' },
  { name: 'Health', color: '#10B981' },
  { name: 'Learning', color: '#F59E0B' },
  { name: 'Finance', color: '#06B6D4' },
  { name: 'Creative', color: '#8B5CF6' },
  { name: 'Relationships', color: '#EC4899' },
];

export function buildCoachReply(params: {
  prompt: string;
  persona: string;
  intensity: number;
  todayTotal: number;
  todayCompleted: number;
  unscheduledGoals: string[];
  nextSessionTitle?: string;
  customAgent?: CustomAgentSummary;
}): string {
  const {
    prompt,
    persona,
    intensity,
    todayTotal,
    todayCompleted,
    unscheduledGoals,
    nextSessionTitle,
    customAgent,
  } = params;
  const lower = prompt.toLowerCase();
  const remaining = Math.max(0, todayTotal - todayCompleted);

  const urgencySuffix =
    intensity >= 5
      ? ' Zero excuses — execute the block now.'
      : intensity === 4
      ? ' Fifteen-minute rule: start immediately.'
      : intensity === 3
      ? ' Keep your calendar honest today.'
      : ' Take it one block at a time.';

  // Custom Build-Your-Own Agent response synthesis
  if (customAgent) {
    const protocolNote = `Mandate (${customAgent.specialty}): ${customAgent.accountabilityProtocol}`;
    if (lower.includes('goal') || lower.includes('drift') || lower.includes('unscheduled')) {
      if (unscheduledGoals.length === 0) {
        return `${customAgent.name} [${customAgent.coachingStyle}]: "${customAgent.signaturePhrase}" All active goals have calendar blocks (${todayCompleted}/${todayTotal} done today). ${protocolNote}${urgencySuffix}`;
      }
      return `${customAgent.name} [${customAgent.specialty}]: "${ unscheduledGoals[0] }" (${unscheduledGoals.length} total) has zero calendar blocks. ${protocolNote} Lock a dedicated block on your grid now.${urgencySuffix}`;
    }
    if (lower.includes('agenda') || lower.includes('today') || lower.includes('workout') || lower.includes('schedule')) {
      const nextLine = nextSessionTitle
        ? `Next scheduled block: "${nextSessionTitle}".`
        : 'No remaining blocks on today’s board — schedule your next session now.';
      return `${customAgent.name} (${customAgent.coachingStyle}): ${todayCompleted}/${todayTotal} blocks completed today (${remaining} remaining). ${nextLine} ${protocolNote}${urgencySuffix}`;
    }
    return `${customAgent.name} [${customAgent.specialty}]: "${customAgent.signaturePhrase}" Heard: "${prompt.slice(0, 70)}". Applying your custom rule — ${customAgent.accountabilityProtocol}${urgencySuffix}`;
  }

  if (lower.includes('goal') || lower.includes('drift') || lower.includes('unscheduled')) {
    if (unscheduledGoals.length === 0) {
      if (persona === 'drill') return `All active goals have calendar coverage. ${todayCompleted}/${todayTotal} blocks executed today.${urgencySuffix}`;
      if (persona === 'builder') return `Every active goal has a scheduled commit block. Focus on shipping ${nextSessionTitle || 'your next sprint'}.${urgencySuffix}`;
      if (persona === 'zen') return `Your goals and calendar are aligned in harmony. Breathe and step into ${nextSessionTitle || 'your next focus session'}.`;
      return `Strong discipline — zero unscheduled goals right now. You are ${todayCompleted}/${todayTotal} on today's board.${urgencySuffix}`;
    }
    const firstDrift = unscheduledGoals[0];
    if (persona === 'drill') {
      return `${unscheduledGoals.length} goal(s) have ZERO calendar time, starting with "${firstDrift}". A goal without a block is wishful thinking. Put it on the grid.${urgencySuffix}`;
    }
    if (persona === 'builder') {
      return `Pipeline warning: "${firstDrift}" (${unscheduledGoals.length} total) has no time block allocated. Assign a 45m sprint on the Planner tab.${urgencySuffix}`;
    }
    if (persona === 'zen') {
      return `"${firstDrift}" is waiting quietly for space on your calendar. Give it one dedicated hour when your energy is clearest.`;
    }
    return `You have ${unscheduledGoals.length} goal(s) needing calendar placement — "${firstDrift}" is top of the list. Let's assign a block before midday.${urgencySuffix}`;
  }

  if (lower.includes('agenda') || lower.includes('today') || lower.includes('schedule') || lower.includes('next')) {
    const nextLine = nextSessionTitle ? `Next up: "${nextSessionTitle}".` : 'No remaining blocks scheduled today.';
    if (persona === 'drill') {
      return `Status report: ${todayCompleted} completed, ${remaining} remaining today. ${nextLine}${urgencySuffix}`;
    }
    if (persona === 'builder') {
      return `Daily build status: ${todayCompleted}/${todayTotal} blocks shipped. ${nextLine}${urgencySuffix}`;
    }
    if (persona === 'zen') {
      return `You have completed ${todayCompleted} of ${todayTotal} sessions today. ${nextLine} Enter it with calm attention.`;
    }
    return `Today's board sits at ${todayCompleted}/${todayTotal} completed (${remaining} left). ${nextLine}${urgencySuffix}`;
  }

  if (persona === 'drill') {
    return `Heard: "${prompt.slice(0, 70)}". You have ${remaining} open block(s) today and ${unscheduledGoals.length} unscheduled goal(s). Action cures hesitation.${urgencySuffix}`;
  }
  if (persona === 'builder') {
    return `Logged. Convert "${prompt.slice(0, 70)}" into a concrete 45-minute calendar block and ship the smallest working increment.${urgencySuffix}`;
  }
  if (persona === 'zen') {
    return `Acknowledged. Release distraction around "${prompt.slice(0, 60)}" and anchor your attention on ${nextSessionTitle || 'one meaningful block today'}.`;
  }
  return `Got it. With ${todayCompleted}/${todayTotal} blocks done today, keep momentum steady${nextSessionTitle ? ` starting with "${nextSessionTitle}"` : ''}.${urgencySuffix}`;
}
