# IoT-Based Healthcare System using Machine Learning

> **Senior Engineering Project Documentation**
>
> This document reconstructs and explains the research project described
> in `Research.pdf` as a senior-level technical design and
> implementation document. It deliberately distinguishes what is
> explicitly supported by the research report from engineering
> interpretation. Where the report does not specify an implementation
> detail, this document does **not** invent one.

------------------------------------------------------------------------

## 1. Executive Summary

### 1.1 Project identity

**Project Name:** IoT-Based Healthcare System using Machine Learning

**Project Type:** EEG-based mental-health classification research system

**Institution:** National Institute of Technology, Rourkela

**Department:** Department of Computer Science & Engineering

**Report Type:** Summer Internship Research Report

**Primary research direction:** Electroencephalography (EEG), signal
processing, machine learning, deep learning, and healthcare Internet of
Things (IoT).

The research investigates whether EEG signals can be processed into
useful numerical representations and classified using machine-learning
models to distinguish five mental-health conditions:

1.  Attention-Deficit/Hyperactivity Disorder (ADHD)
2.  Anxiety
3.  Autism Spectrum Disorder (ASD)
4.  Depression
5.  Schizophrenia

The report describes an end-to-end pipeline:

``` text
EEG Data Acquisition
        |
        v
Preprocessing
        |
        v
Bandpass Filtering
        |
        v
Independent Component Analysis (ICA)
        |
        v
Epoching
        |
        v
Feature Extraction
        |
        +----------------------+
        |                      |
        v                      v
Frequency-Domain         Time-Domain
Features                 Features
        |                      |
        +----------+-----------+
                   |
                   v
             Classification
                   |
       +-----------+-----------+-----------+
       |                       |           |
       v                       v           v
Logistic Regression      Random Forest   Neural Network
       |                       |           |
       +-----------+-----------+-----------+
                   |
                   v
                Results
```

The principal result reported is that the **Multilayer Perceptron
(MLP)** neural network achieved **88.2% average accuracy**, with average
precision, recall, and F1-score of **0.87** across the five disorders.

------------------------------------------------------------------------

# 2. Problem Definition

## 2.1 The real-world problem

Mental-health diagnosis can involve clinical interviews, behavioral
observations, questionnaires, and clinician interpretation. The report
identifies several challenges:

-   **Subjectivity:** reliance on patient self-reporting and clinician
    interpretation.
-   **Late diagnosis:** conditions may be recognized after significant
    functional impairment.
-   **Comorbidity:** overlapping symptoms can complicate diagnosis.
-   **Accessibility:** specialized mental-health professionals are not
    universally available.
-   **Stigma:** social barriers can discourage people from seeking help.

The project therefore investigates a more objective, quantitative
signal-based approach.

The key idea is not:

> "Replace a psychiatrist with an AI model."

The defensible research interpretation is:

> "Use EEG-derived information and machine learning as a potential
> automated assessment or decision-support mechanism, subject to
> substantially more validation before clinical deployment."

That distinction is important from both a software-engineering and
healthcare perspective.

------------------------------------------------------------------------

# 3. Why EEG?

## 3.1 EEG definition

**EEG = Electroencephalography.**

EEG records electrical activity associated with brain activity using
electrodes placed on the scalp.

The report identifies EEG as attractive because it provides:

-   direct measurements of brain electrical activity,
-   millisecond-level temporal resolution,
-   non-invasive measurement,
-   relatively low cost,
-   potential portability.

## 3.2 Engineering interpretation

From a system perspective, EEG is useful because it converts a
biological process into a time-series signal that can be:

1.  sampled,
2.  stored,
3.  filtered,
4.  transformed,
5.  represented numerically,
6.  analyzed statistically,
7.  passed to machine-learning algorithms.

The core engineering challenge is therefore a **signal-to-decision
pipeline**.

------------------------------------------------------------------------

# 4. Project Objectives

The report defines five primary objectives.

## Objective 1 --- EEG processing pipeline

Develop a comprehensive EEG data-processing pipeline for mental-disorder
classification.

## Objective 2 --- Model comparison

Implement and compare:

-   traditional machine learning,
-   neural-network/deep-learning approaches.

## Objective 3 --- Classification performance

Achieve clinically relevant classification accuracy for five major
mental disorders.

## Objective 4 --- IoT-ready architecture

Design a system architecture suitable for eventual Internet of Things
deployment.

## Objective 5 --- Real-time monitoring foundation

Establish a foundation for future real-time mental-health monitoring.

------------------------------------------------------------------------

# 5. Scope

The current research focuses on:

-   five specified mental-health disorders,
-   publicly available EEG datasets,
-   laboratory-controlled EEG recordings,
-   preprocessing,
-   feature engineering,
-   machine-learning classification,
-   neural-network classification,
-   model evaluation,
-   an architecture intended to be suitable for eventual IoT deployment.

The research is therefore best understood as an **EEG analytics and
classification pipeline with an IoT-oriented target architecture**,
rather than as a fully deployed wearable clinical IoT product.

------------------------------------------------------------------------

# 6. Important Scope and Evidence Boundary

This section is intentionally explicit.

The research report provides detailed information about the
**data-processing and machine-learning pipeline**, but it does not fully
specify:

-   the production programming-language stack,
-   a concrete cloud architecture,
-   a particular IoT communication protocol,
-   a specific wearable EEG hardware model,
-   a production database schema,
-   authentication and authorization implementation,
-   API endpoints,
-   deployment containers,
-   cloud provider,
-   production observability stack,
-   exact source-code directory structure.

Therefore, those details must not be presented as existing
implementation facts.

Where this document discusses such concerns, they are presented as
**senior engineering design considerations or future production
requirements**, not as claims about what the original research already
implemented.

------------------------------------------------------------------------

# 7. System Architecture

## 7.1 Architectural decomposition

The report describes three broad system components:

1.  **Data acquisition**
2.  **Processing and analysis**
3.  **Application interface**

The detailed processing pipeline expands these into:

1.  Data acquisition
2.  Preprocessing
3.  Bandpass filtering
4.  ICA cleaning
5.  Epoching
6.  Feature extraction
7.  Frequency-domain analysis
8.  Time-domain analysis
9.  Classification
10. Result generation

## 7.2 Why this architecture?

The separation is technically important because biological signals are
not immediately suitable for machine learning.

A raw EEG signal contains both useful brain information and unwanted
components.

Therefore:

``` text
Raw data
  !=
Model-ready data
```

A model should receive a representation where irrelevant signal
variation has been reduced and meaningful characteristics have been
extracted.

This motivates the pipeline architecture:

``` text
Acquire -> Clean -> Segment -> Represent -> Classify -> Evaluate
```

Each stage has one major responsibility.

------------------------------------------------------------------------

# 8. Data Acquisition

## 8.1 Data sources

The report states that EEG data were collected from multiple sources,
including:

