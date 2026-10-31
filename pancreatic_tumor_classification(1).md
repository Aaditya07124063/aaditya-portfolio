# Multi-Backbone Deep Feature Extraction and Hybrid Machine Learning Benchmark for Radiographic Pancreatic Tumor Classification

> **Document type:** Senior-level project architecture and engineering documentation  
> **Primary source:** `RESEARCH_REPORT_IEEE_FORMAT.docx` supplied with this project  
> **Scope:** Architecture, methodology, data integrity, leakage prevention, model design, evaluation, reproducibility, engineering rationale, results, limitations, and future extension  
> **Evidence policy:** Facts explicitly reported by the research document are stated as facts. Engineering explanations marked **Engineering rationale** explain why the reported design is sensible. Details not present in the source are explicitly identified as implementation assumptions or open items rather than invented facts.

---

## 1. Executive Summary

This project is an empirical medical-imaging machine-learning benchmark for **pancreatic tumor classification from CT/radiographic image slices**, with a particular emphasis on **generalization to completely unseen patients** and on preventing the extremely common failure mode of **slice-level data leakage**.

The core idea is intentionally modular:

```text
CT image slice / patch
        |
        v
+-----------------------------+
| Deep feature extractor      |
|                             |
| ResNet-50                   |
| InceptionV3                 |
| MobileViT                   |
| Swin Transformer            |
+-----------------------------+
        |
        v
High-dimensional feature
embedding f ∈ R^d
        |
        v
+-----------------------------+
| Downstream classifier       |
|                             |
| SVM                         |
| Random Forest               |
| KNN                         |
| XGBoost                     |
| AdaBoost                    |
| Bagging                     |
| ANN                         |
| LSTM                        |
| Bi-LSTM                     |
+-----------------------------+
        |
        v
Normal / Pancreatic Tumor
classification
        |
        v
Patient-group out-of-patient
evaluation
```

The research evaluates:

- **4 feature-extraction backbones**
- **9 downstream classification heads**
- **36 total hybrid pipelines**
- **5 random seeds:** 5, 10, 15, 20, 25
- **2 evaluation regimes:**
  1. slice-level stratified random splitting
  2. strict patient-group stratified splitting

The most important methodological finding is that the apparently excellent **99.91% system-wide mean accuracy** under random slice splitting is misleading because slices belonging to the same patient can be highly correlated. When evaluation is performed on completely unseen patients, the system-wide mean accuracy falls to **79.05%**.

The strongest out-of-patient pipeline reported is:

**ResNet-50 + KNN**

with:

- Test accuracy: **98.60% ± 1.30%**
- F1-score: **98.63% ± 1.27%**
- Cohen's Kappa: **94.58%**

The second strongest reported configuration is:

**Swin Transformer + KNN**

with:

- Test accuracy: **98.37% ± 1.30%**
- F1-score: **98.42% ± 1.24%**
- Cohen's Kappa: **93.74%**

The central engineering lesson is therefore not simply "use the highest-accuracy model." It is:

> **In medical imaging, the evaluation boundary is part of the model. A model can appear nearly perfect if the split allows correlated samples from the same patient to cross train/test boundaries.**

---

# 2. Project Identity

## 2.1 Project title

**Multi-Backbone Deep Feature Extraction and Hybrid Machine Learning Benchmarks for Radiographic Pancreatic Tumor Classification**

## 2.2 Domain

Medical imaging / computer-aided diagnosis / deep learning / machine learning benchmarking.

## 2.3 Clinical problem

The project focuses on pancreatic tumor classification, particularly the challenge of identifying malignant pancreatic abnormalities in CT imagery.

The research document identifies pancreatic ductal adenocarcinoma (PDAC) as a highly lethal malignancy and highlights the difficulty of early detection because tumors can exhibit:

- subtle density variations,
- ill-defined parenchymal margins,
- anatomical overlap with healthy abdominal structures.

Manual slice-by-slice inspection is also described as:

- labor-intensive,
- vulnerable to inter-observer and intra-observer variability,
- susceptible to reader fatigue.

The project therefore investigates whether learned image representations can support automated classification.

---

# 3. Problem Statement

The project addresses two distinct problems.

## 3.1 Machine-learning problem

Given a CT image slice or slice patch:

```text
I ∈ R^(H × W × C)
```

the system should produce a learned feature representation:

```text
f = φ(I; Θ)
```

where:

- `I` is the input image,
- `φ` is a pretrained feature-extraction backbone,
- `Θ` represents the backbone parameters,
- `f` is the resulting feature embedding.

The embedding is then passed to a downstream classifier that predicts the class.

Conceptually:

```text
I
↓
Feature extractor φ
↓
f ∈ R^d
↓
Classifier h
↓
ŷ
```

where `ŷ` is the predicted class.

## 3.2 Experimental-methodology problem

The more important problem is avoiding **patient-specific leakage**.

A CT volume contains many neighboring slices from the same patient. These slices are not independent observations in the statistical sense.

A naive split can therefore produce:

```text
Patient A
 ├── Slice 1 ──> Train
 ├── Slice 2 ──> Train
 ├── Slice 3 ──> Test
 ├── Slice 4 ──> Validation
 └── Slice 5 ──> Train
```

The model can then exploit patient-specific anatomical characteristics.

The desired split is instead:

```text
Patient A ──> Training only
Patient B ──> Validation only
Patient C ──> Test only
```

This establishes a much more meaningful out-of-patient evaluation boundary.

---

# 4. Why This Project Uses a Hybrid Architecture

The architecture separates:

1. **representation learning**
2. **classification**

rather than treating the entire system as one monolithic end-to-end network.

## 4.1 Representation layer

The backbone answers:

> "What visual information is present in this CT image?"

The four backbones provide different inductive biases:

| Backbone | Family | Input | Feature dimension | Primary strength |
|---|---|---:|---:|---|
| ResNet-50 | CNN | 224×224×3 | 2048 | Local spatial texture and stable hierarchical features |
| InceptionV3 | CNN | 299×299×3 | 2048 | Multi-scale convolution |
| MobileViT | CNN + Transformer | 256×256×3 | 640 | Compact representation with local/global modeling |
| Swin Transformer | Vision Transformer | 224×224×3 | 768 | Hierarchical attention and long-range context |

## 4.2 Classification layer

The classifier answers:

> "Given this representation, which diagnostic class does this sample belong to?"

The project tests nine alternatives:

