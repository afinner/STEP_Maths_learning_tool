# Module ideas

Candidates for future modules, chosen against three tests: the care needed is
real but routinely skipped; the failure can be *seen* on a picture you can
move; and a proper system (a decisive quantity, a rule for when the move is
safe) genuinely improves understanding rather than adding a warning to
remember.

Every source cited below was checked against the STEP database or the paper
itself before being listed. "Read" means the question was read in full while
writing this; "tagged" means the database lists it under that topic but it has
not been read, so the description is the database's, not this document's.
No question text is reproduced here; see the standing rule in CONTRIBUTING.md.

The five-part shape of every module is assumed: Hook, Explore, Why, STEP, Bank.

---

## Ready to build

### 1. The inverse undoes the function

**Belief.** If $\tan y = x$ then $y = \arctan x$. More generally, applying the
inverse function undoes the function: $\arcsin(\sin x) = x$, $\sqrt{x^2} = x$.

**Hook.** A continuous function $f$ is defined by $\tan f(x) = x$ for all real
$x$, together with $f(0) = \pi$. Sketch it. The instinct is $f = \arctan$; the
truth is $f(x) = \arctan x + \pi$, and if instead $\tan f(x) = x/(1 - x^2)$
with $f(0) = \pi$ then continuity forces $f$ to climb through *different*
branches as $x$ passes $\pm 1$.

**Decisive quantity.** The branch index $k$ in $y = \arctan x + k\pi$ (or, for
the addition formula, the sign of $1 - ab$). The belief survives exactly while
$k = 0$.

**Explore.** (a) The graph of $\tan$ with a horizontal cursor: drag $x$ and
watch how many $y$ satisfy $\tan y = x$, then watch a continuous path through
them forced to change branch. (b) The arctan addition formula
$\arctan a + \arctan b = \arctan\frac{a+b}{1-ab}$ as a heat map over $(a, b)$
of the left side minus the right side: $0$ on one region, $\pm\pi$ on the
others, with the hyperbola $ab = 1$ as the boundary.

**Sources.** STEP II 2015, Q4 (read: exactly the hook), STEP II 2015, Q5
(read: an arctan telescoping sum, with the branch convention stated in the
question because it matters), STEP I 2008, Q6 (read: a function and its inverse
sketched together, and an integral identity explained by a diagram).

**Fit.** Strong. Visual, measurable, and the source is a STEP question that is
the belief's counterexample almost verbatim.

### 2. The iteration converges to the fixed point

**Belief.** If $x_{n+1} = g(x_n)$ and $g$ has a fixed point $L$, the sequence
converges to $L$; if it seems to be settling, it is.

**Hook.** $u_1 = 1$, $u_{n+1} = 1 + 1/u_n$. The terms hop either side of the
golden ratio; the odd terms increase to it and the even terms decrease to it,
and the sequence as a whole converges only because both halves do. Change
the starting value to $3$: does anything change? (The source asks exactly that.)

**Decisive quantity.** $|g'(L)|$ at the fixed point: below $1$ attracts, above
$1$ repels, and its sign decides whether the approach is monotone or
oscillating. For Newton's method the analogous number is the basin the start
lies in.

**Explore.** A cobweb diagram with the starting value on a slider and a family
of $g$ (say $g(x) = 1 + c/x$, or $g(x) = \lambda x(1 - x)$) on a second slider;
the readout is $|g'(L)|$. A second panel: Newton's method on a cubic with a
draggable start, and the root it lands on.

**Sources.** STEP II 2013, Q6 (read: the hook; subsequences converge
separately, then the whole), STEP I 2017, Q8 (read: a pair of sequences whose
ratio converges to $\sqrt2 - 1$, with error bounds). The database has no
question tagged "Newton", so the Newton panel would be the module's own.

**Fit.** Strong. The cobweb diagram is the canonical example of a picture that
makes a proof obvious.

### 3. Friction is $\mu R$

**Belief.** Friction equals $\mu R$ and acts up the slope (or down it, whichever
was drawn last time).

**Hook.** A block on a rough slope, held by a horizontal force $X$. Friction is
whatever the block needs, in whichever direction it needs it, up to a cap. The
same block with $X$ just large enough to stop it sliding *down* has friction at
the cap pointing up the slope; with $kX$ it is about to slide *up* and friction
is at the cap pointing down. Both are "limiting equilibrium", and they are
different states.

**Decisive quantity.** The friction *required* for equilibrium, $F_{\text{req}}$,
compared with the cap $\mu R$: the block is in equilibrium exactly while
$|F_{\text{req}}| \leq \mu R$, and the sign of $F_{\text{req}}$ says which way
friction acts.

**Explore.** A slope with sliders for $X$, $\theta$ and $\mu$; a chart of
$F_{\text{req}}$ against $X$ with the band $\pm\mu R$ shaded; the readout is
$F_{\text{req}}/\mu R$. A second panel for the ladder-on-a-table question:
which happens first as the painter climbs, tilting or slipping, with the two
failure thresholds plotted against the painter's height.

