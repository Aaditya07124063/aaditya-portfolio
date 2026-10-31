# Project Portfolio --- Complete Project History

**Owner:** Aaditya Adhikari\
**Last consolidated:** 29 October 2026\
**Purpose:** Master reference of the software, research, academic,
startup, and experimental projects discussed in this ChatGPT history.

------------------------------------------------------------------------

## 1. Overview

This document consolidates the distinct projects and project ideas that
have appeared across the conversation history. It is intended to be a
single source of truth for:

-   Resume/CV preparation
-   Interview preparation
-   Research and PhD applications
-   GitHub/README documentation
-   Future development planning
-   Project portfolio tracking
-   Explaining projects to interviewers, mentors, or collaborators

### Project index — focused working set

  -------------------------------------------------------------------------
  \#                Project            Category          Main status
  ----------------- ------------------ ----------------- ------------------
  1                 **ResQNet**        Startup / Mobile  Active development
                                       / AI / Emergency  
                                       Communication     

  2                 **Trading Lab**    Quant Finance /   Active research
                                       Research / ML     

  3                 **Orbyatravel**    Travel / Web      Existing deployed
                                       Platform          project

  4                 **Pancreatic Tumor Medical AI /      Research project
                    CT                 Computer Vision   
                    Classification**                     

  5                 **EEG-based        Biomedical AI /   Completed
                    Mental-Health      Deep Learning     internship
                    Detection                            research
                    Research**                           

  6                 **MobileViT /      Computer Vision / Experimental
                    ResNet-50 / Swin   Deep Learning     research
                    Transformer                          
                    Research**                           

  7                 **Nepal Property   Real Estate / Web Idea / early
                    Website**          Startup Idea      concept

  8                 **Privacy-first    AI / On-device ML Long-term
                    Personal AI**      / Privacy         research/product
                                                         idea

  9                 **Samsung Solve    Innovation /      Competition
                    for Tomorrow       Startup           concept
                    Idea**                               

  10                **Other academic / Coursework / ML / Multiple smaller
                    experimental       Networking        projects
                    work**                               
  -------------------------------------------------------------------------

------------------------------------------------------------------------

# 2. ResQNet

## 2.1 One-line description

**ResQNet is an AI-powered offline emergency communication platform
designed to help people communicate, share locations, and coordinate
rescue when conventional internet or cellular infrastructure is
unavailable.**

## 2.2 Problem

During disasters such as:

-   earthquakes
-   floods
-   landslides
-   major accidents
-   infrastructure failures
-   network outages

normal communication infrastructure can become unreliable or
unavailable.

ResQNet is designed around the idea that nearby smartphones can
communicate directly using technologies such as:

-   Bluetooth
-   Wi-Fi Direct
-   local/offline networking

instead of depending entirely on the internet.

## 2.3 Core concept

The system aims to create a resilient nearby-device communication
network.

A device can:

1.  Detect or receive an emergency event.
2.  Generate an SOS alert.
3.  Share relevant location information.
4.  Communicate with nearby devices.
5.  Relay emergency information through the local network.
6.  Help coordinate rescue.
7.  Prioritize important emergency messages using AI.

## 2.4 Major features

### Emergency communication

-   Offline SOS
-   Nearby-device communication
-   Emergency message propagation
-   Resilient communication when internet connectivity is unavailable

### Location and rescue

-   Location sharing
-   Rescue coordination
-   Trusted contacts
-   Emergency status

### Intelligent emergency detection

The project has explored phone-sensor-based detection for events such
as:

-   vehicle crashes
-   earthquakes

The goal is to reduce the dependency on manual SOS initiation.

### AI prioritization

Emergency messages can be prioritized so that the most critical alerts
receive attention first.

## 2.5 Technology stack

### Mobile application

-   Flutter
-   Dart
-   Android/iOS-oriented mobile architecture

### Backend

-   Node.js
-   Express
-   TypeScript
-   Node.js 20.20.2
-   JWT-based sessions
-   Google Sign-In V2 backend verification

### Database

-   PostgreSQL 16