1. SVM
2. Random Forest
3. KNN
4. XGBoost
5. AdaBoost
6. Bagging
7. ANN
8. LSTM
9. Bi-LSTM

This gives:

```text
4 backbones × 9 heads = 36 hybrid pipelines
```

## 4.3 Why decoupling is valuable

**Engineering rationale:** Separating feature extraction from classification makes the benchmark easier to reason about.

If the architecture were a single monolithic model, a poor result would make it difficult to determine whether the problem came from:

- the visual representation,
- the classifier,
- optimization,
- regularization,
- or the interaction between them.

With a hybrid design, the experiment can ask:

> "For the same ResNet-50 representation, which classifier behaves best?"

and:

> "For the same KNN classifier, which representation is most useful?"

This creates a controlled experimental matrix.

---

# 5. System Architecture

## 5.1 High-level architecture

```text
                 +----------------------+
                 | CT Dataset           |
                 | Normal / Tumor       |
                 +----------+-----------+
                            |
                            v
                 +----------------------+
                 | Data Loader          |
                 | + Patient IDs        |
                 | + Slice metadata     |
                 +----------+-----------+
                            |
                            v
                 +----------------------+
                 | Data Integrity Layer |
                 | MD5 Deduplication    |
                 +----------+-----------+
                            |
                            v
                 +----------------------+
                 | Patient-Group Split  |
                 | Train / Validation   |
                 | Test                 |
                 +----------+-----------+
                            |
                            v
        +---------------------------------------------+
        |             Feature Extraction              |
        |                                             |
        | ResNet-50 | InceptionV3 | MobileViT | Swin |
        +----------------------+----------------------+
                               |
                               v
                      Feature Embeddings
                               |
                               v
        +---------------------------------------------+
        |              Classification                 |
        |                                             |
        | SVM RF KNN XGB AdaBoost Bagging ANN LSTM  |
        | Bi-LSTM                                     |
        +----------------------+----------------------+
                               |
                               v
                    Predictions / Metrics
                               |
                               v
             +--------------------------------+
             | Multi-seed Benchmarking         |
             | Seeds: 5,10,15,20,25            |
             +--------------------------------+
                               |
                               v
                  Results + Comparison
```

---

# 6. Data Layer

## 6.1 Data loading responsibility

According to the research document, `data_loader.py` is responsible for:

- data loading,
- hash auditing,
- slice/group stratification logic.

This makes the data loader more than a simple file reader.

It is effectively the **data-integrity boundary** of the system.

## 6.2 Why data integrity belongs near ingestion

**Engineering rationale:** If corrupted, duplicated, or incorrectly grouped data enters the experiment, every downstream result becomes questionable.

The correct order is therefore:

```text
Raw data
↓
Audit
↓
Deduplication
↓
Patient identification
↓
Patient-group split
↓
Modeling
```

rather than:

```text
Raw data
↓
Model training
↓
Discover leakage later
```

The latter approach risks wasting compute and producing misleading conclusions.

---

# 7. MD5 Deduplication

## 7.1 Problem

The research reports that duplicated image files existed concurrently across training and evaluation directories.

This is dangerous because an identical image can effectively appear in multiple partitions.

## 7.2 Solution

An automated MD5 byte-stream hash verification process was used.

For images `I_A` and `I_B`:

```text
MD5(I_A) = MD5(I_B)
        ↓
Exact byte-level duplicate
        ↓
Purge duplicate copy
```

The audit identified and removed:

**206 exact duplicate image instances.**

## 7.3 Why hashing is appropriate

An MD5 hash converts a file's byte stream into a compact fingerprint.

For exact duplicates:

```text
same bytes
   ↓
same MD5
```

This is useful because the objective is to detect **exact file duplication**, not semantic similarity.

## 7.4 What MD5 does not solve

MD5 deduplication does **not** solve:

- resized duplicates,
- recompressed duplicates,
- slightly modified copies,
- augmented versions,
- near-identical slices,
- slices from the same patient that are not byte-identical.

That is why MD5 deduplication must be combined with **patient-group stratification**.

This distinction is architecturally important:

```text
MD5 deduplication
    solves
exact file duplication

Patient grouping
    solves
patient-level correlation leakage
```

They address different threat models.

---

# 8. Patient-Group Stratification

## 8.1 Core rule

The research explicitly states that CT slices are partitioned using **Patient Identification Numbers**.

All slices from a patient must remain in one logical partition.

The reported test patients include:

### Normal patients

- Patient 1
- Patient 23

### Tumor patients

- Patient 1
- Patient 22
- Patient 66

The source uses the same numeric identifiers under different class labels, so these should be interpreted exactly as reported rather than assumed to be globally unique identifiers.

## 8.2 Why patient-level grouping matters

Neighboring CT slices often contain almost the same anatomy.

Suppose:

```text
Slice A = pancreas + surrounding tissue
Slice B = almost identical anatomical region
Slice C = adjacent anatomical region
```

A random slice split may put A in training and B in testing.

The model then receives test data that is extremely similar to training data.

This inflates apparent generalization.

Patient-group splitting instead creates:

```text
Training patients
       |
       | no patient overlap
       v
Test patients
```

The test set therefore approximates the real question:

> "Can the system classify a patient it has never seen before?"

---

# 9. Evaluation Protocols

The project deliberately evaluates two different splitting strategies.

## 9.1 Benchmark 1 — Slice-level stratified random split

The reported standard split is:

```text
80% Train
10% Validation
10% Test
```

At slice level, this generated a system-wide mean accuracy of:

**99.91%**

The research identifies this as inflated because of inter-slice correlation leakage.

This benchmark is useful as a demonstration of the problem, not as the preferred estimate of clinical generalization.

## 9.2 Benchmark 2 — Patient-group stratified split

The preferred evaluation uses completely unseen patient CT scans.

System-wide mean accuracy:

**79.05%**

This is a dramatic reduction from the naive result.

## 9.3 Performance shift

```text
Naive slice split:
99.91%

Patient-group split:
79.05%

Absolute shift:
20.86 percentage points
```

The research identifies this **20.86 percentage-point performance shift** as evidence of the danger of slice-level evaluation.

---

# 10. Feature Extraction Backbones

## 10.1 ResNet-50

### Architecture

ResNet-50 is a deep residual convolutional neural network.

The research emphasizes identity shortcut connections that help avoid vanishing-gradient problems.

### Input

```text
224 × 224 × 3
```

### Feature vector

