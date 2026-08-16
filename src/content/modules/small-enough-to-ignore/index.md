---
id: small-enough-to-ignore
title: Small enough to ignore
claim: If a quantity is heading to zero, I can replace it with zero. Simplify first, take the limit afterwards.
context: STEP
hypotheses:
  - id: retained-scale-survives
    statement: After substitution and exact cancellation, the part you retain has a non-zero leading term.
    violatedBy: >-
      At theta = 0 the denominator's first-order term is -alpha sin(theta), which
      is not small but absent. The term you discarded is the whole denominator.
  - id: remainder-is-relatively-small
    statement: The discarded remainder is small compared with the first term that actually survives.
    violatedBy: >-
      Round the root down and the retained terms subtract away exactly. Relative
      to zero, even a remainder tending to zero is decisive.
  - id: later-operations-preserve-scale
    statement: No later multiplication, division, or cancellation promotes the discarded remainder back to leading order.
    violatedBy: >-
      A remainder of order 1/n meets a factor of n and arrives at the same size
      as the answer, however large n gets.
predictionPrompt: >-
  As n gets large, what does n(sqrt(n^2 + 1) - n) approach? No working, no
  calculator — the first answer that feels right.
decisiveQuantity:
  symbol: \rho=\dfrac{|\text{kept}|}{|\text{dropped}|}
  name: kept over dropped
  description: >-
    The size of everything your truncation retains, over the size of the leading
    term it discards. A large value means good separation at the displayed
    parameters; asymptotic truncation is justified only when this ratio tends to
    infinity. Where what you kept is zero, rho is zero and the approximation
    says nothing at all.
repairedIntuition: >-
  Smallness is not a property of a quantity. It is a property of that quantity
  relative to what survives beside it, so expand to the order at which the first
  surviving term appears: ask what the expression becomes at the point you care
  about, then check whether what is left is non-zero.
boundary: Truncation is justified after you have kept through the first non-zero surviving term and checked that the omitted remainder stays small relative to it through every later operation.
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