-   open-source repositories,
-   EEGMMI Dataset,
-   DEAP Dataset,
-   collaborating hospital records,
-   laboratory recordings under controlled conditions.

The datasets included healthy controls and patients with clinically
diagnosed disorders.

## 8.2 Dataset characteristics

  Disorder          Subjects   Channels   Sampling Rate   Recording Duration
  --------------- ---------- ---------- --------------- --------------------
  ADHD                    45         11          256 Hz               20 min
  Anxiety                 32          5          256 Hz               15 min
  ASD                     28         19          256 Hz               25 min
  Depression              38         19          256 Hz               20 min
  Schizophrenia           42         19          256 Hz               30 min

### Why sampling rate matters

**Hz = Hertz.**

A sampling rate of **256 Hz** means the signal is represented using
**256 samples per second**.

For a 2-second epoch:

``` text
256 samples/second x 2 seconds
= 512 samples
```

This is why the report specifies 512 samples per 2-second epoch.

------------------------------------------------------------------------

# 9. Signal Processing Pipeline

## 9.1 Why preprocessing is necessary

A raw EEG recording can contain:

-   genuine neural activity,
-   eye-blink artifacts,
-   muscle artifacts,
-   slow baseline drift,
-   high-frequency noise,
-   other recording contamination.

If these unwanted components are fed directly to a classifier, the model
may learn the wrong patterns.

The preprocessing objective is therefore:

> Maximize useful signal information while reducing irrelevant
> artifacts.

The report's preprocessing pipeline consists of:

``` text
Raw EEG
   |
   v
Bandpass Filtering
   |
   v
ICA
   |
   v
Artifact Removal
   |
   v
Clean EEG
```

------------------------------------------------------------------------

# 10. Bandpass Filtering

## 10.1 Definition

A **bandpass filter** keeps frequencies inside a selected range and
suppresses frequencies outside that range.

The report uses:

**0.5 Hz to 45 Hz**

with a:

**FIR = Finite Impulse Response** filter.

## 10.2 Why 0.5--45 Hz?

The report describes this filtering as a way to remove:

-   high-frequency noise,
-   low-frequency drift.

The design therefore attempts to preserve the EEG frequency range
subsequently used for feature engineering.

## 10.3 FIR filter

FIR means **Finite Impulse Response**.

Conceptually, an FIR filter computes each output sample from a finite
set of previous input samples.

The report gives:

``` text
y[n] = sum(k=0 to M) b_k x[n-k]
```

where:

-   `x[n]` is the input signal,
-   `y[n]` is the filtered output,
-   `b_k` are filter coefficients,
-   `M` is the filter order.

## 10.4 Engineering reason for filtering before feature extraction

Suppose a signal contains:

``` text
Useful EEG + slow drift + high-frequency noise
```

Frequency-domain feature extraction would otherwise measure all of those
components.

Filtering first makes the downstream features more representative of the
intended EEG signal.

------------------------------------------------------------------------

# 11. Independent Component Analysis

## 11.1 Definition

**ICA = Independent Component Analysis.**

ICA attempts to separate a multivariate signal into statistically
independent components.

A useful mental model is:

``` text
Observed EEG
     |
     +---- brain activity
     +---- eye movement
     +---- muscle movement
     +---- other artifacts
```

ICA tries to separate these mixtures.

## 11.2 Mathematical model

The report models the observed signal as:

``` text
x = A s
```

where:

-   `x` = observed mixed signal,
-   `A` = mixing matrix,
-   `s` = independent source components.

It then estimates an unmixing matrix `W`:

``` text
s = W x
```

## 11.3 Artifact removal

After decomposition, components associated with artifacts such as:

-   eye blinks,
-   muscle movement,

are identified and removed.

The remaining components are reconstructed into a cleaner EEG signal.

## 11.4 Why ICA comes after filtering?

The architectural sequence is:

``` text
Raw EEG
  |
  v
Bandpass filter
  |
  v
ICA
```

The reason is that removing obvious frequency-domain contamination first
can provide a cleaner signal for component decomposition.

The report does not provide a formal ablation study proving that
alternative ordering is inferior, so this should be described as the
chosen pipeline order rather than as a universally optimal rule.

------------------------------------------------------------------------

# 12. Epoching

## 12.1 Definition

**Epoching** means dividing a continuous signal into smaller
fixed-length segments.

The project uses:

**2-second epochs**

At 256 Hz:

``` text
2 x 256 = 512 samples
```

Therefore:

> One epoch contains 512 samples per channel.

## 12.2 Why epoch?

A long recording is difficult to process as one giant observation.

Epoching provides:

-   consistent input units,
-   smaller computational units,
-   easier batch processing,
-   the ability to study transient signal patterns.

Conceptually:

``` text
20-minute recording
       |
       +--> Epoch 1
       +--> Epoch 2
       +--> Epoch 3
       +--> ...
       +--> Epoch N
```

------------------------------------------------------------------------

# 13. Feature Engineering

## 13.1 What is a feature?

A feature is a numerical measurement that captures a potentially useful
property of the signal.

Instead of giving the model an entire raw waveform without structure, we
calculate interpretable measurements.

The report uses two major feature families:

``` text
                 EEG
                  |
        +---------+---------+
        |                   |
        v                   v
Frequency Domain       Time Domain
Features               Features
```

------------------------------------------------------------------------

# 14. Frequency-Domain Features

## 14.1 Frequency domain explained simply

A time-domain EEG waveform answers:

> "How does the signal change over time?"

A frequency-domain representation answers:

> "Which frequencies contain signal power?"

This is useful because EEG activity is commonly discussed in frequency
bands.

## 14.2 Five frequency bands

### Delta

**1--4 Hz**

Associated in the report with deep sleep.

### Theta

**4--8 Hz**

Associated with drowsiness and meditation.

### Alpha

**8--13 Hz**

Associated with relaxed states.

### Beta

**13--30 Hz**

Associated with active thinking and focus.

### Gamma

**30--45 Hz**

Associated with higher cognitive processing.

------------------------------------------------------------------------

# 15. Power Spectral Density

## 15.1 PSD

**PSD = Power Spectral Density.**

PSD describes how signal power is distributed over frequency.

Conceptually:

``` text
Frequency --->

1 Hz    5 Hz    10 Hz    20 Hz    40 Hz
 |       |        |        |        |
power   power    power    power    power
```

This allows the system to quantify the strength of different frequency
components.

## 15.2 Welch's method

The report computes band power using **Welch's method**.

The idea is to obtain a more stable estimate of power spectral density
by analyzing segments and averaging spectral estimates.

The report gives the band-power formulation:

``` text
P_band = 1/(f2-f1) * integral from f1 to f2 of P(f) df
```

where:

-   `f1` = lower band frequency,
-   `f2` = upper band frequency,
-   `P(f)` = power spectral density.

------------------------------------------------------------------------

