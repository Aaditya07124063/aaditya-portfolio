# EEG case-study copy

Route: `/projects/eeg`. Sources: the detailed report reconstruction in `IoT-Based_Healthcare_System_using_Machine_Learning(1).md` and the internship association in `PROJECT_PORTFOLIO_FOCUSED.md`. Confirm personal role and task definition before publication.

## Public copy

<!-- public-copy:start -->

# EEG signal-processing research

A pipeline that cleans EEG recordings, turns them into numerical features, and compares four classifiers.

Summer research internship project at NIT Rourkela. This is a research pipeline evaluated on recorded datasets. It isn't a wearable device, and it isn't a diagnostic tool.

## Cleaning comes before modeling

Raw EEG records more than brain activity. Eye blinks, muscle movement, slow drift, and high-frequency noise all end up in the signal, and a classifier will learn from whatever it's given. The report puts a good deal of its effort into getting the signal into shape before any model sees it.

The pipeline applies a 0.5 to 45 Hz band-pass filter. It then runs independent component analysis, which separates the recording into components so the ones linked to blinks and muscle activity can be removed. The report says this rejected about 1.3 components per recording on average. Filtering comes first, which gives the decomposition a cleaner input. The report doesn't test other orderings.

The cleaned recording is cut into two-second epochs. At the 256 Hz sampling rate the report uses, each epoch holds 512 samples per channel.

## Two views of the same signal

Each epoch becomes a vector of features from two families. Frequency features measure power in the delta, theta, alpha, beta, and gamma bands with Welch's method, which shows which rhythms are strong. Time-domain features describe how the waveform behaves. They include the three Hjorth parameters, basic statistics such as variance and kurtosis, and two nonlinear measures, sample entropy and the Hurst exponent. The report treats the two families as complementary.

Four classifiers work on those features. They are logistic regression with L2 regularization, a 100-tree random forest, an SVM with an RBF kernel, and a small multilayer perceptron with hidden layers of 128 and 64 units. The simple models act as baselines. If the network can't beat them, its extra capacity isn't buying anything.

The datasets cover ADHD, anxiety, autism spectrum disorder, depression, and schizophrenia, with healthy controls included. These are experimental classification tasks, and the report doesn't claim clinical validation.

## Keeping one person's epochs together

A single recording yields hundreds of epochs. Split those at random and one person's epochs land in both training and testing, which lets a model learn the person instead of the condition. The report splits by subject, with 70% for training, 15% for validation, and 15% for testing, so the test subjects are people the model has never seen. It doesn't say which subjects went where.

## Why this page doesn't quote an accuracy

The report names the MLP as the strongest of the four in its own comparison. This page still leaves out the accuracy figures, because two details are unresolved.

The first is the task itself. The report gives results per condition and a healthy-versus-depression confusion matrix, but it doesn't spell out how the labels were built for each condition or whether each condition was its own binary problem. A number means little without that.

The second is oversampling. The report used SMOTE to balance the classes, which creates synthetic examples by interpolating between real ones. Done before the subject split, it would let synthetic samples derived from test subjects leak into training and undo the point of splitting by subject. The report doesn't say which order it used.

Context matters too. The recordings came from controlled laboratory settings, with 5, 11, or 19 channels depending on the condition. A consumer wearable has different electrodes, more motion, and different people. The report names these limits itself, along with small datasets for some conditions and little study of demographic differences.

## What a wearable would need

The report treats wearable and real-time use as future work, along with CNNs, RNNs, and combining EEG with other signals. None of that was built or evaluated. Moving the pipeline onto a device would mean measuring latency, memory, energy use, and signal quality on the real hardware. That's a separate validation stage from the classifier comparison.

[Next project: LogstoneDB](/projects/logstonedb) · [All projects](/projects)

<!-- public-copy:end -->

## Claim boundaries

Editorial. Do not publish this section.

| Public statement | Source basis | Do not say |
|---|---|---|
| Five conditions, four classifiers, MLP strongest in the report's comparison | Source sections 1, 17, 34 | Any accuracy, precision, recall, or F1 figure. The 88.2% is an average across conditions, not a five-class diagnosis accuracy |
| Task formulation unclear | Source sections 21, 34, 35, 36 | That the work is five-class, or five separate binary tasks. A sigmoid output alone doesn't settle it |
| SMOTE used, order relative to the split unknown | Source section 26.2 | That SMOTE was applied only to the training set |
| Subject-wise 70/15/15 split, assignments unspecified | Source sections 23, 25 | That the split is leak-free |
| Wearable use, CNNs, RNNs, multimodal signals are future work | Source sections 45, 59, 60 | Real-time detection, continuous monitoring, or an implemented CNN or RNN |
| Internship at NIT Rourkela | Source section 1, consolidation section 6 | Dates, a supervisor, or a role, until Aaditya confirms them |

`PROJECT_PORTFOLIO_FOCUSED.md` describes three conditions and real-time work with CNNs and RNNs. The detailed report covers five conditions and evaluates classical models and an MLP. This page follows the report. The report's data sources include a motor-imagery set and an emotion set alongside hospital and lab recordings, so confirm how each condition's data was assembled before publishing any dataset detail.

## Asset and publication notes

Use a processing diagram with a caption that identifies it as the documented research method. Do not depict a live wearable dashboard or claim continuous monitoring. Do not publish the 88.2% reported average without confirming the original report, its label formulation, and its averaging method. The public draft intentionally leaves it out.