```text
d = 2048
```

The reported extraction uses Global Max Pooling.

### Engineering rationale

ResNet is attractive for radiographic imagery because convolution provides a strong local spatial inductive bias.

This is especially relevant when the classification signal depends on:

- texture,
- boundaries,
- local density patterns,
- spatially localized abnormalities.

The study ultimately finds ResNet-50 to be the most stable backbone in the evaluated benchmark, particularly with KNN.

---

# 11. InceptionV3

## 11.1 Architecture

InceptionV3 is described as a factorized multi-scale convolutional network.

Its design evaluates information at multiple spatial scales.

### Input

```text
299 × 299 × 3
```

### Feature vector

```text
d = 2048
```

### Engineering rationale

Pancreatic abnormalities may manifest at different spatial scales.

A multi-scale representation can therefore be useful when discriminative information is not concentrated at one fixed receptive-field size.

However, the benchmark shows that the strongest InceptionV3 configurations do not match ResNet-50 + KNN under the strict patient-group evaluation.

---

# 12. MobileViT

## 12.1 Architecture

MobileViT combines:

- local CNN convolution,
- global Transformer self-attention.

### Input

```text
256 × 256 × 3
```

### Feature vector

```text
d = 640
```

## 12.2 Why this architecture is important

The project specifically highlights MobileViT's compact feature dimension.

Compared with 2048-dimensional representations:

```text
MobileViT: 640
ResNet-50: 2048
InceptionV3: 2048
Swin: 768
```

A smaller representation can reduce downstream memory and computation requirements.

The research notes its potential suitability for resource-constrained clinical hardware.

---

# 13. Swin Transformer

## 13.1 Architecture

Swin Transformer is a hierarchical Vision Transformer using **shifted-window self-attention**.

### Input

```text
224 × 224 × 3
```

### Feature vector

```text
d = 768
```

## 13.2 Attention mechanism

The project describes query, key, and value projections:

```text
Q = F₃ W_Q
K = F₃ W_K
V = F₃ W_V
```

and shifted-window attention:

```text
Attention(Q,K,V)
=
Softmax(
    (QKᵀ / √d_k) + B
) V
```

where:

- `Q` = query representation,
- `K` = key representation,
- `V` = value representation,
- `d_k` = key dimensionality,
- `B` = relative positional bias term.

## 13.3 Engineering rationale

CNNs naturally emphasize local spatial structure.

Transformer-based models can capture longer-range contextual relationships.

This makes Swin useful for testing a fundamentally different representation-learning paradigm against CNNs.

The benchmark shows that Swin + KNN is nearly as strong as ResNet-50 + KNN.

---

# 14. Downstream Classification Heads

The feature extractors are paired with nine classifiers.

## 14.1 SVM

The study uses an RBF-kernel SVM.

Kernel:

```text
K(x_i, x_j)
=
exp(-γ ||x_i - x_j||²)
```

The RBF kernel allows nonlinear decision boundaries in the original feature space.

### Why test SVM?

Deep embeddings can already provide useful structure, and SVMs can exploit that structure without requiring another large neural network.

---

# 15. Random Forest

Random Forest is a nonlinear ensemble of decision trees.

The paper describes tree-based evaluation using impurity-based decisions.

### Why test it?

Random Forest provides a classical nonlinear baseline against which neural and distance-based heads can be compared.

---

# 16. K-Nearest Neighbors

KNN is a non-parametric, distance-based classifier.

The Euclidean distance is:

```text
d(x, x_i)
=
√(
    Σ_m (x_m - x_{i,m})²
)
```

The classifier assigns a label based on nearby training samples in feature space.

## 16.1 Why KNN became the key result

The strongest configurations are:

```text
ResNet-50 → KNN
Swin → KNN
```

The research argues that deep representations create well-separated feature manifolds.

KNN does not need to learn a complex parametric decision surface.

Instead, it directly uses geometry:

```text
Raw image
   ↓
Deep embedding
   ↓
Clustered feature manifold
   ↓
Nearest-neighbor decision
```

The important scientific hypothesis is:

> The pretrained representation may already organize clinically relevant patterns sufficiently well that a simple distance-based decision rule generalizes better than more parameter-heavy heads.

---

# 17. XGBoost

XGBoost is included as a gradient-boosted tree classifier.

Its purpose in the benchmark is to test whether boosted nonlinear decision structures can outperform simpler or neural classification heads on fixed deep embeddings.

---

# 18. AdaBoost

AdaBoost is another ensemble approach that combines weak learners into a stronger classifier.

It provides another classical ensemble point in the benchmark.

---

# 19. Bagging

Bagging combines predictions from multiple models trained using resampled subsets.

It is included to test ensemble variance reduction on the learned feature representations.

---

# 20. ANN

The ANN is described as a dense feed-forward multilayer perceptron using:

- dense layers,
- ReLU activations,
- dropout regularization.

### Why test ANN?

An ANN provides a neural nonlinear classifier directly on top of the frozen/extracted deep representation.

This makes it a natural comparison against classical classifiers.

---

# 21. LSTM

The LSTM head treats feature-vector subcomponents as a sequential structure.

This is an unusual but experimentally interesting design because a flattened embedding is not inherently a temporal sequence.

The source explicitly describes recurrent heads as treating feature-vector sub-vectors as temporal sequences to model contextual correlations.

### Important engineering caveat

The source establishes that this representation was used, but it does **not** provide enough implementation detail to determine whether the sequence ordering has a clinically meaningful interpretation.

Therefore, any claim that LSTM captures genuine anatomical temporal structure would go beyond the supplied evidence.

---

# 22. Bi-LSTM

Bi-LSTM extends the recurrent approach in both directions.

It is intended to capture contextual dependencies from both directions through the constructed feature sequence.

Again, the benchmark establishes the architecture as an experimental classifier head, but the source does not provide enough code-level detail to prove that the sequence ordering corresponds to a natural anatomical sequence.

---

# 23. The 36-Pipeline Benchmark Matrix

The full benchmark is:

```text
4 feature extractors
×
9 classification heads
=
36 hybrid pipelines
```

### Feature extractors

```text
R = ResNet-50
I = InceptionV3
M = MobileViT
S = Swin Transformer
```

### Heads

```text
SVM
RF
KNN
XGBoost
AdaBoost
Bagging
ANN
LSTM
Bi-LSTM
```

Therefore the experimental space is:

