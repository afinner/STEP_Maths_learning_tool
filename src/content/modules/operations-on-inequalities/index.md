---
id: operations-on-inequalities
title: Operations on inequalities
claim: An inequality is an equation with a different sign. Whatever I can do to both sides of one, I can do to both sides of the other.
context: STEP
hypotheses:
  - id: multiplier-keeps-one-sign
    statement: The thing you multiply or divide by has the same sign everywhere you care about.
    violatedBy: >-
      x − 2 is positive above 2 and negative below it, so the same step keeps the
      order on one side and turns it round on the other.
  - id: operation-preserves-order
    statement: The operation you apply to both sides is increasing across the values in play.
    violatedBy: >-
      Squaring reverses the order between negative numbers, so the branch where
      one side is negative is quietly lost.
predictionPrompt: How many separate ranges of x satisfy (x + 1)/(x − 2) < 3?
decisiveQuantity:
  symbol: 'D=\{\,x : \text{original} \neq \text{transformed}\,\}'
  name: disagreement set
  description: >-
    The values of x at which the statement you started with and the statement
    you finished with return different verdicts. A step is sound exactly when
    this set is empty; when it is not, its endpoints say precisely what the step
    cost you.
repairedIntuition: >-
  A step on an inequality is a claim about order, not about form. Before you
  apply it, ask what the operation does to order across the values actually in
  play: multiplying by something whose sign you do not know is two different
  steps at once, and an operation that is increasing on part of the range and
  decreasing on the rest is not a step at all.
boundary: Doing the same thing to both sides is sound whenever that thing is increasing across every value still in play and leaves the statement defined where it was defined before — which covers almost everything you did before this year, and is exactly why the habit is so hard to see.
provenance: >-
  Written for this catalogue as the second module, taking up the
  operations-on-inequalities failure mode named in module 01's design notes. The
  worked witnesses are constructed for the module; the bank cites STEP questions
  by paper, year and number, paraphrased into this module's framing, and
  reproduces no question text.
added: 2026-09-07
---

Solving an inequality looks like solving an equation. You clear the fraction,
gather the terms, and read off the answer.

$$\frac{x+1}{x-2} < 3$$

Multiply both sides by $x-2$, and it becomes $x + 1 < 3(x-2)$, which rearranges
to $x > 3.5$. Every move is one you have made a thousand times on an equation.

The question below is not whether the arithmetic is right. It is.