The backend database contains a substantial relational schema,
previously documented as approximately 29 tables.

### Infrastructure

-   Hostinger VPS
-   Docker
-   Docker Compose
-   Nginx
-   PostgreSQL container
-   API container

Production architecture has used:

``` text
Internet
   |
   v
Nginx / Domain
   |
   v
ResQNet API
   |
   v
PostgreSQL
```

The production Compose setup uses separate `api` and `db` services.

The API container listens internally on port 3000 and has been mapped to
VPS port 3300 in the deployment configuration.

Production deployment path:

``` text
/opt/resqnet
```

A planned API domain has been:

``` text
api.resqnet.co
```

The website/domain discussed for ResQNet is:

``` text
resqnet.co
```

## 2.6 Authentication

The project moved away from relying on Firebase phone OTP for
production.

Authentication work includes:

-   Google Sign-In
-   backend verification
-   JWT/session issuance
-   email verification APIs
-   OTP/SMS integration planning

## 2.7 SMS

For Nepal-focused SMS delivery, Sparrow SMS was selected/discussed.

Relevant architecture:

-   Sparrow provider
-   provider token
-   Sender ID
-   encrypted credential storage

The Sparrow credential architecture uses AES-256-GCM with a
base64-encoded 32-byte:

``` text
PROVIDER_CREDENTIALS_ENCRYPTION_KEY
```

The provider token is encrypted, while the sender ID is plaintext
configuration.

At the time of the recorded development state, real SMS delivery still
required final provider verification/configuration.

## 2.8 Mapping

MapLibre GL was considered for map functionality.

The system needs to support:

-   location display
-   offline/resilient map interaction where possible
-   emergency location sharing

## 2.9 Storage

MinIO was considered as an open-source storage alternative in the
migration away from Firebase.

## 2.10 Firebase migration

A major architectural goal was reducing dependency on Firebase and
moving infrastructure to the user's Hostinger VPS.

The migration direction included:

  Firebase-like responsibility   Replacement
  ------------------------------ ------------------------------------------
  Authentication                 Google Sign-In V2 + backend verification
  Database                       PostgreSQL
  Storage                        MinIO
  Hosting                        Hostinger VPS
  SMS                            Sparrow / other provider
  Analytics                      Initially skipped

## 2.11 Deployment isolation requirement

A critical requirement is:

> **ResQNet must remain isolated from Orbyatravel.**

That means no accidental sharing of:

-   source code
-   databases
-   Docker containers
-   Docker networks
-   ports
-   environment variables
-   domains
-   Firebase configuration
-   deployment workflows

unless explicitly decided later.

## 2.12 Testing

The project has had substantial automated testing.

Recorded milestones include:

-   approximately 38 backend tests passing at an earlier checkpoint
-   later approximately 539 backend tests passing
-   approximately 48 Flutter tests passing

The repository has also had checkpoint commits, including:

``` text
a07939953f63db100efebb1372a6a2006907297c
```

with the message:

``` text
chore: checkpoint tested backend and database foundation
```

## 2.13 Website

The ResQNet website has been deployed at:

``` text
resqnet.co
```

The website has included HTTP content negotiation behavior for Markdown,
including:

-   `Accept` handling
-   q-values
-   wildcard handling
-   HTTP 406 handling
-   Markdown 404 responses
-   `Vary: Accept, Accept-Encoding`

The homepage describes ResQNet as an offline emergency communication
system based on:

-   Bluetooth
-   Wi-Fi Direct
-   SOS
-   location sharing
-   trusted contacts
-   nearby-device communication

## 2.14 Strategic importance

ResQNet is not only a software project. It has been considered as:

-   a startup
-   a research project
-   a competition/pitch project
-   a portfolio project
-   an emergency-communication technology platform

Potential future layers include:

1.  Mobile emergency application
2.  Distributed offline communication protocol
3.  AI-based emergency detection
4.  Emergency-response coordination infrastructure
5.  Government/NGO/disaster-response partnerships

------------------------------------------------------------------------

# 3. Trading Lab

