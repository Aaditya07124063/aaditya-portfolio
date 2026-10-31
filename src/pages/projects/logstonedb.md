---
layout: "../../layouts/Article.astro"
title: "LogstoneDB · Aaditya Adhikari"
description: "An early Go database project exploring Raft through deterministic simulation before a complete replicated key-value system."
project: "logstonedb"
caption: "Illustrative three-node target. The current project starts with deterministic simulation."
---

# LogstoneDB

An early database project in Go, aimed at understanding replicated state by simulating failures before building a networked system.

In progress, and early.

## The plan

The target is a three-node key-value database that uses Raft for replication, on a 24-week schedule. The latest record puts the project in a 14-day deterministic simulator phase, which comes before any real networking. The next written piece is an invariants document, which states what must always be true of the system.

A deterministic simulator controls the order of messages, timeouts, and failures, so a failing run can be replayed exactly. That's what makes distributed bugs possible to study. A crash that happens once on a real network may never happen again.

The goal is a linearizable database, meaning operations appear to happen one at a time in an order that respects real time. Nothing in the record shows that the goal has been reached.

## What the next note should show

A replayable failing trace, the invariant it broke, and the fix would say more than a list of planned features. This page stays short until the project has a trace, an invariant check, or a specific failure to show.

[Back to all projects](/projects)
