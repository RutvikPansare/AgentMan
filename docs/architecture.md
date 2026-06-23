# Tellero Architecture

## Frontend

Stack:
- Next.js
- TypeScript
- Tailwind
- shadcn/ui

## Backend

Stack:
- Supabase
- PostgreSQL
- Edge Functions

## Core Modules

### Inbox

Stores:
- Conversations
- Messages
- Assignments

### Segments

Stores:
- Rules
- Conditions
- Saved Segments

### Broadcasts

Stores:
- Campaigns
- Recipients
- Delivery Results

### Automations

Stores:
- Automation Configurations
- Triggers
- Message Templates

## Variable Mapping Strategy

Store mappings per:

automation_type + template_id

Example:

COD Confirmation
  Template A
  Template B

Winback
  Template A
  Template B

Benefits:
- Restores mappings automatically
- No repeated configuration

## Commerce Layer

Normalized tables:

commerce_customers
commerce_orders
commerce_order_items

platform_type:
- shopify
- woocommerce

## Future AI Layer

Knowledge Base
↓
Retrieval
↓
Gemini Flash
↓
Inbox