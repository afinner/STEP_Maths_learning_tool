### The construction exists, and P is not where the picture puts it

Suppose $AB \neq AC$, so that the bisector of angle $A$ and the perpendicular
bisector of $BC$ are different lines. Where do they meet? Draw the circle
through $A$, $B$ and $C$. The bisector of angle $A$ meets that circle again at
a point $P$ that splits the arc $BC$ not containing $A$ into two equal arcs,
because equal angles at $A$ subtend equal arcs. Equal arcs are cut off by
equal chords, so $PB = PC$, and $P$ lies on the perpendicular bisector of $BC$
as well. The two lines meet on the circumcircle, on the far side of $BC$ from
$A$: outside the triangle, for every triangle.

That is the fact the drawing quietly reversed. Put $P$ inside, and every later
step looks safe.

### Every congruence is true. Now measure the pieces.

Steps 3, 4 and 5 hold exactly as stated: $AF = AG$, $PB = PC$ and $FB = GC$.
Write $u = AF = AG$ and $v = FB = GC$. Because $P$ is outside the triangle,
one perpendicular foot lands inside its side and the other lands on the side
produced, past the vertex. Say $AB < AC$. Then $F$ has passed $B$ while $G$
lies inside $AC$, so

$$
AB = u - v, \qquad AC = u + v
\quad\Longrightarrow\quad
u = \frac{AB + AC}{2}, \qquad v = \frac{AC - AB}{2}.
$$

The foot on the shorter side has overshot its vertex by exactly half the
difference of the two sides. Step 6 claimed $AB = u + v$; the truth is
$AB = u - v$. The argument's only false line is an addition that should have
been a subtraction, and nothing in the argument could have told you which,
because nothing in it ever said which side of $B$ the point $F$ was on.

### The number that carries the sign

Write the foot $F$ as $A + t(B - A)$ along the line $AB$, and set

$$
\sigma = \min(t,\; 1 - t).
$$

Then $\sigma > 0$ means $F$ is strictly between $A$ and $B$, $\sigma = 0$
means $F$ is one of them, and $\sigma < 0$ means $F$ has passed one. The
addition $AB = AF + FB$ is valid exactly when $\sigma \geq 0$. With $u$ and $v$
as above, $t = u/AB$ at $F$ and $t = u/AC$ at $G$, so

$$
\sigma_F = \frac{AB - AC}{2\,AB}, \qquad \sigma_G = \frac{AC - AB}{2\,AC}.
$$

Opposite signs, always, and both zero only when $AB = AC$, which is precisely
when step 1 stops making sense, because the two lines of the construction are
then the same line. There is no triangle in which both additions are sound.
The second panel is that sentence, drawn.

### Why drawing it more carefully does not help

If you insist on drawing $P$ inside the triangle, the natural point to draw is
the incentre, where the three angle bisectors meet. Then both feet do lie
inside their sides, and steps 3, 6 and 7 are all true. But that $P$ is not
equidistant from $B$ and $C$, so the line from $M$ to $P$ is not perpendicular
to $BC$: the angle at $M$ is some degrees off a right angle, and step 4 is the
false one instead. A figure cannot satisfy every hypothesis at once when the
hypotheses are inconsistent; it fails one of them, and it fails it quietly.
The "as it gets drawn" view in the first panel measures the angle it pays with.

### What a figure settles without telling you

A drawing is one point in the space of configurations the hypotheses allow.
It makes definite choices about things a proof has to argue for:

- **betweenness and order**: which of three collinear points is in the middle,
  whether a foot lies inside its side;
- **which side of a line** a point is on, and so whether a length is a sum or
  a difference;
- **existence and uniqueness**: that two lines meet at all, that a circle cuts
  a line in two points and which of the two is meant;
- **shape**: acute rather than obtuse, convex rather than reflex, one root of
  an equation rather than another.

The repair is mechanical. Wherever the argument adds or subtracts lengths,
compares angles, or picks "the" intersection, write the fact it needs as an
inequality ($\sigma \geq 0$, $\mu\nu < 1$, "$F$ and $B$ on the same side of
$AC$") and either derive it from the hypotheses or split into cases.
Coordinates and vectors do this for you: the point $A + t(B - A)$ lies between
$A$ and $B$ if and only if $0 \leq t \leq 1$, and an algebraic derivation that
never uses that inequality holds in every configuration at once. That is what
happens in the STEP question below. Its equation is proved once, from vectors,
and then turns out to hold with $P$ and $Q$ beyond the vertices too, because
the derivation never asked where they were.
