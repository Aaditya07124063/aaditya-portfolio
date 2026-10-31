# Metadata and shared interface copy

Editorial specification. Metadata below is proposed copy, not configured website behavior.

## Page metadata

| Route | Browser title | Description |
|---|---|---|
| `/` | Aaditya Adhikari · Software and research | Software and applied research by Aaditya Adhikari, including offline communication, quantitative evaluation, and biomedical machine learning. |
| `/about` | About · Aaditya Adhikari | Aaditya's interests, research experience, and approach to software systems and machine-learning evaluation. |
| `/projects` | Work · Aaditya Adhikari | Explore the methods, decisions, and limitations behind Aaditya Adhikari's software projects and research studies. |
| `/projects/resqnet` | ResQNet — AI-Powered Offline Emergency Communication System — Aaditya Adhikari | ResQNet is an AI-powered offline emergency communication system by Aaditya Adhikari, exploring SOS messaging and nearby-device communication without relying on the internet. |
| `/projects/trading-lab` | Trading Lab — Quantitative Finance Research Platform — Aaditya Adhikari | Trading Lab is Aaditya Adhikari’s quantitative finance research platform for testing trading signals, execution assumptions, benchmarks, costs, and reproducibility. |
| `/projects/pancreatic-ct` | Pancreatic Tumor Classification Using CT Images — Aaditya Adhikari | Research by Aaditya Adhikari on pancreatic tumor classification using CT images, with emphasis on duplicate auditing, patient-level evaluation, and data leakage. |
| `/projects/eeg` | EEG-Based Mental Health Research Using Deep Learning — Aaditya Adhikari | EEG-based machine learning research by Aaditya Adhikari covering signal preprocessing, feature extraction, and classifier comparison with subject-level evaluation. |
| `/projects/logstonedb` | LogstoneDB — Distributed Database in Go — Aaditya Adhikari | LogstoneDB is Aaditya Adhikari’s Go database research project exploring Raft, deterministic simulation, replicated state, and distributed-system failure testing. |
| `/writing` | Writing · Aaditya Adhikari | Technical notes on software systems, experiments, and evaluation. |
| `/contact` | Contact · Aaditya Adhikari | Find Aaditya Adhikari's public GitHub profile and contact links. |
| Unmatched route | Page not found · Aaditya Adhikari | This page could not be found. Browse the projects or return to the homepage. |

## Search and sharing rules

Set the document language to English. Use the real production domain for canonical URLs only after a domain is selected. Keep private drafts out of the sitemap and mark them noindex. Include only published routes in the sitemap; never include the 404 page.

Use the page title and description for social previews. Add an actual approved share image before declaring an image URL. Do not invent an absolute domain, image URL, publication date, or social handle.

If structured data is added, limit Person fields to confirmed name and verified profile links. Omit education, job titles, employer, awards, and publications without evidence. Do not mark drafts as published scholarly articles.

## Shared interface strings

| Location or state | Copy | Behavior |
|---|---|---|
| Wordmark | Aaditya Adhikari | Link to home |
| Skip link | Skip to content | Move to main content |
| Navigation | Work · About · Contact | Add Writing only once an article is published |
| Footer profile | GitHub | Open the supplied profile |
| Footer contact | Contact | Link to `/contact` |
| Copyright | Copyright {year} Aaditya Adhikari | Substitute the actual launch year |
| Case-study return | All projects | Link to `/projects` |
| Missing optional repository or demo | No rendered label | Omit the control rather than disabling it |
| Optional CV link | Download CV | Render only with a reviewed, accessible PDF |
| Image unavailable | No fabricated replacement | Preserve useful text and caption only if the caption still makes sense |
| Empty writing page | There are no published articles here yet. | Link to project case studies |
| Unexpected page error | This page couldn't load. Try again, or return to the homepage. | Only add if the eventual framework needs an error boundary |
| Retry action | Try again | Retry a failed page operation |

Do not add loading to static content. Reserve image dimensions when assets exist. An external link should identify its destination; do not force new tabs by default. If a new tab is needed, communicate that behavior accessibly.