# 16. Time-Domain Features

## 16.1 Hjorth Parameters

The project uses three Hjorth parameters:

1.  Activity
2.  Mobility
3.  Complexity

### Activity

Measures signal variance.

Simple interpretation:

> How much the signal varies.

### Mobility

Based on the relationship between the variance of the first derivative
and the variance of the signal.

Simple interpretation:

> How quickly the signal changes.

### Complexity

Compares the mobility of the signal with the mobility of its first
derivative.

Simple interpretation:

> How complicated the signal's shape or dynamics are.

## 16.2 Statistical features

The report also uses:

-   Mean
-   Variance
-   Skewness
-   Kurtosis

### Mean

Average signal value.

### Variance

Measures how spread out signal values are.

### Skewness

Measures asymmetry of the distribution.

### Kurtosis

Describes the heaviness of the distribution tails/peakedness.

## 16.3 Nonlinear features

The report includes:

-   Sample entropy
-   Hurst exponent

These attempt to characterize more complicated temporal behavior than
simple mean or variance.

------------------------------------------------------------------------

# 17. Machine-Learning Layer

The project compares multiple classification approaches.

## 17.1 Models

The report implements:

1.  Logistic Regression
2.  Random Forest
3.  Support Vector Machine
4.  Multilayer Perceptron neural network

The architectural decision to compare multiple models is important.

A single model result would answer:

> "Can this model work?"

A model comparison answers a stronger question:

> "How does this approach compare with alternative learning strategies
> on the same task?"

------------------------------------------------------------------------

# 18. Logistic Regression

## 18.1 Definition

Logistic Regression is a classification algorithm that models class
probability from input features.

The report describes its use with:

**L2 regularization.**

## 18.2 Why include it?

It provides a relatively simple baseline.

If a complex neural network performs better than Logistic Regression,
that gives evidence that additional model capacity may be useful for the
feature representation.

------------------------------------------------------------------------

# 19. Random Forest

## 19.1 Definition

Random Forest is an ensemble method based on multiple decision trees.

The report uses:

**100 decision trees.**

Conceptually:

``` text
Features
   |
   +--> Tree 1 --> prediction
   +--> Tree 2 --> prediction
   +--> Tree 3 --> prediction
   ...
   +--> Tree 100 --> prediction
                  |
                  v
              Aggregation
                  |
                  v
             Final result
```

## 19.2 Why use Random Forest?

It provides a strong non-neural baseline capable of modeling non-linear
relationships and interactions among features.

------------------------------------------------------------------------

# 20. Support Vector Machine

## 20.1 SVM

**SVM = Support Vector Machine.**

The report uses an:

**RBF = Radial Basis Function**

kernel with optimized parameters.

## 20.2 Why an RBF kernel?

The RBF kernel allows SVM to represent non-linear decision boundaries.

This is relevant because EEG feature relationships are not necessarily
linearly separable.

------------------------------------------------------------------------

# 21. Neural Network Architecture

## 21.1 MLP

**MLP = Multilayer Perceptron.**

The project implements a simple multilayer neural network.

The reported architecture is:

``` text
Input Features
      |
      v
Hidden Layer 1
128 units
ReLU
      |
      v
Hidden Layer 2
64 units
ReLU
      |
      v
Output Layer
Sigmoid
```

## 21.2 ReLU

**ReLU = Rectified Linear Unit.**

Conceptually:

``` text
ReLU(x) = max(0, x)
```

It passes positive values and converts negative values to zero.

## 21.3 Sigmoid

The output layer uses a sigmoid activation.

Sigmoid maps values into a range between 0 and 1, making it useful for
probability-like outputs in suitable binary-output settings.

The report uses this architecture as its simple neural-network model; it
does not document a deeper CNN/RNN architecture in the current
implementation.

------------------------------------------------------------------------

# 22. Neural-Network Equations

The report gives:

``` text
h1 = ReLU(W1 x + b1)

h2 = ReLU(W2 h1 + b2)

y = sigmoid(W3 h2 + b3)
```

where:

-   `x` = input feature vector,
-   `W1`, `W2`, `W3` = weight matrices,
-   `b1`, `b2`, `b3` = bias vectors,
-   `h1`, `h2` = hidden-layer representations,
-   `y` = output,
-   ReLU and sigmoid = activation functions.

## 22.1 Why multiple layers?

The first hidden layer learns intermediate representations.

The second hidden layer can combine those representations into more
abstract patterns.

The final layer maps the learned representation to an output.

The important principle is:

> Earlier layers learn simpler combinations; later layers can learn more
> complex combinations.

------------------------------------------------------------------------

# 23. Training Protocol

The report specifies:

-   70% training
-   15% validation
-   15% testing
-   subject-wise splitting
-   SMOTE for class imbalance
-   Adam optimizer
-   learning rate = 0.001
-   early stopping
-   patience = 10 epochs

------------------------------------------------------------------------

# 24. Train / Validation / Test Split

## 24.1 Training set

Used to learn model parameters.

## 24.2 Validation set

Used during development to monitor performance and make training
decisions.

## 24.3 Test set

Used as unseen data for final performance evaluation.

The split:

``` text
100%
 |
 +---- 70% Training
 |
 +---- 15% Validation
 |
 +---- 15% Testing
```

------------------------------------------------------------------------

# 25. Subject-Wise Splitting

This is a critical architectural and scientific decision.

## 25.1 The leakage problem

Suppose one person's recording produces hundreds of epochs.

If random epoch-level splitting is used:

``` text
Subject A
  |
  +--> epochs in training
  +--> epochs in testing
```

The model may learn subject-specific characteristics rather than general
disorder characteristics.

That can produce overly optimistic performance.

## 25.2 Chosen approach

Subject-wise splitting means the system keeps samples from a subject
within the appropriate partition.

Conceptually:

``` text
Subjects A-F -> Training

Subjects G-H -> Validation

Subjects I-J -> Testing
```

The exact subject assignment is not specified in the report.

## 25.3 Why this matters

The model is then evaluated more like the real-world problem:

> "Can this system generalize to a person it did not train on?"

rather than:

> "Can it recognize another segment from a person it already saw?"

This is one of the strongest methodological decisions in the project.

------------------------------------------------------------------------

# 26. SMOTE

## 26.1 Definition

**SMOTE = Synthetic Minority Over-sampling Technique.**

Machine-learning datasets can contain unequal class sizes.

For example:

``` text
Class A = 1000 samples
Class B = 300 samples
```

A model may become biased toward the larger class.

SMOTE addresses minority-class representation by generating synthetic
examples based on existing minority samples.

## 26.2 Engineering caution

SMOTE must be applied only within the training workflow and must not
contaminate validation/test data.

The report states that SMOTE was used for class-imbalance handling, but
it does not provide the exact implementation order relative to every
split. Therefore, the precise operational placement should not be
claimed unless confirmed from source code.

