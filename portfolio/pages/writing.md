# Writing page copy and editorial plan

Route: `/writing`. The empty state below is complete public copy. Keep the route out of primary navigation until a real article exists. Do not publish the article ideas below as existing posts.

## Public copy

<!-- public-copy:start -->

# Writing

Technical notes on the systems and experiments behind my work.

Nothing is published here yet. The project pages carry the detail for now.

[Read the case studies](/projects)

<!-- public-copy:end -->

## Editorial plan

No blog posts were supplied. The case-study prose borrows the structure of `about_me.md` (a concrete problem, the mechanism, the decision, the limit) and none of its identity. Treat the voice as provisional, and obtain two or three representative posts before claiming a close voice match or migrating an archive. Keep any existing external archive link only after Aaditya supplies it.

The following are proposed articles, not completed work or publication claims.

| Proposed article | Reader's question | Outline | Evidence required |
|---|---|---|---|
| Why patient splits changed the CT benchmark | Why can a near-perfect result collapse on unseen patients? | Correlated slices; exact duplicates; grouping; aggregate versus best configuration; remaining limits | Original report, split manifests, permission for figures |
| What an offline SOS prototype still depends on | Which dependencies remain when the internet disappears? | Local message; connected peers; foreground lifecycle; maps; optional cloud; physical-device checks | Current app commit and device test log |
| A positive backtest is only the start | How can execution assumptions change a result? | Decision time; fill time; costs; benchmark window; sensitivity; research status | Frozen dataset, runnable engine, reproduced results |
| Testing Raft before adding a network | What can deterministic simulation reveal? | Simulation scope; invariant; recorded failure; fix; limits | Actual simulator, invariant document, replayable trace |

For each approved article, write a concrete opening, explain one mechanism with an example, discuss the decision and its limit, and stop when the question is answered. Include real source links and a real publication date. Do not invent personal discoveries or successful experiments to fill the outline.

Article-page structure: title, short description, publication date, optional update date, body, source links, and a link back to Writing. Derive reading time from the finished text if used. Do not add author credentials that the source audit cannot support.
