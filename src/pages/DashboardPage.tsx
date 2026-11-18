import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getLocalDateString,
  useFirebase,
  type CoachingSessionDoc,
  type CustomAgentDoc,
} from '@/contexts/FirebaseContext';
import {
  CUSTOM_AGENT_COLORS,
  CUSTOM_AGENT_PRESETS,
  CUSTOM_AGENT_SPECIALTIES,
  CUSTOM_AGENT_STYLES,
  getTierSpec,
  INTENSITY_LABELS,
  LIFE_AREAS,
  MEMBERSHIP_TIERS,
  PERSONA_MAP,
  resolvePersonaInfo,
  type BuiltInPersonaId,
  type CoachPersonaId,
  type CustomAgentAccentColor,
  type CustomAgentBlueprintPreset,
  type CustomAgentSpecialty,
  type CustomAgentStyle,
  type GoalHorizon,
  type LifeArea,
  type MembershipTier,
} from '@/lib/membership';
import {
  Bot,
  Calendar,
  Check,
  Clock,
  CreditCard,
  LayoutDashboard,
  Lock,
  LogOut,
  Mic,
  MicOff,
  Plus,
  Search,
  Send,
  Target,
  Trash2,
  Volume2,
  Wrench,
} from 'lucide-react';

type WorkspaceTab = 'today' | 'planner' | 'goals' | 'studio' | 'coach' | 'membership';

const VALID_TABS: WorkspaceTab[] = ['today', 'planner', 'goals', 'studio', 'coach', 'membership'];

