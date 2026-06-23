# AI_CONTEXT.md

## Product Overview

Tellero is a WhatsApp Revenue Engine for D2C ecommerce brands.

The product helps brands increase revenue and customer retention through WhatsApp using:

* Broadcast campaigns
* Customer segmentation
* Automated messaging
* Shared team inbox
* Shopify integrations
* Future WooCommerce integrations

Tellero is NOT a customer support helpdesk and NOT a shipping platform.

Primary positioning:

"WhatsApp Revenue Engine for D2C Brands"

Primary market:

* India
* Shopify merchants
* D2C ecommerce brands

---

## Core Product Areas

### Inbox

Shared WhatsApp inbox for customer conversations.

Features:

* Customer profiles
* Conversation history
* Team assignment
* Future AI reply suggestions

---

### Segments

Users create reusable customer segments.

Examples:

* VIP Customers
* High Value Customers
* First Time Buyers
* Repeat Buyers
* Inactive Customers
* Delivered > 30 Days Ago

Segments should be reusable across:

* Broadcasts
* Automations
* Future campaigns

---

### Broadcasts

Users send WhatsApp campaigns to selected segments.

Capabilities:

* Approved WhatsApp templates
* Audience selection
* Scheduling
* Campaign analytics

---

### Automations

Current automations:

1. COD Confirmation
2. Abandoned Cart
3. Order Notifications
4. Reorder Reminders
5. Winback Campaigns
6. Review Requests

All automation pages follow the same layout.

Left Side:

* Setup
* Trigger configuration
* Segment selection
* Enable / Disable

Right Side:

* Message Template
* Variable Mapping
* Preview

Always reuse existing automation architecture.

Never build a separate template system.

---

## Variable Mapping Strategy

Template variable mappings are stored per:

automation_type + template_id

Example:

COD Confirmation

* Template A -> Mapping A
* Template B -> Mapping B

Winback Campaign

* Template A -> Mapping C

Benefits:

* Users can switch templates without losing mappings
* Previous mappings are automatically restored

Future enhancement:

Brand-level template mapping cache for auto-prefill.

---

## Commerce Integrations

### Shopify

Current primary platform.

Supported:

* OAuth installation
* Customer sync
* Order sync
* Webhooks

Events:

* orders/create
* orders/updated
* orders/fulfilled
* orders/cancelled
* customers/create
* customers/update
* app/uninstalled

Important:

Shopify Fulfilled != Delivered

Fulfilled means shipped/processed.

Delivery events require logistics integrations.

---

### WooCommerce

Planned.

Must normalize into the same commerce model used by Shopify.

Automation logic should never care whether data originated from Shopify or WooCommerce.

---

## Commerce Data Model

Use normalized commerce tables.

Examples:

commerce_customers

commerce_orders

commerce_order_items

platform_type:

* shopify
* woocommerce

Goal:

Build automations once.

Reuse across all commerce platforms.

---

## Logistics Integrations

### Shiprocket

Planned integration.

Purpose:

Receive delivery lifecycle events.

Events:

* Out For Delivery
* Delivered
* Failed Delivery
* RTO Initiated
* RTO Delivered

Unlocks:

* Review Requests
* Delivery-based automations
* RTO prevention
* Delivery-based segmentation

Tellero should not compete with Shiprocket.

Shiprocket provides events.

Tellero provides marketing and revenue automation.

---

## AI Strategy

AI is not the immediate priority.

Current priorities:

1. Shopify
2. Segments
3. Broadcasts
4. Winback Campaigns
5. Review Requests
6. WooCommerce
7. Shiprocket

Future AI roadmap:

Phase 1

* Suggested replies in inbox

Phase 2

* FAQ bot
* Product Q&A
* Shipping questions

Phase 3

* Full AI support assistant
* Human handoff

Recommended models:

* Gemini Flash
* Claude Haiku

Do not build custom models.

Use existing LLM APIs.

---

## Product Principles

1. Revenue First

Every feature should help:

* Increase revenue
* Increase retention
* Reduce churn
* Reduce COD losses

2. Reuse Components

Avoid duplicate UIs.

Reuse:

* Template selector
* Variable mapping
* Segment selector
* Automation layouts

3. Shopify First

Shopify remains the primary commerce platform.

4. Minimize Setup Complexity

Users should be able to activate automations in minutes.

5. Segment-Centric Architecture

Segments are a foundational building block.

All future features should leverage segments.

---

## Long-Term Vision

Become the default WhatsApp marketing and retention platform for D2C brands.

Future platform pillars:

* Inbox
* Segments
* Broadcasts
* Automations
* AI
* Analytics

North Star:

Help ecommerce brands generate more revenue from WhatsApp with minimal manual effort.