------------------------------------------------------------------------

# 27. Adam Optimizer

## 27.1 Definition

**Adam = Adaptive Moment Estimation.**

An optimizer updates neural-network parameters so that the model's error
decreases.

Conceptually:

``` text
Prediction
    |
    v
Calculate error
    |
    v
Calculate gradients
    |
    v
Adam optimizer
    |
    v
Update weights
    |
    v
Better prediction
```

The report uses:

**Learning rate = 0.001**

------------------------------------------------------------------------

# 28. Early Stopping

The model uses:

**Patience = 10 epochs.**

If validation performance stops improving for the configured patience
period, training can stop.

## Why?

Continuing training indefinitely can cause overfitting.

The goal is not:

> "Train for as long as possible."

The goal is:

> "Train until additional training stops improving generalization."

------------------------------------------------------------------------

# 29. Evaluation Metrics

The report evaluates:

-   Accuracy
-   Precision
-   Recall
-   F1-score

------------------------------------------------------------------------

# 30. Accuracy

Accuracy measures the proportion of predictions that are correct.

Conceptually:

``` text
Accuracy =
Correct Predictions
-------------------
Total Predictions
```

The best model achieved:

**88.2%**

------------------------------------------------------------------------

# 31. Precision

Precision asks:

> "When the model predicts a class, how often is that prediction
> correct?"

For a positive class:

``` text
Precision =
True Positives
-------------------------
True Positives + False Positives
```

High precision means fewer false alarms.

------------------------------------------------------------------------

# 32. Recall

Recall asks:

> "Of all the actual positive cases, how many did the model find?"

``` text
Recall =
True Positives
-------------------------
True Positives + False Negatives
```

High recall means fewer missed positive cases.

------------------------------------------------------------------------

# 33. F1-score

F1-score balances precision and recall.

``` text
F1 = 2 * Precision * Recall
     -----------------------
       Precision + Recall
```

The neural network achieved:

**0.87 F1-score**

------------------------------------------------------------------------

# 34. Model Performance

The report's average performance across all five disorders is:

  ------------------------------------------------------------------------
  Model              Accuracy      Precision         Recall       F1-score
  ------------ -------------- -------------- -------------- --------------
  Logistic              72.3%           0.71           0.70           0.70
  Regression                                                

  Random                79.1%           0.78           0.77           0.77
  Forest                                                    

  Support               76.8%           0.75           0.76           0.75
  Vector                                                    
  Machine                                                   

  **Neural          **88.2%**       **0.87**       **0.87**       **0.87**
  Network                                                   
  (MLP)**                                                   
  ------------------------------------------------------------------------

The MLP is therefore the strongest model in the reported comparison.

------------------------------------------------------------------------

# 35. Disorder-Wise Results

The neural-network results are:

  Disorder          Accuracy   Precision   Recall   F1-score
  --------------- ---------- ----------- -------- ----------
  ADHD                 86.5%        0.85     0.86       0.85
  Anxiety              89.2%        0.88     0.89       0.88
  ASD                  85.8%        0.84     0.85       0.84
  Depression           88.7%        0.87     0.88       0.87
  Schizophrenia        90.8%        0.90     0.91       0.90

Highest reported accuracy:

**Schizophrenia --- 90.8%**

Lowest reported accuracy:

**ASD --- 85.8%**

------------------------------------------------------------------------

# 36. Confusion Matrix

The report includes a depression-classification confusion matrix.

It reports:

-   85% healthy identification,
-   89% MDD identification.

**MDD = Major Depressive Disorder.**

A confusion matrix is valuable because a single accuracy number hides
the types of errors.

Conceptually:

``` text
                     Predicted
                 Healthy     MDD
Actual Healthy      TP/Correct   Error
Actual MDD          Error        TP/Correct
```

The actual matrix in the report shows the class-wise identification
percentages.

------------------------------------------------------------------------

# 37. Feature Importance Findings

The report identifies:

### Anxiety and Depression

Alpha and beta band power were among the most discriminative features.

### ADHD

Theta activity showed high importance.

### Schizophrenia

Gamma-band features contributed significantly.

### Across disorders

Hjorth complexity parameters were valuable.

This gives the model a degree of interpretability because we can discuss
which signal characteristics contribute to classification.

------------------------------------------------------------------------

# 38. Why Multi-Domain Features?

A major architectural decision is to combine:

``` text
Frequency information
+
Time information
```

instead of relying exclusively on one representation.

## Frequency features answer:

> Which frequency components are strong?

## Time features answer:

> How does the waveform behave over time?

The two representations are complementary.

The report explicitly identifies multi-domain feature combination as one
factor contributing to the success of the approach.

------------------------------------------------------------------------

# 39. Why the MLP Won

The report attributes the MLP's superior performance to the ability to
model complex, non-linear relationships in EEG data.

The comparison suggests:

``` text
Logistic Regression -> 72.3%
SVM                -> 76.8%
Random Forest      -> 79.1%
MLP                -> 88.2%
```

The important engineering conclusion is not that neural networks are
always better.

Rather:

> For this particular feature representation and experimental setup, the
> MLP produced the strongest reported results.

That is a more scientifically defensible statement.

------------------------------------------------------------------------

# 40. Preprocessing Results

The report states that the preprocessing pipeline successfully removed
artifacts while preserving neural signals.

ICA rejected an average of:

**1.3 components per recording**

The rejected components corresponded primarily to ocular and muscular
artifacts.

------------------------------------------------------------------------

# 41. Discussion of Why the Pipeline Worked

The report identifies four major contributors.

## 41.1 Comprehensive preprocessing

Artifact removal produced cleaner input for feature extraction.

## 41.2 Multi-domain features

Combining time and frequency information provided complementary
information.

## 41.3 Appropriate model complexity

The relatively simple MLP balanced model capacity and generalization.

## 41.4 Rigorous validation

Subject-wise splitting provided more clinically relevant performance
estimates.

------------------------------------------------------------------------

# 42. Limitations

The report explicitly identifies the following limitations.

## 42.1 Limited disorder scope

Only five disorders were studied.

## 42.2 Dataset size

Some disorders have relatively small datasets.

## 42.3 Laboratory conditions

Controlled laboratory recordings may not represent real-world
recordings.

## 42.4 Cultural and demographic factors

These were not extensively explored.

## 42.5 Need for larger validation

Larger and more diverse populations are needed.

------------------------------------------------------------------------

# 43. Why These Limitations Matter

A model can perform well in a research dataset and still perform poorly
in the real world.

For example:

``` text
Research environment
        |
        v
Controlled EEG
        |
        v
Clean acquisition
        |
        v
88.2% reported accuracy
```

Real-world deployment introduces:

``` text
Movement
Different devices
Different electrode placement
Different populations
Environmental noise
Different demographics
Different recording conditions
```

Therefore, generalization must be tested rather than assumed.

