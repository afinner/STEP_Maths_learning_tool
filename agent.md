# STEP Maths Learning Tool

## Purpose

This is not a revision site and not a course. It is a reference for curious
readers, and a portfolio piece: each module takes one mathematical belief that
is close enough to right to survive every question until one is built on the
place it fails, and shows — with a picture you can move — exactly where and why.

STEP questions are sources of mathematical situations and failure modes, not
content to reproduce.

## Core principles

- Mathematical correctness takes priority.
- The motivating example comes before the belief is stated. A claim in the
  abstract loses the reader; a wrong answer they can check does not.
- Interaction is the point. Every module has sliders, plots and constructions
  that let the reader measure the quantity that decides the belief, and the
  page has to make it obvious those exist.
- Prefer interpretable diagnostic quantities over opaque scores. Nothing is
  marked, timed, scored or gated: there are no quizzes, no commitments and no
  confidence checks.
- Do not reproduce examination question text verbatim. Paraphrase, cite, and
  say what is behind every link.
- Do not invent STEP provenance or mathematical claims.

## Architecture

Read README.md and CONTRIBUTING.md before modifying the code.

Every module page has the same five sections in the same order: Hook, Explore,
Why, STEP, Bank. The template owns the order; a module supplies the substance.

Keep mathematical computation out of presentation components. Every number on
a page comes from the module's `compute.ts`, which is what the tests hold to
account.

## Verification

Before considering a coding task complete, run:

    npm test
    npm run check
    npm run build

Add or update tests when mathematical behaviour changes.

## Working style

- Prefer focused PRs.
- Explain conceptual changes separately from implementation changes.
- Flag assumptions rather than silently resolving ambiguous mathematics.
