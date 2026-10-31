# Aaditya Adhikari — Project Portfolio (from Claude history)

Compiled from everything saved about your projects. Grouped by status/type.

---

## 1. LogstoneDB (formerly AegisKV)
**Type:** Solo engineering project | **Stack:** Go
- 24-week solo challenge to build a 3-node linearizable Raft key-value database, reviewed by an external evaluator
- Currently in the 14-day deterministic Raft simulator phase; `docs/invariants.md` is the next submission
- Renamed from AegisKV to LogstoneDB; docs kept in a "database" folder on the Desktop
- Spec files handed to Codex to implement, with Claude as supervisor/reviewer; Codex and Claude do all the work, including parts originally meant to be operator-authored
- Repo: github.com/Aaditya07124063/logstonedb

## 2. On-Device LLM Inference Research (Apple Silicon)
**Type:** Research | **Stage:** Proposal
- ~6-month research project on memory-efficient on-device LLM inference on Apple Silicon (quantization, MLX)
- Being proposed to a professor; treated as a serious, paper-quality project

## 3. Cancer Detection from CT Scans (Pancreatic)
**Type:** ML research | **Stack:** TensorFlow/Keras
- Cancer detection from CT scan images under advisor guidance (supervisor: Chaudhary)
- Methodology: stratified 80:10:10 splits, five runs with fixed seeds, averaged results, ImageNet pretrained weights, 50-epoch minimum
- Four models: ResNet-50, InceptionV3, MobileViT, Swin Transformer
- Audited a flawed prior Kaggle notebook (data leakage, unrealistic accuracy, untrained required models)
- Prepared structured prompts for correct implementation

## 4. ResQNet
**Type:** Emergency communication app | **Stack:** React Native, Firebase, Bluetooth LE mesh
- Dark theme (black/red)
- React Native version uses Firebase Auth/Firestore
- Bugs worked through: display name issues, Firebase phone auth errors, unresponsive UI (missing `onPress` handlers on status badges, unresponsive Connect button)
- Exploring offline mesh chat with store-and-forward BLE relay
- Earlier Flutter version fully scaffolded (18 files) using Google Nearby Connections, TFLite, OpenStreetMap, Firebase

## Smaller Explorations & Coursework
- Campus placement preparation (Software domain)
- Installing ns-3 on macOS and C++ simulation code
- Matrix operations assignments in Python/Jupyter Lab
- Startup ideation: heat-resilience platforms for informal outdoor workers in India; vertical SaaS for underserved professions in Nepal/India; battery health certification for used EVs; satellite carbon monitoring for Nepal's community forests (each stress-tested against incumbents and free alternatives)
- YouTube automation / passive income content strategies

## Background
- Research in BLE mesh emergency communication and medical imaging ML
- Client web work: animation-heavy builds with GSAP, Three.js, Lenis
- Skills: React/Next.js, React Native, TensorFlow/Keras, computer vision, C++ for DSA
- GitHub: github.com/Aaditya07124063