------------------------------------------------------------------------

# 44. Clinical Safety Perspective

This project concerns mental health and therefore has a high consequence
of incorrect classification.

A false positive could incorrectly suggest a condition.

A false negative could miss a condition.

Therefore, production deployment would require substantially more than
model accuracy.

A production clinical system would need, at minimum, careful
consideration of:

-   clinical validation,
-   regulatory requirements,
-   patient consent,
-   privacy,
-   security,
-   data governance,
-   auditability,
-   model monitoring,
-   bias assessment,
-   clinician oversight.

These are engineering requirements for a real clinical product, not
claims that they were implemented in the research report.

------------------------------------------------------------------------

# 45. IoT Deployment Architecture --- Research Direction

The report's future direction is an IoT-capable and real-time system.

A production-oriented conceptual architecture could be:

``` text
+----------------------+
| Wearable EEG Device  |
+----------+-----------+
           |
           | EEG stream
           v
+----------------------+
| Edge / Mobile Device |
| Acquisition Gateway  |
+----------+-----------+
           |
           v
+----------------------+
| Signal Preprocessing |
| Filter + ICA         |
+----------+-----------+
           |
           v
+----------------------+
| Feature Extraction   |
+----------+-----------+
           |
           v
+----------------------+
| ML Inference Engine  |
+----------+-----------+
           |
           v
+----------------------+
| Healthcare Interface |
+----------------------+
```

Again, this diagram is a **production-oriented interpretation of the
research architecture**, not a statement that these specific components
were implemented.

------------------------------------------------------------------------

# 46. Why Edge Processing Would Be Important

For a future real-time wearable system, processing some data close to
the device could reduce:

-   network bandwidth,
-   latency,
-   unnecessary transmission of raw physiological data.

However, ICA and feature extraction can have computational requirements,
so actual edge deployment would require benchmarking.

The report itself identifies embedded implementation for wearable EEG
devices as future work.

------------------------------------------------------------------------

# 47. Real-Time Architecture Considerations

A real-time system would have to answer:

1.  How frequently is data collected?
2.  How large is the processing window?
3.  How much latency is acceptable?
4.  Is preprocessing performed locally or remotely?
5.  What happens when connectivity is lost?
6.  How are predictions stored?
7.  How is patient identity protected?
8.  How are model versions managed?
9.  How are failures handled?
10. How does a clinician interpret the output?

These questions are outside the documented current implementation and
therefore belong to future engineering work.

------------------------------------------------------------------------

# 48. Data Flow

The fundamental data flow is:

``` text
EEG Recording
     |
     v
Raw Time-Series Data
     |
     v
Filtered Signal
     |
     v
ICA-Decomposed Signal
     |
     v
Artifact-Clean Signal
     |
     v
2-Second Epochs
     |
     v
Feature Vectors
     |
     v
Machine-Learning Model
     |
     v
Predicted Class
     |
     v
Evaluation Metrics
```

This is the most useful way to understand the system as a software
pipeline.

------------------------------------------------------------------------

# 49. Data Representation

The system changes the representation of the data multiple times.

## Stage 1 --- Raw signal

``` text
time -> amplitude
```

## Stage 2 --- Clean signal

Same fundamental structure, but with unwanted artifacts reduced.

## Stage 3 --- Epoch

A fixed-size segment.

``` text
2 seconds x 256 Hz = 512 samples
```

## Stage 4 --- Feature vector

The signal is converted into numerical features such as:

``` text
delta_power
theta_power
alpha_power
beta_power
gamma_power
hjorth_activity
hjorth_mobility
hjorth_complexity
mean
variance
skewness
kurtosis
sample_entropy
hurst_exponent
...
```

The exact complete feature-vector dimensionality is not specified in the
report and should not be invented.

## Stage 5 --- Model output

A classification result.

------------------------------------------------------------------------

# 50. Architectural Principle: Separation of Concerns

A senior engineering interpretation of the pipeline is that each stage
should have a clear responsibility.

``` text
Acquisition
    responsibility: obtain EEG

Preprocessing
    responsibility: improve signal quality

Feature Engineering
    responsibility: create useful representations

Model
    responsibility: learn decision boundaries

Evaluation
    responsibility: measure generalization
```

This separation makes the system easier to:

-   test,
-   benchmark,
-   replace,
-   debug,
-   reproduce.

For example, Random Forest can be replaced with MLP without redesigning
the EEG filtering layer.

------------------------------------------------------------------------

# 51. Architectural Principle: Reproducibility

A research ML system should make every experiment reproducible.

A production-quality implementation should explicitly version:

-   dataset version,
-   preprocessing configuration,
-   filter parameters,
-   epoch size,
-   feature configuration,
-   train/validation/test split,
-   model architecture,
-   optimizer,
-   learning rate,
-   random seed,
-   model checkpoint,
-   evaluation metrics.

The research report provides many of these parameters but does not
document a complete experiment-tracking system.

------------------------------------------------------------------------

# 52. Architectural Principle: Preventing Leakage

Data leakage is one of the most important failure modes in biomedical
machine learning.

The pipeline should conceptually enforce:

``` text
Subject Split
     |
     +---- Training subjects
     |
     +---- Validation subjects
     |
     +---- Test subjects
```

Then transformations that learn parameters from data should be fitted
only on the training partition where applicable.

This ensures evaluation reflects unseen subjects.

------------------------------------------------------------------------

# 53. Model Lifecycle

A senior-level model lifecycle would be:

``` text
Dataset
   |
   v
Data validation
   |
   v
Subject split
   |
   v
Training preprocessing
   |
   v
Feature generation
   |
   v
Model training
   |
   v
Validation
   |
   v
Model selection
   |
   v
Final test evaluation
   |
   v
Model artifact
   |
   v
Deployment
   |
   v
Monitoring
```

The report documents the research stages through evaluation, while
production deployment and monitoring are future engineering
considerations.

------------------------------------------------------------------------

# 54. Testing Strategy

The report does not provide a software test suite, so a senior
implementation should distinguish several test levels.

## 54.1 Unit tests

Test individual mathematical components:

-   filter configuration,
-   epoch generation,
-   band-power extraction,
-   Hjorth calculations,
-   feature normalization,
-   metric calculations.

## 54.2 Data tests

Verify:

-   expected sampling rate,
-   expected channel count,
-   absence of invalid values,
-   expected epoch dimensions,
-   valid labels.

## 54.3 Pipeline tests

Given a small known EEG fixture:

``` text
raw EEG
 -> filter
 -> ICA
 -> epoch
 -> feature extraction
```

verify output shapes and basic numerical properties.

## 54.4 Model tests

Verify:

-   input dimensionality,
-   output dimensionality,
-   deterministic inference under fixed conditions,
-   saved model can be reloaded.

## 54.5 Evaluation tests

Verify metric calculations independently of the model implementation.

