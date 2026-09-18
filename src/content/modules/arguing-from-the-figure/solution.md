**(i)** Put $A$ at the origin and $B$ at $(1, 0)$. Then
$P = x(\cos\alpha, \sin\alpha)$, since $AP = x$ along the side that makes
angle $\alpha$ with the base, and $Q = (1 - x\cos\beta,\; x\sin\beta)$
likewise from $B$. The segment $PQ$ has length $x$ and direction $\theta$, so

$$
Q - P = x(\cos\theta, \sin\theta)
\quad\Longrightarrow\quad
x\cos\theta = 1 - x\cos\alpha - x\cos\beta, \qquad
x\sin\theta = x(\sin\beta - \sin\alpha).
$$

Square and add. Since
$(\cos\alpha+\cos\beta)^2 + (\sin\beta - \sin\alpha)^2 = 2 + 2\cos(\alpha+\beta)$,

$$
x^2 = 1 - 2x(\cos\alpha + \cos\beta) + x^2\bigl(2 + 2\cos(\alpha+\beta)\bigr),
$$

which rearranges to $(*)$.

Now the part this module is about. Nothing above used the fact that $P$ lies
between $A$ and $C$. The formula $P = x(\cos\alpha, \sin\alpha)$ describes
every point at distance $x$ from $A$ along the ray through $C$, including the
points beyond $C$, and the same goes for $Q$. So the derivation is word for
word the same when $P$ is on $AC$ produced and $Q$ on $BC$ produced, and
$(*)$ holds there too. In the module's terms: the algebra never took the sign
of $\sigma$. Only the figure did.

**(ii)** $(*)$ is linear exactly when $1 + 2\cos(\alpha+\beta) = 0$, that is
when $\alpha + \beta = 120^\circ$. Otherwise a quarter of the discriminant is

$$
(\cos\alpha + \cos\beta)^2 - \bigl(1 + 2\cos(\alpha+\beta)\bigr)
= \cos^2\alpha + \cos^2\beta - 1 + 2\sin\alpha\sin\beta
= 1 - (\sin\alpha - \sin\beta)^2 .
$$

Both angles lie strictly between $0$ and $\pi$, so both sines lie in $(0, 1]$
and $|\sin\alpha - \sin\beta| < 1$. The discriminant is positive: two distinct
real roots.

**(iii)(a)** $\alpha = \beta = 45^\circ$: $\cos(\alpha+\beta) = 0$ and
$\cos\alpha + \cos\beta = \sqrt2$, so $(*)$ is $x^2 - 2\sqrt2\,x + 1 = 0$ and
$x = \sqrt2 \pm 1$.

The triangle is right-angled and isosceles with
$AC = BC = \tfrac{1}{\sqrt2} \approx 0.707$. The root $x = \sqrt2 - 1 \approx 0.414$
puts $P$ and $Q$ inside their sides with $PQ$ parallel to $AB$: the
configuration the figure shows. The root $x = \sqrt2 + 1 \approx 2.414$ is
longer than either side, so $P$ and $Q$ lie on $AC$ and $BC$ produced, beyond
$C$, with $PQ$ again parallel to $AB$ but running the other way
($\theta = 180^\circ$). It satisfies $AP = PQ = QB$ just as well. In the third
panel, $\sigma_P$ and $\sigma_Q$ are both negative for this root: it is a
placement the figure never drew.

**(iii)(b)** $\alpha = 30^\circ$, $\beta = 90^\circ$: $\alpha + \beta = 120^\circ$,
so $(*)$ is linear, $-2(\cos 30^\circ + \cos 90^\circ)\,x + 1 = 0$, giving
$x = \dfrac{1}{\sqrt3}$.

The triangle is right-angled at $B$ with $BC = \tan 30^\circ = \dfrac{1}{\sqrt3}$
and $AC = \dfrac{2}{\sqrt3}$. So $QB = BC$: the point $Q$ *is* $C$. And $P$,
at distance $\tfrac{1}{\sqrt3} = \tfrac12 AC$ from $A$, is the midpoint of the
hypotenuse, which is at distance $\tfrac12 AC$ from $C$ as well, so $PQ = x$.
The sketch has $Q$ sitting on a vertex: $\sigma_Q = 0$, the boundary case a
generic drawing cannot show.

Two roots in one case and a placement on a vertex in the other, from a single
equation. The equation is right about all of them. It is the picture that is a
special case.