## 3.1 One-line description

**Trading Lab is a quantitative-finance research platform for testing
trading hypotheses using reproducible data, backtesting, statistical
validation, and eventually machine learning and market-impact
information.**

## 3.2 Long-term vision

Trading Lab has three deliberately separate layers:

### Layer 1 --- Scientific research

Solve a credible quantitative-finance research problem and produce:

-   publication-quality methodology
-   experiments
-   statistical validation
-   reproducibility package
-   research paper

This layer is particularly important for PhD applications.

### Layer 2 --- Quant research platform

Turn the research infrastructure into a reusable platform for:

-   data engineering
-   experiment management
-   strategy evaluation
-   research logging
-   reproducibility
-   model comparison

### Layer 3 --- Trading/business

Only after the research layer is credible, the infrastructure can evolve
toward:

-   quantitative research products
-   trading systems
-   paper trading
-   potentially profitable trading

These layers should not be conflated.

## 3.3 Current research direction

A major research track has been **Opening Range Breakout (ORB)**
research.

The goal is to rigorously investigate whether an opening-range strategy
produces statistically defensible excess performance under realistic
Indian-market constraints.

## 3.4 Current research engine

The daily research engine has been designed to:

1.  Load market data.
2.  Add technical indicators.
3.  Generate signals.
4.  Backtest the strategy.
5.  Judge/evaluate results.
6.  Save results to a leaderboard.

A key trading rule is:

> Trade at tomorrow's open.

This is important for avoiding accidental look-ahead behavior.

## 3.5 Intraday research

The project contains intraday datasets including:

-   15-minute data
-   1-hour data

Recorded data coverage:

-   15-minute data: approximately 111 sessions
-   1-hour data: approximately 778 sessions
-   data through 30 September 2026

## 3.6 Universe

The research universe has been frozen to the NIFTY 50 constituent list.

File:

``` text
nse_ind_nifty50list.csv
```

The universe was frozen as of:

``` text
30 September 2026
```

## 3.7 Data engineering

The project has a data registry covering the available data files.

The registry records information such as:

-   file identity
-   checksums
-   provider
-   retrieval date
-   timezone
-   price basis
-   licence notes

An audit recorded coverage of all 36 registered files.

## 3.8 Research documentation

The repository has included documentation such as:

``` text
CLAUDE.md
METHODOLOGY.md
REPRODUCIBILITY.md
RESEARCH_LOG.md
CHANGELOG.md
DATA_REGISTRY.md
EXPERIMENT_REGISTRY.md
```

There are also protocol and decision documents for ORB.

## 3.9 ORB v1

ORB v1 has remained a **DRAFT** rather than being treated as a finished
result.

Important state:

``` text
ORB v1 = DRAFT
Stage 2 = not started
Strategy tuning = not started
```

The holdout boundary was:

``` text
2026-10-01
```

No final ORB or benchmark return should be treated as a published result
from the recorded project state.

## 3.10 Indian market microstructure changes

A major research consideration is the Indian market closing-auction
change.

A SEBI circular dated:

``` text
16 January 2026
```

introduced a closing auction beginning:

``` text
3 August 2026
```

The documented market structure is:

``` text
Continuous trading: ends 15:15
Closing auction:    15:15–15:35
Random close:       approximately 15:28–15:30
Post-close session: 15:50–16:00
```

This materially affects historical backtesting and exit definitions.

## 3.11 Yahoo Finance data issue

The research identified a data-quality problem:

> Yahoo Finance omits the 15:15 bar in approximately 22% of
> stock-sessions after the auction change.

This is an important reproducibility and data-engineering issue.

## 3.12 Broker constraints

Broker forced-close constraints were documented, including:

-   Zerodha: approximately 15:12
-   Upstox: approximately 15:10 since 11 September 2026

These constraints affect realistic exit definitions.

## 3.13 Exit definitions

Candidate exit definitions were documented as:

-   X1
-   X2
-   X3

The project deliberately avoided silently choosing an exit definition
before protocol validation.

## 3.14 Statistical methodology