------------------------------------------------------------------------

# 55. Performance Considerations

The report focuses primarily on classification accuracy and does not
provide detailed runtime benchmarks.

For real-time deployment, additional metrics would be required:

-   preprocessing latency,
-   feature-extraction latency,
-   inference latency,
-   memory usage,
-   CPU/GPU utilization,
-   energy consumption,
-   network bandwidth,
-   end-to-end latency.

A model that achieves high accuracy but cannot run within the required
time or energy budget may not be suitable for a wearable device.

------------------------------------------------------------------------

# 56. Security and Privacy Considerations

EEG is sensitive physiological data.

A real deployment should therefore consider:

-   encryption in transit,
-   encryption at rest,
-   authentication,
-   authorization,
-   secure device pairing,
-   access control,
-   audit logging,
-   data minimization,
-   secure model distribution,
-   deletion/retention policies.

The research report does not claim these were implemented.

They become important when moving from a research prototype to a
healthcare product.

------------------------------------------------------------------------

# 57. Observability for Production

A production system should not only log whether the application is
running.

It should observe:

### System metrics

-   CPU usage,
-   memory,
-   battery,
-   network health,
-   processing latency.

### Data-quality metrics

-   missing samples,
-   abnormal amplitude,
-   channel dropout,
-   excessive artifacts,
-   sampling-rate mismatch.

### Model metrics

-   prediction distribution,
-   confidence distribution,
-   drift indicators,
-   performance when ground truth becomes available.

This is especially important because model failures can originate from
the data rather than from the neural network itself.

------------------------------------------------------------------------

# 58. Model Drift

A model trained on one population may encounter a different population
later.

This can cause **distribution shift**.

For example:

``` text
Training population
        |
        v
Model learns patterns
        |
        v
New population
        |
        v
Different signal distribution
        |
        v
Performance changes
```

Therefore, real deployment should monitor whether incoming EEG
characteristics differ significantly from training data.

------------------------------------------------------------------------

# 59. Why CNN and RNN Are Future Work

The report proposes CNN and RNN architectures.

### CNN

**Convolutional Neural Network**

CNNs are good at learning local patterns.

For EEG, this could potentially capture structured local patterns
across:

-   time,
-   channels,
-   transformed signal representations.

### RNN

**Recurrent Neural Network**

RNNs are designed for sequential data.

They can model relationships over time.

The report proposes these as future work rather than claiming that the
current system implemented them.

------------------------------------------------------------------------

# 60. Why Multimodal Integration?

Future work proposes combining EEG with:

### ECG

**Electrocardiography**

Measures electrical activity of the heart.

### GSR

**Galvanic Skin Response**

Measures changes associated with skin conductance.

The rationale is that mental state can influence multiple physiological
systems.

A future system could therefore combine:

``` text
EEG
 |
 +----+
      |
ECG --+--> Multimodal Model --> Prediction
      |
GSR --+
```

The current report does not provide experimental results for this
multimodal system.

------------------------------------------------------------------------

# 61. Longitudinal Monitoring

Longitudinal monitoring means observing changes over time.

Instead of asking:

> "What is the classification today?"

a future system could ask:

> "How is the signal and predicted state changing over weeks or months?"

This is especially relevant for monitoring treatment response.

The report lists longitudinal monitoring as future work.

------------------------------------------------------------------------

# 62. Clinical Validation

Clinical validation is different from ordinary machine-learning testing.

A research test set asks:

> "Does the model generalize to unseen data?"

Clinical validation asks much broader questions:

-   Does it work on the intended population?
-   Does it work across hospitals?
-   Does it work with different devices?
-   Does it improve clinical decision-making?
-   What are the consequences of false positives?
-   What are the consequences of false negatives?
-   Does it maintain performance across demographic groups?

The report identifies prospective clinical studies as future work.

------------------------------------------------------------------------

# 63. Research Contribution

The report describes several contributions.

## Contribution 1

A unified pipeline for multiple-disorder classification.

## Contribution 2

Combination of traditional feature engineering with neural networks.

## Contribution 3

Robust preprocessing for EEG artifacts.

## Contribution 4

IoT-oriented system architecture.

## Contribution 5

Comparative evaluation of multiple machine-learning models.

## Contribution 6

Identification of potentially discriminative EEG features.

------------------------------------------------------------------------

# 64. References and Scientific Foundation

The report cites prior research on:

-   deep convolutional neural networks for EEG analysis,
-   ADHD EEG classification,
-   schizophrenia classification,
-   autism-spectrum-disorder classification,
-   hybrid CNN-LSTM approaches,
-   Independent Component Analysis,
-   Welch spectral estimation.

Important terminology:

### CNN

Convolutional Neural Network

### LSTM

Long Short-Term Memory

LSTM is a recurrent neural-network architecture designed to model
sequential dependencies.

The report references these techniques primarily as prior work and/or
future directions rather than as the core current architecture.

------------------------------------------------------------------------

# 65. What the Project Actually Demonstrates

The strongest defensible conclusion is:

> An EEG preprocessing, feature-engineering, and machine-learning
> pipeline can classify five mental-health categories in the reported
> experimental setting, and the tested MLP produced the highest reported
> average performance at 88.2% accuracy.

It does **not** demonstrate that:

-   the model is clinically approved,
-   the model replaces diagnosis,
-   the model works universally,
-   the model is ready for hospital deployment,
-   the model is already running on a wearable device,
-   the model works equally well across all populations.

Keeping these boundaries clear is essential.

------------------------------------------------------------------------

# 66. Senior-Level Architectural Review

## 66.1 What is strong

### Strong preprocessing pipeline

Filtering and ICA explicitly address common EEG contamination.

### Good representation strategy

The project combines time-domain and frequency-domain information.

### Model comparison

Multiple algorithms are compared instead of presenting one arbitrary
model.

### Subject-wise validation

This directly addresses an important biomedical ML leakage risk.

### Interpretable features

Frequency bands and Hjorth parameters have understandable signal-level
meanings.

### Future-oriented architecture

The system is designed with eventual IoT and real-time deployment in
mind.

------------------------------------------------------------------------

# 67. What Would Need Improvement for Production

The research report identifies several of these issues itself.

A production-grade version would need:

1.  Larger datasets.
2.  More diverse subjects.
3.  Multi-center validation.
4.  Real-world/wearable EEG data.
5.  Formal clinical validation.
6.  More advanced model experimentation.
7.  Strong privacy/security controls.
8.  Model versioning.
9.  Data-quality monitoring.
10. Model-drift monitoring.
11. Reproducible experiment tracking.
12. Runtime and resource benchmarking.
13. Robust failure handling.
14. Clear clinical interpretation and human oversight.

These are not claims about missing code; they are the engineering
requirements that arise when moving from research toward production.

------------------------------------------------------------------------

# 68. Recommended Repository Structure for a Production Implementation