**Sources.** STEP I 2007, Q9 (read: the hook, both limiting cases in one
question), STEP II 2006, Q9 (read: a ladder on a table that may tilt or slip;
"determine which occurs first"). The database lists 56 questions under
friction, most of them STEP I and II mechanics.

**Fit.** Strong, and a first mechanics module. The examiners' reports on
friction questions are a rich source for the bank.

### 4. The curve lies on one side of its chord

**Belief.** The value at the average is the average of the values:
$f\!\left(\frac{u+v}{2}\right) = \frac{f(u) + f(v)}{2}$, near enough; and
$\mathbb E[f(X)] = f(\mathbb E[X])$.

**Hook.** For the angles of a triangle, $\sin A + \sin B + \sin C \leq \frac{3\sqrt3}{2}$,
with equality only for the equilateral triangle. No calculus is needed: the
sine curve is concave on $(0, \pi)$, so it lies above every chord, and the
mean of three values on a concave curve is below the value at the mean.

**Decisive quantity.** The sign of $f''$ on the interval in play, or
equivalently the Jensen gap $f(\bar x) - \overline{f(x)}$, which has one sign
on a convex stretch and the other on a concave one.

**Explore.** A curve with two or three draggable points on it, the chord
between them, the tangent at the mean, and the gap as a readout; a slider that
moves through a family ($e^{kx}$, $\sin$, $\ln\sin$, $e^{-k\tan x}$) so the
reader can find where convexity changes and watch the inequality reverse.

**Sources.** STEP II 2018, Q2 (read: concavity by the chord definition, the
three-point inequality, and both triangle inequalities above), STEP I 2008, Q4
(read: convexity by $f'' \geq 0$, finding the intervals for $e^{\frac23\sin x}$
and $e^{-k\tan x}$), STEP II 2007, Q7 (tagged "Jensen's inequality").

**Fit.** Strong, and it generalises: the same picture explains AM–GM,
$\mathbb E[X^2] \geq (\mathbb E X)^2$, and why the tangent-line bound
$e^x \geq 1 + x$ works.

### 5. Enough energy to reach the top

**Belief.** A particle on a string completes the circle if it has enough energy
to reach the top; the string stays taut because it is a string.

**Hook.** Give a hanging particle a horizontal impulse. It rises on the circle,
the string goes slack at some angle above the horizontal, the particle flies
as a projectile, and the string snaps taut again later, destroying the radial
part of the momentum. For one particular launch it stops dead at that moment.

**Decisive quantity.** The tension $T(\theta)$ along the arc, and the angle
where it first reaches zero. Energy alone cannot see it.

**Explore.** A pendulum with the launch speed on a slider: the arc while taut,
the projectile phase drawn in a different colour, and $T$ against $\theta$
plotted alongside with the zero crossing marked. A "completes the circle?"
readout that compares the launch speed with the energy threshold *and* with
the tension threshold, so the gap between them is visible.

**Sources.** STEP III 2018, Q11 (read: the hook, including the speed at which
the string goes slack, the time until it is taut again, and the condition for
the particle to come to rest), plus the database's circular-motion questions
from 2004 to 2015 (tagged), several of which are the standard "just completes
the circle" form.

**Fit.** Strong; the second mechanics module, and the most animated.

### 6. If the terms go to zero, the sum converges

**Belief.** A series whose terms tend to zero converges; adding up smaller and
smaller things gives something finite.

**Hook.** $S_n = 1 + \frac1{\sqrt2} + \frac1{\sqrt3} + \cdots + \frac1{\sqrt n}$.
The terms go to zero, and $S_n$ exceeds $2\sqrt{n} - 1$ for every $n$: it goes
to infinity, and the question asks for the *exact* constant in a two-sided
bound. The harmonic series is the same story more slowly.

**Decisive quantity.** The exponent: for terms of size $n^{-p}$, the series
converges exactly when $p > 1$. Visually, whether the rectangles under
$1/x^p$ fit under a curve with a finite area.

**Explore.** Partial sums of $\sum n^{-p}$ with $p$ on a slider straddling $1$,
against the integral $\int_1^N x^{-p}\,dx$ drawn as the area the rectangles
approximate; a second panel with a fixed number of terms and the count $N$ on
a log slider, showing how slowly the harmonic sum grows.

**Sources.** STEP II 2017, Q6 (read: the hook, with $2\sqrt n - 1$ as an upper
bound and a lower bound with the best constant), STEP III 2013, Q2 (tagged
"Infinite series"), STEP III 2010, Q1 (tagged "Sum").

**Fit.** Strong for the "first-year analysis" context, and a natural partner
to module 01: the multiplication mechanism again, with the number of terms as
the large factor.

---

## Promising, but read a source first

These fit the three tests but the sources below are either tagged rather than
read, or read and only partly on point.

### 7. The curve never crosses its asymptote

