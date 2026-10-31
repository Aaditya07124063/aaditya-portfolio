# LogstoneDB project note

Route: `/projects/logstonedb`. Source: `aaditya-projects.md` only. This note is deliberately shorter than the case studies. Confirm the active stage before launch.

## Public copy

<!-- public-copy:start -->

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

<!-- public-copy:end -->

## Publication notes

The source supplies `https://github.com/Aaditya07124063/logstonedb`. Confirm visibility, relevance, and permission before adding a repository button. Do not describe the system as production-ready, fault-tolerant, fully implemented, or externally certified.

The source says coding agents implement the specification files and review the work, including parts first meant to be written by hand. The note therefore makes no claim about who wrote the code. Ask Aaditya how to describe the personal role, and do not infer sole authorship. Do not credit tools as authors or contributors. The source also calls the project a "solo challenge" with an external evaluator. Both phrases are omitted until the role is settled.
