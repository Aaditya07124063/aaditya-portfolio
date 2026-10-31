# Pancreatic CT case-study copy

Route: `/projects/pancreatic-ct`. Source: the research-report reconstruction in `pancreatic_tumor_classification(1).md`. Results below are attributed to that record, not independently reproduced. Confirm report, contribution, and dataset provenance before publication.

## Public copy

<!-- public-copy:start -->

# Pancreatic CT research

A benchmark of medical-imaging models that asks how much of a high accuracy score comes from the model and how much from the way the data was split.

Research study on classifying CT slices as normal or tumor. It isn't a diagnostic product, and nothing here is clinically validated.

## A CT scan is a stack of near-duplicates

One patient's scan produces many neighboring slices that show almost the same anatomy. If those slices are split at random between training and testing, the test set contains images that look a lot like images the model has already seen. The model can score well by recognizing a patient's anatomy without learning anything that carries over to a new patient.

The study compares two ways of splitting. One divides slices at random. The other assigns whole patients to training, validation, or testing, so every test patient is new to the model. The study also checks for exact duplicate files that ended up on both sides of a split.

## Separating the representation from the classifier

The benchmark uses four image backbones. ResNet-50, InceptionV3, MobileViT, and Swin Transformer each turn a slice into a feature vector. Nine classifiers then work on those vectors. They are an SVM, a random forest, KNN, XGBoost, AdaBoost, bagging, a dense neural network, an LSTM, and a bidirectional LSTM. That makes 36 pipelines, and each one runs with five random seeds.

The split keeps the question clean. With one end-to-end network, a poor result could come from the representation, the classifier, or the training. With the two parts apart, the study can hold the ResNet features fixed and compare classifiers, or hold KNN fixed and compare backbones. The recurrent heads need a caveat. They read chunks of a feature vector as if it were a sequence, and the report doesn't show that this order means anything anatomically, so they're best seen as experimental heads.

## Two kinds of leakage need two checks

Content hashing finds files with identical bytes. The report says an MD5 audit removed 206 exact duplicate images. Hashing can't see a resized or recompressed copy, a near-identical neighboring slice, or two different slices from the same patient.

Patient grouping covers that last case by keeping all of a patient's slices in one partition. The two checks address different problems, and the report uses both. Neither proves that every route for leakage is closed.

## What the reported numbers say

The figures in this section come from the project's research report. They haven't been independently reproduced.

Under the random slice split, mean accuracy across all 36 pipelines was 99.91%. Under patient-group evaluation it was 79.05%. The report reads the 20.86-point drop as the effect of leakage, and it treats the first number as a demonstration of the problem, not a result to be proud of.

The best single configuration under patient-group evaluation was ResNet-50 features with KNN, at 98.60% test accuracy with a standard deviation of 1.30 points across five seeds. Swin Transformer with KNN followed at 98.37% with the same spread. Those are scores for single pipelines, not averages across all of them, which is why they sit so far above 79.05%. Many other pipelines scored lower, and some varied by tens of points between seeds.

Two cautions apply to the top of the table. The best of 36 pipelines is a selected number, so it may be optimistic about performance on new data. And the 0.23-point gap between first and second place is smaller than the run-to-run spread, so the ranking isn't evidence that one backbone is better.

## What the report leaves open

The report lists its test patients by number, and the same numbers appear under both classes. It isn't clear whether patient IDs are unique across the whole dataset, which matters for confirming that the grouping did what the report says.

Other details are missing, including the dataset name, the preprocessing, hyperparameters such as the number of neighbors in KNN, and how many patients sat in each partition. Five seeds measure variation between runs. They aren't an external validation, and nothing in the report speaks to a different hospital, scanner, or population.

The most useful next step is a reproducibility package with split manifests and a separate evaluation set. More model comparisons wouldn't fix missing evidence about the evaluation itself.

[Next project: EEG research](/projects/eeg) · [All projects](/projects)

<!-- public-copy:end -->

## Claim boundaries

Editorial. Do not publish this section.

| Public statement | Source basis | Do not say |
|---|---|---|
| 4 backbones, 9 heads, 36 pipelines, 5 seeds | Source sections 1, 4, 23, 24 | That the seeds were chosen or tuned for any reason |
| 206 exact duplicates removed by MD5 | Source section 7 | That all leakage is removed, or that near-duplicates were handled |
| 99.91% and 79.05% are system-wide means over all 36 pipelines | Source sections 9, 30, 31 | That either is a single model's accuracy |
| 98.60% ± 1.30 is ResNet-50 plus KNN under patient-group evaluation | Source section 31.1 | That it is the mean across pipelines, a clinical accuracy, or patient-level diagnostic accuracy |
| 98.37% ± 1.30 is Swin plus KNN; the gap is 0.23 points | Source sections 31, 33 | Statistical superiority of either |
| Patient IDs repeat across classes in the reported test patients | Source section 8.1 | That grouping is or isn't globally unique |

Secondary reported metrics (F1 98.63 ± 1.27, Cohen's kappa 94.58 for the top configuration, other rows of the ranking, per-pipeline standard deviations) stay out of the page. If a results chart is approved, label each figure with its evaluation regime and scope.

`aaditya-projects.md` mentions a stratified 80:10:10 split, a 50-epoch minimum, a supervisor, and an audit of a flawed Kaggle notebook. The report applies 80:10:10 to the slice-level split only and shows 100-epoch training curves. Public copy gives no epoch count, no supervisor, and no split ratio for the patient-group regime. `PROJECT_PORTFOLIO_FOCUSED.md` positions the MobileViT, ResNet-50, and Swin comparison as a separate project. This page treats it as the same benchmark.

## Asset and publication notes

Use an illustrative patient-split diagram, with all samples for a patient visibly kept together. If a result chart is approved, label the two system-wide means separately from the best individual configuration. Do not label slice accuracy as patient-level diagnostic accuracy. Keep the numerical section unpublished if the original report cannot be confirmed. Never publish patient scans without documented rights and de-identification.