The report does not specify a repository structure. If this project were
being organized as a senior software project, a reasonable separation
would be:

``` text
iot-healthcare-ml/
|
+-- README.md
+-- Research.md
+-- pyproject.toml
+-- requirements.txt
|
+-- data/
|   +-- raw/
|   +-- interim/
|   +-- processed/
|   +-- metadata/
|
+-- src/
|   +-- acquisition/
|   +-- preprocessing/
|   |   +-- filtering.py
|   |   +-- ica.py
|   |   +-- epoching.py
|   |
|   +-- features/
|   |   +-- frequency.py
|   |   +-- time_domain.py
|   |   +-- hjorth.py
|   |
|   +-- models/
|   |   +-- logistic_regression.py
|   |   +-- random_forest.py
|   |   +-- svm.py
|   |   +-- mlp.py
|   |
|   +-- training/
|   +-- evaluation/
|   +-- inference/
|   +-- config/
|
+-- tests/
|   +-- unit/
|   +-- integration/
|   +-- data/
|
+-- experiments/
|   +-- configs/
|   +-- results/
|   +-- notebooks/
|
+-- models/
|   +-- checkpoints/
|   +-- exported/
|
+-- docs/
|
+-- deployment/
|   +-- edge/
|   +-- cloud/
|   +-- monitoring/
|
+-- scripts/
```

**Important:** this is a recommended engineering organization, not the
repository structure documented in the research PDF.

------------------------------------------------------------------------

# 69. Why This Repository Structure?

## `data/`

Keeps data separate from source code.

This prevents accidental mixing of raw and processed datasets.

## `src/preprocessing/`

Separates signal-cleaning logic.

## `src/features/`

Keeps feature calculations independent of model code.

## `src/models/`

Allows different algorithms to implement a common prediction interface.

## `src/training/`

Contains training orchestration.

## `src/evaluation/`

Keeps metric computation and evaluation logic separate.

## `tests/`

Makes signal-processing and ML behavior testable.

## `experiments/`

Separates research experimentation from reusable application code.

## `models/`

Stores trained artifacts rather than embedding them inside source code.

## `deployment/`

Separates deployment concerns from research logic.

This follows separation of concerns and makes future model replacement
easier.

------------------------------------------------------------------------

# 70. Recommended Pipeline Interfaces

A production implementation could conceptually expose interfaces like:

``` text
RawEEG
   |
   v
Preprocessor
   |
   v
CleanEEG
   |
   v
EpochGenerator
   |
   v
EEGEpoch[]
   |
   v
FeatureExtractor
   |
   v
FeatureVector[]
   |
   v
Classifier
   |
   v
Prediction[]
```

The benefit is that each stage can be tested independently.

For example, the feature extractor should not need to know whether the
classifier is:

-   Logistic Regression,
-   Random Forest,
-   SVM,
-   MLP.

------------------------------------------------------------------------

# 71. Failure Modes

A senior engineer should explicitly think about failure.

## Acquisition failures

-   missing channel,
-   disconnected electrode,
-   invalid sampling rate,
-   corrupted file.

## Signal failures

-   excessive artifacts,
-   saturation,
-   flatline,
-   unexpected amplitude.

## Preprocessing failures

-   filter configuration error,
-   ICA convergence problem,
-   insufficient data.

## Feature failures

-   NaN values,
-   infinite values,
-   unexpected dimensions.

## Model failures

-   incorrect input dimensions,
-   missing model artifact,
-   incompatible model version.

## Deployment failures

-   lost connectivity,
-   low battery,
-   insufficient compute,
-   unavailable inference service.

The system should fail safely rather than silently producing a medically
misleading result.

------------------------------------------------------------------------

# 72. Reproducibility Checklist

A research-grade run should record:

``` text
[ ] Dataset version
[ ] Subject IDs
[ ] Split strategy
[ ] Sampling rate
[ ] Filter range
[ ] Filter type
[ ] ICA configuration
[ ] Epoch length
[ ] Frequency-band definitions
[ ] Feature list
[ ] SMOTE configuration
[ ] Model architecture
[ ] Optimizer
[ ] Learning rate
[ ] Early-stopping configuration
[ ] Random seed
[ ] Training duration
[ ] Validation metrics
[ ] Test metrics
[ ] Model artifact
```

The report documents many of these parameters, but not every item in
this checklist.

------------------------------------------------------------------------

# 73. Interview Explanation --- 30 Seconds

> I worked on an EEG-based healthcare research system for classifying
> five mental-health conditions. The pipeline starts with EEG
> acquisition, followed by preprocessing using a 0.5--45 Hz FIR bandpass
> filter and Independent Component Analysis to remove artifacts such as
> eye blinks and muscle activity. We segmented the signals into 2-second
> epochs and extracted frequency-domain features such as delta, theta,
> alpha, beta and gamma band power, along with time-domain features such
> as Hjorth parameters and statistical features. We compared Logistic
> Regression, Random Forest, Support Vector Machine and a Multilayer
> Perceptron. The MLP achieved the best average accuracy of 88.2%.

------------------------------------------------------------------------

# 74. Interview Explanation --- 2 Minutes

> The problem we were addressing was whether EEG signals could provide
> useful objective information for automated classification of
> mental-health conditions. We focused on ADHD, anxiety, autism-spectrum
> disorder, depression and schizophrenia.
>
> The first stage was EEG acquisition. EEG, or Electroencephalography,
> measures electrical activity from electrodes placed on the scalp. Raw
> EEG cannot directly be given to a machine-learning model because it
> contains artifacts such as eye blinks, muscle activity and
> low-frequency drift.
>
> Therefore, we first applied a 0.5--45 Hz FIR bandpass filter. We then
> used Independent Component Analysis to separate the mixed EEG signal
> into components and remove components associated with artifacts. After
> cleaning, we divided the continuous signal into 2-second epochs. Since
> the sampling rate was 256 Hz, each epoch contained 512 samples.
>
> We then performed feature engineering in both the frequency and time
> domains. Frequency-domain features included power in the delta, theta,
> alpha, beta and gamma bands. Time-domain features included Hjorth
> activity, mobility and complexity, as well as statistical and
> nonlinear features.
>
> For classification, we compared Logistic Regression, Random Forest,
> Support Vector Machine with an RBF kernel, and a Multilayer Perceptron
> neural network. We used a 70-15-15 train-validation-test split and
> subject-wise splitting to reduce data leakage.
>
> The MLP achieved the best average performance, with 88.2% accuracy,
> 0.87 precision, 0.87 recall and 0.87 F1-score. Schizophrenia had the
> highest individual accuracy at 90.8%.
>
> However, I would consider the system a research prototype rather than
> a clinically deployable product. Larger datasets, multi-center
> validation, real-world wearable EEG testing and formal clinical
> validation would be necessary before deployment.

------------------------------------------------------------------------

# 75. Hard Interview Questions and Strong Answers

