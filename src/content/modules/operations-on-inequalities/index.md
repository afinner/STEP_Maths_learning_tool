---
id: operations-on-inequalities
title: Operations on inequalities
summary: A step that is right on equations, applied to an inequality — and half the solutions vanish without a wrong calculation.
claim: An inequality is an equation with a different sign. Whatever I can do to both sides of one, I can do to both sides of the other.
context: STEP
hypotheses:
  - id: multiplier-keeps-one-sign
    label: Stand at x = 0
    statement: The thing you multiply or divide by has the same sign everywhere you care about.
    violatedBy: >-
      x − 2 is positive above 2 and negative below it, so the same step keeps the
      order on one side and turns it round on the other.
  - id: operation-preserves-order
    label: Square with a negative side
    statement: The operation you apply to both sides is increasing across the values in play.
    violatedBy: >-
      Squaring reverses the order between a negative number and a larger
      positive one, so the branch where one side is negative is quietly lost.
decisiveQuantity:
  symbol: 'D=\{\,x : \text{original} \neq \text{transformed}\,\}'
  name: the disagreement set
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
  decreasing on the rest is not one step at all.
boundary: >-
  Doing the same thing to both sides is sound whenever that thing is increasing
  across every value still in play and leaves the statement defined where it
  was defined before — which covers almost everything you did before this year,
  and is exactly why the habit is so hard to see.
question:
  citation: STEP I 2001, Q2
  link: https://step.maths.org/questions/01-s1-q2
  behind: the paper and links onward to solutions, in the STEP database
provenance: >-
  Written after the operations-on-inequalities failure mode kept appearing in
  STEP I questions; STEP I 2001, Q2 carries both hypotheses in one question.
  Every question cited is paraphrased into this module's framing, and no
  question text is reproduced.
added: 2026-09-07
---

Solve

$$
\frac{x+1}{x-2}<3 .
$$

Multiply both sides by $x-2$ to clear the fraction: $x+1<3x-6$, so $7<2x$, so
$x>3.5$. Every line is a move you have made on equations a thousand times, and
every line of the arithmetic is right.

Now try $x=0$. The left-hand side is $\dfrac{0+1}{0-2}=-\tfrac12$, which is
certainly less than $3$. So $x=0$ is a solution, and it is nowhere in
$x>3.5$.

The full solution set is $x<2$ *or* $x>3.5$. The step lost the whole of the
first range without a single wrong calculation, because multiplying by $x-2$ is
a different step below $2$ from the one it is above $2$.
