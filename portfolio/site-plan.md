# Portfolio structure and layout

This is a proposed design brief, not an existing brand system. It assumes the first audience is an engineering recruiter or technical collaborator, with research readers as a second audience. No audience preference was supplied.

## What the site needs to communicate

Aaditya works on software and applied research. The strongest connection between the projects is attention to failure conditions and evaluation: communication without normal connectivity, trading tests with realistic assumptions, and biomedical models evaluated on unseen people.

Use that connection to select and order the work. Avoid a homepage that lists every language or every future interest. A visitor should understand the work, open a case study, and find a contact route without navigating a résumé database.

## Routes and content

| Route | Content file | Main job | Launch rule |
|---|---|---|---|
| `/` | `pages/home.md` | Introduce Aaditya and lead into selected work | Core page |
| `/about` | `pages/about.md` | Explain interests and working approach | Core page |
| `/projects` | `pages/projects.md` | Show all selected work and status | Core page |
| `/projects/resqnet` | `case-studies/resqnet.md` | Explain the documented offline-communication prototype | Confirm version and contribution |
| `/projects/trading-lab` | `case-studies/trading-lab.md` | Explain the daily research engine and later protocol | Confirm current status |
| `/projects/pancreatic-ct` | `case-studies/pancreatic-ct.md` | Explain evaluation and leakage controls | Confirm report and contribution |
| `/projects/eeg` | `case-studies/eeg.md` | Explain the documented signal-processing research | Confirm internship and task definition |
| `/projects/logstonedb` | `case-studies/logstonedb.md` | Describe an early database project without overclaiming | Confirm it is still active |
| `/writing` | `pages/writing.md` | Host approved technical articles | Empty page copy supplied; omit from main nav until an article exists |
| `/contact` | `pages/contact.md` | Provide a working way to reach Aaditya | GitHub route available from source; email optional |
| Unmatched URL | `pages/404.md` | Return the visitor to useful content | Render with HTTP 404 |

No separate research, experience, services, awards, or testimonials page is justified yet. Put the internship on About and link its case study. Add a CV download only when a reviewed PDF exists. Do not create empty routes for ideas.

## Shared frame

Use a text wordmark, `Aaditya Adhikari`, linked to `/`. Desktop navigation is Work, About, Contact. Work links to `/projects`. Add Writing between About and Contact when there is a published article. Mark the current page accessibly.

On mobile, keep the same short navigation visible and allow it to wrap. This avoids a menu and makes every route immediately available. The footer repeats the name, GitHub, and Contact. Use the actual launch year for the copyright line.

Include a skip link to main content. Use one page-level heading, logical heading order, ordinary anchors for navigation, and buttons only for actions. Every page ends with a useful next link.

## Visual direction

[The design brief](../design.md) governs illustration, typography, color, spacing, controls, and responsive behavior. Use its hand-drawn illustration, DM Sans, and warm paper palette. The earlier starting values have been removed to keep one visual specification.

The portfolio uses editorial rows, readable prose, and precise diagrams. Avoid terminal simulations, typing heroes, skill meters, decorative dashboards, and technology-logo grids. Keep the base composition still and respect reduced motion.

Check actual contrast, zoom, and responsive behavior in the eventual build. This Markdown handoff has not been accessibility-tested as a website.

## Home layout

1. Header.
2. Name, a one-sentence description, and two links. Keep the complete introduction visible before the project list on a normal desktop viewport.
3. Selected work as three full-width editorial rows. Each row has project name, one sentence, status, and one descriptive link. Order ResQNet, Trading Lab, pancreatic CT.
4. A short approach paragraph.
5. One line linking to EEG and the full project index.
6. Contact invitation and footer.

On large screens, project rows use a narrow title column and a wider description column. Stack them below roughly 760 px. If approved visuals become available, place one beside the relevant row. Do not add an empty image frame or an invented product screenshot.

## Project index layout

Start with the introduction. Show the four case studies as a vertical list with category and status. Put LogstoneDB under a separate `In progress` heading. There are too few entries to need filters, search, pagination, or a tag cloud.

Each row has exactly one case-study link. Repository and demo links belong inside the case study, where their version and purpose can be explained.

## Case-study layout

Use the same reading structure on every case study:

1. Title and summary.
2. Plain-text status and scope line.
3. Problem.
4. System or method.
5. Decision and reason.
6. Evidence or observations.
7. Limitations and next work.
8. Related project link.

A desktop side rail can hold a short contents list for long articles. On mobile, put that list above the article or omit it. Do not make the status rail so wide that the main copy becomes narrow.

Reserve an optional contribution line near the top. Populate it only after Aaditya supplies responsibilities and team details. Do not substitute `Founder`, `Lead engineer`, or `Solo developer` without evidence.

Use diagrams to explain the mechanism, not as decorative headers. Supply an adjacent text explanation and meaningful captions. Redraw permitted figures in a consistent style. An illustrative diagram must be labeled as illustrative, particularly if it depicts a planned state.

## About, writing, and contact layouts

About is a short introduction, working approach, research experience, and links to work. A portrait is optional. Skip an education timeline until the facts are confirmed.

Writing is a chronological list with title, date, and one-sentence description once articles exist. The article layout reuses the case-study reading width. Dates must be real publication dates. No fake article cards or made-up reading times.

Contact is a short paragraph and verified links. Start with GitHub. Add email when provided. A contact form would introduce delivery, validation, spam handling, and privacy work with no established need, so omit it.

## Writing guide

The supplied prose is strongest when it explains a concrete situation and follows it with a reason. Preserve that habit. Use first person for Aaditya's interests and confirmed responsibilities, which in the current copy means Home, About, Contact, and the project index. The case studies stay in neutral third person ("the prototype", "the report") until ownership is known. They can still hold a view. They say which choice was right and why, and they say when a result is too thin to rely on.

Write `The prototype relays messages between connected nearby devices` instead of `A revolutionary platform transforming disaster response`. A case study should explain what a decision changes for the system. Avoid claiming that every choice was deliberate when the source only offers a later explanation.

Use contractions naturally. Vary sentence length. Explain a term the first time a general technical reader needs it. Keep the implementation detail that makes the decision understandable and remove tutorial definitions that interrupt the story.

Do not use achievement counters, unsupported superlatives, generic passion statements, invented personal anecdotes, or stock conclusions. Keep current scope close to any capability claim. A planned capability uses future or proposal language.

No actual blog corpus is supplied. The copy follows the conversational, mechanism-first qualities in the available files, but an exact match to Aaditya's established blog voice still needs actual posts.

## Assets to prepare

| Page | Useful asset | Acceptable fallback |
|---|---|---|
| Home | One approved image of real work | Text-only project rows |
| ResQNet | Real prototype screen and a relay diagram | Labeled conceptual relay diagram |
| Trading Lab | Equity and benchmark chart with dates and assumptions | Pipeline diagram without performance claims |
| CT research | Patient split diagram and approved benchmark table | Split diagram only |
| EEG | Signal-processing diagram | Text pipeline |
| About | Approved portrait | No portrait |
| Social sharing | Name and project title on a simple image | Site-wide name card |

Never use patient scans or identifiable medical data without documented rights and de-identification. Do not expose deployment paths, credentials, exact personal locations, or private repository details in screenshots.
