import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  auth,
  clampInteger,
  createSafeId,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  truncateString,
} from '@/lib/firebase';
import {
  buildCoachReply,
  getPricingTuple,
  getTierSpec,
  type BillingCycle,
  type CoachPersonaId,
  type CustomAgentAccentColor,
  type CustomAgentSpecialty,
  type CustomAgentStyle,
  type DayPart,
  type GoalHorizon,
  type LifeArea,
  type MembershipTier,
} from '@/lib/membership';

export interface UserProfileDoc {
  uid: string;
  displayName: string;
  photoURL?: string;
  selectedPersona: CoachPersonaId;
  intensityLevel: number;
  dailyTargetSessions: number;
  onboardingCompleted: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface UserPrivateAccountDoc {
  uid: string;
  email: string;
  tier: MembershipTier;
  billingCycle: BillingCycle;
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'canceled' | 'pending_stripe';
  priceCents: number;
  annualSavingsCents: number;
  stripeMode: 'sandbox_preview' | 'live_stripe';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEndIso?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CustomAgentDoc {
  agentId: string;
  userId: string;
  slotIndex: number; // 1 to 4
  name: string;
  specialty: CustomAgentSpecialty;
  tagline: string;
  coachingStyle: CustomAgentStyle;
  accountabilityProtocol: string;
  signaturePhrase: string;
  accentColor: CustomAgentAccentColor;
  defaultIntensity: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface GoalDoc {
  goalId: string;
  userId: string;
  title: string;
  notes?: string;
  lifeArea: LifeArea;
  horizon: GoalHorizon;
  targetSessions: number;
  completedSessions: number;
  scheduledSessions: number;
  status: 'active' | 'paused' | 'completed';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CoachingSessionDoc {
  sessionId: string;
  userId: string;
  title: string;
  scheduledDate: string;
  startHour: number;
  durationMinutes: number;
  dayPart: DayPart;
  goalId?: string;
  coachPersona: CoachPersonaId;
  snoozeCount: number;
  status: 'scheduled' | 'snoozed' | 'completed';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CoachCheckinDoc {
  checkinId: string;
  userId: string;
  prompt: string;
  coachReply: string;
  persona: CoachPersonaId;
  intensityLevel: number;
  channel: 'voice' | 'text';
  createdAt?: Timestamp;
}

export interface CheckoutIntentDoc {
  intentId: string;
  userId: string;
  tier: MembershipTier;
  billingCycle: BillingCycle;
  amountCents: number;
  savingsCents: number;
  checkoutMode: 'sandbox_preview' | 'live_stripe';
  stripeSessionId?: string;
  status: 'initiated' | 'activated' | 'canceled';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface StripeStatusInfo {
  configured: boolean;
  mode: 'sandbox_preview' | 'live_stripe';
  webhookConfigured: boolean;
}

export interface PendingCheckoutPreview {
  intentId: string;
  sessionId: string;
  tier: MembershipTier;
  billingCycle: 'monthly' | 'annual';
  amountCents: number;
  savingsCents: number;
  planName: string;
  planDescription: string;
  message: string;
}

export interface SaveCustomAgentInput {
  slotIndex: number; // 1 to 4
  name: string;
  specialty: CustomAgentSpecialty;
  tagline: string;
  coachingStyle: CustomAgentStyle;
  accountabilityProtocol: string;
  signaturePhrase: string;
  accentColor: CustomAgentAccentColor;
  defaultIntensity: number;
}

interface FirebaseContextValue {
  user: User | null;
  authReady: boolean;
  dataLoading: boolean;
  authError: string | null;
  profile: UserProfileDoc | null;
  account: UserPrivateAccountDoc | null;
  customAgents: CustomAgentDoc[];
  goals: GoalDoc[];
  sessions: CoachingSessionDoc[];
  checkins: CoachCheckinDoc[];
  checkoutIntents: CheckoutIntentDoc[];
  stripeStatus: StripeStatusInfo;
  checkoutModalState: {
    open: boolean;
    tier: MembershipTier;
    cycle: 'monthly' | 'annual';
  };
  openCheckoutModal: (tier: MembershipTier, cycle?: 'monthly' | 'annual') => void;
  closeCheckoutModal: () => void;
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
  updateCoachSettings: (updates: {
    selectedPersona?: CoachPersonaId;
    intensityLevel?: number;
    dailyTargetSessions?: number;
    displayName?: string;
  }) => Promise<void>;
  saveCustomAgent: (input: SaveCustomAgentInput) => Promise<string>;
  deleteCustomAgent: (agentId: string) => Promise<void>;
  createGoal: (input: {
    title: string;
    notes?: string;
    lifeArea: LifeArea;
    horizon: GoalHorizon;
    targetSessions: number;
  }) => Promise<string>;
  completeGoal: (goalId: string) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  createSession: (input: {
    title: string;
    scheduledDate: string;
    startHour: number;
    durationMinutes: number;
    goalId?: string;
  }) => Promise<void>;
  completeSession: (session: CoachingSessionDoc) => Promise<void>;
  snoozeSession: (session: CoachingSessionDoc) => Promise<void>;
  deleteSession: (session: CoachingSessionDoc) => Promise<void>;
  submitCoachCheckin: (prompt: string, channel: 'voice' | 'text') => Promise<CoachCheckinDoc>;
  startPlanCheckout: (
    tier: MembershipTier,
    cycle: 'monthly' | 'annual'
  ) => Promise<PendingCheckoutPreview | 'redirecting' | 'activated_free'>;
  confirmSandboxPlanActivation: (preview: PendingCheckoutPreview) => Promise<void>;
  seedStarterWorkspace: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(undefined);

function hourToDayPart(hour: number): DayPart {
  if (hour < 12) return 'morning';
  if (hour < 17) return 'midday';
  return 'evening';
}

export function getLocalDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfileDoc | null>(null);
  const [account, setAccount] = useState<UserPrivateAccountDoc | null>(null);
  const [customAgents, setCustomAgents] = useState<CustomAgentDoc[]>([]);
  const [goals, setGoals] = useState<GoalDoc[]>([]);
  const [sessions, setSessions] = useState<CoachingSessionDoc[]>([]);
  const [checkins, setCheckins] = useState<CoachCheckinDoc[]>([]);
  const [checkoutIntents, setCheckoutIntents] = useState<CheckoutIntentDoc[]>([]);

  const [stripeStatus, setStripeStatus] = useState<StripeStatusInfo>({
    configured: false,
    mode: 'sandbox_preview',
    webhookConfigured: false,
  });

  const [checkoutModalState, setCheckoutModalState] = useState<{
    open: boolean;
    tier: MembershipTier;
    cycle: 'monthly' | 'annual';
  }>({
    open: false,
    tier: 'max',
    cycle: 'annual',
  });

  const openCheckoutModal = useCallback(
    (tier: MembershipTier, cycle: 'monthly' | 'annual' = 'annual') => {
      setCheckoutModalState({ open: true, tier, cycle });
    },
    []
  );

  const closeCheckoutModal = useCallback(() => {
    setCheckoutModalState((prev) => ({ ...prev, open: false }));
  }, []);

  useEffect(() => {
    fetch('/api/stripe/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.configured === 'boolean') {
          setStripeStatus({
            configured: data.configured,
            mode: data.mode === 'live_stripe' ? 'live_stripe' : 'sandbox_preview',
            webhookConfigured: Boolean(data.webhookConfigured),
          });
        }
      })
      .catch(() => {
        // Fallback silently if offline
      });
  }, []);

  const ensureUserBootstrap = useCallback(async (firebaseUser: User) => {
    const uid = firebaseUser.uid;
    const userPath = `users/${uid}`;
    const privatePath = `users/${uid}/private/account`;

    try {
      const userSnap = await getDoc(doc(db, 'users', uid));
      if (!userSnap.exists()) {
        const payload: Record<string, unknown> = {
          uid,
          displayName: truncateString(
            firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Coach Member',
            80,
            'Coach Member'
          ),
          selectedPersona: 'core',
          intensityLevel: 2,
          dailyTargetSessions: 4,
          onboardingCompleted: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        if (firebaseUser.photoURL) {
          payload.photoURL = firebaseUser.photoURL.slice(0, 500);
        }
        await setDoc(doc(db, 'users', uid), payload);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, userPath);
    }

    try {
      const privSnap = await getDoc(doc(db, 'users', uid, 'private', 'account'));
      if (!privSnap.exists() && firebaseUser.email) {
        await setDoc(doc(db, 'users', uid, 'private', 'account'), {
          uid,
          email: firebaseUser.email.slice(0, 254),
          tier: 'starter',
          billingCycle: 'free',
          subscriptionStatus: 'active',
          priceCents: 0,
          annualSavingsCents: 0,
          stripeMode: 'sandbox_preview',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, privatePath);
    }
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setDataLoading(true);
        try {
          await ensureUserBootstrap(currentUser);
        } finally {
          setAuthReady(true);
          setDataLoading(false);
        }
      } else {
        setProfile(null);
        setAccount(null);
        setCustomAgents([]);
        setGoals([]);
        setSessions([]);
        setCheckins([]);
        setCheckoutIntents([]);
        setAuthReady(true);
        setDataLoading(false);
      }
    });
    return () => unsubAuth();
  }, [ensureUserBootstrap]);

  useEffect(() => {
    if (!authReady || !user) return;

    const uid = user.uid;

    const unsubProfile = onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data() as UserProfileDoc);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `users/${uid}`)
    );

    const unsubAccount = onSnapshot(
      doc(db, 'users', uid, 'private', 'account'),
      (snap) => {
        if (snap.exists()) {
          setAccount(snap.data() as UserPrivateAccountDoc);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `users/${uid}/private/account`)
    );

    const unsubCustomAgents = onSnapshot(
      query(collection(db, 'users', uid, 'customAgents'), where('userId', '==', uid)),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as CustomAgentDoc);
        items.sort((a, b) => a.slotIndex - b.slotIndex);
        setCustomAgents(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/customAgents`)
    );

    const unsubGoals = onSnapshot(
      query(collection(db, 'users', uid, 'goals'), where('userId', '==', uid)),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as GoalDoc);
        items.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
        setGoals(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/goals`)
    );

    const unsubSessions = onSnapshot(
      query(collection(db, 'users', uid, 'sessions'), where('userId', '==', uid)),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as CoachingSessionDoc);
        items.sort((a, b) => {
          if (a.scheduledDate !== b.scheduledDate) {
            return a.scheduledDate.localeCompare(b.scheduledDate);
          }
          return a.startHour - b.startHour;
        });
        setSessions(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/sessions`)
    );

    const unsubCheckins = onSnapshot(
      query(collection(db, 'users', uid, 'checkins'), where('userId', '==', uid)),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as CoachCheckinDoc);
        items.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
        setCheckins(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/checkins`)
    );

    const unsubIntents = onSnapshot(
      query(collection(db, 'users', uid, 'checkoutIntents'), where('userId', '==', uid)),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as CheckoutIntentDoc);
        items.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
        setCheckoutIntents(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/checkoutIntents`)
    );

    return () => {
      unsubProfile();
      unsubAccount();
      unsubCustomAgents();
      unsubGoals();
      unsubSessions();
      unsubCheckins();
      unsubIntents();
    };
  }, [authReady, user]);

  const signInWithGoogle = useCallback(async (): Promise<User | null> => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await ensureUserBootstrap(cred.user);
      return cred.user;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign-in cancelled or failed';
      setAuthError(msg);
      return null;
    }
  }, [ensureUserBootstrap]);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  const updateCoachSettings = useCallback(
    async (updates: {
      selectedPersona?: CoachPersonaId;
      intensityLevel?: number;
      dailyTargetSessions?: number;
      displayName?: string;
    }) => {
      if (!user) return;
      const path = `users/${user.uid}`;
      const payload: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
      };
      if (updates.selectedPersona) {
        payload.selectedPersona = updates.selectedPersona;
      }
      if (typeof updates.intensityLevel === 'number') {
        payload.intensityLevel = clampInteger(updates.intensityLevel, 1, 5);
      }
      if (typeof updates.dailyTargetSessions === 'number') {
        payload.dailyTargetSessions = clampInteger(updates.dailyTargetSessions, 1, 20);
      }
      if (typeof updates.displayName === 'string') {
        payload.displayName = truncateString(updates.displayName, 80, 'Coach Member');
      }

      try {
        await updateDoc(doc(db, 'users', user.uid), payload);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    },
    [user]
  );

  const saveCustomAgent = useCallback(
    async (input: SaveCustomAgentInput): Promise<string> => {
      if (!user) throw new Error('Please sign in first.');
      if (account?.tier !== 'max') {
        openCheckoutModal('max', 'annual');
        throw new Error(
          'Build-Your-Own Agent Studio is unlocked on the $10/mo ($100/yr · Save $20) Max tier.'
        );
      }

      const safeSlot = clampInteger(input.slotIndex, 1, 4);
      const agentId = `custom_slot_${safeSlot}`;
      const path = `users/${user.uid}/customAgents/${agentId}`;
      const existingSlotDoc = customAgents.find((a) => a.agentId === agentId);

      const baseFields = {
        name: truncateString(input.name, 60, `Custom Coach #${safeSlot}`),
        specialty: input.specialty,
        tagline: truncateString(input.tagline, 100, 'Custom accountability partner.'),
        coachingStyle: input.coachingStyle,
        accountabilityProtocol: truncateString(
          input.accountabilityProtocol,
          300,
          'Enforce daily scheduled blocks and verify completion.'
        ),
        signaturePhrase: truncateString(
          input.signaturePhrase,
          160,
          'Time to execute your next scheduled block.'
        ),
        accentColor: input.accentColor,
        defaultIntensity: clampInteger(input.defaultIntensity, 1, 5),
        updatedAt: serverTimestamp(),
      };

      try {
        if (existingSlotDoc) {
          await updateDoc(doc(db, 'users', user.uid, 'customAgents', agentId), baseFields);
        } else {
          await setDoc(doc(db, 'users', user.uid, 'customAgents', agentId), {
            agentId,
            userId: user.uid,
            slotIndex: safeSlot,
            ...baseFields,
            createdAt: serverTimestamp(),
          });
        }
        // Automatically activate the newly built custom agent and its default intensity
        await updateCoachSettings({
          selectedPersona: agentId,
          intensityLevel: clampInteger(input.defaultIntensity, 1, 5),
        });
        return agentId;
      } catch (err) {
        handleFirestoreError(
          err,
          existingSlotDoc ? OperationType.UPDATE : OperationType.CREATE,
          path
        );
      }
    },
    [user, account?.tier, customAgents, openCheckoutModal, updateCoachSettings]
  );