A literature source, SSRN paper `5198458`, was added to the literature
collection.

A methodological critique found that the paper's bootstrap approach
could produce approximately:

``` text
p ≈ 0.5
```

regardless of the true effect in certain conditions.

More defensible approaches considered include:

-   null-centred block bootstrap
-   sign-flip tests
-   power calculations
-   multiple-testing correction

## 3.15 Backtesting safeguards

The project includes adversarial look-ahead testing.

The development/validation/out-of-sample split is explicitly documented.

This is central to the research goal because a high backtest result
without leakage control would not be a credible research contribution.

## 3.16 Cost model

The intraday engine contains a cost model, but at the recorded audit
stage the rates had not yet been fully populated.

This is an important unfinished research component.

## 3.17 Benchmark

The research framework includes an:

``` text
Open-to-close benchmark
```

The benchmark is intended to provide a baseline against which strategy
performance can be compared.

## 3.18 Software and experiments

The project has included:

-   Python research code
-   FastAPI
-   web UI
-   paper-trading bot
-   machine-learning experiments
-   momentum experiments
-   technical indicators
-   automated tests
-   experiment registry
-   leaderboard

A local development server has used:

``` bash
uvicorn server:app --host 0.0.0.0 --port $PORT
```

## 3.19 Testing milestones

Recorded audits include:

-   67/67 tests passing
-   later 80 tests passing

The exact number changed as the repository evolved, so these should be
treated as historical milestones rather than a permanent count.

## 3.20 Repository state

The repository evolved from an earlier state with:

``` text
Initial commit
```

to a more mature repository with:

-   multiple commits
-   documentation
-   tests
-   registered datasets
-   research protocols
-   reproducibility materials

A later audit recorded:

``` text
18 commits
80 tests passing
clean working tree
```

## 3.21 PhD/research importance

Trading Lab is one of the most strategically important projects because
it is intended to support:

-   research publication
-   PhD applications
-   quantitative-finance expertise
-   future quant business development

The project should prioritize scientific validity over simply maximizing
backtest returns.

------------------------------------------------------------------------

# 4. Orbyatravel

## 4.1 One-line description

**Orbyatravel is a travel-related web project hosted on Hostinger.**

## 4.2 Infrastructure

The project is hosted on:

``` text
Hostinger
```

The infrastructure context includes:

-   VPS hosting
-   Docker
-   web application deployment

## 4.3 Important architectural requirement

Orbyatravel and ResQNet must remain independent.

The ResQNet deployment must not accidentally reuse Orbyatravel
resources.

Avoid unintended sharing of:

-   Docker containers
-   networks
-   databases
-   ports
-   environment variables
-   code
-   deployment workflows

## 4.4 Role in portfolio

Orbyatravel demonstrates practical experience with:

-   web deployment
-   VPS infrastructure
-   production hosting
-   Docker-based deployment
-   domain-based services

------------------------------------------------------------------------

# 5. Pancreatic Tumor CT Classification

## 5.1 One-line description

**A medical-imaging research project focused on pancreatic tumor
classification from CT images using deep-learning/computer-vision
methods.**

## 5.2 Research theme

The project addresses:

``` text
Pancreatic tumor classification using CT images
```

The work has focused on data integrity and model reliability.

## 5.3 Research title

A poster/research artifact was developed under the title:

> **DATA INTEGRITY AUDIT FRAMEWORK FOR PANCREATIC TUMOR CLASSIFICATION
> USING CT IMAGES**

## 5.4 Main concern

The project emphasizes that medical-AI performance depends not only on
model architecture but also on:

-   data quality
-   dataset integrity
-   preprocessing
-   labels
-   leakage prevention
-   reproducibility
-   evaluation methodology

## 5.5 Relevance

This project connects:

-   computer vision
-   medical imaging
-   deep learning
-   research methodology
-   data auditing

It can be positioned as research experience for graduate-school
applications.

------------------------------------------------------------------------

# 6. EEG-based Detection Research

## 6.1 One-line description

