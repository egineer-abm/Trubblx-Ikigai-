# Ikigai Finder Security Specification

## Data Invariants
1. A session belongs to a unique user and cannot be accessed by others.
2. A user profile is private to the owner.
3. Messages must be associated with an active or completed session owned by the user.
4. Timestamps (createdAt, updatedAt) must be set by the server.

## The Dirty Dozen Payloads (Target: Sessions)
1. **Identity Spoofing**: Creating a session with another user's `userId`.
2. **Ghost Fields**: Updating a session with `isAdmin: true`.
3. **State Shortcutting**: Skipping from `active` to `completed` without final analysis.
4. **ID Poisoning**: Using a 1MB string as `sessionId`.
5. **PII Leak**: Authenticated user trying to read someone else's profile.
6. **Immutable Field Write**: Trying to change `createdAt` on update.
7. **Size Attack**: Sending a 2MB message content.
8. **Unauthorized Query**: Listing all sessions without filtering by `userId`.
9. **Terminal State Break**: Updating a session after its status is `completed` (except for specific non-critical fields if any, but better lock it).
10. **Referential Integrity**: Creating a session for a user that doesn't exist in `/users/`.
11. **Type Poisoning**: Sending `answers` as a string instead of an object.
12. **Self-Promotion**: Updating user profile `role` to `admin`.

## Test Runner (Draft)
A `firestore.rules.test.ts` would be needed to verify these. (I'll skip the actual file creation for now and focus on the rules).