  const deleteCustomAgent = useCallback(
    async (agentId: string) => {
      if (!user) return;
      // If active persona or any non-completed sessions reference this custom agent, fall back to 'core'
      if (profile?.selectedPersona === agentId) {
        await updateCoachSettings({ selectedPersona: 'core' });
      }
      const linkedSessions = sessions.filter(
        (s) => s.coachPersona === agentId && s.status !== 'completed'
      );
      for (const sess of linkedSessions) {
        const sPath = `users/${user.uid}/sessions/${sess.sessionId}`;
        try {
          await updateDoc(doc(db, 'users', user.uid, 'sessions', sess.sessionId), {
            coachPersona: 'core',
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, sPath);
        }
      }

      const path = `users/${user.uid}/customAgents/${agentId}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'customAgents', agentId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    },
    [user, profile?.selectedPersona, sessions, updateCoachSettings]
  );

  const createGoal = useCallback(
    async (input: {
      title: string;
      notes?: string;
      lifeArea: LifeArea;
      horizon: GoalHorizon;
      targetSessions: number;
    }): Promise<string> => {
      if (!user) throw new Error('Please sign in first.');
      const currentTier = account?.tier ?? 'starter';
      const tierSpec = getTierSpec(currentTier);
      const activeGoalsCount = goals.filter((g) => g.status === 'active').length;
      if (tierSpec.maxActiveGoals !== null && activeGoalsCount >= tierSpec.maxActiveGoals) {
        openCheckoutModal('pro', 'annual');
        throw new Error(
          `Starter tier supports up to ${tierSpec.maxActiveGoals} active goals. Upgrade to Pro ($5/mo) or Max ($10/mo · $100/yr) for unlimited goals.`
        );
      }

      const goalId = createSafeId('goal');
      const path = `users/${user.uid}/goals/${goalId}`;
      const payload: Record<string, unknown> = {
        goalId,
        userId: user.uid,
        title: truncateString(input.title, 120, 'New Goal'),
        lifeArea: input.lifeArea,
        horizon: input.horizon,
        targetSessions: clampInteger(input.targetSessions, 1, 50),
        completedSessions: 0,
        scheduledSessions: 0,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (input.notes && input.notes.trim()) {
        payload.notes = input.notes.trim().slice(0, 500);
      }

      try {
        await setDoc(doc(db, 'users', user.uid, 'goals', goalId), payload);
        return goalId;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    },
    [user, account, goals, openCheckoutModal]
  );

  const completeGoal = useCallback(
    async (goalId: string) => {
      if (!user) return;
      const target = goals.find((g) => g.goalId === goalId);
      if (!target || target.status === 'completed') return;
      const path = `users/${user.uid}/goals/${goalId}`;
      try {
        await updateDoc(doc(db, 'users', user.uid, 'goals', goalId), {
          status: 'completed',
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    },
    [user, goals]
  );

  const deleteGoal = useCallback(
    async (goalId: string) => {
      if (!user) return;
      const linkedSessions = sessions.filter(
        (s) => s.goalId === goalId && s.status !== 'completed'
      );
      for (const sess of linkedSessions) {
        const sPath = `users/${user.uid}/sessions/${sess.sessionId}`;
        try {
          await updateDoc(doc(db, 'users', user.uid, 'sessions', sess.sessionId), {
            goalId: deleteField(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, sPath);
        }
      }

      const path = `users/${user.uid}/goals/${goalId}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'goals', goalId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    },
    [user, sessions]
  );

  const createSession = useCallback(
    async (input: {
      title: string;
      scheduledDate: string;
      startHour: number;
      durationMinutes: number;
      goalId?: string;
    }) => {
      if (!user) return;
      const sessionId = createSafeId('sess');
      const path = `users/${user.uid}/sessions/${sessionId}`;
      const safeHour = clampInteger(input.startHour, 0, 23);
      const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(input.scheduledDate)
        ? input.scheduledDate
        : getLocalDateString();

      const activePersona = profile?.selectedPersona ?? 'core';
      const isValidActivePersona =
        ['drill', 'core', 'builder', 'zen'].includes(activePersona) ||
        customAgents.some((a) => a.agentId === activePersona);

      const payload: Record<string, unknown> = {
        sessionId,
        userId: user.uid,
        title: truncateString(input.title, 120, 'Focus Session'),
        scheduledDate: safeDate,
        startHour: safeHour,
        durationMinutes: clampInteger(input.durationMinutes, 15, 240),
        dayPart: hourToDayPart(safeHour),
        coachPersona: isValidActivePersona ? activePersona : 'core',
        snoozeCount: 0,
        status: 'scheduled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const validGoal =
        input.goalId && goals.find((g) => g.goalId === input.goalId)
          ? goals.find((g) => g.goalId === input.goalId)
          : undefined;

      if (validGoal) {
        payload.goalId = validGoal.goalId;
      }

      try {
        await setDoc(doc(db, 'users', user.uid, 'sessions', sessionId), payload);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }

      if (validGoal && validGoal.status !== 'completed') {
        const gPath = `users/${user.uid}/goals/${validGoal.goalId}`;
        try {
          await updateDoc(doc(db, 'users', user.uid, 'goals', validGoal.goalId), {
            scheduledSessions: clampInteger(validGoal.scheduledSessions + 1, 0, 500),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, gPath);
        }
      }
    },
    [user, profile, customAgents, goals]
  );

  const completeSession = useCallback(
    async (session: CoachingSessionDoc) => {
      if (!user || session.status === 'completed') return;
      const path = `users/${user.uid}/sessions/${session.sessionId}`;
      try {
        await updateDoc(doc(db, 'users', user.uid, 'sessions', session.sessionId), {
          status: 'completed',
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }

      if (session.goalId) {
        const linkedGoal = goals.find((g) => g.goalId === session.goalId);
        if (linkedGoal && linkedGoal.status !== 'completed') {
          const nextCompleted = clampInteger(linkedGoal.completedSessions + 1, 0, 500);
          const gPath = `users/${user.uid}/goals/${linkedGoal.goalId}`;
          try {
            await updateDoc(doc(db, 'users', user.uid, 'goals', linkedGoal.goalId), {
              completedSessions: nextCompleted,
              status: nextCompleted >= linkedGoal.targetSessions ? 'completed' : linkedGoal.status,
              updatedAt: serverTimestamp(),
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, gPath);
          }
        }
      }
    },
    [user, goals]
  );

  const snoozeSession = useCallback(
    async (session: CoachingSessionDoc) => {
      if (!user || session.status === 'completed') return;
      const path = `users/${user.uid}/sessions/${session.sessionId}`;
      let nextHour = session.startHour + 1;
      let nextDate = session.scheduledDate;
      if (nextHour > 23) {
        nextHour = 8;
        const parsed = new Date(`${session.scheduledDate}T12:00:00`);
        parsed.setDate(parsed.getDate() + 1);
        nextDate = getLocalDateString(parsed);
      }

      try {
        await updateDoc(doc(db, 'users', user.uid, 'sessions', session.sessionId), {
          status: 'snoozed',
          snoozeCount: clampInteger(session.snoozeCount + 1, 0, 20),
          scheduledDate: nextDate,
          startHour: nextHour,
          dayPart: hourToDayPart(nextHour),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    },
    [user]
  );

  const deleteSession = useCallback(
    async (session: CoachingSessionDoc) => {
      if (!user) return;
      const path = `users/${user.uid}/sessions/${session.sessionId}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'sessions', session.sessionId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    },
    [user]
  );

  const submitCoachCheckin = useCallback(
    async (promptText: string, channel: 'voice' | 'text'): Promise<CoachCheckinDoc> => {
      if (!user) throw new Error('Please sign in first.');
      const todayStr = getLocalDateString();
      const todaySessions = sessions.filter((s) => s.scheduledDate === todayStr);
      const todayCompleted = todaySessions.filter((s) => s.status === 'completed').length;
      const nextSession = todaySessions.find((s) => s.status !== 'completed');
      const unscheduledGoals = goals
        .filter((g) => g.status === 'active' && g.scheduledSessions === 0)
        .map((g) => g.title);

      const rawPersona = profile?.selectedPersona ?? 'core';
      const matchedCustomAgent = customAgents.find((a) => a.agentId === rawPersona);
      const activePersona =
        matchedCustomAgent || ['drill', 'core', 'builder', 'zen'].includes(rawPersona)
          ? rawPersona
          : 'core';
      const activeIntensity = profile?.intensityLevel ?? 2;
      const cleanPrompt = truncateString(promptText, 400, "What's on my agenda?");

      const reply = truncateString(
        buildCoachReply({
          prompt: cleanPrompt,
          persona: activePersona,
          intensity: activeIntensity,
          todayTotal: todaySessions.length,
          todayCompleted,
          unscheduledGoals,
          nextSessionTitle: nextSession?.title,
          customAgent: matchedCustomAgent,
        }),
        1000,
        'Stay locked on your next scheduled block.'
      );

      const checkinId = createSafeId('chk');
      const path = `users/${user.uid}/checkins/${checkinId}`;
      const record: CoachCheckinDoc = {
        checkinId,
        userId: user.uid,
        prompt: cleanPrompt,
        coachReply: reply,
        persona: activePersona,
        intensityLevel: activeIntensity,
        channel,
      };

      try {
        await setDoc(doc(db, 'users', user.uid, 'checkins', checkinId), {
          ...record,
          createdAt: serverTimestamp(),
        });
        return record;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    },
    [user, sessions, goals, profile, customAgents]
  );

  const startPlanCheckout = useCallback(
    async (
      tier: MembershipTier,
      cycle: 'monthly' | 'annual'
    ): Promise<PendingCheckoutPreview | 'redirecting' | 'activated_free'> => {
      let currentUser = user;
      if (!currentUser) {
        currentUser = await signInWithGoogle();
        if (!currentUser) {
          throw new Error('Sign in with Google is required to link your membership.');
        }
      }

      const uid = currentUser.uid;

      if (tier === 'starter') {
        const privPath = `users/${uid}/private/account`;
        try {
          await updateDoc(doc(db, 'users', uid, 'private', 'account'), {
            tier: 'starter',
            billingCycle: 'free',
            subscriptionStatus: 'active',
            priceCents: 0,
            annualSavingsCents: 0,
            stripeMode: stripeStatus.mode,
            updatedAt: serverTimestamp(),
          });
          await updateDoc(doc(db, 'users', uid), {
            selectedPersona: 'core',
            intensityLevel: Math.min(profile?.intensityLevel ?? 2, 2),
            updatedAt: serverTimestamp(),
          });
          return 'activated_free';
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, privPath);
        }
      }

      const tuple = getPricingTuple(tier, cycle);
      const intentId = createSafeId('intent');
      const intentPath = `users/${uid}/checkoutIntents/${intentId}`;

      try {
        await setDoc(doc(db, 'users', uid, 'checkoutIntents', intentId), {
          intentId,
          userId: uid,
          tier,
          billingCycle: tuple.billingCycle,
          amountCents: tuple.priceCents,
          savingsCents: tuple.annualSavingsCents,
          checkoutMode: stripeStatus.mode,
          status: 'initiated',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, intentPath);
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          billingCycle: cycle,
          userId: uid,
          email: currentUser.email,
          intentId,
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || 'Failed to initialize membership checkout');
      }

      const data = await response.json();

      if (data.mode === 'live_stripe' && data.url) {
        try {
          await updateDoc(doc(db, 'users', uid, 'checkoutIntents', intentId), {
            stripeSessionId: String(data.sessionId || '').slice(0, 128),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, intentPath);
        }
        window.location.assign(data.url);
        return 'redirecting';
      }

      return {
        intentId,
        sessionId: String(data.sessionId || `cs_preview_${Date.now()}`).slice(0, 128),
        tier,
        billingCycle: cycle,
        amountCents: tuple.priceCents,
        savingsCents: tuple.annualSavingsCents,
        planName: data.plan?.name || `HeyCoach ${tier.toUpperCase()}`,
        planDescription: data.plan?.description || '',
        message:
          data.message ||
          'Stripe secret key is not yet set on the server. Activate in Firebase Sandbox Preview to test all tier capabilities immediately.',
      };
    },
    [user, signInWithGoogle, stripeStatus.mode, profile?.intensityLevel]
  );

  const confirmSandboxPlanActivation = useCallback(
    async (preview: PendingCheckoutPreview) => {
      if (!user) return;
      const uid = user.uid;
      const intentPath = `users/${uid}/checkoutIntents/${preview.intentId}`;
      const privPath = `users/${uid}/private/account`;

      const nextRenewal = new Date();
      if (preview.billingCycle === 'annual') {
        nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
      } else {
        nextRenewal.setMonth(nextRenewal.getMonth() + 1);
      }

      try {
        await updateDoc(doc(db, 'users', uid, 'checkoutIntents', preview.intentId), {
          status: 'activated',
          stripeSessionId: preview.sessionId.slice(0, 128),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, intentPath);
      }

      try {
        await updateDoc(doc(db, 'users', uid, 'private', 'account'), {
          tier: preview.tier,
          billingCycle: preview.billingCycle,
          subscriptionStatus: 'active',
          priceCents: preview.amountCents,
          annualSavingsCents: preview.savingsCents,
          stripeMode: 'sandbox_preview',
          stripeSubscriptionId: preview.sessionId.slice(0, 128),
          currentPeriodEndIso: nextRenewal.toISOString().slice(0, 40),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, privPath);
      }

      // If downgrading to Pro ($5), ensure active persona is one of the 4 standard coaches
      if (
        preview.tier === 'pro' &&
        profile?.selectedPersona &&
        !['drill', 'core', 'builder', 'zen'].includes(profile.selectedPersona)
      ) {
        await updateCoachSettings({
          selectedPersona: 'core',
          intensityLevel: Math.min(profile.intensityLevel ?? 3, 4),
        });
      }
    },
    [user, profile?.selectedPersona, profile?.intensityLevel, updateCoachSettings]
  );

  const seedStarterWorkspace = useCallback(async () => {
    if (!user) return;
    const todayStr = getLocalDateString();
    const g1 = await createGoal({
      title: 'Ship Core Product Milestone',
      notes: 'Deliver verified release before Friday review.',
      lifeArea: 'Work',
      horizon: 'weekly',
      targetSessions: 4,
    });
    const g2 = await createGoal({
      title: '45-Min Strength & Conditioning',
      notes: 'Three sessions per week minimum.',
      lifeArea: 'Health',
      horizon: 'weekly',
      targetSessions: 3,
    });
    await createGoal({
      title: 'Deep Systems Reading (Unscheduled Alert Demo)',
      notes: 'Needs a calendar block assigned to clear drift warning.',
      lifeArea: 'Learning',
      horizon: 'weekly',
      targetSessions: 2,
    });

    await createSession({
      title: 'Morning Architecture Sprint',
      scheduledDate: todayStr,
      startHour: 9,
      durationMinutes: 60,
      goalId: g1,
    });
    await createSession({
      title: 'Midday Execution Check & Ship',
      scheduledDate: todayStr,
      startHour: 14,
      durationMinutes: 45,
      goalId: g1,
    });
    await createSession({
      title: 'Evening Conditioning Block',
      scheduledDate: todayStr,
      startHour: 18,
      durationMinutes: 45,
      goalId: g2,
    });
  }, [user, createGoal, createSession]);

  const value = useMemo<FirebaseContextValue>(
    () => ({
      user,
      authReady,
      dataLoading,
      authError,
      profile,
      account,
      customAgents,
      goals,
      sessions,
      checkins,
      checkoutIntents,
      stripeStatus,
      checkoutModalState,
      openCheckoutModal,
      closeCheckoutModal,
      signInWithGoogle,
      signOutUser,
      updateCoachSettings,
      saveCustomAgent,
      deleteCustomAgent,
      createGoal,
      completeGoal,
      deleteGoal,
      createSession,
      completeSession,
      snoozeSession,
      deleteSession,
      submitCoachCheckin,
      startPlanCheckout,
      confirmSandboxPlanActivation,
      seedStarterWorkspace,
    }),
    [
      user,
      authReady,
      dataLoading,
      authError,
      profile,
      account,
      customAgents,
      goals,
      sessions,
      checkins,
      checkoutIntents,
      stripeStatus,
      checkoutModalState,
      openCheckoutModal,
      closeCheckoutModal,
      signInWithGoogle,
      signOutUser,
      updateCoachSettings,
      saveCustomAgent,
      deleteCustomAgent,
      createGoal,
      completeGoal,
      deleteGoal,
      createSession,
      completeSession,
      snoozeSession,
      deleteSession,
      submitCoachCheckin,
      startPlanCheckout,
      confirmSandboxPlanActivation,
      seedStarterWorkspace,
    ]
  );

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
}

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebase must be used inside FirebaseProvider');
  }
  return ctx;
}
