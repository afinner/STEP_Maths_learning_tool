**(i)** The instinct is to multiply through by $x$. That is the map
$t\mapsto xt$, increasing for $x>0$ and decreasing for $x<0$: the first
hypothesis of the module, and the fourth step in the panel. So, cases.

**$x>0$.** Multiplying keeps the order: $x+2x^{2}-x^{3}>2$, i.e.
$x^{3}-2x^{2}-x+2<0$. Factorise by grouping:
$x^{2}(x-2)-(x-2)=(x-2)(x^{2}-1)=(x+1)(x-1)(x-2)$. So we need
$(x+1)(x-1)(x-2)<0$:

| | $x<-1$ | $-1<x<1$ | $1<x<2$ | $x>2$ |
| --- | --- | --- | --- | --- |
| $(x+1)(x-1)(x-2)$ | $-$ | $+$ | $-$ | $+$ |

With $x>0$: $\;1<x<2$.

**$x<0$.** Multiplying reverses the order: $(x+1)(x-1)(x-2)>0$, so $-1<x<1$
or $x>2$. With $x<0$: $\;-1<x<0$.

**Solution:** $\;-1<x<0\;$ or $\;1<x<2$.

What the naive route gives: $(x+1)(x-1)(x-2)<0$ everywhere, i.e. $x<-1$ or
$1<x<2$. It is right for positive $x$ and wrong at every negative $x$ except
$x=-1$ itself, where both statements happen to fail: it gains $x<-1$ and loses
$-1<x<0$. Select this step in the first panel and the disagreement set is the
whole negative axis.

**(ii)** Both sides are defined for $x\ge-\tfrac{10}{3}$, and both are
non-negative — the right side is at least $2$. Squaring is increasing on
$[0,\infty)$, so the first squaring is sound:

$$
3x+10>4+4\sqrt{x+4}+(x+4)
\iff 2x+2>4\sqrt{x+4}
\iff x+1>2\sqrt{x+4} .
$$

Now the second hypothesis. The right side is still non-negative, but the left
side is $x+1$, which is negative for $x<-1$, and there the statement fails
outright: a negative number cannot exceed a non-negative one. So any solution
has $x>-1$, and for those $x$ both sides are positive and squaring is sound
again:

$$
x^{2}+2x+1>4x+16
\iff x^{2}-2x-15>0
\iff(x-5)(x+3)>0 ,
$$

so $x<-3$ or $x>5$. With $x>-1$: $\;x>5$.

**Solution:** $\;x>5$.

Squaring the second time without checking the sign of $x+1$ gives $x<-3$ or
$x>5$, and with the domain $x\ge-\tfrac{10}{3}$ that admits
$-\tfrac{10}{3}\le x<-3$: a third of a unit of $x$ that satisfies the squared
statement and never satisfied the original. Try $x=-3.2$: the left side is
$\sqrt{0.4}\approx0.63$ and the right is $2+\sqrt{0.8}\approx2.89$. In the
first panel this is the fifth step, and the disagreement set is exactly that
interval.

Two hypotheses, one question: (i) is the multiplier whose sign you do not know,
and (ii) is the operation that is increasing on part of the range and
decreasing on the rest.