**A summer research internship project at NIT Rourkela focused on
real-time EEG-based detection of depression, ADHD, and anxiety using
wearable sensors and deep learning.**

## 6.2 Internship

Institution:

``` text
National Institute of Technology, Rourkela
```

Role:

``` text
Summer Research Intern
```

Period:

``` text
May 2025 – June 2025
```

## 6.3 Research goal

The project explored whether EEG signals from wearable sensors could be
processed in real time to identify patterns associated with:

-   depression
-   ADHD
-   anxiety

## 6.4 Technology

Tools and libraries included:

-   MNE-Python
-   NumPy
-   SciPy
-   CNN architectures
-   RNN architectures

## 6.5 Pipeline concept

A simplified pipeline is:

``` text
Wearable EEG
     |
     v
Signal acquisition
     |
     v
Preprocessing
     |
     v
Feature / signal representation
     |
     v
Deep-learning model
     |
     v
Classification
```

## 6.6 Research value

The project demonstrates experience in:

-   biomedical signal processing
-   time-series data
-   deep learning
-   CNNs
-   RNNs
-   Python scientific computing
-   research experimentation

------------------------------------------------------------------------





# 11. Trading Lab Research Paper / ORB v1

This is a sub-project of Trading Lab but is important enough to track
separately.

## 11.1 Research question

The broad question is whether an Opening Range Breakout strategy
provides statistically meaningful and economically relevant performance
in the Indian market under realistic trading constraints.

## 11.2 Research requirements

The research should account for:

-   transaction costs
-   broker constraints
-   market microstructure
-   closing-auction changes
-   data quality
-   look-ahead bias
-   multiple testing
-   out-of-sample evaluation

## 11.3 Research stages

Recorded state:

``` text
Stage 1: research/protocol development
Stage 2: not started
ORB v1: DRAFT
```

## 11.4 Holdout

The holdout boundary was:

``` text
2026-10-01
```

This should remain protected from strategy tuning.

------------------------------------------------------------------------

# 12. Research Infrastructure / Experiment Framework

Several conversations refer not to one model but to a broader reusable
research infrastructure.

## 12.1 Purpose

Create a system that can:

-   register datasets
-   track experiments
-   store configurations
-   run backtests
-   compare strategies
-   validate statistical results
-   maintain research logs
-   preserve reproducibility

## 12.2 Key concepts

### Data Registry

Tracks:

-   data source
-   retrieval date
-   checksum
-   timezone
-   price basis
-   licence

### Experiment Registry

Tracks:

-   hypothesis
-   configuration
-   dataset
-   model/strategy
-   result
-   validation state

### Research Log

Records:

-   experiment
-   result
-   interpretation
-   decision
-   next action

### Reproducibility

The project emphasizes the ability to reproduce research results rather
than relying on undocumented manual experiments.

------------------------------------------------------------------------

# 13. ResQNet Pitch / Startup Documentation

ResQNet has also been treated as a pitch/startup project separate from
its software implementation.

## 13.1 Startup narrative

### Problem

Disaster victims can lose access to normal communication infrastructure.

### Solution

A smartphone-based offline emergency communication network.

### Differentiation

The project combines:

-   peer-to-peer communication
-   emergency alerts
-   location sharing
-   AI detection
-   rescue coordination

### Social impact

Potential users include:

-   disaster victims
-   rescue teams
-   communities
-   NGOs
-   emergency responders

### Future scale

Potential extensions include:

-   disaster-response organizations
-   government agencies
-   emergency services
-   humanitarian organizations

------------------------------------------------------------------------


# 15. Development Environment Used Across Projects

## Hardware

The development/research environment has included:

-   MacBook Pro M1
-   Mac mini M4
-   Mac mini M4-class machines
-   iPad Air 5th generation

## Software

Common tools include:

-   VS Code
-   Jupyter Lab
-   Git
-   GitHub
-   Docker
-   Docker Compose
-   Flutter
-   Firebase CLI
-   Python
-   C/C++
-   Java
-   JavaScript
-   TypeScript
-   Rust

## AI/ML frameworks

