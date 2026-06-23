# AgentMan - Knowledge Base

<!--
This is the CONTEXT layer: what AgentMan is and what we believe.
Reference material - slow-moving. Read it to stay aligned; don't churn it.
For what to build next, see the Roadmap section in CLAUDE.md / GEMINI.md (direction) and docs/board.md (active work).
-->


Before writing or applying any of the following, an AI agent MUST flag this to Rutvik and wait for explicit go-ahead:

- Any `ALTER TABLE` / `DROP TABLE` / `DROP COLUMN` / `RENAME COLUMN` migration
- Any new RLS policy or change to existing RLS policies
- Any change to an existing API route signature or response shape that `main` callers depend on
- Any change to Supabase Edge Functions

Safe to proceed without flagging:
- New tables with no dependency from `main` code (additive-only migrations)
- New API routes that `main` does not call
- Frontend-only changes on feature branches
- Purely local TypeScript / test changes

**When in doubt, flag it.** Write the migration, show it to Rutvik, and wait for "go ahead" before instructing him to apply it via the Supabase dashboard.

**This is non-negotiable and applies to every integration, forever.**

Tellero's value is the automation, the messaging, and the brand experience - not the specific vendors wired up underneath. Shopify, WooCommerce, Shiprocket, Delhivery, WhatsApp, Instagram, Razorpay, Stripe are all swappable implementation details. The code must reflect this at every layer.

Every integration lives behind an adapter interface and canonical types. Business logic works with normalized, provider-agnostic shapes. Adding a new provider should mean: one adapter file, one registry entry, one settings UI - nothing else changes.

Concretely:
- Shipping providers use `IShippingAdapter` + `src/lib/shipping/registry.ts`. The automation engine and UI never import from `src/lib/shiprocket` directly.
- Commerce platforms write to generic `platform`/`external_id`/`channel` DB columns. The automation engine reads those, not Shopify-specific columns.
- Messaging channels follow the same pattern as new channels are added.
- UI labels always describe the concept, never the vendor: "Order Events" not "Shopify Events", "Shipping Events" not "Shiprocket Events".

If provider-specific logic is bleeding into route handlers, cron jobs, or UI components, that is a bug in the architecture - fix it before shipping.

## Vision


## Target customers


## Core product areas


- **Application URL Context**: The `application_url` in `shopify.app.toml` is used as the base path for resolving relative webhook URIs. It must be set to the root domain (`https://tellero.in`), **not** the install path (`https://tellero.in/api/shopify/appstore/install`).
- If `application_url` includes a path, all webhooks will incorrectly duplicate that path (e.g. `/api/shopify/appstore/install/api/shopify/webhooks/...`) resulting in 404s.
- **Magic Install Flow**: App installs are safely handled by `src/middleware.ts` intercepting root domain requests (`/?shop=...&hmac=...`) and transparently redirecting them to the `/api/shopify/appstore/install` path.

## Current status & What's built

- **Meta WhatsApp (Live)**
  - *What it does*: Connects the brand's WhatsApp Business Account to Tellero, allowing them to send and receive messages natively.
  - *Details*: Users can onboard seamlessly using the "Embedded Signup" flow (Facebook Login for Business), instantly exchanging OAuth codes for business IDs and access tokens. The app continuously monitors token health, surfaces a "Reconnect needed" state if permissions expire, and routes all outgoing messages through a centralized, robust Cloud API client (`src/lib/whatsapp/client.ts`).