```text
R × {9 heads}
I × {9 heads}
M × {9 heads}
S × {9 heads}
```

This is preferable to evaluating only one "favorite" model because it exposes interaction effects between representation and classifier.

---

# 24. Reproducibility Through Multi-Seed Evaluation

The benchmark uses five random seeds:

```text
5
10
15
20
25
```

Metrics are reported as:

```text
Mean ± Standard Deviation
```

for:

- Accuracy
- F1-score
- Precision
- Recall
- Cohen's Kappa

## Why multiple seeds matter

A single run can be unusually lucky or unlucky.

For example:

```text
Run 1: 99.4%
Run 2: 98.2%
Run 3: 97.8%
```

would communicate a very different level of confidence than:

```text
98.5% ± 0.3%
```

The standard deviation therefore acts as an indicator of run-to-run stability.

---

# 25. Repository Architecture

The research document explicitly describes four key repository files.

```text
project/
│
├── data_loader.py
├── hybrid_pipeline.py
├── run_multi_seed.py
└── check_and_fix_leakage.py
```

## 25.1 `data_loader.py`

Responsibilities reported by the research:

- data loading,
- hash auditing,
- slice/group stratification.

Conceptual responsibility:

```text
filesystem
   ↓
data_loader.py
   ↓
validated samples
   ↓
patient-aware partitions
```

### Architectural importance

This module defines the boundary between raw data and experimental data.

---

# 26. `hybrid_pipeline.py`

Responsibilities reported:

- multi-backbone feature extraction,
- CNN support,
- Transformer support,
- downstream hybrid classification.

Conceptually:

```text
image
 ↓
selected backbone
 ↓
embedding
 ↓
selected classifier
 ↓
prediction
```

The modularity allows combinations such as:

```text
ResNet-50 + KNN
ResNet-50 + SVM
Swin + KNN
MobileViT + Bagging
...
```

without redesigning the entire experiment for each model.

---

# 27. `run_multi_seed.py`

This is the benchmark orchestration layer.

It iterates across:

```text
Seeds:
5
10
15
20
25
```

and enables multi-seed evaluation.

Conceptually:

```python
for seed in [5, 10, 15, 20, 25]:
    run_all_model_combinations(seed)
    collect_metrics()
aggregate_results()
```

The exact source code is not included in the supplied report, so the pseudocode above describes the reported responsibility rather than claiming the exact implementation.

---

# 28. `check_and_fix_leakage.py`

This is the dedicated data-integrity audit utility.

Reported responsibility:

> Detect duplicate image instances using content hashing.

Its architectural role is important because leakage checking is treated as a **first-class operation**, not an informal manual step.

Conceptually:

```text
dataset
 ↓
hash every image
 ↓
group identical hashes
 ↓
identify duplicates
 ↓
remove duplicate copies
 ↓
validated dataset
```

The audit found:

**206 exact duplicates.**

---

# 29. Recommended End-to-End Execution Lifecycle

The research supports the following conceptual execution order.

## Phase 1 — Dataset audit

```text
Raw dataset
↓
Hash audit
↓
Duplicate removal
```

## Phase 2 — Patient metadata validation

```text
Images
↓
Patient IDs
↓
Group-level organization
```

## Phase 3 — Patient-aware split

```text
Patients
↓
Train / Validation / Test groups
```

No patient should cross the evaluation boundary.

## Phase 4 — Feature extraction

For each backbone:

```text
image
↓
pretrained backbone
↓
embedding
```

## Phase 5 — Downstream classification

For each embedding:

```text
embedding
↓
SVM / RF / KNN / XGBoost / AdaBoost /
Bagging / ANN / LSTM / Bi-LSTM
↓
prediction
```

## Phase 6 — Multi-seed benchmark

Run:

```text
seed = 5
seed = 10
seed = 15
seed = 20
seed = 25
```

## Phase 7 — Statistical aggregation

Calculate:

```text
mean
standard deviation
```

for the reported evaluation metrics.

## Phase 8 — Comparative analysis

Compare:

- backbone effects,
- classifier effects,
- backbone-head interactions,
- split strategy effects,
- stability across seeds.

---

# 30. Experimental Results

## 30.1 Benchmark 1: Slice-level random split

System-wide mean accuracy:

**99.91%**

Several configurations reached effectively perfect scores.

Reported examples include:

| Backbone | Head | Train Accuracy | Test Accuracy | F1 | Kappa |
|---|---|---:|---:|---:|---:|
| InceptionV3 | ANN | 99.81 ± 0.22 | 100.00 ± 0.00 | 100.00 ± 0.00 | 100.00 |
| InceptionV3 | Bi-LSTM | 100.00 ± 0.00 | 100.00 ± 0.00 | 100.00 ± 0.00 | 100.00 |
| ResNet-50 | SVM | 100.00 ± 0.00 | 100.00 ± 0.00 | 100.00 ± 0.00 | 100.00 |
| ResNet-50 | RF | 100.00 ± 0.00 | 100.00 ± 0.00 | 100.00 ± 0.00 | 100.00 |
| MobileViT | KNN | 100.00 ± 0.00 | 100.00 ± 0.00 | 100.00 ± 0.00 | 100.00 |
| Swin | KNN | 100.00 ± 0.00 | 100.00 ± 0.00 | 100.00 ± 0.00 | 100.00 |

### Interpretation

These results should **not** be interpreted as evidence that the system is clinically perfect.

The study itself attributes the near-perfect performance to inter-slice correlation leakage.

---

# 31. Benchmark 2: Patient-Group Stratified Split

The patient-group benchmark is the meaningful generalization experiment.

The reported system-wide mean accuracy is:

**79.05%**

However, several individual hybrid configurations perform much better than this aggregate.

## 31.1 Top configurations

