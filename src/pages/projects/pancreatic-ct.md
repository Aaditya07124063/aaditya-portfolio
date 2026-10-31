---
layout: "../../layouts/Article.astro"
title: "Pancreatic CT research · Aaditya Adhikari"
description: "A research case study on duplicate auditing, patient-group evaluation, and interpreting medical-imaging benchmark results."
project: "pancreatic-ct"
caption: "Illustrative patient grouping. All slices from a patient stay in a single evaluation partition."
---

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

## What the report leaves open

The report lists its test patients by number, and the same numbers appear under both classes. It isn't clear whether patient IDs are unique across the whole dataset, which matters for confirming that the grouping did what the report says.

Other details are missing, including the dataset name, the preprocessing, hyperparameters such as the number of neighbors in KNN, and how many patients sat in each partition. Five seeds measure variation between runs. They aren't an external validation, and nothing in the report speaks to a different hospital, scanner, or population.

The most useful next step is a reproducibility package with split manifests and a separate evaluation set. More model comparisons wouldn't fix missing evidence about the evaluation itself.

[Next project: EEG research](/projects/eeg) · [All projects](/projects)
