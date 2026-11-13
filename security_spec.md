# ICONOCRACIA — Firestore Security Specification (Phase 0 TDD)

## 1. Master Source of Truth & Data Invariants

1. **Master Gate (`/users/{userId}`)**:
   - Every researcher owns a single workspace root document at `/users/{userId}` where `userId == request.auth.uid` and `ownerId == request.auth.uid`.
   - Zero PII (`email`, `phone`, `address`) and zero binary/base64 image payloads are stored in `/users/{userId}` or any subcollection.
   - All write operations require a verified Google account (`request.auth.token.email_verified == true`).
2. **Relational Subcollection Invariant (`slideRevisions`, `researchNotes`, `atelierRecords`)**:
   - Documents in `/users/{userId}/slideRevisions/{revisionId}`, `/users/{userId}/researchNotes/{noteId}`, and `/users/{userId}/atelierRecords/{recordId}` cannot be read (single `get`) or mutated unless `/users/{userId}` exists and `get(/databases/$(database)/documents/users/$(userId)).data.ownerId == request.auth.uid`.
   - List queries (`allow list`) enforce `isOwner(userId) && resource.data.ownerId == request.auth.uid` without `get()`/`exists()` to prevent O(n) read amplification while guaranteeing zero cross-user leakage.
3. **Immutable & Temporal Invariants**:
   - `ownerId`, `createdAt`, and structural identity keys (`deck`/`lang`/`slideIndex` on `SlideRevision`; `deck` on `ResearchNote`; `kind` on `AtelierRecord`) are immortal after creation.
   - On `create`, `createdAt == request.time && updatedAt == request.time`.
   - On `update`, `updatedAt == request.time`.
4. **Terminal State Locking**:
   - `SlideRevision.reviewStatus == 'locked'` prevents any subsequent update or delete.
   - `ResearchNote.status == 'archived'` prevents any subsequent update or delete.
   - `AtelierRecord.status == 'archived'` prevents any subsequent update or delete.
5. **Volumetric & Regex Bounds**:
   - Every path ID (`userId`, `revisionId`, `noteId`, `recordId`) on single-document operations must match `^[a-zA-Z0-9_\-]+$` with length `1..128`.
   - Every string field enforces strict `.size() <= maxLength` synchronized verbatim with `firebase-blueprint.json`.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 01 — Identity Spoofing (`ownerId` mismatch)**:
   Authenticated `user_A` attempts `create` on `/users/user_A` with `{ "ownerId": "user_B", ... }` → `PERMISSION_DENIED`.
2. **Payload 02 — Cross-Tenant Subcollection Write**:
   Authenticated `user_A` attempts `create` on `/users/user_B/slideRevisions/representacao_fr_00` → `PERMISSION_DENIED`.
3. **Payload 03 — Unverified Email Write Spoof**:
   Token with `uid: "user_A"`, `email_verified: false` attempts `create` on `/users/user_A` → `PERMISSION_DENIED`.
4. **Payload 04 — Orphaned Subcollection Write (Missing Master Gate Parent)**:
   Verified `user_orphan` attempts `create` on `/users/user_orphan/atelierRecords/rec_01` before `/users/user_orphan` exists → `PERMISSION_DENIED`.
5. **Payload 05 — Shadow / Ghost Field Injection on Create**:
   Verified `user_A` sends `{ ..., "isAdmin": true }` to `/users/user_A` → `PERMISSION_DENIED` (`hasOnly` rejection).
6. **Payload 06 — Shadow / Ghost Field Injection on Update**:
   Verified `user_A` updates `/users/user_A/slideRevisions/representacao_en_00` adding `"isVerified": true` → `PERMISSION_DENIED` (`affectedKeys().hasOnly(...)` + `isValidSlideRevision` rejection).
7. **Payload 07 — Value Poisoning on Whitelisted Update Key**:
   Verified `user_A` updates `presenterNote` with a 3,500-character string (exceeding `maxLength: 3000`) or oversized `AtelierRecord.promptOrSummary` (exceeding `maxLength: 2000`, e.g. attempting to smuggle a base64 image) → `PERMISSION_DENIED`.
8. **Payload 08 — ID Poisoning (Path Variable Injection)**:
   Verified `user_A` attempts `create` at `/users/user_A/researchNotes/bad$id with spaces!` → `PERMISSION_DENIED`.
9. **Payload 09 — Client Timestamp Forgery**:
   Verified `user_A` sets `createdAt` or `updatedAt` to a past/future timestamp instead of `request.time` → `PERMISSION_DENIED`.
10. **Payload 10 — Immortal Field Mutation (`createdAt` / `deck` / `kind` Tampering)**:
    Verified `user_A` attempts `update` changing `deck` on `SlideRevision` or `kind` on `AtelierRecord` → `PERMISSION_DENIED`.
11. **Payload 11 — Terminal State Bypass**:
    Verified `user_A` attempts `update` on a `ResearchNote` or `AtelierRecord` whose `existing().status == 'archived'` → `PERMISSION_DENIED`.
12. **Payload 12 — Unauthorized Cross-User List / Get**:
    Authenticated `user_B` attempts `get` or `list` on `/users/user_A/researchNotes` or `/users/user_A/atelierRecords` → `PERMISSION_DENIED`.
