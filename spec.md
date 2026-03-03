# Specification

## Summary
**Goal:** Remove the Active Tournaments section from the HomePage and ensure tournament creation and slot count updates are synced across all player sessions in near real-time using localStorage polling.

**Planned changes:**
- Remove the "Active Tournaments" section and its polling logic from the HomePage entirely
- Add localStorage storage event listeners and a 3-second polling interval to the TournamentsPage so newly created tournaments appear automatically for all players
- Ensure that when a player registers for a tournament, the slot count increments and is reflected on the TournamentsPage and TournamentCard within the next polling cycle (≤3 seconds) for all open sessions

**User-visible outcome:** The homepage no longer shows a tournament listing. When an admin creates a tournament, all players see it on the Tournaments page within 3 seconds. When any player registers, the slot count updates for all viewers without requiring a manual refresh.
