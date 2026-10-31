# Design language

## Direction and scope

Build Aaditya's portfolio with expressive hand-drawn illustration, clean sans-serif typography, and a spacious editorial layout. The drawings bring warmth and curiosity. Alignment, readable text, and consistent controls give the site its professional finish.

This document records the visual direction chosen through the three supplied references. It is the visual authority for future implementation and supersedes the earlier visual starting values in `portfolio/site-plan.md`. That plan still governs routes, content structure, evidence requirements, and publication rules.

The references establish the character of the design. The numeric tokens below are proposed implementation values, not exact measurements sampled from the images. Font families are proposed choices, not identifications of the reference fonts. No website or accessibility testing is implied by this document.

## What to carry forward from each reference

| Reference | Observed details | Application to this portfolio |
|---|---|---|
| Woset character scene | Warm gray paper-like background; thin, irregular black contours; sparse green and yellow fills; small navigation at the edges; centered sans-serif copy; scattered characters and plants; drawings cropped by the viewport; a handwritten `CLICK` and curved arrow | Primary illustration language. Use original ink drawings, large areas of empty space, and occasional handwritten annotations. Keep navigation compact and dependable. |
| Fly compute section | White background; large left-aligned paragraph; selective dark emphasis within softer gray text; small inline pictorial objects; a colored pencil-like landscape along the bottom; lavender, yellow, mint, and peach fills; overlapping clouds, bridges, buildings, and wind turbines | Model for technical storytelling. Let text lead, with a coherent illustrated scene framing a section or explaining a mechanism. Use inline artwork sparingly. |
| Travel collage | Deep forest-green panel; large clean white type; quiet horizontal rules; a narrow supporting information column; overlapping photographs with broad white borders, slight rotations, and small captions; tactile dark surroundings | Secondary treatment for real project imagery and occasional dark sections. Borrow the deliberate layering, material feel, and restrained hierarchy. |

Woset is the strongest guide for drawing style. The Fly reference shows how illustration can accompany serious technical content. The travel reference supports photography and composition; its outer black presentation frame, slide count, and swipe label are not site UI requirements.

Use one consistent drawing vocabulary throughout the portfolio. Do not alternate between cartoon characters, polished 3D icons, and pencil landscapes without adapting them into the same visual family. The small rendered objects in the Fly reference are optional inspiration, not a requirement for a second icon system.

## Composition

Keep a clear grid beneath the expressive artwork. Text, navigation, captions, and controls share stable alignment. Illustrations may sit off-axis, overlap other artwork, or extend beyond a section edge.

- Give each section one dominant subject, such as an introduction, a project, or a diagram.
- Reserve a clear area around headings and primary links. Place drawings beside the content or around its perimeter.
- Use broad editorial rows and open sections. Add a container only when it groups related information or represents a physical artifact, such as a photograph.
- Create asymmetry through illustration placement and image scale. Keep reading order predictable.
- Use whitespace between unrelated ideas and tighter spacing within related groups.
- Crop decorative artwork intentionally at section boundaries. Never crop essential text, faces needed to understand an image, or controls.
- Keep overlapping photographs within a dedicated composition area. Their rotation must not obscure captions or the next section.

### Starting layout values

| Token | Desktop | Small screens |
|---|---|---|
| Page width | Maximum 1120px | Full width within gutters |
| Page gutters | 32–48px | 20–24px |
| Long-form text | 62–68 characters per line | Available width |
| Section spacing | 88–128px | 48–72px |
| Related content gap | 24–40px | 20–28px |
| Spacing scale | 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px | Same scale |

Use fluid spacing between these values. Let content determine section height. A sparse hero can feel spacious without forcing every section to fill a viewport.

## Typography

Use a clean sans-serif with open counters, clear numerals, and comfortable paragraph rhythm. Most of the visual character belongs in illustration, image treatment, and composition.

Proposed primary family: **DM Sans**, with `Arial, sans-serif` as fallbacks. Use the same family for navigation, headings, body copy, and captions. Confirm its appearance with real portfolio copy before implementation locks the font. Self-host the approved font files when available.

