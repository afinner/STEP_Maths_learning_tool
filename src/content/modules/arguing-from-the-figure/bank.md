Sorted by what the figure settled without saying so. Each link is the
question's entry in the STEP database, which carries the paper and links
onward to solutions. Follow one expecting the question, not the answer.

### Which side, and which one

- [STEP II 2015, Q2](https://step.maths.org/questions/15-s2-q2) — A point $F$ on the perpendicular bisector of $AB$ at a given distance from $C$, "with $F$ and $B$ on the same side of $AC$". A circle meets a line twice, and the condition names which point is meant; drop it and the trisection you are asked to prove is about the wrong one.
- [STEP I 2017, Q7](https://step.maths.org/questions/17-s1-q7) — Equilateral triangles built on the sides of a triangle, each "on the other side" of its side from the opposite vertex. The which-side condition is written into the question because the result depends on it.
- [STEP I 2009, Q8](https://step.maths.org/questions/09-s1-q8) — The incircle of a triangle formed by three lines, defined in the question itself as the circle "lying totally inside": three lines have four circles touching all of them, and a figure chooses one of them silently.

### Betweenness, written as an inequality

- [STEP I 2016, Q6](https://step.maths.org/questions/16-s1-q6) — A point $X$ on the side $OA$, between $O$ and $A$, with position vector $m\mathbf{a}$: the question asks for the range of $m$. That range is $\sigma \geq 0$ in vector form, and the rest of the question is safe because it is stated.
- [STEP II 2018, Q7](https://step.maths.org/questions/18-s2-q7) — Two lines from the vertices of a triangle meeting at a point $Q$, with ratios $\mu$ and $\nu$ satisfying $\mu\nu < 1$. The last part asks what that condition means geometrically: it is the algebraic form of "the lines cross where the figure says they do".

### One configuration standing in for all of them

- [STEP II 2003, Q4](https://step.maths.org/questions/03-s2-q4) — The area of a circular segment, derived for a chord on one side of the centre, and then the question asks how the formula must change for other positions of the line. The formula was an exemplar of one configuration, and the question says so.
- [STEP I 2001, Q1](https://step.maths.org/questions/01-s1-q1) — Three points on the sides of a unit square, no two on the same side; show that some side of the triangle they make is at most $\sqrt6 - \sqrt2$. The extremal configuration is not the one you draw first.
- [STEP I 2012, Q6](https://step.maths.org/questions/12-s1-q6) — A flagpole on the diameter of a circular path, seen from three points on it. The inequality in the last part needs $\alpha + \beta \leq \tfrac12\pi$, a condition on the shape that the picture of the flagpole does not show.

### Two to do by hand

**1.** In the figure of the hook, let the circle through $A$, $B$ and $C$ meet
the bisector of angle $A$ again at $P$. Show that $PB = PC$, and deduce that
$P$ lies on the perpendicular bisector of $BC$ and on the far side of $BC$
from $A$.

<details>
<summary>Answer</summary>

The bisector makes equal angles $\angle BAP = \angle PAC$ at the circumference,
and equal angles at the circumference stand on equal chords, so $PB = PC$.
A point equidistant from $B$ and $C$ is on the perpendicular bisector of $BC$.
The bisector of angle $A$ leaves $A$ into the interior of the triangle and
crosses $BC$ before it reaches the circle again, so its second meeting with
the circle is on the far side of $BC$.

</details>

**2.** Let $F = A + t(B - A)$ for a real number $t$. Show that
$AB = AF + FB$ if $0 \leq t \leq 1$, and that $AB = |AF - FB|$ otherwise.

<details>
<summary>Answer</summary>

$AF = |t|\,AB$ and $FB = |1 - t|\,AB$, so $AF + FB = (|t| + |1 - t|)\,AB$.
For $0 \leq t \leq 1$ the bracket is $t + (1 - t) = 1$. For $t > 1$ it is
$t + (t - 1) = 2t - 1 > 1$, and then $AF - FB = AB$; for $t < 0$ it is
$1 - 2t > 1$, and $FB - AF = AB$. The sum is right exactly when
$\sigma = \min(t, 1 - t) \geq 0$.

</details>
