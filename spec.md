# GenZe Esports Tournament

## Current State
- Tournaments are fully on-chain (blockchain): create, delete, fetch all work correctly.
- Player registrations: saved to localStorage on the registering player's device. The backend `registerPlayer` is called but only stores name/contact as JSON. The frontend also stores a full Player object in localStorage.
- Payments: saved to localStorage on the paying player's device only.
- Admin panel: reads players and payments from localStorage, so it only shows data from the admin's own device -- players from other devices never appear.
- Admin approve/reject buttons: call `savePlayers`/`savePayments` which only update localStorage -- changes never reach other devices.
- Backend already has `updatePlayerStatus` and `updatePaymentStatus` functions, but they are never called by the admin panel.
- Backend has `getPlayersByTournament` but no `getAllPlayers` function.
- Backend has `getPaymentsByPlayer` but no `getAllPayments` function.

## Requested Changes (Diff)

### Add
- Backend: `getAllPlayers()` query that returns all players with full details (name, contact JSON with email/phone/game/gameId/teamName/username, tournamentId, status, registeredAt).
- Backend: `getAllPayments()` query that returns all payments with full details (playerId, playerName, tournamentId, tournamentName, amount, screenshotData as Text, status, submittedAt).
- Backend: `registeredAt` timestamp field on Player type.
- Backend: `playerName`, `tournamentId`, `tournamentName`, `amount`, `screenshotDataText`, `submittedAt` fields on Payment type.
- Frontend `backendService.ts`: `fetchAllPlayersFromBackend()` and `fetchAllPaymentsFromBackend()` functions.
- Frontend `backendService.ts`: `approvePlayerInBackend()`, `rejectPlayerInBackend()`, `approvePaymentInBackend()`, `rejectPaymentInBackend()` functions calling `updatePlayerStatus` and `updatePaymentStatus`.
- Frontend `backendService.ts`: `submitPaymentToBackend()` that stores payment on blockchain instead of localStorage.

### Modify
- Backend `registerPlayer`: store full contact JSON (already done), add `registeredAt = Time.now()` to Player record.
- Backend `submitPayment`: add `playerName`, `tournamentId`, `tournamentName`, `amount`, `screenshotDataText`, `submittedAt` fields to Payment record so admin can identify payments.
- Frontend `AdminPanelPage.tsx`: replace `getPlayers()`/`getPayments()` localStorage reads with blockchain fetches. Replace `savePlayers`/`savePayments` approval calls with backend calls (`updatePlayerStatus`, `updatePaymentStatus`). Poll players and payments every 10 seconds like tournaments.
- Frontend `PaymentPage.tsx`: submit payment to blockchain (call `submitPayment`) in addition to (or instead of) localStorage.
- Frontend `RegisterPage.tsx`: remove localStorage save of player after backend registration (player is now authoritative on blockchain).
- Frontend `seedData.ts`: remove fake/seed players from initialization. Keep the helper types but `seedData()` only initializes empty arrays if not present.

### Remove
- Frontend admin panel reliance on localStorage for players and payments.
- Any hardcoded sample players or payments added during app initialization.

## Implementation Plan
1. Regenerate Motoko backend with `getAllPlayers`, `getAllPayments`, updated Player/Payment types with full fields.
2. Update `backendService.ts` to add `fetchAllPlayersFromBackend`, `fetchAllPaymentsFromBackend`, `approvePlayerInBackend`, `rejectPlayerInBackend`, `approvePaymentInBackend`, `rejectPaymentInBackend`, `submitPaymentToBackend`.
3. Update `AdminPanelPage.tsx` to fetch players/payments from blockchain and use backend approve/reject.
4. Update `PaymentPage.tsx` to submit payment to blockchain.
5. Update `RegisterPage.tsx` to not save player to localStorage (blockchain is authoritative).
6. Clear any fake seed data from `seedData.ts` init.
