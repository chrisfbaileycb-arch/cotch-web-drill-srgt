# HeyCoach Firestore Security Specification (Phase 0 & Phase 5 Red Team Audit)

## 1. Data Invariants & Relationship Mapping

1. **Master Source of Truth**: `/users/{userId}` is the parent root for every member's coaching workspace.
2. **PII Split Isolation**: Member email addresses and billing/membership subscription records (`tier`, `billingCycle`, `priceCents`, `annualSavingsCents`, `stripeCustomerId`) are strictly isolated inside `/users/{userId}/private/account` (`docId == 'account'`). No PII (`email`, `phone`, `address`) is permitted in `/users/{userId}`.
3. **Verified Identity Gate**: Every write operation across all collections requires `request.auth != null`, `request.auth.token.email_verified == true`, and `request.auth.uid == userId`.
4. **Master Gate Relational Sync**: Subcollections (`customAgents`, `goals`, `sessions`, `checkins`, `checkoutIntents`, `private`) require the parent `/users/$(userId)` document to exist (`exists(/databases/$(database)/documents/users/$(userId))`). Furthermore:
   - Creating or updating a `CustomAgent` (`/users/{userId}/customAgents/{agentId}`) enforces `slotIndex in [1, 2, 3, 4]` (strictly capping custom agents to 4 slots) and verifies that the member's `/users/$(userId)/private/account` document has `tier == 'max' && subscriptionStatus == 'active'`.
   - Selecting a custom agent ID (`selectedPersona`) on `/users/{userId}` or referencing a non-built-in `coachPersona`/`persona` on `CoachingSession` or `CoachCheckin` verifies `exists(/databases/$(database)/documents/users/$(userId)/customAgents/$(personaId))`.
   - Creating or updating a `CoachingSession` with an optional `goalId` requires `exists(/databases/$(database)/documents/users/$(userId)/goals/$(incoming().goalId))`.
5. **Membership Pricing Integrity**: `UserPrivateAccount` enforces valid 3-tier combinations:
   - `starter`: `billingCycle == 'free'`, `priceCents == 0`, `annualSavingsCents == 0`
   - `pro` ($5/mo standard 4 coaches): `(billingCycle == 'monthly' && priceCents == 500 && annualSavingsCents == 0)` OR `(billingCycle == 'annual' && priceCents == 5000 && annualSavingsCents == 1000)`
   - `max` ($10/mo · $100/yr Build-Your-Own Agent Studio +4 custom coaches): `(billingCycle == 'monthly' && priceCents == 1000 && annualSavingsCents == 0)` OR `(billingCycle == 'annual' && priceCents == 10000 && annualSavingsCents == 2000)` ($100/yr upfront with $20 savings vs $10/mo).
6. **Terminal State Locking**:
   - `Goal`: Once `existing().status == 'completed'`, updates are blocked (except `isAdmin()`).
   - `CoachingSession`: Once `existing().status == 'completed'`, updates are blocked (except `isAdmin()`).
   - `CheckoutIntent`: Once `existing().status in ['activated', 'canceled']`, updates are blocked (except `isAdmin()`).
   - `CoachCheckin`: Log entries are strictly append-only (`allow update: if false;`).
7. **Temporal Integrity**: `createdAt == request.time` on `create` (immutable on `update`), and `updatedAt == request.time` on `create` and `update`.
8. **Secure List Queries**: Every `allow list` block restricts `resource.data.userId == request.auth.uid` and `request.auth.uid == userId` with zero `get()`/`exists()` calls inside `list`.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 (Identity Spoofing on UserProfile)**: Authenticated user `uid_attacker` writes `/users/uid_victim` or sets `uid: "uid_victim"`.
2. **Payload 2 (Unverified Email Spoof)**: Attacker authenticates with `email: "chrisfbailey.CB@gmail.com"` and `email_verified: false` to claim bootstrapped admin privileges.
3. **Payload 3 (Shadow Ghost Field Injection)**: Owner updates `/users/uid_1` with `{ displayName: "Alex", isAdmin: true, updatedAt: SERVER_TIMESTAMP }`.
4. **Payload 4 (PII Cross-Tenant Scrape)**: Authenticated user `uid_attacker` attempts `get` on `/users/uid_victim/private/account` to read victim email and Stripe IDs.
5. **Payload 5 (Forged Pricing / Free Max Tier)**: User writes `/users/uid_1/private/account` with `{ tier: "max", billingCycle: "annual", priceCents: 0, annualSavingsCents: 99999 }`.
6. **Payload 6 (Unauthorized Custom Agent Creation on Starter/Pro Tier)**: A `starter` or `pro` ($5) user attempts to create `/users/uid_1/customAgents/custom_slot_1` without an active `max` ($10/mo · $100/yr) subscription, or passes `slotIndex: 5` to exceed the 4-agent cap.
7. **Payload 7 (Orphaned Session With Non-Existent GoalId or Ghost Custom Agent)**: User creates `/users/uid_1/sessions/sess_1` referencing `goalId: "ghost_goal_999"` or `coachPersona: "custom_nonexistent"` that does not exist.
8. **Payload 8 (ID Poisoning / 2KB Path Variable)**: User attempts `create` at `/users/uid_1/goals/` + 500-char string containing spaces/slashes.
9. **Payload 9 (Value Poisoning on Update)**: User updates `Goal.title` or `CustomAgent.accountabilityProtocol` with a 10,000-character string or invalid enum.
10. **Payload 10 (Terminal State Mutation)**: User attempts to mutate a `Goal` or `CoachingSession` whose `existing().status == 'completed'`.
11. **Payload 11 (Timestamp Forgery & Immortal Field Mutation)**: User creates a `Goal` or `CustomAgent` with a past client `Timestamp` instead of `request.time`, or mutates `createdAt` during `update`.
12. **Payload 12 (Unauthorized List Scraping)**: User `uid_attacker` runs a collection `list` query on `/users/uid_victim/customAgents` or `/users/uid_victim/sessions`.