-   PyTorch
-   TensorFlow
-   MNE-Python
-   NumPy
-   SciPy

## Backend

-   Node.js
-   Express
-   FastAPI
-   PostgreSQL

## Infrastructure

-   Hostinger VPS
-   Docker
-   Nginx
-   MinIO
-   PostgreSQL

------------------------------------------------------------------------

# 16. Project Relationship Map

The projects can be grouped into four major tracks.

## Track A --- Startup / Product Engineering

``` text
ResQNet
   |
   +--> Mobile application
   +--> Backend
   +--> Offline networking
   +--> AI emergency detection
   +--> Rescue coordination
   +--> Startup / pitch
```

``` text
Orbyatravel
   |
   +--> Travel web platform
   +--> Production hosting
   +--> VPS / Docker
```

``` text
Nepal Property Website
   |
   +--> Real-estate marketplace
   +--> Nepal-focused product idea
```

## Track B --- Quantitative Finance

``` text
Trading Lab
   |
   +--> Data Engineering
   +--> ORB v1
   +--> Backtesting
   +--> Statistical Testing
   +--> ML experiments
   +--> Paper Trading
   +--> Research Paper
   +--> PhD preparation
   +--> Future Quant Business
```

## Track C --- AI / Research

``` text
Pancreatic CT Classification
   |
   +--> Medical imaging
   +--> Data integrity
   +--> Deep learning
```

``` text
EEG Research
   |
   +--> Wearable EEG
   +--> Signal processing
   +--> CNN
   +--> RNN
```

``` text
Vision Research
   |
   +--> MobileViT
   +--> ResNet-50
   +--> Swin Transformer
   +--> CNN
```

## Track D --- Long-term AI

``` text
Privacy-first Personal AI
   |
   +--> Local data
   +--> Local memory
   +--> Local models
   +--> Privacy
   +--> Local training
```

------------------------------------------------------------------------

# 17. Portfolio Positioning

## Strongest engineering project

### ResQNet

Best demonstrates:

-   full-stack development
-   mobile development
-   backend engineering
-   databases
-   Docker
-   deployment
-   distributed/offline communication
-   AI
-   product thinking

## Strongest research project

### Trading Lab

Best demonstrates:

-   quantitative research
-   data engineering
-   statistical methodology
-   experimental design
-   reproducibility
-   financial-market understanding
-   research discipline

## Strongest medical-AI research

### Pancreatic Tumor CT Classification

Best demonstrates:

-   computer vision
-   medical imaging
-   data integrity
-   deep learning
-   research methodology

## Strongest internship research

### EEG-based Detection Research

Best demonstrates:

-   research internship
-   biomedical signal processing
-   wearable sensors
-   deep learning
-   CNN/RNN

## Strongest architecture/model-comparison work

### MobileViT / ResNet-50 / Swin Transformer

Best demonstrates:

-   modern computer vision
-   deep-learning experimentation
-   architecture comparison
-   model training

------------------------------------------------------------------------

# 18. Project Status Matrix

  -----------------------------------------------------------------------------------------------
  Project                        Research      Production         Startup Current priority
                                                                potential 
  ----------------------- --------------- --------------- --------------- -----------------------
  ResQNet                            High            High            High High

  Trading Lab                   Very High          Medium            High Very High

  Orbyatravel                         Low            High          Medium Medium

  Pancreatic CT                 Very High             Low          Medium High for research

  EEG Research                  Very High             Low          Medium High for academic
                                                                          profile

  MobileViT/ResNet/Swin              High             Low          Medium Medium

  Nepal Property Website              Low             Low            High Low/Idea

  Privacy-first Personal        Very High             Low       Very High Long-term
  AI                                                                      

  Samsung Solve for                Medium             Low            High Competition-dependent
  Tomorrow                                                                
  -----------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 19. Recommended Master Portfolio Structure

For future CV, GitHub, PhD applications, and interviews, the portfolio
can be organized as:

## Tier 1 --- Flagship Projects

1.  **Trading Lab --- Quantitative Finance Research Platform**
2.  **ResQNet --- Offline Emergency Communication Platform**