| Role | Proposed size | Weight | Line height |
|---|---|---|---|
| Main heading | Fluid 40–72px | 500 | 1.08–1.15 |
| Section heading | Fluid 28–44px | 500 | 1.15–1.25 |
| Introductory paragraph | Fluid 22–32px | 400, selective 500 | 1.35–1.5 |
| Body | 18px | 400 | 1.6–1.7 |
| Navigation and controls | 15–16px | 400–500 | 1.4 |
| Captions and metadata | 14–15px | 400 | 1.45–1.6 |

Keep heading letter spacing close to natural, with at most a slight tightening around `-0.025em` at large sizes. Use sentence case. Keep paragraph text left-aligned. A brief centered introduction can follow the Woset reference, provided the line length stays short.

Use weight or a darker color to emphasize a meaningful phrase within a large paragraph. Keep every word readable. The travel reference's very faint text is not a contrast target.

Reserve handwriting for a short annotation, a sketch label, or a small signature detail. Draw those marks as part of the artwork. Keep body copy, navigation, buttons, and essential instructions in the primary font. Do not use a handwriting font across the interface.

## Color and material

Use warm neutral backgrounds and dark ink as the default. Keep most of each page quiet so the small colored areas in illustrations have room to register.

| Role | Proposed value | Use |
|---|---|---|
| Paper | `#F5F3ED` | Main page background |
| White | `#FFFFFF` | Photo borders and occasional clean sections |
| Ink | `#20231F` | Primary text and illustration outlines |
| Secondary ink | `#565D55` | Supporting text and metadata |
| Rule | `#D8DCD2` | Decorative separators |
| Forest | `#173F32` | Links, primary actions, occasional dark section |
| Dark forest | `#10291F` | Dark section background |
| Cream | `#F5F3ED` | Text on dark forest |
| Pencil yellow | `#E8CF7A` | Small illustration fills and highlights |
| Lavender | `#C8B8DB` | Illustration shading |
| Mint | `#B9D5C0` | Illustration fills |
| Peach | `#E4B8A0` | Illustration fills |

Choose two or three supporting fill colors for a scene. Reuse them across related drawings. Pastels are artwork colors, not default text colors or status indicators.

Paper texture is optional and should be barely visible. Apply it to illustration or selected background areas. Keep reading areas clear. Use subtle image grain when it suits real photography. Avoid heavy noise over the entire site, artificial folds behind prose, broad gradients, and glossy surfaces.

Dark forest sections are optional moments of emphasis, not a separate dark theme. Use them for a contained project or photo story when the content justifies the change.

## Illustration system

The intended drawing has confident, imperfect contours. Lines can wobble slightly, vary in pressure, and leave occasional small gaps. Shapes remain legible and deliberately composed.

- Start with ink outlines around 1.5–2.5px at their intended desktop display size. Match perceived weight across assets.
- Use rounded stroke ends, irregular curves, and simple silhouettes. Avoid mechanically perfect geometry in decorative drawings.
- Leave much of the drawing unfilled. Use flat muted fills with occasional pencil hatching or light grain.
- Keep detail selective. A small drawing should still read at mobile size.
- Use arrows, underlines, stars, plants, characters, and scene fragments only where they support a specific idea or interaction.
- Choose original subjects related to Aaditya's work and interests. Do not trace the reference characters or reuse their branding.

For example, a ResQNet illustration could show a few devices connected by a relay path. A Trading Lab illustration could show a notebook beside a simplified research pipeline. These are proposed subjects, not claims about existing assets or implementation.

Decorative sketches can be loose. Technical diagrams must preserve correct connections, labels, direction, and scale where scale matters. Distinguish a conceptual sketch from measured results in its caption. Keep scientific plots precise and provide their units, legends, and evidence.

Prefer SVG for original line drawings and diagrams where practical. Keep labels as readable text when possible. Use optimized raster files for textured illustration and photographs. Prepare assets for their actual display size rather than shrinking a dense scene until its detail disappears.

