# Launch checklist and review record

Editorial document. Content drafting is complete; publication readiness still depends on personal confirmation and primary evidence. This folder does not build or deploy a website.

## Needed from Aaditya

| Item | Why it matters | Safe default until supplied |
|---|---|---|
| Preferred public email | Provides a direct contact route | Keep the supplied GitHub profile link; do not promise private messaging |
| Institution, degree, graduation year, location | Personal biography | Omit, since the supplied biography belongs to someone else |
| Current role and availability | Prevents stale hiring claims | Omit |
| Individual role and team credits for each project | Establishes honest contribution claims | Neutral project descriptions; no sole-author or lead-role claims |
| Current ResQNet repository and commit | Resolves three stack records and current limitations | Explicitly cover the documented Flutter prototype |
| Current Trading Lab revision and research stage | Distinguishes August engine from October protocol | Preserve the historical boundary and draft status |
| Original CT report, data provenance, split manifests, result artifacts | Supports numerical claims and patient separation | Withhold numerical section if evidence is unavailable |
| Original EEG report and internship confirmation | Clarifies tasks, labels, dataset mapping, oversampling, and role | Keep numerical performance claims out |
| LogstoneDB progress and public repository permission | Avoids describing an old stage as current | Withhold note if no longer active |
| Project screenshots and figure rights | Makes visuals accurate and publishable | Text and labeled illustrative diagrams |
| Two or three real blog posts | Establishes Aaditya's existing voice | Treat the current voice as provisional and claim no voice match |
| CV and LinkedIn | Enables optional professional links | Omit both controls |
| Portfolio domain | Enables canonical and share URLs | Do not generate fictional absolute URLs |

## Editorial checks before launch

- [ ] Confirm name spelling and GitHub ownership.
- [ ] Approve or rewrite each first-person interest statement on Home and About. They were drafted from the project record, not from Aaditya's own words.
- [ ] Decide how the LogstoneDB note describes Aaditya's role, given that the source says coding agents implement the specifications.
- [ ] Confirm project status labels against current records.
- [ ] Add a specific contribution line to each case study where evidence supports it.
- [ ] Resolve publication permission for research, team work, and client material.
- [ ] Check the original CT report before publishing its numerical section.
- [ ] Keep report-derived metrics labeled as reported, with their evaluation units and scope.
- [ ] Confirm EEG task formulation before introducing any accuracy number.
- [ ] Review current ResQNet claims against actual devices and the named build.
- [ ] Verify any external repository, demo, or profile link that will be rendered.
- [ ] Remove editorial instructions from public content during implementation.
- [ ] Omit unavailable links and draft article cards.
- [ ] Add real publication dates only to actual published articles.

## Implementation checks

These are acceptance criteria for the future website, not checks already performed on this Markdown handoff.

- [ ] Every approved route renders and every internal link reaches its intended page.
- [ ] A missing URL returns HTTP 404 and useful recovery links.
- [ ] Navigation, focus order, skip link, and all controls work with a keyboard.
- [ ] Text remains readable at 200% zoom and on a narrow mobile viewport.
- [ ] Normal text meets 4.5:1 contrast and large text meets 3:1.
- [ ] Diagrams have equivalent text, and screenshots have useful alternative text.
- [ ] No content depends on hover, color alone, or animation.
- [ ] Reduced-motion settings are respected if motion is introduced.
- [ ] No horizontal page overflow at 320 px, except an intentionally scrollable data table.
- [ ] Images have dimensions, sensible compression, and no private or patient information.
- [ ] Page titles, descriptions, canonical URLs, and share images match published content.
- [ ] Sitemap contains only published pages, and private drafts remain unindexed.
- [ ] Contact links work and no placeholder or nonfunctional form is visible.

## Review record

### Source pass

The seven original Markdown sources were examined before drafting public page copy. The audit identifies each source's purpose and separates reported implementation, proposed architecture, historical snapshots, and unrelated biography. Original source files were preserved.

### Rewrite pass (Sonnet 5.5)

The public copy in `pages/` and `case-studies/` was rewritten as technical blog prose. The first drafts read as an evidence audit. Nearly every sentence carried a qualifier such as "the documented", "the supplied record", or "does not establish". The rewrite keeps each limit but states it once, in the place where it matters, and spends the rest of the page on the problem, the mechanism, and the reasoning behind each choice. Each case study now follows the same arc as the `about_me.md` file the style was borrowed from (a concrete problem, how it works, why that choice, what still fails). Nothing else from that file is used.

What changed in the evidence handling:

