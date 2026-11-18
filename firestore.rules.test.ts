import {
  assertFails,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import * as fs from 'node:fs';

/**
 * Security TDD Suite verifying all "Dirty Dozen" adversarial payloads
 * return PERMISSION_DENIED against firestore.rules.
 */
export async function runSecurityRulesDirtyDozenSuite(): Promise<void> {
  const rules = fs.readFileSync('firestore.rules', 'utf8');
  const testEnv: RulesTestEnvironment = await initializeTestEnvironment({
    projectId: 'heycoach-security-test',
    firestore: { rules },
  });

  try {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const adminDb = ctx.firestore();
      await setDoc(doc(adminDb, 'users', 'uid_victim'), {
        uid: 'uid_victim',
        displayName: 'Victim User',
        selectedPersona: 'core',
        intensityLevel: 3,
        dailyTargetSessions: 4,
        onboardingCompleted: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await setDoc(doc(adminDb, 'users', 'uid_victim', 'private', 'account'), {
        uid: 'uid_victim',
        email: 'victim@example.com',
        tier: 'max',
        billingCycle: 'annual',
        subscriptionStatus: 'active',
        priceCents: 10000,
        annualSavingsCents: 2000,
        stripeMode: 'sandbox_preview',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await setDoc(doc(adminDb, 'users', 'uid_1'), {
        uid: 'uid_1',
        displayName: 'Valid Member',
        selectedPersona: 'core',
        intensityLevel: 3,
        dailyTargetSessions: 4,
        onboardingCompleted: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await setDoc(doc(adminDb, 'users', 'uid_1', 'goals', 'goal_completed'), {
        goalId: 'goal_completed',
        userId: 'uid_1',
        title: 'Shipped Goal',
        lifeArea: 'Work',
        horizon: 'weekly',
        targetSessions: 3,
        completedSessions: 3,
        scheduledSessions: 3,
        status: 'completed',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });

    const attackerCtx = testEnv.authenticatedContext('uid_attacker', {
      email: 'attacker@example.com',
      email_verified: true,
    });
    const spoofedAdminCtx = testEnv.authenticatedContext('uid_spoof', {
      email: 'chrisfbailey.CB@gmail.com',
      email_verified: false,
    });
    const user1Ctx = testEnv.authenticatedContext('uid_1', {
      email: 'user1@example.com',
      email_verified: true,
    });
    const orphanCtx = testEnv.authenticatedContext('uid_no_profile', {
      email: 'orphan@example.com',
      email_verified: true,
    });

    // 1. Identity Spoofing on UserProfile
    await assertFails(
      setDoc(doc(attackerCtx.firestore(), 'users', 'uid_victim'), {
        uid: 'uid_victim',
        displayName: 'Pwned',
        selectedPersona: 'drill',
        intensityLevel: 5,
        dailyTargetSessions: 5,
        onboardingCompleted: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 2. Unverified Email Admin Spoof
    await assertFails(
      getDoc(doc(spoofedAdminCtx.firestore(), 'users', 'uid_victim', 'private', 'account'))
    );

    // 3. Shadow Ghost Field Injection
    await assertFails(
      updateDoc(doc(user1Ctx.firestore(), 'users', 'uid_1'), {
        displayName: 'Alex',
        isAdmin: true,
        updatedAt: serverTimestamp(),
      })
    );

    // 4. PII Cross-Tenant Scrape
    await assertFails(
      getDoc(doc(attackerCtx.firestore(), 'users', 'uid_victim', 'private', 'account'))
    );

    // 5. Forged Pricing / Free Max Tier
    await assertFails(
      setDoc(doc(user1Ctx.firestore(), 'users', 'uid_1', 'private', 'account'), {
        uid: 'uid_1',
        email: 'user1@example.com',
        tier: 'max',
        billingCycle: 'annual',
        subscriptionStatus: 'active',
        priceCents: 0,
        annualSavingsCents: 99999,
        stripeMode: 'sandbox_preview',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 6. Unauthorized Custom Agent Creation by Non-Max User & Slot Cap Guard
    await assertFails(
      setDoc(doc(user1Ctx.firestore(), 'users', 'uid_1', 'customAgents', 'custom_slot_1'), {
        agentId: 'custom_slot_1',
        userId: 'uid_1',
        slotIndex: 1,
        name: 'Iron Workout Coach',
        specialty: 'Workout & Fitness',
        tagline: 'Never miss a lift.',
        coachingStyle: 'High-Energy Athletic',
        accountabilityProtocol: 'Verify warm-up and progressive overload every session.',
        signaturePhrase: 'Bar is loaded. Let us work.',
        accentColor: '#EF4444',
        defaultIntensity: 4,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 6b. Orphaned Goal Without Parent User
    await assertFails(
      setDoc(doc(orphanCtx.firestore(), 'users', 'uid_no_profile', 'goals', 'goal_1'), {
        goalId: 'goal_1',
        userId: 'uid_no_profile',
        title: 'Orphan Goal',
        lifeArea: 'Work',
        horizon: 'weekly',
        targetSessions: 3,
        completedSessions: 0,
        scheduledSessions: 0,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 7. Orphaned Session With Non-Existent GoalId
    await assertFails(
      setDoc(doc(user1Ctx.firestore(), 'users', 'uid_1', 'sessions', 'sess_1'), {
        sessionId: 'sess_1',
        userId: 'uid_1',
        title: 'Ghost Link',
        scheduledDate: '2026-11-18',
        startHour: 9,
        durationMinutes: 60,
        dayPart: 'morning',
        goalId: 'non_existent_goal_999',
        coachPersona: 'core',
        snoozeCount: 0,
        status: 'scheduled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 8. ID Poisoning / Oversized Document ID
    const poisonedId = 'x'.repeat(200);
    await assertFails(
      setDoc(doc(user1Ctx.firestore(), 'users', 'uid_1', 'goals', poisonedId), {
        goalId: poisonedId,
        userId: 'uid_1',
        title: 'Poison ID',
        lifeArea: 'Work',
        horizon: 'daily',
        targetSessions: 1,
        completedSessions: 0,
        scheduledSessions: 0,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 9. Value Poisoning on Update (oversized title)
    await assertFails(
      updateDoc(doc(user1Ctx.firestore(), 'users', 'uid_1'), {
        displayName: 'A'.repeat(500),
        updatedAt: serverTimestamp(),
      })
    );

    // 10. Terminal State Mutation on Completed Goal
    await assertFails(
      updateDoc(doc(user1Ctx.firestore(), 'users', 'uid_1', 'goals', 'goal_completed'), {
        title: 'Reopened Illegally',
        updatedAt: serverTimestamp(),
      })
    );

    // 11. Timestamp Forgery (client timestamp instead of request.time)
    await assertFails(
      setDoc(doc(user1Ctx.firestore(), 'users', 'uid_1', 'goals', 'goal_forged_ts'), {
        goalId: 'goal_forged_ts',
        userId: 'uid_1',
        title: 'Backdated Goal',
        lifeArea: 'Health',
        horizon: 'daily',
        targetSessions: 2,
        completedSessions: 0,
        scheduledSessions: 0,
        status: 'active',
        createdAt: Timestamp.fromMillis(1000000),
        updatedAt: Timestamp.fromMillis(1000000),
      })
    );

    // 12. Unauthorized Cross-User List Query
    await assertFails(
      getDocs(collection(attackerCtx.firestore(), 'users', 'uid_victim', 'goals'))
    );
  } finally {
    await testEnv.cleanup();
  }
}
