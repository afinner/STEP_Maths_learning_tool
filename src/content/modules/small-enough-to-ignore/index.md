---
id: small-enough-to-ignore
title: Small enough to ignore
claim: If a quantity is heading to zero, I can replace it with zero. Simplify first, take the limit afterwards.
context: STEP
hypotheses:
  - id: substitution-remains-defined
    statement: Replacing the small quantity by zero leaves a defined expression at the point of interest.
    violatedBy: >-
      At theta = 0 the denominator's first-order term is -alpha sin(theta), which
      is not small but absent. The term you discarded is the whole denominator.
  - id: discarded-effect-vanishes
    statement: After every later operation, the effect of the discarded remainder still tends to zero.
    violatedBy: >-
      A remainder of order 1/n meets a factor of n and arrives at the same size
      as the answer, however large n gets.
predictionPrompt: >-
  As n gets large, what does n(sqrt(n^2 + 1) - n) approach? No working, no
  calculator — the first answer that feels right.
decisiveQuantity:
  symbol: E=|F-F_{\mathrm{trunc}}|
  name: discarded effect
  description: >-
    The absolute difference between the original expression and the truncated
    one, after every later operation. For a finite requested limit, replacing the
    small term preserves it when both expressions remain defined and E tends to zero.
    The secondary ratio rho measures the stronger question of retained relative
    or leading-order information.
repairedIntuition: >-
  First ask what information you need. To preserve only a finite limit, track
  whether the discarded contribution still tends to zero after every later operation.
  To preserve leading-order or relative information, compare the remainder with
  the first term that survives and expand until that scale is visible.
boundary: For a finite requested limit, replacing a small quantity by zero preserves it when the resulting expression stays defined and the total discarded effect tends to zero; preserving leading-order information requires the stronger relative comparison measured by rho.
provenance: >-
  2022 STEP 3 Q6, with 2024 STEP 3 Q2(ii)(a) as the opening witness. Both are
  paraphrased into this module's framing; the official papers are linked from
  the bank.
added: 2026-08-15
---

Two expressions, each containing a quantity heading to zero.

$$n\left(\sqrt{n^{2}+1}-n\right) \qquad\text{and}\qquad R(\theta,\alpha)=\frac{\sin(\theta+\alpha)-\sin\theta}{\cos(\theta+\alpha)-\cos\theta}$$

In the first, $1$ is genuinely negligible beside $n^{2}$, and judging so is
correct. In the second, $\alpha$ is as small as you like and the $\alpha^{2}$
terms are smaller still. Both invite the same move: drop the small thing, then
take the limit.

The move gives the right answer for $R$ at $\theta=\pi/3$ and a wrong one at
$\theta=0$ — with $\alpha$ behaving identically in both cases. Nothing about the
small quantity changed. What changed was where you were standing.