function formatHour(hour: number): string {
  const normalized = ((hour % 24) + 24) % 24;
  const suffix = normalized >= 12 ? 'PM' : 'AM';
  const h12 = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${h12}:00 ${suffix}`;
}

function getWeekDates(anchorDateStr: string): { dateStr: string; dayShort: string; dayNum: string }[] {
  const anchor = new Date(`${anchorDateStr}T12:00:00`);
  const dayOfWeek = anchor.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() + mondayOffset);

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return labels.map((dayShort, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    return {
      dateStr: getLocalDateString(d),
      dayShort,
      dayNum: String(d.getDate()).padStart(2, '0'),
    };
  });
}

export default function DashboardPage() {
  const {
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
    openCheckoutModal,
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
    seedStarterWorkspace,
  } = useFirebase();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as WorkspaceTab) || 'today';
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(
    VALID_TABS.includes(initialTab) ? initialTab : 'today'
  );

  const todayStr = useMemo(() => getLocalDateString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Forms & interactive filters
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDate, setSessionDate] = useState(todayStr);
  const [sessionHour, setSessionHour] = useState(9);
  const [sessionDuration, setSessionDuration] = useState(45);
  const [sessionGoalId, setSessionGoalId] = useState('');

  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalNotes, setGoalNotes] = useState('');
  const [goalArea, setGoalArea] = useState<LifeArea>('Work');
  const [goalHorizon, setGoalHorizon] = useState<GoalHorizon>('weekly');
  const [goalTargetSessions, setGoalTargetSessions] = useState(3);

  const [goalSearch, setGoalSearch] = useState('');
  const [goalAreaFilter, setGoalAreaFilter] = useState<'All' | LifeArea>('All');

  // Build-Your-Own Agent Studio State (4 dedicated slots on $10/mo · $100/yr Max tier)
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [agentName, setAgentName] = useState(CUSTOM_AGENT_PRESETS[0].name);
  const [agentSpecialty, setAgentSpecialty] = useState<CustomAgentSpecialty>(
    CUSTOM_AGENT_PRESETS[0].specialty
  );
  const [agentTagline, setAgentTagline] = useState(CUSTOM_AGENT_PRESETS[0].tagline);
  const [agentStyle, setAgentStyle] = useState<CustomAgentStyle>(
    CUSTOM_AGENT_PRESETS[0].coachingStyle
  );
  const [agentProtocol, setAgentProtocol] = useState(
    CUSTOM_AGENT_PRESETS[0].accountabilityProtocol
  );
  const [agentPhrase, setAgentPhrase] = useState(CUSTOM_AGENT_PRESETS[0].signaturePhrase);
  const [agentColor, setAgentColor] = useState<CustomAgentAccentColor>(
    CUSTOM_AGENT_PRESETS[0].accentColor
  );
  const [agentIntensity, setAgentIntensity] = useState<number>(
    CUSTOM_AGENT_PRESETS[0].defaultIntensity
  );
  const [savingAgent, setSavingAgent] = useState(false);

  const [coachInput, setCoachInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [billingCycleView, setBillingCycleView] = useState<'monthly' | 'annual'>('annual');

  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as WorkspaceTab | null;
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
    }
    const checkoutParam = searchParams.get('checkout');
    if (checkoutParam === 'success') {
      setStatusBanner('Stripe checkout completed! Your membership status is synced.');
    } else if (checkoutParam === 'canceled') {
      setStatusBanner('Checkout was canceled — your existing membership remains unchanged.');
    }
  }, [searchParams]);

  // Synchronize Agent Studio form fields when user clicks between Slot 1..4
  useEffect(() => {
    const existing = customAgents.find((a) => a.slotIndex === selectedSlot);
    if (existing) {
      setAgentName(existing.name);
      setAgentSpecialty(existing.specialty);
      setAgentTagline(existing.tagline);
      setAgentStyle(existing.coachingStyle);
      setAgentProtocol(existing.accountabilityProtocol);
      setAgentPhrase(existing.signaturePhrase);
      setAgentColor(existing.accentColor);
      setAgentIntensity(existing.defaultIntensity);
    } else {
      const preset = CUSTOM_AGENT_PRESETS[(selectedSlot - 1) % CUSTOM_AGENT_PRESETS.length];
      setAgentName(preset.name);
      setAgentSpecialty(preset.specialty);
      setAgentTagline(preset.tagline);
      setAgentStyle(preset.coachingStyle);
      setAgentProtocol(preset.accountabilityProtocol);
      setAgentPhrase(preset.signaturePhrase);
      setAgentColor(preset.accentColor);
      setAgentIntensity(preset.defaultIntensity);
    }
  }, [selectedSlot, customAgents]);

  const applyBlueprintPreset = (preset: CustomAgentBlueprintPreset) => {
    setAgentName(preset.name);
    setAgentSpecialty(preset.specialty);
    setAgentTagline(preset.tagline);
    setAgentStyle(preset.coachingStyle);
    setAgentProtocol(preset.accountabilityProtocol);
    setAgentPhrase(preset.signaturePhrase);
    setAgentColor(preset.accentColor);
    setAgentIntensity(preset.defaultIntensity);
  };

  const switchTab = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const currentTier: MembershipTier = account?.tier ?? 'starter';
  const tierSpec = getTierSpec(currentTier);
  const isMaxTier = currentTier === 'max';
  const activePersonaId: CoachPersonaId = profile?.selectedPersona ?? 'core';
  const activePersona = useMemo(
    () => resolvePersonaInfo(activePersonaId, customAgents),
    [activePersonaId, customAgents]
  );
  const activeIntensity = profile?.intensityLevel ?? 2;

  const todaySessions = useMemo(
    () => sessions.filter((s) => s.scheduledDate === todayStr),
    [sessions, todayStr]
  );
  const todayCompleted = useMemo(
    () => todaySessions.filter((s) => s.status === 'completed').length,
    [todaySessions]
  );
  const unscheduledActiveGoals = useMemo(
    () => goals.filter((g) => g.status === 'active' && g.scheduledSessions === 0),
    [goals]
  );

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const selectedDaySessions = useMemo(
    () => sessions.filter((s) => s.scheduledDate === selectedDate),
    [sessions, selectedDate]
  );

  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      const matchesArea = goalAreaFilter === 'All' || g.lifeArea === goalAreaFilter;
      const matchesQuery =
        !goalSearch.trim() ||
        g.title.toLowerCase().includes(goalSearch.toLowerCase()) ||
        (g.notes && g.notes.toLowerCase().includes(goalSearch.toLowerCase()));
      return matchesArea && matchesQuery;
    });
  }, [goals, goalAreaFilter, goalSearch]);

  const handleSelectBuiltInPersona = async (personaId: BuiltInPersonaId) => {
    if (!tierSpec.allowedPersonas.includes(personaId)) {
      openCheckoutModal('pro', 'annual');
      return;
    }
    await updateCoachSettings({ selectedPersona: personaId });
  };

  const handleSelectCustomAgent = async (agent: CustomAgentDoc) => {
    if (!isMaxTier) {
      openCheckoutModal('max', 'annual');
      return;
    }
    await updateCoachSettings({
      selectedPersona: agent.agentId,
      intensityLevel: agent.defaultIntensity,
    });
  };

  const handleSelectIntensity = async (lvl: number) => {
    if (lvl > tierSpec.maxIntensityLevel) {
      openCheckoutModal(lvl === 5 ? 'max' : 'pro', 'annual');
      return;
    }
    await updateCoachSettings({ intensityLevel: lvl });
  };

  const handleSaveCustomAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMaxTier) {
      openCheckoutModal('max', 'annual');
      return;
    }
    setSavingAgent(true);
    try {
      await saveCustomAgent({
        slotIndex: selectedSlot,
        name: agentName,
        specialty: agentSpecialty,
        tagline: agentTagline,
        coachingStyle: agentStyle,
        accountabilityProtocol: agentProtocol,
        signaturePhrase: agentPhrase,
        accentColor: agentColor,
        defaultIntensity: agentIntensity,
      });
      setStatusBanner(
        `Custom Coach Slot #${selectedSlot} ("${agentName}") saved to Firebase and activated as your live coach.`
      );
    } catch (err) {
      setStatusBanner(err instanceof Error ? err.message : 'Unable to save custom agent');
    } finally {
      setSavingAgent(false);
    }
  };

  const handleCreateGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    try {
      await createGoal({
        title: goalTitle,
        notes: goalNotes,
        lifeArea: goalArea,
        horizon: goalHorizon,
        targetSessions: goalTargetSessions,
      });
      setGoalTitle('');
      setGoalNotes('');
      setShowNewGoalForm(false);
    } catch (err) {
      setStatusBanner(err instanceof Error ? err.message : 'Could not create goal');
    }
  };

  const handleCreateSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim()) return;
    await createSession({
      title: sessionTitle,
      scheduledDate: sessionDate,
      startHour: sessionHour,
      durationMinutes: sessionDuration,
      goalId: sessionGoalId || undefined,
    });
    setSessionTitle('');
    setShowNewSessionForm(false);
  };

  const speakText = (text: string) => {
    if (!speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = activePersonaId === 'drill' ? 1.12 : activePersonaId === 'zen' ? 0.92 : 1.02;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore browser speech synthesis errors
    }
  };

  const handleSendCoachPrompt = async (promptText: string, channel: 'voice' | 'text') => {
    if (!promptText.trim()) return;
    const rec = await submitCoachCheckin(promptText, channel);
    setCoachInput('');
    if (channel === 'voice' || speechEnabled) {
      speakText(rec.coachReply);
    }
  };

  const handleToggleVoiceCapture = () => {
    if (!tierSpec.voiceCoachingIncluded) {
      openCheckoutModal('max', 'annual');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setStatusBanner('Browser speech recognition is unavailable here — use quick voice prompts or text input below.');
      return;
    }

    const recognition = new SpeechRecognitionCtor() as {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onresult: ((event: { results: { 0: { transcript: string } }[] }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void;
      stop: () => void;
    };

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript.trim()) {
        void handleSendCoachPrompt(transcript, 'voice');
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const handleSeedStarter = async () => {
    setSeeding(true);
    try {
      await seedStarterWorkspace();
      setStatusBanner('Sample goals and today’s coaching blocks added to your Firebase workspace.');
    } catch (err) {
      setStatusBanner(err instanceof Error ? err.message : 'Failed to seed sample items');
    } finally {
      setSeeding(false);
    }
  };

  if (!authReady || dataLoading) {
    return (
      <div className="min-h-screen bg-[#0c0c14] text-white flex items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-4">
          <div className="h-10 w-56 bg-[#141420] rounded-xl animate-pulse" />
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="h-28 bg-[#141420] rounded-xl animate-pulse" />
            <div className="h-28 bg-[#141420] rounded-xl animate-pulse" />
            <div className="h-28 bg-[#141420] rounded-xl animate-pulse" />
          </div>
          <div className="h-64 bg-[#141420] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0c0c14] text-white flex flex-col">
        <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-white/10">
          <Link to="/" className="text-lg font-black tracking-tight text-white whitespace-nowrap shrink-0">
            HEY<span className="text-amber-400">COACH</span>
          </Link>
          <Link
            to="/"
            className="px-4 py-2 rounded-lg border border-white/15 text-xs font-semibold text-gray-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Back to Overview
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl bg-[#141420] border border-white/10 p-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs text-amber-400 font-semibold">Firebase Authenticated Workspace</p>
              <h1 className="text-3xl font-black text-white" style={{ textWrap: 'balance' }}>
                Sign in to launch your AI Coach
              </h1>
              <p className="text-sm text-gray-400 leading-relaxed">
                Sync your goals, 7-day calendar blocks, standard coach personas ($5/mo), or build 4 of your own custom AI Coach Agents ($10/mo · $100/yr Save $20).
              </p>
            </div>

            {authError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {authError}
              </p>
            )}

            <button
              onClick={() => void signInWithGoogle()}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-400 text-[#0c0c14] font-black text-sm hover:brightness-110 transition-all"
            >
              Continue with Google
            </button>

            <div className="border-t border-white/10 pt-4 text-xs text-gray-400 flex items-center justify-between tabular-nums">
              <span>Starter $0</span>
              <span>·</span>
              <span>Pro $5 (4 Coaches)</span>
              <span>·</span>
              <span className="text-amber-300 font-semibold">Max $10 (+4 Custom Agents)</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const navItems: { id: WorkspaceTab; label: string; icon: React.ReactNode }[] = [
    { id: 'today', label: 'Today', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'planner', label: 'Calendar Planner', icon: <Calendar className="w-4 h-4" /> },
    { id: 'goals', label: 'Goals', icon: <Target className="w-4 h-4" /> },
    { id: 'studio', label: 'Agent Studio (4 Slots)', icon: <Bot className="w-4 h-4" /> },
    { id: 'coach', label: 'Voice & Check-In', icon: <Mic className="w-4 h-4" /> },
    { id: 'membership', label: 'Membership', icon: <CreditCard className="w-4 h-4" /> },
  ];

  const tabTitles: Record<WorkspaceTab, string> = {
    today: 'Today Agenda',
    planner: 'Calendar Planner',
    goals: 'Accountability Goals',
    studio: 'Build-Your-Own Agent Studio (4 Custom Slots)',
    coach: 'Voice & Coach Dispatch',
    membership: 'Membership & Billing',
  };

  const currentSlotExisting = customAgents.find((a) => a.slotIndex === selectedSlot);

  return (
    <div className="min-h-screen bg-[#0c0c14] text-white flex flex-col lg:flex-row">
      {/* Left Sidebar (264px on desktop) */}
      <aside className="w-full lg:w-64 lg:min-h-screen bg-[#10101a] border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <Link to="/" className="text-lg font-black tracking-tight text-white whitespace-nowrap">
            HEY<span className="text-amber-400">COACH</span>
          </Link>
          <button
            onClick={() => switchTab('membership')}
            className="text-xs font-bold text-amber-400 hover:underline whitespace-nowrap"
          >
            {currentTier === 'max' ? 'Max · 8 Agents' : currentTier === 'pro' ? 'Pro · 4 Coaches' : 'Starter'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => switchTab(item.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-amber-400 text-[#0c0c14]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Active Coach Roster (4 Standard + 4 Build-Your-Own Custom Slots) */}
        <div className="hidden lg:block p-4 mt-1 border-t border-white/10 space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Standard Coaches ($5)</span>
              <span style={{ color: activePersona.color }} className="font-semibold truncate max-w-[110px]">
                {activePersona.name}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(PERSONA_MAP) as BuiltInPersonaId[]).map((pid) => {
                const p = PERSONA_MAP[pid];
                const allowed = tierSpec.allowedPersonas.includes(pid);
                const selected = activePersonaId === pid;
                return (
                  <button
                    key={pid}
                    onClick={() => void handleSelectBuiltInPersona(pid)}
                    className={`px-2.5 py-2 rounded-lg text-xs font-semibold border text-left transition-colors truncate ${
                      selected
                        ? 'bg-white/10 border-amber-400 text-white'
                        : 'bg-transparent border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {p.name} {!allowed ? '· $5' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4 Custom Build-Your-Own Agent Slots ($10 Max Tier) */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2 tabular-nums">
              <span>Custom Agents ($10)</span>
              <button
                onClick={() => switchTab('studio')}
                className="text-amber-400 hover:underline font-semibold"
              >
                {customAgents.length}/4 Built
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[1, 2, 3, 4].map((slot) => {
                const agent = customAgents.find((a) => a.slotIndex === slot);
                const isSelected = Boolean(agent && activePersonaId === agent.agentId);
                return (
                  <button
                    key={slot}
                    onClick={() => {
                      if (agent && isMaxTier) {
                        void handleSelectCustomAgent(agent);
                      } else {
                        setSelectedSlot(slot);
                        switchTab('studio');
                      }
                    }}
                    className={`px-2.5 py-2 rounded-lg text-xs font-semibold border text-left transition-colors truncate ${
                      isSelected
                        ? 'bg-white/10 border-amber-400 text-white'
                        : agent
                        ? 'bg-white/5 border-white/15 text-gray-200 hover:border-white/30'
                        : 'bg-transparent border-dashed border-white/10 text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {agent ? agent.name : `+ Slot #${slot}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2 tabular-nums">
              <span>Intensity</span>
              <span className="font-semibold text-white">
                L{activeIntensity} · {INTENSITY_LABELS[activeIntensity]?.label}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1 tabular-nums">
              {[1, 2, 3, 4, 5].map((lvl) => {
                const locked = lvl > tierSpec.maxIntensityLevel;
                const selected = activeIntensity === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => void handleSelectIntensity(lvl)}
                    title={
                      locked
                        ? `Upgrade to ${lvl === 5 ? 'Max ($10/mo · $100/yr)' : 'Pro ($5/mo)'} for Level ${lvl}`
                        : `Level ${lvl}: ${INTENSITY_LABELS[lvl].label}`
                    }
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      selected
                        ? 'bg-amber-400 text-[#0c0c14] border-amber-400'
                        : locked
                        ? 'border-white/5 text-gray-600 hover:border-white/20'
                        : 'border-white/10 text-gray-300 hover:border-white/30'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Account Footer */}
        <div className="hidden lg:flex mt-auto p-4 border-t border-white/10 items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">
              {profile?.displayName || user.displayName || 'Member'}
            </div>
            <div className="text-[11px] text-gray-500 truncate">
              {account?.email || user.email}
            </div>
          </div>
          <button
            onClick={() => void signOutUser()}
            title="Sign out"
            className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/25 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Contextual Top Bar */}
        <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-6 bg-[#0c0c14]">
          <div className="flex items-center gap-2 text-sm text-gray-400 min-w-0">
            <span className="hidden sm:inline">Workspace</span>
            <span className="hidden sm:inline" aria-hidden="true">/</span>
            <span className="font-bold text-white truncate">{tabTitles[activeTab]}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => switchTab('studio')}
              className="hidden sm:flex px-3.5 py-2 rounded-lg border border-white/15 text-xs font-bold text-gray-200 hover:border-amber-400 transition-colors items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Build Agent ({customAgents.length}/4)</span>
            </button>
            <button
              onClick={() => {
                setSessionDate(selectedDate);
                setShowNewSessionForm(true);
              }}
              className="px-3.5 py-2 rounded-lg border border-white/15 text-xs font-bold text-white hover:border-amber-400 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Block</span>
            </button>
            <button
              onClick={() => setShowNewGoalForm(true)}
              className="px-3.5 py-2 rounded-lg bg-amber-400 text-[#0c0c14] text-xs font-black hover:brightness-110 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Goal</span>
            </button>
          </div>
        </header>

        {statusBanner && (
          <div className="mx-6 mt-4 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 text-xs text-amber-200">
            <span>{statusBanner}</span>
            <button
              onClick={() => setStatusBanner(null)}
              className="text-amber-400 font-bold hover:underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Quick Inline Modals for New Goal / New Session */}
        {showNewGoalForm && (
          <div className="mx-6 mt-4 p-5 rounded-2xl bg-[#141420] border border-white/15">
            <form onSubmit={(e) => void handleCreateGoalSubmit(e)} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white">Create Accountability Goal</h3>
                <button
                  type="button"
                  onClick={() => setShowNewGoalForm(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Goal Title</label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="e.g., Ship customer onboarding v2"
                    className="w-full px-3 py-2 rounded-lg bg-[#0c0c14] border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Life Area</label>
                  <select
                    value={goalArea}
                    onChange={(e) => setGoalArea(e.target.value as LifeArea)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0c0c14] border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    {LIFE_AREAS.map((a) => (
                      <option key={a.name} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Horizon</label>
                    <select
                      value={goalHorizon}
                      onChange={(e) => setGoalHorizon(e.target.value as GoalHorizon)}
                      className="w-full px-2.5 py-2 rounded-lg bg-[#0c0c14] border border-white/15 text-sm text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Blocks</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={goalTargetSessions}
                      onChange={(e) => setGoalTargetSessions(Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-lg bg-[#0c0c14] border border-white/15 text-sm text-white tabular-nums"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  maxLength={500}
                  value={goalNotes}
                  onChange={(e) => setGoalNotes(e.target.value)}
                  placeholder="Optional definition of done (up to 500 chars)"
                  className="flex-1 px-3 py-2 rounded-lg bg-[#0c0c14] border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-400 text-[#0c0c14] text-xs font-black hover:brightness-110 whitespace-nowrap"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        )}

        {showNewSessionForm && (
          <div className="mx-6 mt-4 p-5 rounded-2xl bg-[#141420] border border-white/15">
            <form onSubmit={(e) => void handleCreateSessionSubmit(e)} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white">
                  Schedule Execution Block (Supervised by {activePersona.name})
                </h3>
                <button
                  type="button"
                  onClick={() => setShowNewSessionForm(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Session Title</label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    placeholder="e.g., Deep Work Sprint"
                    className="w-full px-3 py-2 rounded-lg bg-[#0c0c14] border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0c0c14] border border-white/15 text-sm text-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Start Hour</label>
                  <select
                    value={sessionHour}
                    onChange={(e) => setSessionHour(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#0c0c14] border border-white/15 text-sm text-white tabular-nums"
                  >
                    {Array.from({ length: 18 }, (_, i) => i + 5).map((h) => (
                      <option key={h} value={h}>
                        {formatHour(h)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Duration</label>
                  <select
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#0c0c14] border border-white/15 text-sm text-white tabular-nums"
                  >
                    <option value={25}>25 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                    <option value={120}>120 min</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <select
                  value={sessionGoalId}
                  onChange={(e) => setSessionGoalId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#0c0c14] border border-white/15 text-sm text-white"
                >
                  <option value="">No linked goal (standalone session)</option>
                  {goals
                    .filter((g) => g.status !== 'completed')
                    .map((g) => (
                      <option key={g.goalId} value={g.goalId}>
                        Link Goal: {g.title} ({g.lifeArea})
                      </option>
                    ))}
                </select>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-400 text-[#0c0c14] text-xs font-black hover:brightness-110 whitespace-nowrap"
                >
                  Lock Onto Calendar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Body */}
        <main className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
          {/* TODAY TAB */}
          {activeTab === 'today' && (
            <>
              {/* Coach Briefing Banner */}
              <section className="rounded-2xl bg-[#141420] border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="text-xs text-gray-400 flex flex-wrap items-center gap-2">
                    <span style={{ color: activePersona.color }} className="font-bold">
                      {activePersona.name}
                    </span>
                    {activePersona.isCustom && (
                      <>
                        <span>·</span>
                        <span className="text-amber-300 font-semibold">
                          Custom Agent ({activePersona.specialty})
                        </span>
                      </>
                    )}
                    <span>·</span>
                    <span>Level {activeIntensity} ({INTENSITY_LABELS[activeIntensity]?.label})</span>
                    <span>·</span>
                    <span className="tabular-nums">{todayStr}</span>
                  </div>
                  <h2 className="text-2xl font-black text-white" style={{ textWrap: 'balance' }}>
                    {activePersona.defaultGreeting}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {unscheduledActiveGoals.length > 0
                      ? `${unscheduledActiveGoals.length} active goal(s) still lack calendar blocks — "${unscheduledActiveGoals[0].title}" needs a slot today.`
                      : todaySessions.length > 0
                      ? `You have ${todaySessions.length} session(s) on today's grid (${todayCompleted} completed).`
                      : 'Your calendar is wide open today. Lock your first execution block now.'}
                  </p>
                </div>

                <div className="flex items-center gap-6 shrink-0 tabular-nums border-t md:border-t-0 pt-4 md:pt-0 border-white/10">
                  <div>
                    <div className="text-xs text-gray-400">Today Done</div>
                    <div className="text-3xl font-black text-amber-400">
                      {todayCompleted}/{todaySessions.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Custom Agents</div>
                    <div className="text-3xl font-black text-white">
                      {customAgents.length}/4
                    </div>
                  </div>
                </div>
              </section>

              {/* Empty Workspace Quick Seeder */}
              {goals.length === 0 && sessions.length === 0 && (
                <section className="rounded-2xl bg-[#141420] border border-dashed border-white/20 p-8 text-center space-y-4">
                  <h3 className="text-xl font-black text-white">
                    Your Firebase Coaching Workspace Is Ready
                  </h3>
                  <p className="text-sm text-gray-400 max-w-lg mx-auto">
                    Start from scratch with your own goals and time blocks, populate sample goals, or open the Agent Studio to build up to 4 custom AI accountability coaches.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => void handleSeedStarter()}
                      disabled={seeding}
                      className="px-5 py-2.5 rounded-xl bg-amber-400 text-[#0c0c14] text-xs font-black hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      {seeding ? 'Populating Firestore…' : 'Populate Sample Goals & Today’s Schedule'}
                    </button>
                    <button
                      onClick={() => switchTab('studio')}
                      className="px-5 py-2.5 rounded-xl border border-white/15 text-xs font-semibold text-gray-300 hover:text-white"
                    >
                      Open Build-Your-Own Agent Studio
                    </button>
                  </div>
                </section>
              )}

              {/* Two-Column Today Split */}
              <div className="grid lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 rounded-2xl bg-[#141420] border border-white/10 divide-y divide-white/10">
                  <div className="px-5 py-4 flex items-center justify-between">
                    <h3 className="text-base font-black text-white">Today’s Execution Blocks</h3>
                    <span className="text-xs text-gray-400 tabular-nums">
                      {todaySessions.length} scheduled
                    </span>
                  </div>

                  {todaySessions.length === 0 ? (
                    <div className="p-8 text-center space-y-3">
                      <p className="text-sm text-gray-400">No blocks scheduled for today yet.</p>
                      <button
                        onClick={() => {
                          setSessionDate(todayStr);
                          setShowNewSessionForm(true);
                        }}
                        className="px-4 py-2 rounded-lg bg-white/10 text-xs font-bold text-white hover:bg-white/15"
                      >
                        + Add Today’s First Block
                      </button>
                    </div>
                  ) : (
                    todaySessions.map((sess) => (
                      <SessionRow
                        key={sess.sessionId}
                        session={sess}
                        goalTitle={goals.find((g) => g.goalId === sess.goalId)?.title}
                        coachName={resolvePersonaInfo(sess.coachPersona, customAgents).name}
                        onComplete={() => void completeSession(sess)}
                        onSnooze={() => void snoozeSession(sess)}
                        onDelete={() => void deleteSession(sess)}
                      />
                    ))
                  )}
                </div>

                <div className="rounded-2xl bg-[#141420] border border-white/10 divide-y divide-white/10">
                  <div className="px-5 py-4 flex items-center justify-between">
                    <h3 className="text-base font-black text-white">Needs Calendar Time</h3>
                    <span className="text-xs text-amber-400 font-semibold tabular-nums">
                      {unscheduledActiveGoals.length} unscheduled
                    </span>
                  </div>
                  {unscheduledActiveGoals.length === 0 ? (
                    <div className="p-6 text-xs text-gray-400 leading-relaxed">
                      Every active goal has at least one calendar session assigned. Zero drift detected.
                    </div>
                  ) : (
                    unscheduledActiveGoals.map((g) => (
                      <div key={g.goalId} className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate">{g.title}</div>
                          <div className="text-xs text-gray-400">
                            {g.lifeArea} · {g.horizon} · 0/{g.targetSessions} blocks
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSessionTitle(`${g.title} Sprint`);
                            setSessionGoalId(g.goalId);
                            setSessionDate(todayStr);
                            setShowNewSessionForm(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-400/15 text-amber-300 border border-amber-400/30 text-xs font-bold hover:bg-amber-400 hover:text-[#0c0c14] transition-colors whitespace-nowrap shrink-0"
                        >
                          Assign Block
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* BUILD-YOUR-OWN AGENT STUDIO TAB (4 Custom Slots on $10/mo · $100/yr Max Tier) */}
          {activeTab === 'studio' && (
            <div className="space-y-6">
              {/* Studio Header Banner */}
              <section className="rounded-2xl bg-[#141420] border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span className="text-amber-400 font-bold">Upper-Tier ($10/mo · $100/yr Save $20)</span>
                    <span>·</span>
                    <span>4 Standard Coaches + 4 Custom Build-Your-Own Agents</span>
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    Build Your Own AI Coach & Accountability Roster
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    While the $5 Pro plan gives you our 4 standard coaches, the $10 Max plan lets you design 4 additional custom persona agents — like a dedicated Workout Coach, Goal-Setting Strategist, Deep Work Lead, or Recovery Guard — each enforcing your custom accountability rules.
                  </p>
                </div>

                {!isMaxTier ? (
                  <button
                    onClick={() => openCheckoutModal('max', 'annual')}
                    className="px-5 py-3 rounded-xl bg-amber-400 text-[#0c0c14] text-xs font-black hover:brightness-110 transition-all whitespace-nowrap shrink-0"
                  >
                    Unlock 4 Custom Agent Slots ($10/mo · $100/yr) →
                  </button>
                ) : (
                  <div className="text-right tabular-nums shrink-0">
                    <div className="text-xs text-emerald-400 font-bold">Max Studio Unlocked</div>
                    <div className="text-2xl font-black text-white">{customAgents.length} / 4 Slots Active</div>
                  </div>
                )}
              </section>

              {/* 4 Custom Agent Slot Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((slot) => {
                  const slotAgent = customAgents.find((a) => a.slotIndex === slot);
                  const isEditing = selectedSlot === slot;
                  const isActiveCoach = Boolean(slotAgent && activePersonaId === slotAgent.agentId);

                  return (
                    <div
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSelectedSlot(slot);
                      }}
                      className={`rounded-2xl p-5 border text-left transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                        isEditing
                          ? 'bg-[#1a1628] border-amber-400'
                          : 'bg-[#141420] border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-400 tabular-nums">
                          <span>Custom Slot #{slot}</span>
                          {isActiveCoach ? (
                            <span className="text-emerald-400 font-bold">Active Coach ✓</span>
                          ) : slotAgent ? (
                            <span style={{ color: slotAgent.accentColor }} className="font-semibold">
                              L{slotAgent.defaultIntensity}
                            </span>
                          ) : (
                            <span className="text-gray-500">Empty Slot</span>
                          )}
                        </div>

                        {slotAgent ? (
                          <>
                            <div className="text-base font-black text-white truncate">
                              {slotAgent.name}
                            </div>
                            <div className="text-xs font-semibold" style={{ color: slotAgent.accentColor }}>
                              {slotAgent.specialty}
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2">
                              {slotAgent.accountabilityProtocol}
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="text-base font-bold text-gray-300">
                              + Build Coach #{slot}
                            </div>
                            <p className="text-xs text-gray-500">
                              Click to configure a Workout, Goal-Setting, or Custom Accountability agent.
                            </p>
                          </>
                        )}
                      </div>

                      {slotAgent && (
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleSelectCustomAgent(slotAgent);
                            }}
                            className="text-xs font-bold text-amber-400 hover:underline"
                          >
                            {isActiveCoach ? 'Currently Active' : 'Set as Active Coach'}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void deleteCustomAgent(slotAgent.agentId);
                            }}
                            title="Delete custom agent"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Custom Agent Builder Form & Blueprint Presets */}
              <div className="grid lg:grid-cols-3 gap-6 items-start">
                {/* Left 2 Columns: Builder Form */}
                <form
                  onSubmit={(e) => void handleSaveCustomAgentSubmit(e)}
                  className="lg:col-span-2 rounded-2xl bg-[#141420] border border-white/10 p-6 space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <div className="text-xs text-amber-400 font-bold tabular-nums">
                        Configuring Custom Agent Slot #{selectedSlot} of 4
                      </div>
                      <h3 className="text-lg font-black text-white">
                        {currentSlotExisting
                          ? `Edit "${currentSlotExisting.name}"`
                          : `Design New Custom Coach for Slot #${selectedSlot}`}
                      </h3>
                    </div>

                    {/* Quick Starter Templates */}
                    <div className="flex flex-wrap gap-1.5">
                      {CUSTOM_AGENT_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applyBlueprintPreset(preset)}
                          className="px-2.5 py-1 rounded-lg bg-[#0c0c14] border border-white/10 text-xs text-gray-300 hover:border-amber-400/60 hover:text-white transition-colors whitespace-nowrap"
                        >
                          Load {preset.label.split(' ')[0]} Template
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Custom Coach Name (max 60 chars)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={60}
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        placeholder="e.g., Iron Rep Workout Coach"
                        className="w-full px-3 py-2 rounded-xl bg-[#0c0c14] border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Coaching Specialty
                      </label>
                      <select
                        value={agentSpecialty}
                        onChange={(e) => setAgentSpecialty(e.target.value as CustomAgentSpecialty)}
                        className="w-full px-3 py-2 rounded-xl bg-[#0c0c14] border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400"
                      >
                        {CUSTOM_AGENT_SPECIALTIES.map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Communication & Delivery Style
                      </label>
                      <select
                        value={agentStyle}
                        onChange={(e) => setAgentStyle(e.target.value as CustomAgentStyle)}
                        className="w-full px-3 py-2 rounded-xl bg-[#0c0c14] border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400"
                      >
                        {CUSTOM_AGENT_STYLES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Short Motto / Tagline (max 100 chars)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={100}
                        value={agentTagline}
                        onChange={(e) => setAgentTagline(e.target.value)}
                        placeholder="e.g., Progressive overload, zero skipped gym blocks."
                        className="w-full px-3 py-2 rounded-xl bg-[#0c0c14] border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Accountability Mandate & Rules Enforced on Your Calendar (max 300 chars)
                    </label>
                    <textarea
                      required
                      rows={3}
                      maxLength={300}
                      value={agentProtocol}
                      onChange={(e) => setAgentProtocol(e.target.value)}
                      placeholder="Define exactly what this coach holds you accountable for during daily briefings and check-ins…"
                      className="w-full px-3 py-2 rounded-xl bg-[#0c0c14] border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Signature Opening Phrase (max 160 chars)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={160}
                      value={agentPhrase}
                      onChange={(e) => setAgentPhrase(e.target.value)}
                      placeholder="e.g., The bar is loaded and your training window is open."
                      className="w-full px-3 py-2 rounded-xl bg-[#0c0c14] border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">
                        Agent Accent Color
                      </label>
                      <div className="flex items-center gap-2">
                        {CUSTOM_AGENT_COLORS.map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setAgentColor(c.hex)}
                            title={c.label}
                            className={`w-8 h-8 rounded-lg border-2 transition-transform ${
                              agentColor === c.hex ? 'scale-110 border-white' : 'border-transparent opacity-75'
                            }`}
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-2 tabular-nums">
                        Default Intensity: Level {agentIntensity} ({INTENSITY_LABELS[agentIntensity]?.label})
                      </label>
                      <div className="grid grid-cols-5 gap-1.5 tabular-nums">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setAgentIntensity(lvl)}
                            className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                              agentIntensity === lvl
                                ? 'bg-amber-400 text-[#0c0c14] border-amber-400'
                                : 'border-white/15 text-gray-300 hover:border-white/30'
                            }`}
                          >
                            L{lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <span className="text-xs text-gray-400">
                      Saves directly to Firestore `/users/{user.uid.slice(0, 6)}…/customAgents/custom_slot_{selectedSlot}`
                    </span>
                    <button
                      type="submit"
                      disabled={savingAgent}
                      className="px-6 py-3 rounded-xl bg-amber-400 text-[#0c0c14] font-black text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                    >
                      {!isMaxTier && <Lock className="w-3.5 h-3.5" />}
                      <span>
                        {savingAgent
                          ? 'Saving to Firebase…'
                          : !isMaxTier
                          ? 'Upgrade to Max ($10/mo · $100/yr) to Save Agent'
                          : `Save & Activate Slot #${selectedSlot} Coach`}
                      </span>
                    </button>
                  </div>
                </form>

                {/* Right Column: Live Agent Preview & Quick Blueprints */}
                <div className="space-y-4">
                  <div
                    className="rounded-2xl p-6 bg-[#141420] space-y-4"
                    style={{ border: `2px solid ${agentColor}` }}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold" style={{ color: agentColor }}>
                        Slot #{selectedSlot} Live Preview
                      </span>
                      <span className="text-gray-400 tabular-nums">
                        Level {agentIntensity} · {agentStyle}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xl font-black text-white">{agentName || 'Unnamed Agent'}</h4>
                      <p className="text-xs font-semibold" style={{ color: agentColor }}>
                        {agentSpecialty} · {agentTagline}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#0c0c14] border border-white/10 p-3.5 space-y-2">
                      <div className="text-[11px] text-gray-400 font-semibold">
                        Sample Dispatch Response
                      </div>
                      <p className="text-xs text-gray-200 leading-relaxed italic">
                        “{agentPhrase} Applying your protocol: {agentProtocol}”
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#141420] border border-white/10 p-5 space-y-3">
                    <h4 className="text-sm font-black text-white">4 Recommended Custom Archetypes</h4>
                    <p className="text-xs text-gray-400">
                      Click any template below to pre-fill Slot #{selectedSlot}, then customize its rules:
                    </p>
                    <div className="space-y-2">
                      {CUSTOM_AGENT_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applyBlueprintPreset(preset)}
                          className="w-full p-3 rounded-xl bg-[#0c0c14] border border-white/10 hover:border-amber-400/50 text-left transition-colors"
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-white">
                            <span>{preset.name}</span>
                            <span style={{ color: preset.accentColor }}>{preset.specialty}</span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                            {preset.tagline}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PLANNER TAB */}
          {activeTab === 'planner' && (
            <div className="space-y-6">
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((wd) => {
                  const dayTotal = sessions.filter((s) => s.scheduledDate === wd.dateStr).length;
                  const dayDone = sessions.filter(
                    (s) => s.scheduledDate === wd.dateStr && s.status === 'completed'
                  ).length;
                  const isSelected = wd.dateStr === selectedDate;
                  return (
                    <button
                      key={wd.dateStr}
                      onClick={() => setSelectedDate(wd.dateStr)}
                      className={`p-3 rounded-xl border text-center transition-colors tabular-nums ${
                        isSelected
                          ? 'bg-amber-400 text-[#0c0c14] border-amber-400'
                          : 'bg-[#141420] border-white/10 text-gray-300 hover:border-white/25'
                      }`}
                    >
                      <div className={`text-xs font-semibold ${isSelected ? 'text-[#0c0c14]/80' : 'text-gray-400'}`}>
                        {wd.dayShort}
                      </div>
                      <div className="text-lg font-black mt-0.5">{wd.dayNum}</div>
                      <div className={`text-[11px] mt-1 ${isSelected ? 'text-[#0c0c14]/90 font-bold' : 'text-gray-500'}`}>
                        {dayTotal > 0 ? `${dayDone}/${dayTotal}` : '—'}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl bg-[#141420] border border-white/10 divide-y divide-white/10">
                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-white tabular-nums">
                      Schedule for {selectedDate}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Morning, midday, and evening execution blocks
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSessionDate(selectedDate);
                      setShowNewSessionForm(true);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-amber-400 text-[#0c0c14] text-xs font-black hover:brightness-110 whitespace-nowrap"
                  >
                    + Add Block on {selectedDate}
                  </button>
                </div>

                {selectedDaySessions.length === 0 ? (
                  <div className="p-10 text-center text-sm text-gray-400">
                    No blocks scheduled for {selectedDate}. Click “+ Add Block” above to reserve focus time.
                  </div>
                ) : (
                  selectedDaySessions.map((sess) => (
                    <SessionRow
                      key={sess.sessionId}
                      session={sess}
                      goalTitle={goals.find((g) => g.goalId === sess.goalId)?.title}
                      coachName={resolvePersonaInfo(sess.coachPersona, customAgents).name}
                      onComplete={() => void completeSession(sess)}
                      onSnooze={() => void snoozeSession(sess)}
                      onDelete={() => void deleteSession(sess)}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* GOALS TAB */}
          {activeTab === 'goals' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={goalSearch}
                    onChange={(e) => setGoalSearch(e.target.value)}
                    placeholder="Filter goals…"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141420] border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#141420] border border-white/10 overflow-x-auto">
                  {(['All', ...LIFE_AREAS.map((a) => a.name)] as ('All' | LifeArea)[]).map((area) => (
                    <button
                      key={area}
                      onClick={() => setGoalAreaFilter(area)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        goalAreaFilter === area
                          ? 'bg-amber-400 text-[#0c0c14]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              {tierSpec.maxActiveGoals !== null && (
                <div className="px-4 py-3 rounded-xl bg-[#141420] border border-white/10 flex items-center justify-between gap-4 text-xs">
                  <span className="text-gray-300 tabular-nums">
                    Starter Tier Quota: {goals.filter((g) => g.status === 'active').length} / {tierSpec.maxActiveGoals} active goals used
                  </span>
                  <button
                    onClick={() => openCheckoutModal('pro', 'annual')}
                    className="text-amber-400 font-bold hover:underline whitespace-nowrap"
                  >
                    Unlock Unlimited Goals ($5/mo) →
                  </button>
                </div>
              )}

              <div className="rounded-2xl bg-[#141420] border border-white/10 divide-y divide-white/10">
                {filteredGoals.length === 0 ? (
                  <div className="p-10 text-center space-y-3">
                    <p className="text-sm text-gray-400">No goals match your current filter.</p>
                    <button
                      onClick={() => setShowNewGoalForm(true)}
                      className="px-4 py-2 rounded-lg bg-amber-400 text-[#0c0c14] text-xs font-black"
                    >
                      + Create Goal
                    </button>
                  </div>
                ) : (
                  filteredGoals.map((goal) => {
                    const pct = Math.min(
                      100,
                      Math.round((goal.completedSessions / Math.max(1, goal.targetSessions)) * 100)
                    );
                    const isCompleted = goal.status === 'completed';
                    return (
                      <div
                        key={goal.goalId}
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="font-semibold text-white">{goal.lifeArea}</span>
                            <span>·</span>
                            <span className="capitalize">{goal.horizon}</span>
                            <span>·</span>
                            <span className="tabular-nums">
                              {goal.completedSessions}/{goal.targetSessions} completed ({goal.scheduledSessions} scheduled)
                            </span>
                            {isCompleted && (
                              <>
                                <span>·</span>
                                <span className="text-emerald-400 font-semibold">Completed ✓</span>
                              </>
                            )}
                          </div>
                          <div className={`text-base font-bold ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
                            {goal.title}
                          </div>
                          {goal.notes && (
                            <p className="text-xs text-gray-400 line-clamp-2">{goal.notes}</p>
                          )}
                          <div className="h-1.5 w-full max-w-md bg-[#0c0c14] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!isCompleted && (
                            <>
                              <button
                                onClick={() => {
                                  setSessionTitle(`${goal.title} Block`);
                                  setSessionGoalId(goal.goalId);
                                  setSessionDate(todayStr);
                                  setShowNewSessionForm(true);
                                }}
                                className="px-3 py-1.5 rounded-lg border border-white/15 text-xs font-semibold text-gray-200 hover:border-amber-400 whitespace-nowrap"
                              >
                                + Block
                              </button>
                              <button
                                onClick={() => void completeGoal(goal.goalId)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500 hover:text-[#0c0c14] transition-colors whitespace-nowrap"
                              >
                                Mark Done
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => void deleteGoal(goal.goalId)}
                            aria-label="Delete goal"
                            className="p-2 rounded-lg border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* VOICE & CHECK-IN TAB */}
          {activeTab === 'coach' && (
            <div className="grid lg:grid-cols-5 gap-6 items-start">
              <div className="lg:col-span-2 rounded-2xl bg-[#141420] border border-white/10 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white">Live Coach Dispatch</h3>
                    <p className="text-xs text-gray-400">
                      {activePersona.name} {activePersona.isCustom ? `(${activePersona.specialty})` : ''} · Level {activeIntensity}
                    </p>
                  </div>
                  <button
                    onClick={() => setSpeechEnabled(!speechEnabled)}
                    title="Toggle spoken audio response"
                    className={`p-2 rounded-lg border text-xs ${
                      speechEnabled
                        ? 'border-amber-400/50 text-amber-400 bg-amber-400/10'
                        : 'border-white/10 text-gray-500'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Coach Switcher (Standard + Custom Built Agents) */}
                {customAgents.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-gray-400">Active Custom & Standard Roster</div>
                    <div className="flex flex-wrap gap-1.5">
                      {customAgents.map((ca) => (
                        <button
                          key={ca.agentId}
                          type="button"
                          onClick={() => void handleSelectCustomAgent(ca)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                            activePersonaId === ca.agentId
                              ? 'bg-amber-400 text-[#0c0c14] border-amber-400'
                              : 'bg-[#0c0c14] border-white/15 text-gray-300 hover:text-white'
                          }`}
                        >
                          {ca.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Microphone Button */}
                <div className="py-4 flex flex-col items-center justify-center gap-3">
                  <button
                    onClick={handleToggleVoiceCapture}
                    className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all ${
                      isListening
                        ? 'bg-red-500/20 border-red-400 text-red-400 scale-105'
                        : tierSpec.voiceCoachingIncluded
                        ? 'bg-amber-400/15 border-amber-400 text-amber-400 hover:scale-105'
                        : 'bg-white/5 border-white/15 text-gray-400 hover:border-amber-400/50'
                    }`}
                  >
                    {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </button>
                  <p className="text-xs text-gray-400 text-center">
                    {isListening
                      ? 'Listening… speak your check-in now'
                      : tierSpec.voiceCoachingIncluded
                      ? `Tap microphone to talk with ${activePersona.name}`
                      : 'Live Voice Coaching & Custom Agents are included in Max ($10/mo · $100/yr)'}
                  </p>
                </div>

                {/* Quick Prompt Buttons */}
                <div className="flex flex-wrap gap-2">
                  {[
                    "What's on my agenda today?",
                    'Check unscheduled goal drift',
                    'Hold me to my custom accountability rule',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => void handleSendCoachPrompt(q, 'text')}
                      className="px-3 py-1.5 rounded-lg bg-[#0c0c14] border border-white/10 text-xs text-gray-300 hover:border-amber-400/50 hover:text-white transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Text Check-in Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSendCoachPrompt(coachInput, 'text');
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    maxLength={400}
                    value={coachInput}
                    onChange={(e) => setCoachInput(e.target.value)}
                    placeholder={`Message ${activePersona.name}…`}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-[#0c0c14] border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    aria-label="Send check-in"
                    className="p-2.5 rounded-xl bg-amber-400 text-[#0c0c14] hover:brightness-110 transition-all shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Immutable Check-in Log */}
              <div className="lg:col-span-3 rounded-2xl bg-[#141420] border border-white/10 divide-y divide-white/10">
                <div className="px-5 py-4 flex items-center justify-between">
                  <h3 className="text-base font-black text-white">Coaching Dispatch History</h3>
                  <span className="text-xs text-gray-400 tabular-nums">{checkins.length} entries</span>
                </div>
                {checkins.length === 0 ? (
                  <div className="p-10 text-center text-sm text-gray-400">
                    No coaching dispatches logged yet. Trigger a prompt on the left to record your first check-in in Firestore.
                  </div>
                ) : (
                  checkins.slice(0, 12).map((chk) => {
                    const resolved = resolvePersonaInfo(chk.persona, customAgents);
                    return (
                      <div key={chk.checkinId} className="p-5 space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>
                            <strong style={{ color: resolved.color }}>{resolved.name}</strong>
                            {resolved.isCustom ? ` (${resolved.specialty})` : ''} · Level {chk.intensityLevel} · {chk.channel}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">You: “{chk.prompt}”</p>
                        <p className="text-sm text-white font-medium leading-relaxed">
                          {chk.coachReply}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* MEMBERSHIP & BILLING TAB */}
          {activeTab === 'membership' && (
            <div className="space-y-8">
              <section className="rounded-2xl bg-[#141420] border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>Active Membership</span>
                    <span>·</span>
                    <span className="capitalize text-emerald-400 font-semibold">
                      {account?.subscriptionStatus || 'active'}
                    </span>
                    <span>·</span>
                    <span>
                      {stripeStatus.configured
                        ? 'Live Stripe API Connected'
                        : 'Stripe Wiring Ready (Awaiting STRIPE_SECRET_KEY in .env)'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    {tierSpec.name}{' '}
                    <span className="text-amber-400 tabular-nums">
                      {account?.priceCents
                        ? `($${(account.priceCents / 100).toFixed(0)}/${account.billingCycle === 'annual' ? 'yr' : 'mo'})`
                        : '($0 Free)'}
                    </span>
                  </h2>
                  <p className="text-xs text-gray-400">
                    {account?.annualSavingsCents
                      ? `Upfront annual discount applied: saving $${(account.annualSavingsCents / 100).toFixed(0)}/year.`
                      : 'Pro ($5/mo) unlocks all 4 standard coaches; Max ($10/mo or $100/yr Save $20) adds 4 Build-Your-Own Custom Coach Agents.'}
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-[#0c0c14] p-1 rounded-xl border border-white/10 shrink-0">
                  <button
                    onClick={() => setBillingCycleView('monthly')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                      billingCycleView === 'monthly'
                        ? 'bg-white text-[#0c0c14]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    onClick={() => setBillingCycleView('annual')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                      billingCycleView === 'annual'
                        ? 'bg-emerald-400 text-[#0c0c14]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Annual Upfront (Save $20)
                  </button>
                </div>
              </section>

              {/* 3-Tier Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                {MEMBERSHIP_TIERS.map((plan) => {
                  const isCurrent =
                    currentTier === plan.tier &&
                    (plan.tier === 'starter' || account?.billingCycle === billingCycleView);
                  const displayDollars =
                    plan.tier === 'starter'
                      ? 0
                      : billingCycleView === 'annual'
                      ? plan.annualPriceDollars
                      : plan.monthlyPriceDollars;

                  return (
                    <div
                      key={plan.tier}
                      className={`rounded-2xl p-6 flex flex-col border transition-colors ${
                        plan.highlight
                          ? 'bg-[#181422] border-amber-400/60'
                          : 'bg-[#141420] border-white/10'
                      }`}
                    >
                      <div className="text-xs text-gray-400 mb-1">{plan.audience}</div>
                      <div className="flex items-baseline justify-between gap-2 mb-2">
                        <h3 className="text-xl font-black text-white">{plan.name}</h3>
                        {plan.badgeText && billingCycleView === 'annual' && (
                          <span className="text-xs font-bold text-emerald-400 whitespace-nowrap">
                            Save ${plan.annualSavingsDollars}
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-1.5 mb-1 tabular-nums">
                        <span className="text-4xl font-black text-white">${displayDollars}</span>
                        <span className="text-xs text-gray-400">
                          {plan.tier === 'starter'
                            ? '/ forever'
                            : billingCycleView === 'annual'
                            ? '/ year upfront'
                            : '/ month'}
                        </span>
                      </div>

                      <div className="text-xs text-gray-400 mb-5 min-h-[18px] tabular-nums">
                        {plan.tier !== 'starter' && billingCycleView === 'annual' ? (
                          <span className="text-emerald-400 font-medium">
                            ${plan.annualEffectiveMonthlyDollars}/mo effective · ${plan.annualSavingsDollars} saved vs ${plan.monthlyPriceDollars * 12}/yr
                          </span>
                        ) : plan.tier !== 'starter' ? (
                          <span>
                            Or ${plan.annualPriceDollars}/yr upfront (save ${plan.annualSavingsDollars})
                          </span>
                        ) : (
                          <span>No credit card required</span>
                        )}
                      </div>

                      <ul className="space-y-2.5 mb-6 flex-1 border-t border-white/10 pt-4">
                        {plan.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-2 text-xs text-gray-300">
                            <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => openCheckoutModal(plan.tier, billingCycleView)}
                        disabled={isCurrent}
                        className={`w-full py-3 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                          isCurrent
                            ? 'bg-white/10 text-gray-400 cursor-default'
                            : plan.highlight
                            ? 'bg-amber-400 text-[#0c0c14] hover:brightness-110'
                            : 'border border-white/20 text-white hover:border-amber-400'
                        }`}
                      >
                        {isCurrent
                          ? 'Current Active Plan'
                          : plan.tier === 'starter'
                          ? 'Downgrade to Starter'
                          : `Select ${plan.name} →`}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Firestore Checkout Audit History */}
              <section className="rounded-2xl bg-[#141420] border border-white/10 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-sm font-black text-white">
                    Membership & Stripe Checkout Intent Log
                  </h3>
                  <span className="text-xs text-gray-400 tabular-nums">
                    {checkoutIntents.length} record(s)
                  </span>
                </div>
                {checkoutIntents.length === 0 ? (
                  <div className="p-6 text-xs text-gray-400">
                    No paid plan transitions recorded yet. Selecting Pro ($5/mo · $50/yr) or Max ($10/mo · $100/yr) logs a verified CheckoutIntent in Firestore.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs tabular-nums">
                      <thead className="bg-[#0e0e18] text-gray-400 border-b border-white/10">
                        <tr>
                          <th className="px-5 py-3 font-semibold">Intent ID</th>
                          <th className="px-5 py-3 font-semibold">Tier & Cycle</th>
                          <th className="px-5 py-3 font-semibold text-right">Amount</th>
                          <th className="px-5 py-3 font-semibold text-right">Annual Savings</th>
                          <th className="px-5 py-3 font-semibold">Mode</th>
                          <th className="px-5 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {checkoutIntents.map((intent) => (
                          <tr key={intent.intentId} className="hover:bg-white/[0.02]">
                            <td className="px-5 py-3 font-mono text-gray-300">{intent.intentId}</td>
                            <td className="px-5 py-3 text-white font-semibold capitalize">
                              {intent.tier} · {intent.billingCycle}
                            </td>
                            <td className="px-5 py-3 text-right text-white">
                              ${(intent.amountCents / 100).toFixed(2)}
                            </td>
                            <td className="px-5 py-3 text-right text-emerald-400">
                              {intent.savingsCents > 0
                                ? `$${(intent.savingsCents / 100).toFixed(2)}`
                                : '—'}
                            </td>
                            <td className="px-5 py-3 text-gray-400">{intent.checkoutMode}</td>
                            <td className="px-5 py-3 capitalize font-semibold text-amber-300">
                              {intent.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function SessionRow({
  session,
  goalTitle,
  coachName,
  onComplete,
  onSnooze,
  onDelete,
}: {
  session: CoachingSessionDoc;
  goalTitle?: string;
  coachName?: string;
  onComplete: () => void;
  onSnooze: () => void;
  onDelete: () => void;
}) {
  const isDone = session.status === 'completed';

  return (
    <div className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
      <div className="space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 tabular-nums">
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold text-gray-200">{formatHour(session.startHour)}</span>
          <span>·</span>
          <span>{session.durationMinutes} min</span>
          <span>·</span>
          <span className="capitalize">{session.dayPart}</span>
          {coachName && (
            <>
              <span>·</span>
              <span className="text-gray-300">Coach: {coachName}</span>
            </>
          )}
          {session.snoozeCount > 0 && (
            <>
              <span>·</span>
              <span className="text-orange-400">Snoozed {session.snoozeCount}x</span>
            </>
          )}
          {goalTitle && (
            <>
              <span>·</span>
              <span className="text-amber-300 truncate max-w-[200px]">{goalTitle}</span>
            </>
          )}
        </div>
        <div className={`text-sm font-bold ${isDone ? 'line-through text-gray-500' : 'text-white'}`}>
          {session.title}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isDone ? (
          <span className="text-xs font-bold text-emerald-400 px-2.5 py-1">Completed ✓</span>
        ) : (
          <>
            <button
              onClick={onSnooze}
              className="px-3 py-1.5 rounded-lg border border-white/15 text-xs font-semibold text-gray-300 hover:text-white transition-colors whitespace-nowrap"
            >
              Snooze +1h
            </button>
            <button
              onClick={onComplete}
              className="px-3 py-1.5 rounded-lg bg-amber-400 text-[#0c0c14] text-xs font-black hover:brightness-110 transition-all flex items-center gap-1 whitespace-nowrap"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Complete</span>
            </button>
          </>
        )}
        <button
          onClick={onDelete}
          aria-label="Delete session"
          className="p-1.5 rounded-lg border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
