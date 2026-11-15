---
layout: "../../layouts/Article.astro"
title: "Orbyatravels — Full-Stack Travel Marketplace for Nepal — Aaditya Adhikari"
description: "Orbyatravels is a full-stack travel marketplace for Nepal, built as a monorepo of four Next.js apps, a Hono API and shared packages, with a grounded AI trip planner."
project: "orbyatravels"
caption: "Simplified system map. Four Next.js apps and an API share typed packages and one PostgreSQL database. Not a deployment diagram."
---

# Orbyatravels

A travel marketplace for Nepal, built as a monorepo of four web apps, an API and shared packages.

Independent businesses list what they sell. Travellers discover places, get an AI-built itinerary and book. The source code is private, so this page describes the design and leaves out anything confidential.

## The problem

A travel marketplace has several kinds of user, and they want different things. A traveller wants to explore and book. A hotel or bus operator wants to manage listings and payouts. Staff need to approve businesses and verify payments. An admin sets commission and limits. Putting all of that behind role checks in one app means a bug in the admin screens can take down the consumer site.

Orbyatravels doesn't own any of the services it sells. It runs the software, brings the traveller, and takes a commission from the provider.

## How it is split

The project is a pnpm and Turborepo monorepo with five applications and seven shared packages.

- **web** is the traveller site: a map of places, a bucket list, the AI itinerary, booking and payment.
- **provider** is where businesses register, upload licence documents, list accommodation, flights, buses, trains, car rentals and guided tours, and manage bookings and payouts.
- **employee** is the staff portal: approving providers and listings, curating places, verifying manual payments and running the CRM.
- **admin** holds commission rules, coupons, referral programmes, AI limits, integrations and revenue.
- **api** is a Hono service with background jobs on BullMQ and Redis.

The four Next.js apps are separate deployments on purpose. The docs give the reason: the blast radius of a bug in the admin app shouldn't include the consumer site. They share packages for the database client (Prisma on PostgreSQL), types, UI components, payments, referrals and CRM logic, so the rules live in one place. The Prisma schema has 65 models and more than a dozen migrations.

## Money

Payments support two settlement modes. In `DIRECT` mode the provider collects the full amount and later owes the platform its commission. In `ESCROW` mode the platform collects and forwards the provider's share. The mode is a per-provider setting, so moving a provider between them isn't a rewrite.

The commission rate that applied to a booking is frozen on its payment row. Editing a rule later never changes what a provider was already owed. The docs treat `ESCROW` as regulated activity in Nepal and flag it as a legal question that has to be settled before use.

## The AI trip planner

The planner is grounded. Its prompt carries the traveller's saved places, other places in that country, and approved provider listings filtered by travel style. It must copy titles exactly, and titles in the answer are fuzzy-matched back to real rows, so an itinerary leg can link to something bookable. If nothing matches, the model describes the stop generically instead of naming a business that doesn't exist.

Calls go through a chain of LLM providers in an order the admin sets. Any failure falls through to the next key, then the next provider. That exists because the planner once depended on a single provider and went down with its free-tier rate limit. The model for each provider is fixed in code, because the prompt depends on JSON output and exact title reproduction.

## Engineering decisions worth noting

- A booking is a real booking. It reaches the provider's portal and the provider is expected to honour it, which is a product decision and also the largest operational risk.
- Holds on bookings wait for payment, and provider payment methods are configurable.
- Datastores (PostgreSQL, Redis, Meilisearch) publish no ports to the host. Docker Compose, Caddy and Nginx front the services.
- Nothing in the schema is Nepal-specific, but the legal framework is. Expanding means a new legal exercise as well as new data.

## What this page doesn't claim

There are no traffic, revenue or performance numbers here, because I have none to show. Screenshots aren't included either.

[Visit orbyatravel.com](https://orbyatravel.com) · [Back to all projects](/projects)
