# Source audit

Editorial reference. Do not publish this file as a portfolio page.

The supplied files are secondary records: conversation summaries, engineering references, and reconstructions of research reports. The underlying repositories, original reports, experiment artifacts, and blogs are not present. A statement that a source author verified something is historical evidence, not a verification performed for this portfolio.

## What each file contributes

| Source | What it contains | Portfolio use | Evidence boundary |
|---|---|---|---|
| `about_me.md` | Ramnath Thakur's introduction and Foomato internship case file. Includes feed ranking, ETA prediction, explicit ownership, and technical trade-offs. | Style reference only: concrete problem, mechanism, decision, limitation. | None of this biography, education, employment, or project ownership belongs to Aaditya. Howzat and PaperCode are excluded. |
| `aaditya-projects.md` | Aaditya's project-history summary. Adds LogstoneDB, an Apple Silicon inference proposal, client web work, and another ResQNet version. | Identity spelling, GitHub handle, early LogstoneDB note, research interests. | Sparse summary. The 24-week database target is a goal, not a finished linearizable database. Implementation provenance does not establish personal authorship. |
| `PROJECT_PORTFOLIO_FOCUSED.md` | Consolidation dated 29 October 2026. Describes later ResQNet backend work, Trading Lab protocols, internship, and wider ideas. | Breadth, later historical milestones, project selection. | A conversation consolidation cannot prove current deployments, test counts, security, or completed roadmap items. |
| `design.md` | Visual direction chosen from three supplied references, dated after the other sources. | Visual authority for the build. It supersedes the starting values in `site-plan.md`. | Not a factual source. It contains no project evidence and its own text says no accessibility testing is implied. |
| `RESQNET(1).md` | Detailed Flutter/Firebase reference covering mesh, SOS, maps, sensors, permissions, auth, security, defects, and release blockers. | Main technical basis for the explicitly identified Flutter prototype case study. | Foreground relay, connection defects, missing cloud fan-out, and absent end-to-end protection limit product claims. Suggested fixes are not completed fixes. |
| `TRADING_LAB(1).md` | Engineering snapshot dated 19 August 2026. Covers the daily pipeline, loaders, indicators, fills, metrics, UI, paper state, results, robustness studies, and review findings. | Earlier daily-engine case study with an explicit historical boundary. | Results are reported in this file, not reproduced here. The snapshot predates the later research consolidation. |
| `pancreatic_tumor_classification(1).md` | Research-report reconstruction covering four backbones, nine heads, five seeds, exact-duplicate auditing, patient splits, results, and future work. | Research case study centered on leakage and evaluation. | Original DOCX, datasets, split manifests, and code are absent. Proposed production structure is not implemented evidence. |
| `IoT-Based_Healthcare_System_using_Machine_Learning(1).md` | Research-report reconstruction covering EEG preprocessing, engineered features, four classifiers, subject-wise splits, reported results, limitations, and proposed IoT deployment. | EEG research case study. | Original PDF and code are absent. Wearable deployment, CNNs, and RNNs are future directions in this source. |

## Corrections that affect the public story

### Keep identities separate

Aaditya's institution and graduation year cannot be inferred from Ramnath's introduction. NIT Rourkela is documented as the site of Aaditya's EEG internship. That does not establish Aaditya's degree institution. Omit nationality, residence, age, and education until confirmed.

### Name the ResQNet version

The short history describes React Native, Firebase, and BLE exploration. The detailed reference describes Flutter, Dart, Firebase, and Nearby Connections. The later consolidation describes Flutter with a Node.js, Express, TypeScript, and PostgreSQL backend, plus a migration away from Firebase.

Do not combine these into one verified current stack. The case study covers the documented Flutter/Firebase prototype and labels later backend work separately. Ask for the current repository and commit before changing that boundary.

The detailed implementation uses keyword rules for emergency classification. Calling it a trained AI classifier is inaccurate, and the reference says so about its own `pubspec.yaml` description. The consolidation's "AI-powered" and "AI prioritization" wording must not carry into public copy. File counts also differ across records (18 files in the short history, 51 Dart files in the reference), so the public copy gives none. A ten-hop limit is a forwarding rule, not a measured range guarantee. Store-and-forward, iOS transport, and continuous background relay are not documented as working in this prototype.

Map rendering depends on tiles having been available or downloaded. Offline speech depends on local language models. Calling emergency services still depends on telephony service. Do not repeat the source's blanket claim that every path works offline.