## Q: Why not simply feed raw EEG into a neural network?

**Answer:**

> Raw EEG contains artifacts and a large amount of signal variation.
> Preprocessing reduces irrelevant components, while engineered features
> provide structured information that can make learning easier. A
> raw-signal deep-learning approach is possible, but it was not the
> architecture evaluated in this report.

## Q: Why did you use ICA?

**Answer:**

> ICA separates statistically independent components from mixed
> multichannel EEG. This makes it possible to identify components
> associated with artifacts such as eye blinks and muscle activity and
> remove them before reconstruction.

## Q: Why not use only frequency features?

**Answer:**

> Frequency features describe spectral information, but they don't
> completely describe how the signal evolves over time. Time-domain
> features provide complementary information, so combining both gives
> the classifier a richer representation.

## Q: Why subject-wise splitting?

**Answer:**

> Because one subject can produce many epochs. Randomly distributing
> epochs could place samples from the same person in both training and
> testing, causing data leakage. Subject-wise splitting gives a more
> realistic estimate of generalization to unseen subjects.

## Q: Why did MLP outperform Random Forest?

**Answer:**

> In this experiment, the MLP was better able to model the complex
> non-linear relationships in the engineered EEG feature space. I would
> not generalize that neural networks are always superior; the reported
> result is specific to this dataset and experimental setup.

## Q: Is 88.2% accuracy clinically sufficient?

**Answer:**

> No conclusion like that should be made from this experiment alone. The
> result is promising, but clinical deployment requires larger and more
> diverse datasets, external validation, prospective clinical studies,
> and evaluation of false-positive and false-negative consequences.

## Q: What is the biggest weakness of the project?

**Answer:**

> The main limitation is generalization. The dataset size and diversity
> are limited, and laboratory recordings may not fully represent
> real-world wearable EEG. I would prioritize multi-center, diverse and
> real-world validation.

## Q: What would you improve first?

**Answer:**

> I would first improve the dataset and validation strategy rather than
> immediately making the neural network more complicated. Larger
> multi-center data and external subject-level validation would provide
> stronger evidence of generalization. After that I would benchmark CNN
> and RNN architectures and evaluate real-time deployment constraints.

------------------------------------------------------------------------

# 76. Technical Glossary

  -----------------------------------------------------------------------
  Term                                Meaning
  ----------------------------------- -----------------------------------
  EEG                                 Electroencephalography; records
                                      electrical brain activity

  IoT                                 Internet of Things; connected
                                      physical devices

  ML                                  Machine Learning

  DL                                  Deep Learning

  AI                                  Artificial Intelligence

  ADHD                                Attention-Deficit/Hyperactivity
                                      Disorder

  ASD                                 Autism Spectrum Disorder

  ICA                                 Independent Component Analysis

  FIR                                 Finite Impulse Response

  PSD                                 Power Spectral Density

  MLP                                 Multilayer Perceptron

  SVM                                 Support Vector Machine

  RBF                                 Radial Basis Function

  SMOTE                               Synthetic Minority Over-sampling
                                      Technique

  ReLU                                Rectified Linear Unit

  CNN                                 Convolutional Neural Network

  RNN                                 Recurrent Neural Network

  LSTM                                Long Short-Term Memory

  ECG                                 Electrocardiography

  GSR                                 Galvanic Skin Response

  MDD                                 Major Depressive Disorder

  Hz                                  Hertz

  F1-score                            Harmonic mean of precision and
                                      recall

  Artifact                            Unwanted signal contamination

  Epoch                               Fixed-length segment of a
                                      continuous signal

  Feature                             Numerical representation of useful
                                      signal information

  Sampling rate                       Number of samples recorded per
                                      second

  Band power                          Signal power within a frequency
                                      range

  Generalization                      Ability to perform on unseen data

  Data leakage                        Information from evaluation data
                                      unintentionally influencing
                                      training

  Overfitting                         Learning training-specific patterns
                                      that do not generalize

  Regularization                      Technique used to reduce
                                      overfitting

  Optimizer                           Algorithm that updates model
                                      parameters during training

  Learning rate                       Step size used during parameter
                                      updates
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 77. Final Architecture Summary

The project can be summarized as a layered system:

``` text
                    HEALTHCARE APPLICATION
                            |
                            v
                     Classification
                            |
                +-----------+-----------+
                |           |           |
                v           v           v
              LR          RF          MLP
                            |
                           SVM
                \           |           /
                 +----------+----------+
                            |
                            v
                    Feature Extraction
                     /              \
                    /                \
                   v                  v
          Frequency Domain       Time Domain
                Features             Features
                    \                /
                     \              /
                      v            v
                         Epoching
                            |
                            v
                           ICA
                            |
                            v
                    Bandpass Filter
                            |
                            v
                       Raw EEG Data
                            |
                            v
                     Data Acquisition
```

Where:

-   **LR** = Logistic Regression
-   **RF** = Random Forest
-   **SVM** = Support Vector Machine
-   **MLP** = Multilayer Perceptron

The reported best result is:

``` text
MLP
 |
 +-- Accuracy  = 88.2%
 +-- Precision = 0.87
 +-- Recall    = 0.87
 +-- F1-score  = 0.87
```

------------------------------------------------------------------------

# 78. Final Engineering Conclusion

This project is fundamentally an **end-to-end biomedical
signal-processing and machine-learning pipeline**.

Its engineering story is:

``` text
Problem
  |
  v
EEG provides objective physiological signal
  |
  v
Raw EEG is noisy
  |
  v
Preprocess it
  |
  +--> Bandpass filter
  |
  +--> ICA artifact removal
  |
  v
Create consistent 2-second epochs
  |
  v
Extract meaningful features
  |
  +--> Frequency domain
  |
  +--> Time domain
  |
  v
Compare multiple classifiers
  |
  v
MLP performs best in this experiment
  |
  v
88.2% average accuracy
  |
  v
Promising research result
  |
  v
Requires larger real-world and clinical validation
before production healthcare deployment
```

The most important senior-level takeaway is that the **model is only one
part of the system**.

The quality of the final prediction depends on the entire chain:

``` text
Data quality
     +
Preprocessing
     +
Artifact handling
     +
Feature engineering
     +
Leakage prevention
     +
Model architecture
     +
Validation methodology
     =
Trustworthy result
```

That is the correct way to present this work to a senior software
engineer, ML engineer, researcher, or interviewer.

------------------------------------------------------------------------

# 79. Source Boundary

This document is based primarily on the supplied `Research.pdf`,
including its text, tables, equations, diagrams, reported metrics,
limitations, and future-work section.

Where the report explicitly states an implementation detail, this
document presents it as part of the project.

Where the report does **not** specify a software/deployment detail, this
document labels the discussion as a recommended engineering design
rather than silently presenting it as implemented fact.

This distinction should be preserved in interviews and technical
documentation.
