---
id: fixture-module
title: Fixture — averaging away a spike
summary: Fixture content that exercises every part of the module template.
claim: If almost every term is zero, the average has to go to zero as well.
context: general
hypotheses:
  - id: terms-stay-bounded
    label: Grow the spike
    statement: The terms are bounded by a constant that does not depend on n.
    violatedBy: Let the single non-zero term grow with n and the bound is gone.
  - id: spike-does-not-dominate
    label: Few terms, big spike
    statement: No single term is comparable in size to the sum of the others.
    violatedBy: Take few terms and a large spike; one term is the entire sum.
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
question:
  citation: Fixture question
  link: https://example.invalid/fixture
  behind: nothing at all — this is a fixture
provenance: Fixture content, written to exercise the build pipeline. Not a real module.
added: 2026-08-14
---

This is fixture content. It exists so the build, the tests, and the deployment
have something to render, and it is excluded from the production site.

The body of a real module is the **hook**: a short example where the belief
gives a wrong answer, ending where the belief is stated. Take the sequence with
a single non-zero term $s$ at position $k$:

$$
x_j = \begin{cases} s & j = k \\ 0 & \text{otherwise} \end{cases}
$$

The mean of the first $n$ terms, once $n \geq k$, is $s/n$. Every term but one
is zero, so the average ought to be zero-ish — and for a fixed $s$ it is.
