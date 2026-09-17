---
id: small-enough-to-ignore
title: Small enough to ignore
summary: A term that is heading to zero gets replaced by zero — and takes the answer with it.
claim: If a quantity is heading to zero, I can replace it with zero, simplify, and take the limit afterwards.
context: STEP
hypotheses:
  - id: discarded-effect-vanishes
    label: Push n to a million
    statement: The effect of what you discarded still tends to zero after everything that happens to it later.
    violatedBy: >-
      A remainder of size 1/2n meets a factor of n and arrives at the same size
      as the answer, however large n gets.
  - id: substitution-remains-defined
    label: Stand at θ = 0
    statement: After the small quantity is replaced by zero, the expression is still defined at the point you care about.
    violatedBy: >-
      At θ = 0 the first-order denominator is −α sin 0, which is not small but
      absent. What you kept is 0/0.
decisiveQuantity:
  symbol: 'E=\bigl|F-F_{\mathrm{trunc}}\bigr|'
  name: the discarded effect
  description: >-
    How far the truncated expression sits from the true one, measured after every
    later operation. The shortcut preserves a limit exactly when the truncated
    expression is still defined there and E tends to zero.
repairedIntuition: >-
  Look at what survives before deciding what to drop. The size of a term is not
  a property of the term; it is a comparison with whatever it is about to be
  added to, multiplied by, or divided by. If what you kept cancels, or vanishes
  at your point, the term you dropped was the leading one.
boundary: >-
  Replacing a small quantity by zero is safe when the result is still defined
  and nothing afterwards multiplies, divides or cancels against it at the same
  order — which is most of the time, and exactly why the habit survives.
question:
  citation: STEP III 2022, Q6
  link: https://step.maths.org/sites/default/files/2023-06/2022STEP3Mock.pdf
  behind: full solutions and the examiner's report, in the STEP Support Programme's worked paper
provenance: >-
  STEP III 2022, Q6, where both the ratio and the rolling circle come from, with
  STEP III 2024, Q2(ii)(a) as the simplest example of the same mechanism. Both
  are paraphrased into this module's framing; no question text is reproduced.
added: 2026-08-15
---

What is

$$
\lim_{n\to\infty}\, n\left(\sqrt{n^{2}+1}-n\right)\,?
$$

The quick argument runs like this. When $n$ is large, the $1$ under the root is
nothing beside $n^{2}$, so $\sqrt{n^{2}+1}\approx\sqrt{n^{2}}=n$. The bracket is
$n-n=0$, and $n\times 0=0$. The limit is $0$.

Here is what the expression actually does.

| $n$ | $n\left(\sqrt{n^{2}+1}-n\right)$ |
| --- | --- |
| 1 | 0.4142136 |
| 10 | 0.4987562 |
| 100 | 0.4999875 |
| 1 000 | 0.4999999 |
| 1 000 000 | 0.5000000 |

It is $\tfrac12$. Every sentence in the quick argument was true: the $1$ *is*
negligible beside $n^{2}$, and $\sqrt{n^{2}+1}-n$ *does* go to zero. The
estimate was fine. What went wrong is what happened to it next: the piece
thrown away was about $1/2n$, and the very next step multiplied it by $n$.