The source's tile-server policy claims, emergency numbers, app-store requirements, and vendor-specific limits are not independently checked. They are unnecessary for the portfolio and are omitted.

### Separate Trading Lab's earlier engine and later protocol

The August reference describes a small daily research engine with print-based smoke scripts and a paper bot whose recorded diary had one initial entry and no fills. The October consolidation reports later automated-test milestones, data registries, and intraday research planning. Those are different checkpoints, not proof that the earlier defects remain or were fixed.

The documented ML evaluation is a single chronological holdout, not walk-forward validation. The snapshot did not run `run_ml.py`, so its accuracy and return figures come from the project README and are doubly secondary. The later ORB v1 protocol is a draft, with Stage 2 and tuning not started in the record. The 1 October 2026 holdout boundary is a protocol boundary, not evidence that the holdout has since been evaluated.

Do not present returns as proof of profitability. The daily-engine reference reports cost sensitivity, uneven parameter results, benchmark warm-up differences, and missing economic assumptions. Its claim of a 39% drawdown reduction is inconsistent with the displayed magnitudes of 38.4% and 15.1%. Omit that derived percentage. Rounded returns of 184.8% and 181.6% differ by 3.2 percentage points, while the source table reports a 3.1-point margin. Avoid that rounded-margin claim too.

Market closing times, broker rules, tax rates, and circular details are not needed in the copy. They require current primary-source verification before any later article uses them.

### Keep the CT aggregates distinct

The source reports a system-wide mean of 99.91% for a random slice split and 79.05% for patient-group evaluation. The 98.60% ± 1.30% result belongs to the best reported ResNet-50 plus KNN configuration. It is not the mean across all pipelines or a clinical diagnostic accuracy claim.

The source reports 206 exact duplicate instances removed. Hashing does not detect every near-duplicate or prove patient identity. Numeric patient labels recur across classes, so globally unique patient grouping needs confirmation. Five seeds do not establish external clinical validation. Do not claim statistical superiority from the 0.23-point difference between the two leading means. The short history lists an 80:10:10 split and a 50-epoch minimum. The report applies 80:10:10 to the slice-level split only and shows 100-epoch curves, so the public copy gives no epoch count and no ratio for the patient-group regime.

### Describe the EEG work as documented

The consolidation mentions three conditions, CNNs, RNNs, and real-time wearable work. The detailed report reconstruction covers five conditions and evaluates logistic regression, random forest, SVM, and an MLP. It puts CNNs, RNNs, and wearable deployment in future work. Use the detailed account for this case study, and retain the internship association from the consolidation pending confirmation.

The 88.2% accuracy is a reported average across disorder tasks. It does not establish a single five-class diagnosis model. A sigmoid output alone does not resolve the task definition. The order of SMOTE relative to splitting is not documented, nor is the exact mapping from named datasets to diagnostic labels. Keep numerical EEG performance out of the initial public copy until the original report clarifies these issues. Channel counts also differ by condition (5, 11, or 19), so the conditions are not like-for-like comparisons.

## Project selection

| Work | Decision | Reason |
|---|---|---|
| ResQNet | Main case study | Substantial engineering decisions and documented limitations. |
| Trading Lab | Main case study | Concrete measurement design and research discipline. |
| Pancreatic CT | Main case study | Clear evaluation question and data-integrity story. |
| EEG | Main case study | Internship research with a distinct signal-processing pipeline. |
| LogstoneDB | Short project note | Useful systems direction, sparse progress evidence. |
| Orbyatravel | Hold detailed page | Hosting is recorded, but audience, contribution, product behavior, visuals, and permission are missing. |
| Apple Silicon LLM inference | Hold | Proposal only. |
| Separate vision-model project | Merge into CT unless distinct evidence arrives | Avoid counting the same backbone comparison twice. |
| Privacy-first personal AI, Nepal property platform | Hold | Concepts, not delivered products. |
| Samsung competition narrative | Keep with ResQNet only if evidenced | No award, selection, or partnership is established. |
| Coursework, startup ideation, installation notes | Exclude from selected work | They add breadth without enough evidence of a portfolio outcome. |

## Evidence to request once

Collect current project commits, personal responsibilities, team credits, public repository permissions, original research reports, approved figures, dataset provenance, internship confirmation, preferred contact details, and two or three actual blog posts. The launch checklist turns these gaps into specific actions.