| Rank | Backbone | Head | Test Accuracy | F1 | Kappa |
|---:|---|---|---:|---:|---:|
| 1 | ResNet-50 | KNN | **98.60 ± 1.30** | **98.63 ± 1.27** | **94.58** |
| 2 | Swin | KNN | **98.37 ± 1.30** | **98.42 ± 1.24** | **93.74** |
| 3 | Swin | Bi-LSTM | 97.47 ± 3.66 | 97.75 ± 3.19 | 89.61 |
| 4 | ResNet-50 | ANN | 93.76 ± 9.55 | 94.27 ± 8.67 | 83.23 |
| 5 | MobileViT | Bagging | 91.47 ± 8.71 | 91.43 ± 8.55 | 72.36 |
| 6 | MobileViT | KNN | 91.20 ± 10.97 | 92.57 ± 9.08 | 76.61 |
| 7 | InceptionV3 | KNN | 90.40 ± 7.87 | 91.28 ± 6.74 | 73.33 |
| 8 | Swin | LSTM | 89.84 ± 15.34 | 91.73 ± 12.02 | 76.38 |
| 9 | MobileViT | LSTM | 89.61 ± 14.05 | 91.16 ± 12.18 | 74.46 |
| 10 | MobileViT | Bi-LSTM | 87.24 ± 12.36 | 88.98 ± 10.36 | 69.67 |
| 11 | MobileViT | SVM | 86.58 ± 18.40 | 88.77 ± 15.41 | 71.52 |
| 12 | ResNet-50 | AdaBoost | 84.74 ± 21.02 | 87.17 ± 17.57 | 70.03 |
| 13 | InceptionV3 | LSTM | 81.10 ± 26.48 | 83.69 ± 22.54 | 67.79 |
| 14 | InceptionV3 | ANN | 80.99 ± 33.77 | 79.03 ± 39.75 | 67.96 |

---

# 32. Why ResNet-50 + KNN Wins

The study's central scientific explanation is feature-manifold geometry.

The deep feature extractor maps the input into:

```text
R^d
```

The representation can organize images into clusters.

Conceptually:

```text
                 Feature space

      Tumor cluster
          ● ● ●
       ● ● ● ● ●
          ● ●

                         Normal cluster
                           ○ ○ ○
                        ○ ○ ○ ○
                           ○ ○
```

If the representation already separates the classes, KNN can classify a new point by asking:

> Which known feature vectors are closest?

This avoids fitting a complicated decision boundary.

The study argues that this may make KNN more resistant to patient-specific anatomical variation.

---

# 33. CNN vs Transformer Interpretation

## ResNet-50

The research attributes its success to local spatial inductive bias.

This is relevant for:

- fine-grained tissue texture,
- local density transitions,
- parenchymal boundaries.

## Swin Transformer

The study highlights shifted-window self-attention for modeling longer-range context.

It performs almost as well as ResNet-50 when paired with KNN.

The key comparison is:

```text
ResNet-50 + KNN = 98.60%
Swin + KNN      = 98.37%
```

The difference is only:

**0.23 percentage points.**

This indicates that both convolutional and transformer representations can produce highly useful embeddings under the reported patient-group benchmark.

---

# 34. Stability Analysis

ResNet-50 + KNN reports:

```text
98.60 ± 1.30%
```

Swin + KNN reports:

```text
98.37 ± 1.30%
```

The study describes ResNet-50 as demonstrating the highest overall stability.

By contrast, several weaker pipelines have much larger standard deviations.

Examples:

```text
InceptionV3 + ANN:
80.99 ± 33.77%

InceptionV3 + LSTM:
81.10 ± 26.48%

ResNet-50 + AdaBoost:
84.74 ± 21.02%
```

A senior engineering interpretation is that **mean performance alone is insufficient**.

A model with:

```text
95% ± 20%
```

is operationally less predictable than:

```text
94% ± 2%
```

even though the first mean may appear stronger.

---

# 35. Metrics

## 35.1 Accuracy

```text
Accuracy =
correct predictions / total predictions
```

Useful as a general measure, but can be misleading under class imbalance.

## 35.2 Precision

Precision asks:

> Of the samples predicted as positive, how many were actually positive?

```text
Precision = TP / (TP + FP)
```

## 35.3 Recall

Recall asks:

> Of the actual positive samples, how many did the system identify?

```text
Recall = TP / (TP + FN)
```

In a medical screening context, recall can be particularly important because false negatives can be costly.

## 35.4 F1-score

F1 balances precision and recall:

```text
F1 = 2 × Precision × Recall
     -------------------------
       Precision + Recall
```

## 35.5 Cohen's Kappa

Cohen's Kappa measures agreement beyond what would be expected by chance.

The reported best Kappa is:

**94.58% for ResNet-50 + KNN.**

---

# 36. Visual Artifacts Reported in the Research

The document contains several figures that reinforce the experimental architecture.

## Figure 1 — End-to-end framework

Located on page 2.

It illustrates the pipeline from CT input through:

- deep feature extraction,
- hybrid classification,
- out-of-patient evaluation.

## Figure 2 — Dataset split distribution

Located on page 3.

The bar chart shows the class distribution across training, validation, and test partitions under patient-group stratification.

## Figure 3 — ROC plot

Located on page 3.

It compares the top-performing hybrid pipelines.

The plot visually demonstrates separation between true-positive and false-positive rates.

## Figure 4 — Training/validation curves

Located on page 4.

It shows:

- training and validation accuracy,
- cross-entropy loss,
- progression over 100 epochs.

## Figure 5 — Test accuracy distribution

Located on page 4.

It compares test accuracy across all 36 model combinations under patient-group stratification.

## Figure 6 — Confusion matrix grid

Located on page 4.

It compares the nine classifier heads when paired with the ResNet-50 feature extractor.

---

# 37. Why the 99.91% Result Is a Warning, Not a Victory

A major senior-level lesson from this project is that a benchmark can be technically correct according to its split but scientifically misleading.

Suppose a patient has 100 highly correlated slices.

A random split might produce:

```text
80 slices → training
10 slices → validation
10 slices → test
```

The test samples are not truly independent.

The model therefore has access to nearly identical patient-specific patterns during training.

The reported:

```text
99.91%
```

must therefore be interpreted as a demonstration of what leakage can do.

The patient-group result:

```text
79.05%
```

is a much more informative system-wide generalization estimate.

---

# 38. Data Leakage Threat Model

The project effectively addresses two leakage classes.

## Threat 1 — Exact duplication

```text
same file
↓
different folders
↓
different dataset partitions
```

Countermeasure:

**MD5 deduplication**

## Threat 2 — Patient correlation

```text
same patient
↓
many related slices
↓
different partitions
```

Countermeasure:

**patient-group stratification**

## Combined defense

```text
Raw data
   |
   +--> Exact duplicate audit
   |
   +--> Patient identity audit
             |
             v
       Leakage-safe dataset
```

This layered approach is significantly stronger than using either method alone.

---

# 39. Important Architectural Decisions

## Decision 1 — Separate feature extraction from classification

### Why

To benchmark representation quality independently from classifier behavior.

### How