---

## 3. Phase 5 Red Team Conflict Report & Audit Verification

| Collection | Identity Spoofing | State Shortcutting / Terminal Lock | Resource / Value Poisoning | PII & List Query Enforcement | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/users/{userId}` | Blocked (`incoming().uid == userId && request.auth.uid == userId`) | Action-based `affectedKeys().hasOnly(...)` + custom persona existence check | `isValidId(userId)` + `displayName.size() <= 80` + `isValidUserProfile` wraps update | No PII stored; `list` denied (`allow list: if false`) | **PASS** |
| `/users/{userId}/private/{docId}` | Blocked (`docId == 'account'`, `email == request.auth.token.email`, `email_verified == true`) | Strict pricing tuple check (`isValidPricingTuple`) | `isValidUserPrivateAccount` wraps create & update; strict string `.size()` bounds | Split-collection PII restricted to `isOwner(userId) \|\| isAdmin()`; `list` denied | **PASS** |
| `/users/{userId}/customAgents/{agentId}` | Blocked (`incoming().userId == request.auth.uid`, requires `hasMaxMembership(userId)`) | Enforces `slotIndex >= 1 && slotIndex <= 4` (max 4 custom coaches) + immutable `slotIndex`/`createdAt` | `isValidId(agentId)` + `isValidCustomAgent` wraps create & update | `allow list` enforces `resource.data.userId == request.auth.uid` with zero DB lookups | **PASS** |
| `/users/{userId}/goals/{goalId}` | Blocked (`incoming().userId == request.auth.uid`, parent `/users/$(userId)` exists) | Terminal lock `existing().status != 'completed'` enforced | `isValidId(goalId)` + `isValidGoal` wraps update + `title.size() <= 120` | `allow list` enforces `resource.data.userId == request.auth.uid` with zero DB lookups | **PASS** |
| `/users/{userId}/sessions/{sessionId}` | Blocked (`incoming().userId == request.auth.uid`, optional `goalId` & custom persona existence verified) | Terminal lock `existing().status != 'completed'` enforced | `isValidId(sessionId)` + `isValidCoachingSession` wraps update + `scheduledDate` regex | `allow list` enforces `resource.data.userId == request.auth.uid` with zero DB lookups | **PASS** |
| `/users/{userId}/checkins/{checkinId}` | Blocked (`incoming().userId == request.auth.uid`, parent `/users/$(userId)` & custom persona existence verified) | Immutable (`allow update: if false`) | `isValidId(checkinId)` + `prompt.size() <= 400`, `coachReply.size() <= 1000` | `allow list` enforces `resource.data.userId == request.auth.uid` with zero DB lookups | **PASS** |
| `/users/{userId}/checkoutIntents/{intentId}` | Blocked (`incoming().userId == request.auth.uid`, parent `/users/$(userId)` exists) | Terminal lock `!(existing().status in ['activated', 'canceled'])` | `isValidId(intentId)` + `isValidCheckoutIntent` wraps update | `allow list` enforces `resource.data.userId == request.auth.uid` with zero DB lookups | **PASS** |
| `/admins/{adminUid}` | Client writes completely blocked (`allow write: if false`) | Read-only registry | `isValidId(adminUid)` | `allow list: if false`; `get` restricted to self or verified admin | **PASS** |
