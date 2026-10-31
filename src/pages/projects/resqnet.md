---
layout: "../../layouts/Article.astro"
title: "ResQNet — AI-Powered Offline Emergency Communication System — Aaditya Adhikari"
description: "ResQNet is an AI-powered offline emergency communication system by Aaditya Adhikari, exploring SOS messaging and nearby-device communication without relying on the internet."
project: "resqnet"
caption: "Illustrative relay path between connected devices. No measured range or delivery reliability is implied."
---

# ResQNet

A prototype for sending SOS messages between nearby phones when the internet and the cell network are gone.

Prototype under development. This page covers the Android build described in the project's Flutter and Firebase engineering reference, and it says what that build can't do yet.

## Why an emergency app can't depend on a server

In a flood, a landslide, or a building fire, the cell network is often one of the first things to fail. Towers lose power and backhaul gets cut, and what survives is swamped by everyone calling at once. An emergency app that posts alerts to a server ends up as a client for infrastructure that isn't there.

ResQNet starts from a stricter rule. No step that matters in an emergency should wait on the internet. Phones that can reach each other pass messages directly, and each phone relays what it hears. Firebase, online map tiles, and translation are extras that are allowed to fail.

The prototype is built to answer a narrow question. How much of an SOS flow can run locally, and which dependencies are still left once the obvious ones are removed?

## How a message travels

The app is written in Flutter and Dart. Google Nearby Connections carries the traffic between phones, in its cluster mode, where any phone can connect to any other. A star layout with one hub phone would stop working when that phone's battery died. The messages are a few hundred bytes of JSON, so link speed hardly matters here. Topology does.

Every phone advertises itself and looks for others at the same time. There is no server, no client role, and no elected coordinator. A message carries an identifier, text, a category, a priority, optional coordinates, a timestamp, and a hop count, along with the sender's name, battery level, and optional medical details. Anonymous mode swaps the name for "Anonymous" and leaves the medical fields out.

There is no routing table. A phone that receives a message it hasn't seen stores it and forwards it to every phone it's connected to. Two rules keep that from turning into a storm. Each phone remembers message identifiers and drops repeats, so it forwards each message once while the app is running. And a hop counter stops forwarding after ten hops. That limit caps how far one message spreads through connected phones. It isn't a measured range.

Flooding is simple and needs no knowledge of where the recipient is. The price is airtime and battery, because the same message gets transmitted many times.

## Local work first, cloud work second

When a phone sends an SOS, the alert goes into local state and onto the screen before the cloud calls start, and the cloud calls aren't awaited. In the mesh code, a message is stored locally, sent over the radio, and only then written to Firestore history. If the code waited for a cloud write before transmitting, the app would fail in exactly the situation it was built for.

The same thinking shows up in smaller choices. A failed GPS fix doesn't cancel an SOS, because a message without coordinates is better than none. The map screen asks the user to download a 25 km region ahead of time, since a cache that only keeps tiles you've already looked at can't hold the area you're fleeing to.

The principle still has gaps, and the reference lists them. Translation calls an online endpoint. Sign-in goes through Firebase. Offline speech input relies on language models already on the phone, and Nepali coverage isn't guaranteed. Country detection, which picks the right emergency numbers, is arithmetic on coordinates instead of a geocoding service, so it works without a connection. That choice has a cost too. The bounding box for Nepal sits entirely inside the box for India, and India is tested first, so the reference finds that a phone in Kathmandu is shown India's numbers.

## Giving people a chance to cancel

A manual SOS starts a five-second countdown with a vibration on each tick and a cancel button. The crash-triggered path waits twenty seconds, on the reasoning that someone who has just been in a collision may be disoriented. A false alarm isn't harmless. It uses up responders' attention and teaches people to ignore alerts, so no sensor heuristic in the app transmits without a countdown first.

The heuristics need that safety net. Crash detection looks for a sharp impact followed by near stillness. The reference notes that the app reads GPS speed at impact but never uses it to decide anything, so dropping a phone on a desk meets both conditions and starts the countdown. An earthquake detector built on a standard seismometer trigger also fired on desk bumps. The reference concludes that one phone's accelerometer can't tell a tremor from local noise and that the feature should be removed instead of tuned.

Emergency message classification is a keyword table, not a trained model, and this page describes it that way. The reference chose it over bundling a classifier because it's instant, adds nothing to the app size, works offline, and can be audited by reading the rules. It misfires in predictable ways. The first matching category wins, so a message about a fire and a painful leg is filed as medical, and "no drinking water" reads as a flood.

## What would stop it working in the field

The reference ends with a list of known defects. Several of them decide whether the mesh works at all.

Connection setup is the most serious. The function that gives each phone a distinct name is never called, so every phone advertises the same name. The tiebreak that decides which of two phones starts a connection also compares against a name with the prefix added twice, so as documented both sides try to connect at once and the handshakes collide. Fixing one problem without the other doesn't help.

Participation is the next problem. The app has no Android foreground service, so when the screen locks a phone stops advertising, discovering, and relaying. A mesh needs phones to keep taking part for hours. There's also no store-and-forward, so a message reaches only the phones connected at that moment, and the transport works on Android only.

Security is the largest gap. Nearby Connections encrypts each link, but every relaying phone decrypts the payload and can read the sender's name, coordinates, and any medical details. Nothing authenticates the sender, so a modified client could forge messages or inject false alerts. Anonymous mode strips the name and medical fields before sending, which helps, but it doesn't change either point.

The reference calls message signing and encryption of the sensitive fields the highest-value work remaining. It also lists release blockers, including a placeholder application ID and a release build signed with the debug key.

## What would count as evidence

The radio transport needs physical Android devices for testing. Validation should remove internet access while leaving the radios required by Nearby Connections enabled. Two phones are the minimum, and three are needed to test relaying, because two phones only ever test a single hop. The reference lays out that test plan and records no results from it. Its automated test file was still the default counter template when the reference was written.

The evidence worth waiting for is a named build tested on real devices. It should cover discovery, direct delivery, delivery from one phone to another through a third, what happens when a phone drops out, and battery use over time.

## Later work

Other project records describe different stacks over time. They include a React Native version with Firebase, and a TypeScript and Express backend with PostgreSQL and Docker alongside a move away from Firebase. Those are separate checkpoints. They don't show that the defects above were fixed, and this page doesn't merge them into one stack.

ResQNet is a development project. Nothing in the records shows it running as an emergency service.

[Next project: Trading Lab](/projects/trading-lab) · [All projects](/projects)