- **Meta Instagram (Live)**
  - *What it does*: Connects the brand's Instagram Business account to Tellero, allowing them to receive and reply to Instagram DMs directly from the unified inbox.
  - *Details*: Supports OAuth authentication via Meta, stores credentials per organization, parses inbound Instagram webhooks (DMs and comments), and abstracts the send/receive flow through the generic `IChannelAdapter`. Note: Automations and broadcasts currently remain WhatsApp-only.
  - **Comments (Live)**: keyword-triggered auto-DM on post/reel comments (`/dashboard/instagram/comments`). Merchants create campaigns with one or more keywords, scope them to all posts or specific ones (via a Graph API media picker), optionally post a public reply on the comment, send a free-text private DM with `{{first_name}}`/`{{discount_code}}`/`{{post_url}}`/`{{brand_name}}` variables, and optionally generate a unique per-commenter Shopify discount code. One interaction per commenter per campaign (dedup via `campaign_interactions`). DM message is stored as plain text directly on the campaign - Instagram DMs have no Meta approval workflow, so they don't go through the WhatsApp `templates` table.
  - **Story Replies (Live)**: auto-DM when a follower replies to the brand's story (`/dashboard/instagram/story-replies`). One settings row per org (enable toggle, optional keyword filter, free-text DM with `{{first_name}}`/`{{discount_code}}`/`{{brand_name}}`, optional per-replier Shopify discount). Story replies are detected in the inbound DM webhook via the `story_mention` attachment and routed separately from regular DMs. Dedup per `(org, story, replier)` so a follower replying to the same story twice gets one DM, but a reply to a different story triggers a new one.
- **Shopify (Live)**
  - *What it does*: Syncs eCommerce store data, handles App Store installations, and processes Shopify-native billing.
  - *Details*: 
    - **Data Sync & HMAC Verification**: Listens to Shopify webhooks (like `orders-create`) and handles unauthenticated OAuth callbacks (`appstore/install`, `appstore/callback`). Strictly verifies HMAC signatures to ensure security before processing data or logging in users.
      - *CRITICAL RULE*: When computing the HMAC signature for Shopify API requests (OAuth/App Install requests), **ONLY the `hmac` parameter must be excluded**. Previous legacy Shopify documentation suggested excluding the `session` parameter, but Shopify's current algorithm *includes* the `session` parameter when signing the request. Stripping `session` will result in failed HMAC validations.
    - **Authentication & Flow**: If a merchant launches the app from inside the Shopify Admin, the backend securely processes the OAuth handshake, auto-reconnects broken tokens, creates magic links to bypass manual passwords, and routes users intelligently (redirecting to the Integrations page on first install/reconnect, but straight to the Dashboard for daily usage).
    - **Install entry point (rule 2.3.1)**: There is NO manual `myshopify.com` URL entry field anywhere in the UI - the in-dashboard "Connect Shopify" card links to the App Store listing (`NEXT_PUBLIC_SHOPIFY_APP_LISTING_URL`), so shop selection happens on Shopify's own surface. When an already-logged-in Tellero user starts the install, `appstore/install` sets a `shopify_appstore_user_id` cookie and `appstore/callback` links the new connection to that user's existing org (skipping email-matching), but first guards against linking a shop already connected to a different org (redirects with `error=shop_already_connected`) since DB uniqueness is per-`(org_id, shop_domain)`. Anonymous cold installs from the listing have no cookie and fall through to the magic-link account-creation flow.
    - **Billing Integration Lifecycle**: Native integration with the Shopify Billing API (`appSubscriptionCreate`) that handles the strict USD currency requirements for the App Store (while Razorpay handles INR for direct merchants). The full lifecycle operates perfectly in sync:
      1. **Upgrades**: Users upgrade via the Tellero dashboard (`POST /api/billing/shopify/create-subscription`). This requests a confirmation URL from Shopify.
         - *CRITICAL RULE*: In `appSubscriptionCreate`, the `test` flag must ALWAYS be set to `true` while the app is in pre-launch/review phase. Never change it to `false` without explicit permission from the user.
      2. **Approvals**: The user is redirected to Shopify to approve the charge.
      3. **Verification**: Shopify redirects back to Tellero (`GET /api/billing/shopify/callback`). Tellero securely queries the Shopify GraphQL API (using the strictly formatted `gid://shopify/AppSubscription/[id]`) to fetch the exact `currentPeriodEnd` date and verify the `ACTIVE` status before unlocking the plan in the database.
      4. **Cancellations & Failures**: Merchants cannot upgrade/downgrade from within the Shopify Admin, but they *can* cancel. If a merchant clicks cancel in Shopify, or if their charge is declined/frozen, Shopify fires the `app_subscriptions/update` webhook. Our webhook handler securely verifies the payload, matches the `charge_id` to prevent old webhooks from overriding active plans, and instantly downgrades the merchant to the `free` tier in our database.
      5. **Downgrading to Free UX**: If a user clicks "Downgrade" to Free in our dashboard, the UI intercepts it and instructs them to cancel via their Shopify Admin panel (triggering the webhook flow above).
