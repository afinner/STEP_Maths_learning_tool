# STEP Maths Learning Tool

## Purpose

This is not primarily a maths revision site it is a tool for maths learners.

The project finds specific mathematical false beliefs or
failure modes that can be exposed through carefully designed interactions inspired by STEP questions.

The aim is to identify where a learner's intuitive model ceases to be
valid, and where possible make that failure measurable.

STEP questions are sources of mathematical situations and failure modes,
not content to reproduce.

## Core principles

- Mathematical correctness takes priority.
- Diagnostic items should test the mechanism rather than memory of the
  worked example.
- Prefer interpretable diagnostic quantities over opaque scores.
- Preserve the learner's initial commitment before revealing an answer.
- Do not reproduce examination question text verbatim.
- Do not invent STEP provenance or mathematical claims.

## Architecture

Read README.md and CONTRIBUTING.md before modifying the code.

Be aware that Module 01 may have evolved beyond parts of the original
module contract. Do not assume either the documentation or Module 01 is
automatically correct.

Keep mathematical computation out of presentation components where practical.

## Verification

Before considering a coding task complete, run:

npm test
npm run check
npm run build

Add or update tests when mathematical or diagnostic behaviour changes.

## Working style

- Prefer focused PRs.
- Do not perform broad refactors unless specifically requested.
- Explain conceptual changes separately from implementation changes.
- Flag assumptions rather than silently resolving ambiguous mathematics.