Backbones produce fixed-size embeddings, which are then consumed by interchangeable heads.

### Benefit

36 combinations can be evaluated without redesigning the complete model.

---

## Decision 2 — Include both CNN and Transformer backbones

### Why

CNNs and Transformers have different inductive biases.

### How

Use:

- ResNet-50,
- InceptionV3,
- MobileViT,
- Swin Transformer.

### Benefit

The benchmark tests whether results are specific to one representation family.

---

## Decision 3 — Include classical ML heads

### Why

A stronger deep representation does not necessarily require a deep classifier.

### How

Evaluate:

- SVM,
- Random Forest,
- KNN,
- XGBoost,
- AdaBoost,
- Bagging.

### Benefit

The project can determine whether simple decision rules exploit the embedding better than additional neural parameterization.

---

## Decision 4 — Include neural heads

### Why

To compare classical classifiers with neural nonlinear classifiers.

### How

Evaluate:

- ANN,
- LSTM,
- Bi-LSTM.

### Benefit

The benchmark measures whether additional learned nonlinear structure improves performance.

---

## Decision 5 — Use patient-level evaluation

### Why

To prevent inter-slice correlation leakage.

### How

Group samples by patient ID before partitioning.

### Benefit

The test set represents unseen patients rather than unseen slices from known patients.

---

## Decision 6 — Add MD5 auditing

### Why

Exact duplicate files can otherwise cross dataset boundaries.

### How

Hash image byte streams and identify equal hashes.

### Benefit

Removes exact duplicates before benchmarking.

---

## Decision 7 — Use multiple random seeds

### Why

Single-run results can be unstable.

### How

Run seeds:

```text
5, 10, 15, 20, 25
```

### Benefit

Report mean and standard deviation.

---

# 40. What the Source Does NOT Specify

This section is deliberately included to prevent undocumented implementation details from being presented as facts.

The supplied research document does **not** fully specify:

- exact Python version,
- exact deep-learning framework version,
- exact operating system,
- exact GPU/CPU hardware,
- exact dependency versions,
- exact dataset name,
- total dataset size in raw-image terms,
- exact preprocessing operations,
- normalization constants,
- augmentation pipeline,
- exact optimizer configuration,
- learning rate,
- batch size,
- number of frozen/unfrozen backbone layers,
- exact classifier hyperparameters,
- exact K value used by KNN,
- exact SVM `C` and `γ`,
- exact Random Forest tree count,
- exact XGBoost configuration,
- exact LSTM sequence construction,
- exact train/validation/test patient lists beyond the reported test identifiers,
- exact file hierarchy beyond the four repository modules,
- exact serialization/checkpoint strategy,
- exact inference API,
- deployment architecture.

These should **not** be invented when explaining the project in an interview or technical document.

If the actual repository contains these details, they should be added from the source code.

---

# 41. Senior-Level Code Architecture Expectations

Based strictly on the repository responsibilities reported in the research document, the clean architectural separation should look conceptually like:

```text
                 +----------------------+
                 | Data Integrity       |
                 |                      |
                 | data_loader.py       |
                 | check_and_fix_       |
                 | leakage.py           |
                 +----------+-----------+
                            |
                            v
                 +----------------------+
                 | Experiment Engine    |
                 |                      |
                 | hybrid_pipeline.py   |
                 +----------+-----------+
                            |
                            v
                 +----------------------+
                 | Benchmark Orchestr.  |
                 |                      |
                 | run_multi_seed.py    |
                 +----------+-----------+
                            |
                            v
                 +----------------------+
                 | Metrics / Results    |
                 +----------------------+
```

This separation creates a clear dependency direction:

```text
Data
 ↓
Feature/Model pipeline
 ↓
Experiment runner
 ↓
Results
```

The experiment runner should not become responsible for raw-data validation, because that would couple orchestration to data integrity.

---

# 42. Failure Modes and Defenses

## Failure mode 1 — Duplicate files

### Symptom

Artificially high performance.

### Defense

MD5 content hashing.

---

## Failure mode 2 — Same patient in train and test

### Symptom

Near-perfect test accuracy.

### Defense

Patient-group stratification.

---

## Failure mode 3 — Trusting a single seed

### Symptom

Unstable or non-reproducible result.

### Defense

Five seeds and mean ± SD.

---

## Failure mode 4 — Selecting model using leaked benchmark

### Symptom

A model optimized for the wrong evaluation regime.

### Defense

Treat patient-group testing as the authoritative generalization benchmark.

---

## Failure mode 5 — Selecting only by accuracy

### Symptom

Potentially misleading model ranking.

### Defense

Evaluate:

- Accuracy,
- Precision,
- Recall,
- F1,
- Kappa,
- standard deviation.

---

## Failure mode 6 — Assuming a complex head is automatically better

### Symptom

Additional neural parameters produce worse generalization.

### Defense

Benchmark simple heads such as KNN against ANN/LSTM/Bi-LSTM and ensemble methods.

---

# 43. Scientific Interpretation of the Benchmark

The project provides evidence for several observations.

## Observation 1

A deep feature representation can be more important than classifier complexity.

Evidence:

```text
ResNet-50 + KNN
98.60%
```

outperforms many more complex classifier combinations.

## Observation 2

Transformer representations can compete strongly with CNN representations.

Evidence:

```text
Swin + KNN
98.37%
```

## Observation 3

Data-splitting methodology can change the apparent performance dramatically.

Evidence:

```text
99.91% naive
79.05% patient-group system mean
```

## Observation 4

Exact duplicate auditing is necessary.

Evidence:

```text
206 duplicates removed
```

## Observation 5

Model stability matters.

Several configurations show very large standard deviations, while the best KNN configurations remain around ±1.30 percentage points.

---

# 44. Interview-Level Explanation

If asked:

> "What is your project?"

A strong explanation is:

> This project is a medical-imaging benchmark for pancreatic tumor classification from CT images. Instead of building one monolithic model, we separate deep feature extraction from downstream classification. We evaluate four different backbones—ResNet-50, InceptionV3, MobileViT, and Swin Transformer—and pair each with nine classifiers, giving 36 hybrid pipelines. The most important part of the project is data leakage prevention. A naive slice-level split produced about 99.91% accuracy, but that was inflated because slices from the same patient could appear in both train and test sets. We therefore added MD5-based duplicate detection and strict patient-group stratification. Under unseen-patient evaluation, ResNet-50 plus KNN achieved 98.60% ± 1.30% test accuracy and 98.63% ± 1.27% F1. The main engineering lesson is that patient-level evaluation is essential for meaningful medical AI benchmarking.