- **Shipping events (Shiprocket Live, provider-agnostic)**
  - *What it does*: When a shipping provider fires a tracking webhook, Tellero sends a branded WhatsApp from the brand's own number - so customers get "out for delivery", "delivered", and "failed delivery / NDR" updates from the brand, not the courier.
  - *Details*: Built behind the `IShippingAdapter` abstraction (`src/lib/shipping/`): canonical `NormalizedShippingEvent` types, a `registry.ts` factory (`getAdapter(provider, orgId, supabase)`), and the `ShiprocketAdapter` which maps Shiprocket's full ~90-code `shipment_status_id` table to 8 canonical event types. The unified webhook lives at `/api/shipping/webhook/[provider]/[orgId]` (org-scoped so order-number matching can't collide across tenants); on receipt it resolves the order, checks the org's `shipping_events` settings, dedups by AWB + event type, and dispatches directly via `sendWhatsAppTemplate` (no cron - webhooks are already real-time). Merchants configure each event (toggle + template + slot mapping) under the "Shipping Events" section of the **Order & Shipping Events** page, which only unlocks once a shipping provider is connected. `delivery_failed` is notification-only for now (conversational NDR is a future feature). The underlying Shiprocket API client (`src/lib/shiprocket`) handles auth, rate-limiting, and tracking fetches; granular pull tools for the AI bot are still pending (T-082).
- **Storefront Widgets (Theme App Extension, Live)**
  - *What it does*: Drops a WhatsApp lead-capture form anywhere on the storefront via the Shopify Theme Editor. A shopper submits their phone number, gets opted in and tagged `whatsapp-optin` in Shopify, and instantly receives a discount code via WhatsApp.
  - *Details*: Discount % is a merchant-editable setting on the theme block itself (`extensions/tellero-chat/blocks/whatsapp_optin.liquid`), not a dashboard setting, since merchants already configure the block's text/colors there. The WhatsApp template used for the message is picked separately on Settings > Shopify (template approval is per-org/WABA, which the theme schema can't express). Discount minting is idempotent per contact (`contacts.widget_discount_code`) - repeat opt-ins from the same number never mint a second code. The proxy route (`src/app/api/shopify/proxy/route.ts`) also returns the code in its response so the widget can show it on-page immediately, in addition to the WhatsApp send. Both this widget and Order Tracking (`order_tracking.liquid`) have a country-code dropdown (shared `extensions/tellero-chat/snippets/country_codes.liquid`, ~190 countries) instead of being US-only, plus a Width slider (280-900px) since they previously always stretched full-section-width.
  - *CRITICAL RULE*: Changes under `extensions/` (block code, schema) or to `shopify.app.toml` only reach any store - dev or live - after running `shopify app deploy --allow-updates`. `git push` alone does nothing for these; only the Next.js backend auto-deploys via Vercel on push.
- **Checkout UI Extensions (Live)**
  - *What it does*: Native UI blocks rendered securely inside Shopify's checkout flow. Specifically, the `order-tracking-ui` extension targets the Thank You and Order Status pages.
  - *Details*: Built using `@shopify/ui-extensions-react/checkout`. It dynamically captures `order.id` and `address.phone` securely from the checkout session API and sends it to the app proxy via `fetch()`. The proxy handles CORS `OPTIONS` preflight requests because the extension runs in an isolated `extensions.shopifycdn.com` sandbox environment. Network access must be explicitly granted in the Partner Dashboard for this to work in production.

## Product principles


## Key integrations

## Related docs
- Roadmap & milestones → roadmap.md
- Task queue → docs/todo.md
- Architecture → architecture.md
- Integrations detail → integrations.md
- Product decisions → decision-log.md

## Architecture & Database Context