**Belief.** A curve approaches its asymptote from one side and never crosses
it; the two branches either side of a vertical asymptote look alike.

**Why it fits.** Curve sketching is the most-tagged topic in the database (127
hits), examiners comment on it every year, and the decisive quantity is simple:
the sign of $f(x) - (\text{asymptote})$ as $x \to \infty$, which can change.
Explore: a rational function family with sliders, the difference from the
asymptote plotted on its own axis so a crossing is a zero.

**Sources.** STEP I 2010, Q2 (read: $y = e^x/(x-b)$-type curves with one
stationary point either side of the vertical asymptote), STEP II 2015, Q4
(read: continuous branches of arctan-type curves), STEP III 2006, Q1 and
STEP III 2004, Q2 (tagged "Curve sketching"). None read so far has the
horizontal-asymptote crossing as its point; find one before building.

### 8. $45^\circ$ gives the greatest range

**Belief.** Range is maximised at $45^\circ$; the time up equals the time
down; the collision happens where the paths cross on the sketch.

**Why it fits.** Projectiles are the database's second most-tagged mechanics
topic (56 hits), and every belief above fails as soon as launch and landing
heights differ or a second particle is involved. Explore: a trajectory with
launch height and angle on sliders and the optimal angle as a readout that
moves off $45^\circ$.

**Sources.** STEP II 2010, Q9 (read: two particles projected towards each
other, with inequalities that come from the order in which things happen).
Find the question that turns on unequal heights.

### 9. A strict inequality survives the limit

**Belief.** If $a_n < b_n$ for all $n$ then $\lim a_n < \lim b_n$; what is true
of every term is true of the limit.

**Why it fits.** Analysis, and very visual: two sequences approaching each
other. Decisive quantity: the gap $b_n - a_n$ and whether it tends to zero.
Closely related: every $S_n$ rational, the limit irrational.

**Sources.** STEP I 2017, Q8 (read: $c_n > \sqrt2 - 1$ with the limit equal to
$\sqrt2 - 1$, which is this belief's counterexample in passing). A cleaner
source would help.

### 10. The substitution just has to hit the limits

**Belief.** Any substitution $u = \phi(x)$ works in a definite integral as long
as the limits are changed accordingly.

**Why it fits.** Fails when $\phi$ is not one-to-one on the interval, and the
failure is visible: the graph of $\phi$ folds. Decisive quantity: the number
of preimages. Module 02's sibling, for integrals.

**Sources.** STEP II 2014, Q4 (read: $u = 1/x$, which is monotone, so not a
counterexample), plus 82 questions tagged "substitution". Find one where the
substitution is $x = \sin\theta$ or $u = x^2$ over a range where it folds.

### 11. By symmetry, the extremum is at the symmetric point

**Belief.** A symmetric problem has its maximum where the variables are equal.

**Why it fits.** Often true (AM–GM, idea 4), and false often enough to be
dangerous: the symmetric point can be the minimum or a saddle. Explore: a
contour plot of a symmetric function on a constraint curve with a draggable
point. Decisive quantity: the second derivative in the antisymmetric direction.

**Sources.** STEP II 2018, Q2 (read: the symmetric point *is* the maximum, so
this is the safe case), STEP II 2007, Q2 and STEP III 2009, Q5 (tagged
"symmetry"). A counterexample source is still needed.

### 12. $\arg(zw) = \arg z + \arg w$

**Belief.** Arguments add; $\sqrt{zw} = \sqrt z\sqrt w$; the principal value
behaves like a function.

**Why it fits.** Idea 1 on the Argand diagram: the branch cut made visible.
Explore: two draggable points, their product, and the sum of principal
arguments leaving $(-\pi, \pi]$.

**Sources.** STEP III 2016, Q7 (tagged "Argand geometry"), STEP III 2018, Q6
(tagged "Complex geometry"), STEP III 2012, Q6 and STEP III 2013, Q6 (tagged
"Complex numbers"). None read yet.

### 13. The outcomes I can list are equally likely

**Belief.** If I can list the outcomes, each has probability one over the
count.

**Why it fits.** STEP I probability questions are built on it. Explore: a
sample-space grid for two dice or a card draw, with the outcomes the reader
would list highlighted against the equally-likely ones. Decisive quantity: the
count behind each listed outcome.

**Sources.** STEP I 2006, Q13 (tagged "Dice roll"), STEP II 2007, Q12 (tagged
"Dice"), STEP II 2008, Q12 (tagged), and 99 questions tagged "expectation".
None read yet.

---

## Not recommended

- **Differentiating an inequality** ($f \leq g \Rightarrow f' \leq g'$). True
  belief, false conclusion, and visual, but STEP uses only the sound direction
  (integrate, or differentiate the difference), so there is no natural featured
  question.
- **The constant of integration on a disconnected domain.** Correct and
  surprising, but it has no STEP home and no measurable quantity beyond a
  count of components.
- **Extraneous roots from squaring an equation.** Real, but it is module 02
  restated for equations; better as a bank item there than as a module.
