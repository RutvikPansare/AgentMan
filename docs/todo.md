# Tellero - Todo

<!--
Queue of upcoming tasks. Specced in Cowork, picked up by Claude Code.
Format is flexible - one line for simple tasks, add bullets when Claude Code needs context to implement without back-and-forth.
On completion: check the box, cut the line into docs/done.md under today's date.
IDs never reuse - increment from the highest T-NNN in either this file or done.md.
-->

## Queue

### M12: Instagram Automations

- [ ] **T-137** DM Keywords epic (broken down separately - design TBD)
  - Trigger: inbound Instagram DM matches a keyword (whole-word, case-insensitive, OR logic across multiple keywords)
  - Response: auto-reply DM with configurable template + optional discount code
  - Simpler than Comments - no post picker, no public reply, no comment webhook subscription needed
  - Inbound DM webhook already exists (T-129) - this just adds keyword matching logic on top
  - **Break into sub-tasks before starting**


## Backlog

- [ ] **T-147** Reinstate InstagramGate on Instagram sub-pages
  - Restore the connection check in `InstagramGate` so unconnected orgs see the "Connect Instagram" prompt instead of the page content.
  - Reverses T-146. Do this before any public launch of the Instagram section.

- [ ] **T-139** Cross-channel profile picture display in inbox
  - Show contact avatars in the conversation list and thread header for both WhatsApp and Instagram - not Instagram-only.
  - WhatsApp: fetch via WhatsApp Business API profile endpoint (`GET /{phone-number-id}/contacts/{wa_id}` - returns `profile.avatar`). Note: Meta only returns this if the customer has not set their profile to private.
  - Instagram: fetch via Graph API (`GET /{psid}?fields=profile_pic`) - already have the access token from `instagram_connections`. Store on `conversations.profile_pic_url` (additive migration, same table as `customer_name`).
  - Same non-blocking pattern as T-138: fetch on first message, cache on the conversation row, skip if already set, never block message save on failure.
  - UI: replace the existing initials avatar in `ConversationItem` and `ConversationHeader` with the pic when available, fall back to initials if absent.
  - Do both channels in one task so the inbox looks consistent regardless of channel.

- [ ] **T-081** Implement `recommend_products` AI tool. Build keyword-based semantic search to allow the bot to suggest items.
- [ ] **T-082** Implement shipping pull tools for AI bot (depends on T-110).
  - `getTracking?()` on ShiprocketAdapter: wire to existing `ShiprocketClient.getTrackingByAWB()`. Used by the bot's "where is my order?" flow to return granular location + ETA rather than just the Shopify fulfillment URL.
  - `getShippingEstimate?()` on ShiprocketAdapter: call Shiprocket's `/courier/serviceability` endpoint with origin pin, destination pin, and weight. Returns `ShippingEstimate[]` (one per available courier). Bot uses this to answer "when will my order arrive if I order now?".
  - Register the two methods as bot tools in `src/lib/bot/tools.ts` following the existing `withErrorLogging` wrapper pattern.
- [ ] **T-027** Remove `test: true` from Shopify billing mutation (`src/app/api/billing/shopify/create-subscription/route.ts`) before public launch so real merchants are actually charged.
- [ ] **T-084** Execute Database Abstraction (Dual-Write Strategy) (M5)
  - Add `platform`, `external_id`, and `channel` columns to the `orders`, `contacts`, and `abandoned_checkouts` tables safely using a Supabase migration.
  - Update Shopify webhooks to dual-write incoming events to both the legacy `shopify_` columns and the new generic columns.
