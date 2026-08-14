---
id: fixture-module
title: Fixture — averaging away a spike
claim: If almost every term is zero, the average has to go to zero as well.
context: general
hypotheses:
  - id: terms-stay-bounded
    statement: The terms are bounded by a constant that does not depend on n.
    violatedBy: Let the single non-zero term grow with n and the bound is gone.
  - id: spike-does-not-dominate
    statement: No single term is comparable in size to the sum of the others.
    violatedBy: Take few terms and a large spike; one term is the entire sum.
predictionPrompt: >-
  The sequence is zero everywhere except one term. Before you move anything:
  does the running mean go to zero?
decisiveQuantity:
  symbol: \dfrac{s}{n}
  name: spike share
  description: >-
    The size of the exceptional term divided by the number of terms averaged.
    The claim survives exactly while this goes to zero.
repairedIntuition: >-
  Averaging shrinks a term by a factor of n, so a term that grows faster than n
  survives the averaging. "Almost all zero" is a statement about how many terms
  are exceptional, not about how large they are.
boundary: The average of mostly-zero terms goes to zero whenever the exceptional terms stay bounded.
provenance: Fixture content, written to exercise the build pipeline. Not a real module.
added: 2026-08-14
---

This is fixture content. It exists so the build, the tests, and the deployment
have something to render, and it is excluded from the production site.

The body of a real module goes here: the derivation the reader follows, in
order, up to the point where the claim gets made. It supplies the **Run** beat
and nothing else — the other five beats come from frontmatter and from the
widget below.

Take the sequence with a single non-zero term $s$ at position $k$:

$$
x_j = \begin{cases} s & j = k \\ 0 & \text{otherwise} \end{cases}
$$

The mean of the first $n$ terms, once $n \geq k$, is

$$
\frac{1}{n}\sum_{j=1}^{n} x_j = \frac{s}{n}.
$$

Every term but one is zero, so the average ought to be zero-ish, and for a fixed
$s$ it is: the mean decays like $1/n$. The prediction below asks whether that
survives when $s$ is allowed to move.
