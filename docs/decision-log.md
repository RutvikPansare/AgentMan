# Tellero Decision Log

Record of decisions and why they were made. Newest entries at the top.

## 2026-06-22 - Comment campaign DMs store free text on the campaign, not a templates FK (T-145)

**Decision**: `instagram_comment_campaigns` gets a new `dm_message text` column for the private-DM body. The T-140 migration's `dm_template_id` FK into the `templates` table is left in place (nullable, harmless) but no longer written to or read by the app.

**Why**: `templates` is shaped entirely around WhatsApp's Meta template-approval workflow - `status`, `category`, `language`, and a Meta-formatted `components` JSON blob. Instagram DMs sent via `InstagramAdapter.sendText` are plain free-text with no approval step. Routing the campaign editor through a template picker/FK would mean fabricating a fake Meta-shaped row just to store a string, which is both extra complexity and conceptually wrong - it would imply Instagram DMs go through the same review pipeline WhatsApp templates do. Confirmed with Rutvik before building; storing the message directly on the campaign is simpler and correct for how the channel actually works.

## 2026-06-22 - Comment public replies post to the comment id, not the media id (T-142)

**Decision**: The Comments engine posts a public reply via `POST /{comment_id}/replies` on the Graph API, deviating from the T-142 spec which said `POST /{media-id}/replies`. The DM also goes through `InstagramAdapter.sendText` (the adapter's real method), not the spec's `sendMessage`.

**Why**: `/{media-id}/replies` is not a valid Instagram Graph endpoint - replying to a specific comment requires the comment id (`/{ig-comment-id}/replies`). Following the spec literally would have produced a non-working API call. The spec's `sendMessage` likewise predates the channel-adapter refactor (T-122/T-128) that standardised on `sendText`. Both deviations keep the engine correct against the actual API and current code; flagged here since they diverge from the written task.

## 2026-06-22 - Instagram-resolved display names go on `conversations.customer_name`, not `contacts` (T-138)

**Decision**: When resolving a real Instagram username via the Graph API for an inbound DM, write it to `conversations.customer_name` (the field the inbox UI already reads). Do not write to `contacts.name`/`contacts.profile_pic_url`, and do not create a `contacts` row for Instagram PSIDs.

**Why**: `contacts` is purpose-built for WhatsApp opted-in customers - `phone` is `NOT NULL` with a `UNIQUE(user_id, phone)` constraint, and segments/broadcast targeting query it assuming every row is a real phone number. Storing an Instagram PSID there to satisfy a "name" field would pollute that table's semantics and risks Instagram identities leaking into WhatsApp broadcast audiences. `conversations.customer_name` is already the field the UI renders for both channels, so writing there is both correct and zero-risk to existing WhatsApp logic.

## 2026-06-22 - One Instagram handle per org (T-127)

**Decision**: The `instagram_connections` table enforces a `UNIQUE(org_id)` constraint, intentionally limiting each Tellero organization to exactly one connected Instagram Business account.

**Why**: Instagram DMs, unlike WhatsApp APIs which support multiple phone numbers per WABA, are tied 1:1 to a specific Instagram handle. While some brands operate multiple handles, Tellero's automations, inbox routing, and UI paradigms currently assume a single unified presence per channel. Supporting multi-handle routing would require a "handle selection" step in every broadcast and automation, complicating the UX for the 99% of users with a single handle. We can revisit if multi-brand orgs become common.

## 2026-06-22 - Instagram connect logic shared between the settings route and the OAuth callback (T-127)

**Decision**: Extracted the Instagram OAuth exchange + `instagram_connections` upsert into `connectInstagramAccount()` (`src/lib/instagram/connect.ts`), called by both `POST /api/settings/instagram/connect` (browser already has a code) and `GET /api/auth/instagram/callback` (Meta's redirect target). Each route only handles auth + the redirect-on-result shape; the actual Graph API walk (code → short-lived token → long-lived token → Pages → linked Instagram Business account → profile) lives once.

**Why**: T-127 explicitly specs two entry points that do the same exchange. Duplicating the multi-step Graph API logic across two route files would mean two places to fix when Meta changes a response shape. `instagram_connections` itself mirrors `shiprocket_connections` exactly (one row per org via `unique(org_id)`, RLS scoped through `org_members`) for consistency with the existing integration-connection pattern.

## 2026-06-22 - Channel abstraction is inbox/bot-only; templates, automations, broadcasts stay WhatsApp-only (T-121)

**Decision**: The new `IChannelAdapter` (`src/lib/channels/`) covers only free-text `sendText` (plus optional `sendMedia`) for the inbox reply + bot send layer. It deliberately does NOT include template sending - that stays in `sendWhatsAppTemplate` and the automation/broadcast/shipping dispatch paths remain WhatsApp-only forever. The registry (`getChannelAdapter`) mirrors the T-109 shipping-registry stub pattern: it recognizes `whatsapp`/`instagram` as known channels but throws "not yet implemented" until adapters land (WhatsAppAdapter in T-122), and throws "Unsupported channel" for anything else.

**Why**: WhatsApp template messaging (HSM, approval flows, variable slots) is a WhatsApp-specific concept with no Instagram equivalent, so forcing it behind a generic channel interface would leak WhatsApp assumptions into the abstraction - the opposite of provider agnosticism. The only thing genuinely shared across channels is the inbox/bot conversational send, so the interface is scoped to exactly that. Keeping the abstraction tiny means adding Instagram later is one adapter file + one registry branch, with automations/broadcasts untouched.

## 2026-06-21 - Timeline write extracted to a shared helper; broadcast wired directly, not via the wrapper (T-117)

**Decision**: The T-116 timeline write lives in `src/lib/conversations/recordTimelineMessage.ts`, called by both the `sendWhatsAppTemplate` wrapper and `process-broadcasts`. The T-117 spec assumed every sender shares the `sendWhatsAppTemplate` wrapper, but broadcasts actually send through the raw `@/lib/whatsapp/client` functions (`sendWhatsAppTemplate`/`sendWhatsAppText`) with a different call shape (pre-built `components`, no `wabaId`). Rather than refactor the broadcast send path onto the wrapper, broadcast calls `recordTimelineMessage` directly at its success branch.

**Why**: One source of truth for the timeline write (find-or-create + insert + error-swallowing) without forcing broadcast through a wrapper whose param shape doesn't fit. Keeps the change low-risk (broadcast send logic untouched) while still landing broadcasts on the unified timeline. Timeline failures are logged and swallowed everywhere so a DB hiccup can never fail an already-successful WhatsApp send.

## 2026-06-21 - Unified timeline: automated sends create hidden conversations that "graduate" into the inbox (T-116)

**Decision**: Every outbound message (automation, broadcast, shipping update) now lands on the same `conversations`/`messages` timeline as live agent chat, via a shared `findOrCreateConversation` primitive. New threads created purely by automation are inserted with `inbox_visible = false` and are filtered out of the inbox list. A thread only "graduates" to `inbox_visible = true` when the customer initiates (inbound message) or an agent manually replies (T-118). Automated rows are tagged `sender_type = 'automation'` + a human-readable `source_label` for badge rendering (T-119).

**Why**: We want one chronological history per customer so agents see the full context (what we auto-sent before they reply), without flooding the inbox with thousands of one-way notification threads that no human needs to action. The visibility flag decouples "we have a timeline for this customer" from "this belongs in the agent work queue". Backfilling `inbox_visible = true` for any conversation with an existing inbound message guarantees zero regression for currently-active threads. Race safety leans on the existing UNIQUE(org_id, customer_phone) constraint rather than app-level locking.

## 2026-06-21 - Shipping webhook URL made org-scoped to close a cross-tenant matching gap (T-112, amends T-111)

**Decision**: Changed the unified shipping webhook from `/api/shipping/webhook/[provider]` to `/api/shipping/webhook/[provider]/[orgId]`. `ShiprocketConnected.tsx` now embeds `connection.brand_id` (the org id) in the URL shown to each merchant.
**Why**: T-112's dispatch logic resolves which order/org a webhook belongs to by matching `channel_order_id` against `orders.shopify_order_number`. With a single global URL (T-111's original design), two different brands with Shiprocket connected could theoretically share an order-number string at the same time, causing a wrong-brand WhatsApp send to a wrong customer. Scoping the URL per org removes the ambiguity entirely - the route now filters `orders` by `org_id` directly instead of searching across all orgs. Confirmed with Rutvik before implementing, since it meant reopening T-111's already-shipped route; the alternative (ship simple matching, fix later) was explicitly declined in favor of closing the gap now. This does not weaken provider-agnosticism - the `[orgId]` segment applies uniformly to every provider, it's orthogonal to the `[provider]` adapter-selection segment.

## 2026-06-21 - Shipping webhook route treats any registry throw as a 400, not just unknown providers (T-111)

**Decision**: `src/app/api/shipping/webhook/[provider]/route.ts` wraps the `getAdapter()` call in a try/catch and returns `400` on any throw - whether the provider slug is truly unknown or it's a known-but-unimplemented provider like `delhivery`. The adapter is also constructed with an empty-string `brandId`, since `org_id` resolution from `channel_order_id` happens later in T-112's dispatch step, not at adapter-construction time.
**Why**: From the calling provider's perspective both failure modes mean "we cannot process this webhook" - returning the same status code for both avoids retries either way, matching the todo's "200 even for unhandled types so the provider does not retry unnecessarily" intent extended to the 400 path. The empty `brandId` is safe today because `normalizeWebhook`/`verifyWebhook` don't touch it; it'll need to become a real value once `getTracking`/`getShippingEstimate` (T-082) are wired through this same registry call path.

## 2026-06-21 - Shiprocket status codes 36 and 46 bucket to `delivery_failed`, not `exception`/`return_initiated` (T-110)

**Decision**: In `src/lib/shipping/adapters/shiprocket/statusMap.ts`, Shiprocket's numeric codes `36` (Undelivered) and `46` (RTO Non-Delivery Report) map to our canonical `delivery_failed` event type, breaking from a straight reading of Shiprocket's own status grouping (a reference implementation we checked treats these as exception/return-adjacent statuses with no dedicated NDR concept).
**Why**: Tellero's roadmap (M8, and the upcoming T-112/T-113 "Failed Delivery / NDR" settings card) is specifically about notifying customers via WhatsApp when a delivery attempt fails - that's what code 36/46 represent on the wire. Our `ShippingEventType` union has a `delivery_failed` bucket precisely for this; bucketing these two codes anywhere else would silently break the NDR notification feature before it's even built.

## 2026-06-21 - Shipping registry shell throws for all providers, not just unknown ones (T-109)

**Decision**: `getAdapter()` in `src/lib/shipping/registry.ts` throws a distinct error for every provider right now: "Unsupported shipping provider" for slugs outside the `ShippingProvider` union, and "Shipping adapter for X is not yet implemented" for known slugs (`shiprocket`, `delhivery`) that don't have an adapter class yet.
**Why**: T-109's scope was contracts + registry shell only, with adapter classes deferred to T-110. The original todo wording ("known provider returns instance") assumed an adapter would exist to instantiate, which contradicted "no adapter implementations in this task." Asked Rutvik to pick between this throw-based shell versus a throwaway stub adapter class; he chose the throw-based shell to avoid scope creep and keep the registry a pure shell until T-110 lands.

## 2026-06-21 - Checkout UI Extensions fetch routing via absolute Proxy URL (T-108)

**Decision**: Checkout UI Extensions hit the Tellero app proxy using its absolute Shopify URL (`https://${shop.myshopifyDomain}/apps/tellero`). We added CORS headers (`OPTIONS` preflight) to `/api/shopify/proxy/route.ts` to allow this.
**Why**: Checkout UI extensions run in a sandboxed Web Worker on `extensions.shopifycdn.com`, not the store domain. They cannot make relative proxy requests. By using the absolute URL, Shopify's router intercepts the cross-origin request, appends the standard app-proxy HMAC signature, and forwards it to our Next.js backend securely. We must respond to CORS preflights properly to appease the browser sandbox enforcing this cross-origin request.


## 2026-06-21 - Disabled WhatsApp message sending on lead capture opt-in (T-107)

**Decision**: We stopped sending an automated WhatsApp template message upon lead capture opt-in. The system now only generates the Shopify discount code and returns it immediately for on-screen display (the "copyable chip" workflow) without relying on or checking for an active WhatsApp template.

**Why**: To streamline the lead capture process and ensure users get their discount immediately without delay. Decoupling the discount code generation from the WhatsApp template existence guarantees the incentive works out-of-the-box even if the organization hasn't fully set up or gotten approval for their WhatsApp templates yet.

## 2026-06-21 - Skip Next.js trailing-slash redirect for the Shopify app proxy route (T-105)

**Decision**: Added `skipTrailingSlashRedirect: true` to `next.config.mjs`. Shopify's app proxy always forwards requests to the upstream URL with a trailing slash appended (`/api/shopify/proxy` -> `/api/shopify/proxy/`). Next.js's default behavior redirects that trailing-slash request back to the non-slash path - but since this redirect happens mid-proxy, the browser resolves the relative `Location` header against the storefront's domain instead of `tellero.in`, producing a 404 on the shop's own domain that never reaches our backend.

**Why**: This persisted even after fixing the deploy gap (below) and a script-order bug - both real issues, but neither was the actual cause of the submit failures. Found the real cause by matching the exact symptom (host/path mismatch, signed proxy params on the wrong domain) against a Shopify developer community thread where staff traced an identical case to this trailing-slash interaction. Applies to any future app-proxy route, not just lead-capture/order-tracking - worth remembering if a new proxy-backed endpoint 404s the same way.

## 2026-06-21 - Theme extension changes require `shopify app deploy`, not just `git push` (T-104/T-105)

**Decision**: Committing and pushing changes to `extensions/tellero-chat/` only updates the repo - it does nothing to what's live on Shopify. A new extension version (and any `shopify.app.toml` config change, e.g. `[app_proxy]`) only reaches installed/dev stores after running `shopify app deploy --allow-updates` and it being released. We hit this directly: the theme editor was still showing pre-session schema, and storefront submits were 404ing because the app proxy config had never actually been pushed to Shopify's side - both fixed by one `shopify app deploy`.

**Why**: Easy to assume "pushed to main" means "live," since that's true for the Next.js backend (Vercel auto-deploys on push). Theme app extensions and app config are a separate deploy step entirely, gated behind the Shopify CLI, not git. Going forward: after any change under `extensions/` or to `shopify.app.toml`, run `shopify app deploy --allow-updates --message "<summary>"` before considering the change live.

## 2026-06-20 - Lead-capture widget discount % lives on the theme block, not a dashboard setting (T-102)

**Decision**: The storefront WhatsApp lead-capture widget's discount percentage is a merchant-editable field on the Shopify theme block itself (`extensions/tellero-chat/blocks/whatsapp_optin.liquid`, schema field `discount_percentage`, range 1-50, default 10), passed to `/api/shopify/proxy` in the POST body and clamped server-side. The WhatsApp template (which the % has no bearing on) is the one setting that still lives on the Tellero dashboard, in a small card on Settings > Shopify, because template approval is per-org/per-WABA and the theme schema has no way to dynamically list an org's Meta-approved templates.

**Why**: Merchants already configure this block per-section in the Theme Editor (heading, colors, button text), so a discount % field belongs there rather than forcing a second dashboard trip. Discount minting is idempotent per contact (`contacts.widget_discount_code`) - re-submitting the same phone number never mints a second code, since the value travels through a client-controlled POST and could otherwise be abused for unlimited codes.

## 2026-06-19 - Retain and set `shopify_connections.user_id` (do not drop it) (T-100)

**Decision**: `shopify_connections.user_id` (NOT NULL, FK to `profiles`) is kept as the installer audit trail alongside the canonical `org_id`. Every insert into the table must set it. The `DROP COLUMN user_id` line for this table was removed from `20260616_rename_user_id_to_org_id.sql`.

**Why**: The org-level refactor (`20260603_org_level_integrations.sql`) deliberately added `org_id` for org-shared access while preserving `user_id` for the installer. A later migration tried to drop `user_id`, but that drop never ran in prod (migrations are applied manually via the Supabase dashboard here). The install upserts, meanwhile, stopped setting `user_id` - so every App Store install failed with Postgres `23502` (null value in NOT NULL column). Rather than drop the column (which 8 code sites still read via `.or(org_id.eq.X,user_id.eq.X)` and which the audit trail wants), we keep it and set it on insert: session-linked installs store the logged-in installer's id, cold installs store the created/matched merchant user id. This keeps code and the live schema consistent with no prod migration.

## 2026-06-19 - Block cross-org shop linking in the session-linked install branch (T-098)

**Decision**: Before the session-linked install branch (`appstore/callback`) upserts a `shopify_connections` row, it now checks whether that `shop_domain` is already owned by a different org and, if so, redirects to `?error=shop_already_connected` rather than creating the row. Same-org reconnects are still allowed.

**Why**: DB uniqueness on `shopify_connections` is `(org_id, shop_domain)`, not global on `shop_domain`. The cold/email-matching install path looks up any existing connection by `shop_domain` and reuses its org, so it can't create duplicates - but the session-linked branch added in T-092 skipped that lookup and keyed only on `org_id`. A logged-in user installing a shop already connected to another org could therefore create two active rows for the same shop, and the webhook handler's `.eq('shop_domain', …).single()` lookup throws on multiple rows, silently dropping the webhook (orders stop syncing with no error surfaced). The guard restores parity with the cold path. Low probability (Shopify only allows one install per shop and the installer must be staff of that shop) but a silent failure mode, so worth guarding explicitly.

## 2026-06-19 - Map in-progress fulfillment states to distinct non-cancellable values (T-095)

**Decision**: `FULFILLMENT_STATUS_MAP` now maps GraphQL `IN_PROGRESS`/`PENDING_FULFILLMENT`/`ON_HOLD`/`SCHEDULED`/`OPEN` to distinct values (`in_progress`/`on_hold`/`scheduled`/`open`) rather than letting them fall through to `null`, and `UNFULFILLED` maps explicitly to `unfulfilled`.

**Why**: The bot's cancel and address-change tools (`src/lib/bot/tools.ts`) gate on fulfillment status - they only permit the action when status is `'unfulfilled'` or `null`. Any unmapped status became `null` (then `'unfulfilled'` in the DB), so an order whose fulfillment had already started looked cancellable to a customer over WhatsApp. Mapping these to distinct non-null values makes the existing bot guard reject them automatically, with no change to the bot logic itself. Webhook ingestion is unaffected (Shopify webhooks send REST-style statuses, never these GraphQL enum values).

## 2026-06-19 - Drop `status=any` when migrating order sync to GraphQL (T-093)

**Decision**: When moving `sync/route.ts` from REST to `ShopifyClient.getOrders` GraphQL, we filter the 90-day window by `created_at:>=` alone and do NOT carry over the old REST `status=any` parameter.

**Why**: The REST `/orders.json` endpoint defaulted to returning only open orders, so `status=any` was required to include closed/cancelled/archived orders in the sync. The GraphQL `orders` connection has no such default - it returns all non-deleted orders regardless of status. Re-adding a `status:any` search term is unnecessary and is not valid GraphQL order-query syntax, so the date filter is sufficient and correct.

## 2026-06-19 - Remove manual shop-URL entry; route all installs through the App Store (T-092)

**Decision**: Removed the in-dashboard manual `xxx.myshopify.com` entry field (`ShopifyDisconnected.tsx`). The component now links to the Shopify App Store listing, where Shopify's own surface handles store selection and OAuth. To preserve organic-signup linking, `appstore/install` stamps a `shopify_appstore_user_id` cookie when a logged-in Tellero user initiates the install, and `appstore/callback` links the connection to that user's existing org instead of matching by the shop's email. Cold (anonymous) listing installs are untouched and keep the magic-link account-creation flow.

**Why**: Supersedes the earlier "keep dual flow" call below. Rule 2.3.1 is literal: an app must not request manual entry of a myshopify.com URL during install, regardless of whether the user is already authenticated. Rather than risk a review bounce, we moved shop identification onto Shopify's surface. The session cookie keeps the organic funnel intact (user who finds Tellero directly still installs in one click from the listing and lands back logged-in), and avoids the latent bug where email-matching could link a store to the wrong account when the Shopify store email differs from the Tellero login email.

## 2026-06-19 - Keep dual Shopify install flow (manual connect + App Store) [SUPERSEDED by T-092 above]

**Decision**: Keep both Shopify connect paths - the in-dashboard manual shop-URL entry (`ShopifyDisconnected.tsx` -> `/api/shopify/oauth/install`) for organic Tellero signups, and the HMAC-verified `/api/shopify/appstore/install` entry point for App Store listing installs. No code change made.

**Why**: Flagged as "needs review" (2.3.1) by the Shopify App Store self-review skill, but on inspection both paths terminate in the same standard OAuth handshake with nonce/state verification - the manual path additionally requires the user to already be authenticated in Tellero, so it's not a competing/confusing entry point. App is non-embedded, so there's no App Bridge/session-token conflict between the two. Intentional product choice: lets users who find Tellero directly (not via Shopify's App Store) self-serve a connection. _Reversed the same day after re-reading 2.3.1 as literal - see T-092 entry above._

## 2026-06-18 - Customer Feedback Table (T-080)

**Decision**: Added a dedicated `customer_feedback` table to the database instead of appending to a unstructured `notes` field in the `contacts` table.

**Why**: Having a dedicated table with an explicit RLS policy allows us to easily query, categorize, and build analytics around customer sentiment later. It keeps the `contacts` table clean and ensures feedback is firmly scoped to the organization (`org_id`).


## 2026-06-18 - Remove Hinglish language option (T-061)

**Decision**: The internal `en-hinglish` language option has been removed entirely from the template editor, leaving only English and Hindi.

**Why**: Meta's WhatsApp API does not accept `en-hinglish` as a valid language code. Rather than silently normalizing `en-hinglish` to `en` in the background, we opted to remove the option so the user explicitly selects English or Hindi when creating the template, keeping our data in strict alignment with Meta's options.

## 2026-06-18 - Dynamic Shopify Discounts (T-059)

**Decision**: Dynamic Shopify Discount Codes are generated inside the `process-automations` cron job right before message dispatch, rather than immediately upon webhook receipt.

**Why**: Generating codes upon webhook receipt (e.g., Abandoned Cart) would clutter the merchant's Shopify admin with thousands of unused discount codes for carts that never converted. Delaying generation until actual dispatch reduces bloat and ensures codes are only minted for successfully contacted recipients.

## 2026-06-16 - Timestamp-based broadcast analytics (T-033)

**Decision:** We calculate aggregate broadcast metrics (`delivered`, `opened`, `replied`) by counting the presence of timestamps (`delivered_at IS NOT NULL`) on the `broadcast_recipients` table instead of relying on the linear `status` string.

**Why:** A recipient's `status` can only hold one state at a time. If a message was successfully "read" but the user later replied with "STOP", their status was overwritten to "opted_out". Relying on the status column for aggregate counts caused them to be retroactively subtracted from the "delivered" and "read" funnels, creating counter drift. Timestamps are permanent markers of success, making the funnel metrics fully resilient to terminal state overrides.

## 2026-06-16 - Include session parameter in Shopify HMAC (T-028)

**Decision:** The `session` parameter is now included in the string that generates the Shopify OAuth HMAC signature in `verifyShopifyInstallRequest`.

**Why:** Earlier versions of Shopify's documentation explicitly stated that `session` should be excluded from the cryptographic hash. However, recent request logs showed that `appstore/install` requests were failing validation because Shopify now includes `session` when generating the HMAC. Removing our exclusion logic correctly matched their hash and successfully authenticated returning merchants.

## 2026-06-16 - Agents get full access to operational areas (T-026)

**Decision:** Agents are no longer inbox-only. They get full view + action access to Contacts, Templates, and Broadcasts (create/edit/tag contacts, create/submit templates, create/send broadcasts), on top of Inbox and their own profile. They remain blocked from billing, team, automations, analytics, integrations, and brand settings. Enforced by adding the prefixes to `canAccessPath`, removing the T-025 agent API blocks, and relaxing contacts/tags RLS write policies from `is_org_admin` to `is_org_member`.

**Why:** Direct product call by the owner. The "agent = inbox only" wording on the Team page was the original intent, but in practice support agents need to manage customers (contacts), prepare/send campaigns, and work with templates day to day. Money/configuration surfaces (billing, integrations, automations) stay admin/owner because mistakes there are higher blast-radius. This supersedes the agent scope set in T-025.

## 2026-06-16 - Role-based dashboard access (T-025)

**Decision:** Dashboard navigation and pages are gated by org role through a single source of truth, `src/lib/access.ts` (`canAccessPath`). Owner = full access including billing; admin = full access except billing; agent = inbox + own profile only. Enforced in three layers: `Sidebar` hides links the role can't use, a client `RouteGuard` redirects members who navigate to a forbidden page (holding render until the role is known so nothing flashes), and mutating API routes reject the wrong role server-side. RLS remains the final backstop.

**Why:** Until now any logged-in member could open every page; agents would land on broadcast/billing/team pages that only errored on them, and billing was reachable by admins. The Team settings page already advertised a clear model (owner/admin/agent), so we made the app actually enforce it. Centralizing the rule in one tested function keeps the sidebar, the guard, and future checks consistent instead of scattering `role === 'agent'` conditionals. Defense in depth: UI gating is for UX, API checks + RLS are for security.

## 2026-06-16 - RLS access model: members read, admins write (T-023)

**Decision:** RLS on tenant tables now resolves membership through `org_members` via the `is_org_member`/`is_org_admin` SECURITY DEFINER helpers instead of comparing `auth.uid()` to the org id. Standard model: every org member (owner/admin/agent) can READ their org's data; only owners/admins insert/update/delete records and configuration; the shared-inbox tables (`conversations`, `messages`, `contact_tags`) and `templates` are fully operable by every member; `billing_events` is owner/admin only.

**Why:** After the `user_id` -> `org_id` rename, policies read `auth.uid() = org_id`, which only the owner satisfies (their uid equals the org id). Every other team member was locked out. Routing the check through `org_members` lets added team members act on their employer's data with role-appropriate permissions, which is the whole point of the Team/Org model. Read-for-all-members + write-for-admins keeps agents productive (especially in the inbox) without letting them mutate billing or destructive config. Dropping and re-creating all policies per table (rather than patching names) guarantees a deterministic end state regardless of which historical migrations a database has already applied.

## 2026-06-16 - Rename user_id to org_id for tenant tables

**Decision:** We renamed the `user_id` column to `org_id` across all tenant-specific database tables (`broadcasts`, `contacts`, `orders`, `automations`, `abandoned_checkouts`, etc.) and updated the entire codebase to match.

**Why:** Because Tellero operates on a Team/Organization model (where the brand owner's profile ID acts as the org ID), having the tenant column named `user_id` caused developer confusion and bugs where the logged-in team member's ID was mistakenly used instead of the resolved employer's `orgId`. A global refactor was performed to make the schema match the domain logic.

## 2026-06-15 - Global SWR with localStorage

**Decision:** We installed `swr` and added a custom `localStorageProvider` to a global `SWRProvider` in `layout.tsx`. All automation hooks were migrated to `useSWR`.

**Why:** It dramatically reduces boilerplate code by replacing inline manual `localStorage` hooks. Users still get instant UI renders (skipping loading skeletons) thanks to the cache, but SWR securely handles deduplication, caching, and stale-while-revalidate background fetches without flickering.

## 2026-06-15 - Skipping orders/paid webhook

**Decision:** We are not implementing the Shopify `orders/paid` webhook right now.

**Why:** Currently, we treat orders as confirmed at create time. For most D2C brands using Shopify, card or UPI payments are instant, so the order is immediately paid. We can revisit this later if there is a specific merchant need for handling delayed payment captures.

## 2026-06-15 - Live Shopify Product Fetching

**Decision:** The `ProductPicker` used in broadcasts and automations fetches products dynamically via the `/api/shopify/products` endpoint rather than keeping a synced table of products in the Tellero database.

**Why:** It avoids the massive complexity of webhooks handling product creations, updates, variant changes, and deletions just for the sake of auto-filling variables in a UI. The live fetch is fast enough for the dashboard and guarantees accurate URLs and prices at compose time.

## 2026-06-15 - Welcome flow first-order detection

**Decision:** The welcome flow automation relies on querying `contact.total_orders === 1` inside the `orders-create` webhook, immediately after `increment_contact_orders` runs, rather than calculating historical orders or tracking a separate `welcome_sent` boolean.

**Why:** Since `increment_contact_orders` runs synchronously before the welcome flow check, the state is immediately accurate. This avoids adding new database columns (`welcome_sent_at`) or doing complex aggregations to figure out if it's the customer's first order.

## 2026-06-15 - Fetch revenue attribution in the same API route as broadcast stats

**Decision:** The new `/api/broadcasts/[id]/analytics` route fetches the denormalized delivery funnel counters from `broadcasts` and the revenue attribution from `analytics_events` in the same request, rather than splitting them into two parallel endpoints.

**Why:** Both queries are fast (delivery stats are pre-aggregated denormalized counters, and `analytics_events` is indexed on `source_type, source_id, event_type`). Splitting them would require more frontend state management and extra boilerplate, with no noticeable performance gain. We can split them later if the `analytics_events` aggregation becomes a bottleneck for large merchants.

## 2026-06-15 - Centralize the segment builder in place; schedule broadcasts via a promote-then-deliver cron

**Decision:** Lifted the existing, working `segmentQueryBuilder` out of the Segments UI `_lib` into `src/lib/segments.ts` and made every consumer (Segments preview, broadcasts, winback/review crons) use it, rather than rewriting segment resolution as an in-memory filter. The broadcast send route's weaker inline `resolveSegment` (numeric/date/city only, no tags/attributes/OR) was deleted in favour of the shared `resolveSegmentContacts`. For scheduling, added a dedicated `process-scheduled-broadcasts` cron that promotes due `scheduled` broadcasts (claim -> resolve segment -> queue recipients -> set `sending`); the existing `process-broadcasts` cron then delivers them. Added a `segment_ref` column because `broadcasts.segment` stores the display label, which isn't resolvable later.

**Why:** The query-based builder already handled tags (`!inner`), `not_tag` (pre-fetch exclusion), attributes (JSONB), and OR (scalar via `.or()`), and was used by the UI; reusing it keeps one source of truth and avoids changing UI preview behaviour mid-Meta-review. An in-memory rewrite would have been more testable but a bigger blast radius for no functional gain at the 10k-per-org cap. Splitting promotion (queue) from delivery (send) mirrors the existing `schedule-*` vs `process-*` cron split, keeps each job simple, and lets the proven delivery path stay untouched. `segment_ref` was required because a scheduled broadcast must rebuild its recipient list at send time and the label alone can't be resolved.

## 2026-06-15 - WhatsApp connection health is reactive/on-demand, not a proactive cron

**Decision:** For detecting a dead WhatsApp token we validate on demand when the merchant opens settings (`validateWhatsAppToken` pinged from the settings GET, surfaced as a "Reconnect needed" state) instead of building a scheduled cron that polls `meta_token_expires_at`. Only definitive auth failures (OAuthException / token codes) flip the state; transient and network errors are treated as still-valid to avoid false reconnect prompts.

**Why:** Embedded Signup business tokens generally do not expire, so `meta_token_expires_at` is usually null and polling it buys nothing - a proactive cron would be premature with no merchants yet on ES tokens. The real failure mode is revocation, and the moment that matters to a merchant is when they check their connection. On-demand validation reuses the centralized client, needs no schema or cron, and covers the 80% case. A send-path failure flag + alerting can come later if revocations prove common.

## 2026-06-15 - Adopt WhatsApp Embedded Signup; centralize the send path first

**Decision:** Added Embedded Signup (Facebook Login for Business) as the primary way merchants connect WhatsApp: a browser SDK flow returns an authorization code, the `/api/settings/whatsapp/embedded-signup` route exchanges it for a business token, stores `waba_id` + `phone_number_id` + `meta_token_expires_at`, and auto-subscribes our app to the WABA. The manual WABA-ID-plus-token form stays as a fallback. Before building it, all 6 duplicated Cloud API send sites were collapsed into `src/lib/whatsapp/client.ts`.

**Why:** Embedded Signup makes onboarding self-serve and multi-tenant (no manual token generation), which is the prerequisite for self-serve broadcasts/automations now that payments unlock business-initiated messaging. Centralizing the send path first removed six copies of the phone-number lookup + POST (process-wide caching, one Graph version, one error shape), shrinking the surface the new flow had to touch and paying down existing duplication. Storing `phone_number_id` lets send paths skip the extra `/phone_numbers` lookup on cold starts. Kept the manual form so existing connections and non-SDK setups still work.

## 2026-06-14 - Scope checkpoints to risky work instead of stopping after every step

**Decision:** Replaced the "stop and ask for confirmation after each step" rule (CLAUDE.md, GEMINI.md, tdd-workflow skill) with a scoped rule: checkpoint only before large, risky, or hard-to-reverse changes (schema/migrations, auth, cross-cutting refactors, deletes) or when requirements are ambiguous; otherwise complete bounded, reversible tasks and report.

**Why:** Per-step checkpointing added friction on bounded, reversible work (e.g. a multi-file UI refactor) without adding safety. Scoping keeps the guard where it matters while letting routine work run end to end.

## 2026-06-14 - Open onboarding modal before loading data

**Decision:** `onOpen` sets the modal visible at the welcome step immediately, then fetches data in the background and advances to the first incomplete step.

**Why:** Previously `onOpen` awaited `loadFormsAndProgress` (4+ network calls) before `setVisible(true)`, so the modal felt slow to open. Welcome step needs no data, so showing it instantly removes perceived latency. Did not `next/dynamic` the modal: it must stay mounted to catch the open event, and lazy-importing would delay the listener so a fast click could do nothing.

---

## 2026-06-14 - "Continue setup" CTA always visible, including at 100%

**Decision:** The setup-strength CTA shows in every state and is labelled "Continue setup" even when setup is 100% complete. The "Review setup" / dismissible-only gating was removed.

**Why:** The General settings card is permanent (not a dismissible dashboard widget). Rutvik wanted users to re-run onboarding any number of times and always see progress. Consistent "Continue setup" labelling across states avoids confusion.

---

## 2026-06-13 - Cast template category to Meta union type

**Decision:** Cast `tmpl.category` to `"MARKETING" | "UTILITY" | "AUTHENTICATION"` in `submit-all-drafts`.

**Why:** DB row types `category` as `string`, but `submitTemplate` requires the Meta union. Build failed without the cast.

---

## 2026-06-12

Decision:
Store template variable mappings per automation + template.

Reason:
Users switch templates frequently and should not lose mappings.

Status:
Accepted

---

## 2026-06-12

Decision:
Review Requests use Fulfillment events initially.

Reason:
Shiprocket integration not yet available.

Future:
Move to Delivered events when Shiprocket is integrated.

Status:
Accepted

---

## 2026-06-12

Decision:
Normalize Shopify and WooCommerce into shared commerce tables.

Reason:
Automations should not care about platform source.

Status:
Accepted

---

## 2026-06-12

Decision:
Position Tellero as a WhatsApp Revenue Engine.

Not:
Shipping notification software.

Reason:
Revenue features are easier to monetize.

Status:
Accepted

---

## 2026-06-12

Decision:
Build Winback Campaigns before AI Support Bot.

Reason:
Direct revenue impact.

Status:
Accepted

### 2026-06-16: UI Flat Redesign (T-023)
- **Decision:** Shifted the global UI aesthetics from a heavy, warm "latte" cream with shadows to a flat, crisp `#FDFDFC` off-white canvas with fully rounded pill buttons and zero drop-shadows.
- **Why:** To strike a balance between Tellero's premium feel and the ultra-modern, clean aesthetics of tools like Claude and Linear. By relying entirely on 1px borders instead of shadows, the interface feels significantly lighter and less cluttered.

### 2026-06-18
**Decision:** Use Shopify Draft Orders for COD-to-Prepaid conversion instead of a direct Razorpay/Cashfree API integration.
**Why:** Directly integrating Razorpay/Cashfree requires the merchant to provide and maintain additional API keys in Tellero, duplicating their payment setup. By creating a Shopify Draft Order (with a custom flat discount) and sending the native Shopify checkout URL, we keep the entire payment flow, tax calculations, and fulfillment within the familiar Shopify ecosystem. When the draft order is paid, Shopify natively creates a new standard order (which we catch via webhooks, tag, and use to automatically cancel the original COD order).