## Photography and collage

Use real, relevant photographs or project images when available. A photo can sit inside a white print-like border with a wider bottom edge for a caption. On desktop, a small group can overlap with rotations around 2–6 degrees.

Use a restrained shadow only to explain the overlap. Keep most panels and controls flat. Do not turn every project row into a tilted card.

Captions, dates, places, and project labels must be accurate. Omit unverified details. Avoid stock photographs presented as personal experiences. Do not invent screenshots, metrics, or research outputs to fill a collage.

On small screens, stack images with minimal rotation and readable captions. Provide all essential information outside the overlap.

## Interface details

Navigation stays simple text on the page background. Use an underline for the current page and a visible keyboard focus state. The wordmark can begin as Aaditya's name in the primary family; a custom hand-lettered mark is optional future work.

Use a forest-filled button with cream text for a primary action when a button treatment is useful. Use descriptive underlined links for navigation into projects. Start with a 6px control radius and a minimum 44px target height. Keep all controls upright and consistently aligned.

Use thin rules and spacing to separate project rows. Put status in plain text. Avoid badge collections and decorative technology-logo grids.

A handwritten arrow may draw attention to a real link. The link still needs a clear label and a full keyboard-accessible target. Keep functional icons consistent and recognizable; reserve loose drawing for supporting artwork.

## Application to the portfolio

| Area | Treatment |
|---|---|
| Home introduction | Clear name and short introduction, surrounded by one restrained composition of original drawings. Keep the path into work immediately visible. |
| Selected work | Spacious editorial rows with prominent project names, factual descriptions, and one relevant sketch or real image where available. |
| Project index | Consistent vertical rhythm and easy comparison. Illustrations identify projects without competing with titles and status. |
| Case studies | Calm reading column, precise diagrams, captions, and occasional margin sketches. Allow wide figures when the evidence needs space. |
| About | Personal copy with an optional real portrait or small illustrative scene. Use collage only when there are relevant approved images. |
| Contact and footer | Short copy, verified links, and an optional small closing drawing. |

The written portfolio remains the content source. Do not borrow the references' sales language, achievement counters, product claims, or fictional characters as portfolio facts.

## Motion, responsiveness, and accessibility

Keep the default composition still and fully visible. Optional motion can include a short underline reveal, a small drawing response on hover, or a gentle image adjustment on focus. Start with 150–220ms transitions and small movement. Avoid scroll hijacking, continuous floating, cursor trails, and elaborate entrance sequences.

- Respect reduced-motion preferences and remove nonessential movement.
- Keep text and controls above decorative artwork. Decorative layers must not intercept clicks or focus.
- Remove or reposition peripheral drawings on narrow screens before reducing text size.
- Preserve semantic reading order when desktop art and text appear side by side.
- Prevent horizontal page overflow from cropped or rotated artwork.
- Give informative images useful alternative text and decorative images empty alternative text.
- Provide text explanations for diagrams and real links for interactive drawings.
- Check normal text contrast at 4.5:1 and large text at 3:1. Check meaningful control boundaries and focus indicators at 3:1.
- Support keyboard navigation, 200% text zoom, and reflow at 320 CSS pixels without losing content.

These are implementation requirements to verify in the eventual build. The supplied screenshots do not establish accessible behavior.

## Review criteria

Review each page against these questions before accepting its design:

- Does the first view communicate Aaditya's work and expose a clear next link?
- Are the drawings visibly handmade, coherent in style, and related to the content?
- Does the typography remain crisp and comfortable beside the artwork?
- Do text and controls follow a clear grid despite the expressive composition?
- Is there enough empty space for the content and illustration to read separately?
- Are photography, captions, diagrams, and factual claims supported by the portfolio sources?
- Does the mobile layout preserve the hierarchy with fewer decorative elements?
- Can visitors use the page with a keyboard, reduced motion, and enlarged text?

Reject a result that depends on handwriting for readability, fills every gap with doodles, repeats generic rounded cards, or uses decorative artwork in place of technical evidence.