---

# 45. If Asked "Why KNN?"

Answer:

> The pretrained deep backbone already transforms the CT image into a structured feature manifold. KNN directly exploits the geometry of that embedding instead of learning another highly parameterized decision function. In our patient-group benchmark, ResNet-50 plus KNN achieved the best reported test accuracy, 98.60%, and Swin plus KNN achieved 98.37%.

---

# 46. If Asked "Why Was 100% Accuracy Wrong?"

Answer:

> It was not necessarily a model-learning failure; it was an evaluation-design problem. CT slices from the same patient are strongly correlated. A slice-level random split can put highly similar slices from one patient into both training and test sets. The model can therefore learn patient-specific characteristics rather than general disease features. After enforcing patient-group separation, the system-wide mean accuracy dropped from 99.91% to 79.05%, exposing the leakage effect.

---

# 47. If Asked "How Did You Prevent Leakage?"

Answer:

> We used two complementary defenses. First, we performed MD5 content hashing to detect exact duplicate image files and removed 206 duplicates. Second, and more importantly, we grouped CT slices by Patient ID so that slices from a test patient were completely excluded from training and validation. This prevents inter-slice patient correlation from crossing the evaluation boundary.

---

# 48. If Asked "Why Test 36 Models?"

Answer:

> The objective was not just to find one model that works. We wanted to separate the effect of the feature representation from the effect of the classifier. Four feature extractors multiplied by nine classification heads gives 36 combinations. That lets us determine whether performance comes primarily from the backbone, the downstream head, or their interaction.

---

# 49. If Asked "Why Multiple Seeds?"

Answer:

> Machine-learning results can depend on random initialization and data-related randomness. We therefore repeated the benchmark with seeds 5, 10, 15, 20, and 25 and reported mean ± standard deviation. That gives a better estimate of both performance and stability than a single run.

---

# 50. If Asked "Why Not Just Use a CNN End-to-End?"

Answer:

> An end-to-end CNN would be a valid modeling approach, but it would not answer the benchmarking question as cleanly. By separating feature extraction from classification, we can reuse the same learned representation with nine different downstream heads. This makes the experimental comparison more controlled and exposes the surprising result that a simple KNN head can outperform more parameter-heavy alternatives.

---

# 51. If Asked "What Is the Most Important Part of the Project?"

The strongest answer is:

> **The leakage-remediation methodology.**

The model benchmark is valuable, but the methodological contribution is more important because a medically impressive metric is not meaningful if the test set contains information correlated with the training patients.

The project demonstrates this directly through the:

```text
99.91% → 79.05%
```

performance shift.

---

# 52. Reproducibility Checklist

Before treating a benchmark result as trustworthy, verify:

- [ ] Dataset integrity audit executed.
- [ ] MD5 duplicates identified.
- [ ] Duplicate copies removed.
- [ ] Patient IDs validated.
- [ ] No patient appears in multiple partitions.
- [ ] Test patients are completely unseen during training.
- [ ] Same preprocessing is applied consistently.
- [ ] Feature extractor configuration is fixed.
- [ ] Classifier configuration is recorded.
- [ ] All five seeds are executed.
- [ ] Mean and standard deviation are calculated.
- [ ] Accuracy is reported together with additional metrics.
- [ ] Results are stored in a reproducible form.
- [ ] Benchmark split strategy is explicitly documented.

---

# 53. Future Scope

The research identifies two principal future directions.

## 53.1 3D volumetric CT segmentation

The current study works around radiographic slices/features.

Future work can move toward full 3D volumetric processing:

```text
2D slice
   ↓
3D CT volume
   ↓
3D representation
   ↓
tumor segmentation
```

This could preserve anatomical context across slices rather than treating slices independently.

## 53.2 Multi-modal radiomic feature fusion

Future work can combine learned deep features with radiomic descriptors.

Conceptually:

```text
Deep features
      +
Radiomic features
      ↓
Fusion representation
      ↓
Classifier
```

This could combine automatically learned representations with explicitly engineered quantitative imaging features.

---

# 54. Recommended Future Architecture

The source only explicitly states the future directions above. A senior engineering extension could evolve the system toward:

```text
                  CT Volume
                      |
             +--------+--------+
             |                 |
             v                 v
        3D CNN /          Transformer
        3D encoder        volume encoder
             |                 |
             +--------+--------+
                      |
                      v
              Deep representation
                      |
                      +----------------+
                      |                |
                      v                v
                 Radiomics        Clinical metadata
                      |                |
                      +-------+--------+
                              |
                              v
                       Feature Fusion
                              |
                              v
                      Patient-level model
                              |
                              v
                       Risk / diagnosis
```

This is an architectural proposal, not a component currently documented in the source.

---

# 55. Important Clinical Engineering Caveats

This research should be understood as a **benchmarking and research system**, not as a clinically deployed diagnostic device.

A high benchmark accuracy does not automatically imply:

- regulatory approval,
- clinical safety,
- generalization to another hospital,
- generalization to another scanner,
- generalization to another population,
- robustness to acquisition protocol changes,
- diagnostic superiority over radiologists.

A deployment-grade system would require substantially more validation.

---

# 56. Deployment Considerations for a Real Clinical System

If this project were evolved into a production clinical system, additional layers would be required.

## Data layer

- DICOM ingestion
- scanner metadata validation
- protocol normalization
- patient identity management
- audit logs

## ML layer

- model versioning
- preprocessing versioning
- feature extractor versioning
- classifier versioning
- calibrated confidence
- out-of-distribution detection

## Safety layer

- human-in-the-loop review
- confidence thresholds
- abstention behavior
- false-negative monitoring
- auditability

## MLOps layer

- experiment tracking
- dataset versioning
- model registry
- reproducible builds
- monitoring
- rollback

These are not documented as current project components and therefore should be treated as future engineering requirements.

---

# 57. Architecture Quality Assessment

From a senior software-engineering perspective, the strongest architectural choices documented in the project are:

### Strong

1. **Modular feature/classifier separation**
2. **Explicit leakage auditing**
3. **Patient-group evaluation**
4. **Multi-seed benchmarking**
5. **Comparison across CNN and Transformer families**
6. **Comparison across classical and neural classifiers**
7. **Dedicated benchmark runner**
8. **Dedicated leakage-remediation utility**

