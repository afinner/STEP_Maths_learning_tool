**(i)** By the addition formula,
$\cos(\theta+\alpha)-\cos\theta=\cos\theta\,(\cos\alpha-1)-\sin\theta\sin\alpha$.
With $\cos\alpha=1-\tfrac12\alpha^{2}+O(\alpha^{4})$ and
$\sin\alpha=\alpha+O(\alpha^{3})$ this is
$-\alpha\sin\theta-\tfrac12\alpha^{2}\cos\theta+O(\alpha^{3})$. The same steps
give $\sin(\theta+\alpha)-\sin\theta=\alpha\cos\theta-\tfrac12\alpha^{2}\sin\theta+O(\alpha^{3})$.

If $\sin\theta\neq0$, divide numerator and denominator by $\alpha$:

$$
\frac{\cos\theta-\tfrac12\alpha\sin\theta+O(\alpha^{2})}{-\sin\theta-\tfrac12\alpha\cos\theta+O(\alpha^{2})}
\;\longrightarrow\;\frac{\cos\theta}{-\sin\theta}=-\cot\theta .
$$

This is the step the belief gets right: the $\alpha^{2}$ terms sit beside
non-zero first-order terms, so dropping them changes nothing in the limit.

If $\sin\theta=0$ then $\cos\theta=\pm1$ and the first-order term of the
denominator is gone. The ratio is

$$
\frac{\pm\alpha+O(\alpha^{3})}{\mp\tfrac12\alpha^{2}+O(\alpha^{4})}
=-\frac{2}{\alpha}\bigl(1+O(\alpha^{2})\bigr),
$$

which is unbounded: it tends to $-\infty$ as $\alpha\to0^{+}$ and to $+\infty$
as $\alpha\to0^{-}$. There is no limit. This is the second panel with the chip
pressed: keep first order at $\theta=0$ and you have $\alpha/0$; keep second
order and the pole appears. Notice, too, that the question hands you the
$\alpha^{2}$ term in the "show that". A STEP question rarely gives you a term
you will not need.

**(ii)(a)** The centre $X$ of $C_1$ is at distance $na$ from $O$ in the
direction of $Q$, so $X=(na\cos\theta,\ na\sin\theta)$. Rolling without
slipping means the arc of $C_2$ covered by the contact point, $(n-1)a\,\theta$,
equals the arc of $C_1$ that has rolled, so $C_1$ has turned through
$(n-1)\theta$ relative to the line $XQ$, and that line has itself turned through
$\theta$. So $XP$ makes angle $\theta+(n-1)\theta=n\theta$ with the $x$-axis,
and $P=X+a(\cos n\theta,\sin n\theta)$:

$$
x(\theta)=a(n\cos\theta+\cos n\theta),\qquad y(\theta)=a(n\sin\theta+\sin n\theta).
$$

At $\theta=0$ this gives $\bigl((n+1)a,0\bigr)$, as it should.

**(b)** Squaring and adding,

$$
OP^{2}=a^{2}\bigl[n^{2}+1+2n(\cos\theta\cos n\theta+\sin\theta\sin n\theta)\bigr]
      =a^{2}\bigl[n^{2}+1+2n\cos(n-1)\theta\bigr].
$$

Setting this equal to $(n-1)^{2}a^{2}=a^{2}(n^{2}-2n+1)$ gives
$\cos(n-1)\theta=-1$, so

$$
\theta=\frac{(2k+1)\pi}{n-1},\qquad k=0,1,\dots,n-2
$$

within one turn. These are the $n-1$ cusps of the curve: the moments when $P$
is the point of contact itself, and (as the third panel shows) momentarily at
rest.

**(c)** With $\theta_0=\pi/(n-1)$ we have $(n-1)\theta_0=\pi$, so
$\cos n\theta_0=\cos(\pi+\theta_0)=-\cos\theta_0$ and
$\sin n\theta_0=-\sin\theta_0$. Keep those two facts to hand.

Apply part (i) to each of the four differences, keeping second order. The
second bracket in each line is the expansion of $\sin n(\theta_0+\alpha)-\sin n\theta_0$
and its cosine twin, which is part (i) with $n\alpha$ in place of $\alpha$:

$$
\frac{y(\theta_0+\alpha)-y(\theta_0)}{x(\theta_0+\alpha)-x(\theta_0)}
=\frac{n\bigl(\alpha\cos\theta_0-\tfrac12\alpha^{2}\sin\theta_0\bigr)+\bigl(n\alpha\cos n\theta_0-\tfrac12n^{2}\alpha^{2}\sin n\theta_0\bigr)+\cdots}
      {n\bigl(-\alpha\sin\theta_0-\tfrac12\alpha^{2}\cos\theta_0\bigr)+\bigl(-n\alpha\sin n\theta_0-\tfrac12n^{2}\alpha^{2}\cos n\theta_0\bigr)+\cdots}
$$

Collect powers of $\alpha$:

$$
=\frac{n\alpha\,(\cos\theta_0+\cos n\theta_0)-\tfrac12n\alpha^{2}(\sin\theta_0+n\sin n\theta_0)+\cdots}
      {-n\alpha\,(\sin\theta_0+\sin n\theta_0)-\tfrac12n\alpha^{2}(\cos\theta_0+n\cos n\theta_0)+\cdots}.
$$

Here is the trap. Dividing by $\alpha$ and sending $\alpha\to0$ would give
$-(\cos\theta_0+\cos n\theta_0)/(\sin\theta_0+\sin n\theta_0)$, the
"$-\cot$" shape of part (i), and it is tempting to write that down. But at
$\theta_0$ both brackets are zero: $\cos\theta_0+\cos n\theta_0=0$ and
$\sin\theta_0+\sin n\theta_0=0$. The first-order terms are absent from
*both* numerator and denominator, exactly as in the $\sin\theta=0$ case of
part (i). That is the 0/0 the whole module is about, and the second-order terms
are what is left. Substituting $\sin n\theta_0=-\sin\theta_0$ and
$\cos n\theta_0=-\cos\theta_0$:

$$
\lim_{\alpha\to0}\frac{-\tfrac12n\alpha^{2}(1-n)\sin\theta_0}{-\tfrac12n\alpha^{2}(1-n)\cos\theta_0}
=\tan\theta_0 .
$$

Finally, at $\theta_0$ the point $P$ is
$X-a(\cos\theta_0,\sin\theta_0)=(n-1)a\,(\cos\theta_0,\sin\theta_0)$, so $OP$
points in the direction $\theta_0$ and has gradient $\tan\theta_0$. The tangent
and $OP$ have the same gradient, so they are parallel.

In the module's terms: $\theta_0$ is a point where the first-order coefficients
of *both* $x$ and $y$ vanish. The curve has a cusp there, the tracing point is
instantaneously at rest, and the direction it leaves in is decided by the
second-order terms. Press "Snap to the nearest cusp" in the third panel to
stand on it.