## Tier 2 --- Research Projects

3.  **Pancreatic Tumor CT Classification**
4.  **EEG-based Detection Research**
5.  **MobileViT / ResNet-50 / Swin Transformer Experiments**

## Tier 3 --- Product/Web Projects

6.  **Orbyatravel**
7.  **Nepal Property Platform**

## Tier 4 --- Future Research/Product Concepts

8.  **Privacy-first Personal AI**
9.  **Samsung Solve for Tomorrow / innovation concepts**

------------------------------------------------------------------------

# 20. Important Accuracy Notes

This document intentionally distinguishes between:

-   completed projects
-   active projects
-   research experiments
-   startup ideas
-   competition concepts
-   coursework

Not every idea mentioned in conversation has a production repository.

In particular:

-   **ResQNet** is an active, substantial engineering/product project.
-   **Trading Lab** is an active research project and should not be
    described as having a proven profitable trading strategy.
-   **ORB v1 remains a draft research protocol/state in the recorded
    history.**
-   **Pancreatic CT classification** is research-oriented.
-   **EEG research** was an internship project.
-   **MobileViT/ResNet/Swin work** represents model
    experimentation/research.
-   **Nepal property platform** is an idea rather than a completed
    production system.
-   **Privacy-first Personal AI** is a long-term research/product
    concept.
-   **Samsung Solve for Tomorrow** represents innovation/pitch work,
    closely associated with the social-impact direction of ResQNet.

------------------------------------------------------------------------

# 21. Master Project Summary

``` text
AADITYA ADHIKARI — PROJECT PORTFOLIO

ENGINEERING / PRODUCT
├── ResQNet
│   ├── Flutter
│   ├── Node.js / Express / TypeScript
│   ├── PostgreSQL
│   ├── Docker / Hostinger
│   ├── Offline Bluetooth / Wi-Fi Direct
│   ├── AI emergency detection
│   └── Emergency communication
│
├── Orbyatravel
│   ├── Travel platform
│   ├── Web engineering
│   └── Hostinger deployment
│
└── Nepal Property Platform
    └── Nepal-focused real-estate marketplace idea

QUANT / RESEARCH
└── Trading Lab
    ├── Data engineering
    ├── ORB research
    ├── Backtesting
    ├── Statistical testing
    ├── Market microstructure
    ├── Paper trading
    ├── ML experiments
    └── PhD/publication direction

AI / COMPUTER VISION
├── Pancreatic Tumor CT Classification
├── EEG-based Detection Research
└── MobileViT / ResNet-50 / Swin Transformer

FUTURE AI
└── Privacy-first Personal AI

INNOVATION / PITCH
└── Samsung Solve for Tomorrow concepts
```

------------------------------------------------------------------------

# 22. Final Strategic View

The projects form a coherent profile rather than a random collection.

The strongest overall narrative is:

> **Software engineer and researcher building practical AI systems, with
> experience spanning distributed emergency communication, quantitative
> finance, medical AI, deep learning, and privacy-first AI.**

The two flagship directions are:

### ResQNet

A practical engineering/startup path combining:

``` text
Mobile + Backend + Distributed Systems + AI + Social Impact
```

### Trading Lab

A research/PhD path combining:

``` text
Data Engineering + Quantitative Finance + Statistics + ML + Reproducibility
```

The medical-AI and computer-vision projects strengthen the research
profile, while Orbyatravel and the property-platform idea demonstrate
broader product-building interests.

The long-term portfolio can therefore be understood as three connected
ambitions:

``` text
                AI / SOFTWARE
                     |
          +----------+----------+
          |                     |
       PRODUCTS              RESEARCH
          |                     |
      ResQNet              Trading Lab
      Orbyatravel          Medical AI
      Property             Computer Vision
          |                     |
          +----------+----------+
                     |
              FUTURE AI SYSTEMS
                     |
             Privacy-first AI
```

This structure should be used as the baseline when preparing future CVs,
GitHub documentation, research statements, PhD applications, startup
pitches, or technical interviews.