- Editorial notes stay below the `Public copy` heading. Each of the four case studies gained a `Claim boundaries` section that lists each public statement, its source section, and what must not be said. That section is not public.
- ResQNet names the rule-based classifier as a keyword table and does not call it AI. It adds the documented naming and tiebreak defects, the foreground-only relay, the missing end-to-end protection, and the absence of recorded physical-device results. Different stacks across the records are described as separate checkpoints and are not merged.
- Trading Lab keeps the August 2026 snapshot and the later opening-range protocol apart, keeps ORB v1 as a draft, and drops the inconsistent derived drawdown percentage and the rounded margin. It adds the parameter-sweep, trailing-stop, and unmodeled-effects findings in prose, with no return figures.
- The CT page keeps the two system-wide means separate from the 98.60% best configuration, says the best of 36 is a selected number, and says the 0.23-point gap is inside the run-to-run spread. It adds the repeated patient numbers as an open question. It gives no epoch count, supervisor, or patient-group split ratio.
- The EEG page gives no accuracy figure. It names the two unresolved details (the label formulation and where SMOTE sits relative to the split) as the reason.
- LogstoneDB makes no claim about who wrote the code and omits the phrases "solo" and "external evaluator".
- `site-plan.md` now points to `design.md` as the visual authority, and its writing guide says where first person is allowed. `source-audit.md` gained the `design.md` row and four additions on the conflicts above.

### Recheck (Sonnet 5.5)

After the rewrite, a second pass compared each public sentence with its source section and corrected these errors in the first rewrite.

- ResQNet. Anonymous mode was said to hide the battery level, but it removes only the name and the three medical fields. The duplicate-message memory was said to give "at most once" handling, but it resets on restart. The cloud-write ordering described the mesh path and the SOS path as one sequence. The test plan said three phones were the minimum, but the reference says two phones is the minimum and three are needed for relaying. The stack history said "later" for a record with no date.
- Trading Lab. The leaderboard was said to receive every run, but only web-interface runs append to it. The cost-model audit note said no rates were filled in, but the consolidation says they were not fully populated.
- EEG. The report was said to spend "most" of its effort on preprocessing, which overreads the source. The reason given for filtering before ICA is the source's own interpretation, not a tested result. The Hurst exponent was called a measure of irregularity, but the report calls it a nonlinear feature.

The recheck also ran an unslop pass by hand over the public copy. It checked for em dashes, mid-sentence colons, curly quotes, stock AI vocabulary, bolded nouns, title-case headings, and sentences over 38 words. It found none after the edits. The style rules were applied by hand, not by a tool.

### Mechanical checks performed (Sonnet 5.5)

A temporary script at `/tmp/aadi-check/check.py` (Python 3 standard library only, outside the repository, no dependencies) ran against the final files. The final run reported 0 failures.

- All eight root Markdown files match their SHA-256 baselines taken before the pass, so the originals are unchanged.
- Each page and case study has a `Public copy` section with exactly one H1 and no skipped heading levels.
- Every internal link in public copy points to one of the ten routes in the site plan. The only external link is the GitHub profile.
- All ten routes appear in both the site plan and the metadata table.
- No Markdown file in `portfolio/` contains an em dash or an en dash. Public copy contains no curly quotes.
- Public copy contains none of a list of blocked terms. The list covers the other person's name and projects, tool and model names, "AI-powered", the withheld ResQNet, Trading Lab, and EEG figures (88.2, 184.8, 181.6, 38.4, 39%, 539, 22%), unconfirmed names and venues, email characters, and editorial instruction words. The script first flagged "placeholder" in the ResQNet copy. That use is legitimate (a placeholder application ID), so the term was removed from the blocked list and not from the copy.
- Required evidence-boundary phrases are present in the CT, ResQNet, Trading Lab, EEG, and LogstoneDB public copy.
- All relative links in `portfolio/` resolve, and the README links every file in the folder.
- Every number in each case study's public copy appears verbatim in that case study's sources. This is a string match. It does not prove the number is used correctly, which the manual comparison covered.

### What was not checked

No website exists, so nothing was rendered, and no link was fetched. The GitHub URL is unverified. No source code or result was re-run, so every metric stays a reported figure. No grammar tool or second human reader reviewed the prose. The style review is a single pass by the same model that wrote the copy, so a final independent check by the main agent is still needed. The copy is a draft for Aaditya's factual and voice review.

### Requested model review

The initial Opus 5.5 task failed with `EAI_AGAIN` before producing work. The user then requested 6.1 Sol as the main agent and Claude Sonnet for writing, and prohibited further Opus use. No successful Opus review is claimed. The Sonnet 5.5 writing pass above ran without subagents and completed. The main agent's independent check is recorded below.

### Independent final check by the main agent

6.1 Sol reviewed the rewritten pages, case studies, route plan, design brief, and evidence notes. The final edits added explicit public-copy start and end markers, removed the superseded visual token table, softened a categorical claim about model-selection optimism, and corrected the description of a tied high-scoring parameter pair. The Trading Lab copy now attributes the cost-sensitivity interpretation to its historical source rather than asserting a current realistic cost. The ResQNet test description now distinguishes internet access from the local radios required by the transport.

The source-hash and document validation checks were rerun after these edits. A separate marker check verified that all eleven page drafts have exactly one bounded public-copy region and that editorial sections stay outside it. No website was built or rendered, and no repositories, research results, or external links were independently verified.