### Areas requiring additional documentation in the actual repository

1. Configuration management
2. Dependency pinning
3. Dataset versioning
4. Experiment tracking
5. Result serialization
6. Logging
7. Error handling
8. Checkpoint management
9. Unit tests
10. Integration tests
11. CI/CD
12. Hardware/runtime requirements
13. Exact preprocessing
14. Hyperparameter configuration
15. Model artifact versioning

The research report does not provide enough evidence to claim that these are implemented.

---

# 58. Suggested Production-Grade Repository Structure

The report only explicitly names four files. The following is therefore a **recommended evolution**, not a claim about the current repository:

```text
pancreatic-tumor-classification/
│
├── README.md
├── requirements.txt
├── pyproject.toml
├── LICENSE
│
├── configs/
│   ├── data.yaml
│   ├── models.yaml
│   └── experiments.yaml
│
├── data/
│   ├── raw/
│   ├── validated/
│   └── manifests/
│
├── src/
│   ├── data_loader.py
│   ├── check_and_fix_leakage.py
│   ├── hybrid_pipeline.py
│   ├── feature_extractors/
│   ├── classifiers/
│   ├── evaluation/
│   └── utils/
│
├── experiments/
│   └── run_multi_seed.py
│
├── results/
│   ├── metrics/
│   ├── plots/
│   └── confusion_matrices/
│
├── tests/
│   ├── test_data_integrity.py
│   ├── test_patient_split.py
│   └── test_pipeline.py
│
└── docs/
    └── pancreatic_tumor_classification.md
```

Again, this is a recommended engineering structure, not the documented current repository tree.

---

# 59. Senior-Level Design Principles Demonstrated

## Principle 1 — Separate concerns

Data loading should not be responsible for model architecture.

Model architecture should not be responsible for experiment orchestration.

Experiment orchestration should not silently change dataset semantics.

---

## Principle 2 — Make invalid states difficult to create

The strongest example is patient grouping.

Instead of trusting every experiment author to remember:

> "Don't mix patients."

the data layer should enforce the rule structurally.

---

## Principle 3 — Treat evaluation as part of the system

The model is not:

```text
backbone + classifier
```

The effective research system is:

```text
data definition
+
split policy
+
feature extraction
+
classifier
+
metrics
+
randomness control
```

Changing the split policy changes the scientific meaning of the result.

---

## Principle 4 — Prefer reproducible experiments

A result should be traceable to:

```text
dataset
+
split
+
seed
+
backbone
+
classifier
+
configuration
```

The five-seed design moves the project in this direction.

---

# 60. Final Technical Takeaway

The project is fundamentally a study of **representation quality plus evaluation integrity**.

The headline numbers are:

```text
36 hybrid pipelines
4 backbones
9 classifier heads
5 random seeds
206 duplicate images removed

99.91%
naive slice-level system mean

79.05%
patient-group system mean

98.60 ± 1.30%
best reported test accuracy
ResNet-50 + KNN

98.63 ± 1.27%
best reported F1

94.58%
best reported Cohen's Kappa
```

The most important conclusion is not that one model achieved 98.60%.

It is that **the methodology determines whether a medical-AI number means anything**.

The project demonstrates this experimentally:

```text
                 Evaluation methodology
                         |
            +------------+------------+
            |                         |
            v                         v
      Slice-level split        Patient-group split
            |                         |
            v                         v
        99.91%                    79.05%
      misleadingly             realistic system
      optimistic                 benchmark
```

After leakage is controlled, the best reported hybrid systems remain highly accurate:

```text
ResNet-50 → KNN     98.60%
Swin       → KNN    98.37%
```

This supports the project's broader engineering and scientific argument:

> **Strong deep representations can make simple downstream decision rules extremely effective, but trustworthy medical AI requires patient-level evaluation, duplicate detection, reproducibility, and explicit leakage controls before model accuracy can be interpreted as genuine generalization.**

---

# 61. Source Traceability

The project description, methodology, results, and repository architecture in this document are grounded primarily in the supplied research report:

- Project title and research objective: pages 1–2.
- Four feature extractors and feature dimensions: page 2.
- Nine downstream classifier families: page 2.
- MD5 deduplication and 206 duplicates: page 2.
- Patient-group stratification and reported test patients: page 2.
- Multi-seed protocol and benchmark results: pages 3–4.
- Scientific discussion of KNN, CNN vs Transformer behavior, and the 20.86-point shift: page 4.
- Repository files and future scope: page 4.

The supplied report explicitly names the following repository modules:

```text
data_loader.py
hybrid_pipeline.py
run_multi_seed.py
check_and_fix_leakage.py
```

Any additional repository structure or implementation details in this document are labeled as recommendations or engineering rationale rather than current-code facts.

---

# 62. One-Page Architecture Summary

```text
                              PROJECT
                                |
        +-----------------------+-----------------------+
        |                       |                       |
        v                       v                       v
   DATA INTEGRITY         REPRESENTATION          EXPERIMENT CONTROL
        |                       |                       |
        |                 +-----+-----+                 |
        |                 |           |                 |
        v                 v           v                 v
   MD5 hashing        CNN family   Transformer      Multi-seed
   duplicate audit        |             |           execution
        |                 |             |                 |
        v                 +------+------+                 |
   Patient IDs                  |                        |
        |                        v                        |
        v                 Feature embeddings              |
 Patient-group                   |                        |
 stratification                  v                        |
        |                 9 classifier heads              |
        |                        |                        |
        +------------------------+------------------------+
                                 |
                                 v
                         36 hybrid pipelines
                                 |
                                 v
                         5 random seeds
                                 |
                                 v
                   Accuracy / F1 / Precision /
                   Recall / Cohen's Kappa
                                 |
                                 v
                    Out-of-patient benchmark
```

---

# 63. Final Engineering Verdict

This is best understood as a **research-grade benchmarking framework**, not merely a classifier.

Its most significant architectural feature is the explicit separation of:

```text
data integrity
      ↓
patient-safe evaluation
      ↓
deep representation
      ↓
downstream classification
      ↓
multi-seed benchmarking
      ↓
comparative analysis
```

That separation is what makes the project scientifically meaningful.

The strongest documented model is:

**ResNet-50 + KNN**

but the strongest documented engineering decision is:

**patient-group stratification combined with duplicate auditing.**

The difference matters. A model can be replaced later; a flawed evaluation protocol can invalidate the entire study.

