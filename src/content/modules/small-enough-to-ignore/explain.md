### The error you make, and what happens to it next

Replacing a small quantity $\varepsilon$ by zero inside an expression $f$ is
not free. If $f$ is smooth,

$$
f(\varepsilon)=f(0)+f'(0)\,\varepsilon+O(\varepsilon^{2}),
$$

so the substitution costs an error of about $|f'(0)|\,\varepsilon$. That is
small. Whether it *matters* is a different question, and it is answered by what
the rest of the calculation does to it.

For the hook, write the root as $n\sqrt{1+1/n^{2}}$ and expand with the
binomial series:

$$
\sqrt{n^{2}+1}
 = n\left(1+\frac{1}{n^{2}}\right)^{1/2}
 = n\left(1+\frac{1}{2n^{2}}-\frac{1}{8n^{4}}+\cdots\right)
 = n+\frac{1}{2n}-\frac{1}{8n^{3}}+\cdots
$$

So $\sqrt{n^{2}+1}-n=\dfrac{1}{2n}-\dfrac{1}{8n^{3}}+\cdots$, and the shortcut
replaced this by $0$: an error of $\dfrac{1}{2n}$, which goes to zero as
promised. Then

$$
n\left(\sqrt{n^{2}+1}-n\right)=\frac12-\frac{1}{8n^{2}}+\cdots\;\longrightarrow\;\frac12 .
$$

The factor of $n$ outside multiplied the error back up to a constant. The
answer *is* the error. Everything the shortcut kept, $n-n$, cancelled to
nothing, so there was nothing else for the answer to be.

The same thing without any series: multiply top and bottom by
$\sqrt{n^{2}+1}+n$,

$$
n\left(\sqrt{n^{2}+1}-n\right)
 = n\cdot\frac{(n^{2}+1)-n^{2}}{\sqrt{n^{2}+1}+n}
 = \frac{n}{\sqrt{n^{2}+1}+n}\;\longrightarrow\;\frac12 .
$$

The $1$ that was "negligible beside $n^{2}$" is the entire numerator of the
difference.

### Three ways a discarded term comes back

1. **Cancellation.** The terms you kept subtract to nothing ($n-n$), so the
   first term you dropped is the leading term of the answer.
2. **Multiplication.** A factor that grows ($n$) meets an error that shrinks
   ($1/2n$). The product need not shrink.
3. **A denominator that also vanished.** In a quotient of two small quantities
   only the leading *non-zero* term of each matters, and which term that is can
   depend on where you are standing.

The third is the subtle one, and it is where the second panel above spends its
time.

### The ratio $R(\theta,\alpha)$, done properly

$$
R(\theta,\alpha)=\frac{\sin(\theta+\alpha)-\sin\theta}{\cos(\theta+\alpha)-\cos\theta}
$$

Geometrically this is the gradient of the chord of the unit circle between the
points at angles $\theta$ and $\theta+\alpha$. As $\alpha\to0$ it should become
the gradient of the tangent at $\theta$.

Expand each difference with the addition formulae and the Maclaurin series for
$\sin\alpha$ and $\cos\alpha$:

$$
\begin{aligned}
\sin(\theta+\alpha)-\sin\theta &= \alpha\cos\theta-\tfrac12\alpha^{2}\sin\theta-\tfrac16\alpha^{3}\cos\theta+\cdots\\[2pt]
\cos(\theta+\alpha)-\cos\theta &= -\alpha\sin\theta-\tfrac12\alpha^{2}\cos\theta+\tfrac16\alpha^{3}\sin\theta+\cdots
\end{aligned}
$$

**Generic $\theta$**, with $\sin\theta\neq0$. Divide top and bottom by
$\alpha$:

$$
R=\frac{\cos\theta-\tfrac12\alpha\sin\theta+\cdots}{-\sin\theta-\tfrac12\alpha\cos\theta+\cdots}\;\longrightarrow\;-\cot\theta .
$$

The dropped $\alpha^{2}$ terms were genuinely negligible: after the division
they are $O(\alpha)$ beside something of size $1$. At $\theta=\pi/3$ this gives
$-1/\sqrt3\approx-0.577$, the gradient of the tangent to the unit circle there.

**At $\theta=0$.** Now $\sin\theta=0$, and the first-order term of the
denominator is not small; it is absent:

$$
R(0,\alpha)=\frac{\alpha-\tfrac16\alpha^{3}+\cdots}{-\tfrac12\alpha^{2}+\tfrac1{24}\alpha^{4}-\cdots}.
$$

Keeping first order gives $\alpha/0$: not a large number but no number at all,
because the truncation has kept nothing in the denominator. Keeping second
order gives $R\approx-2/\alpha$, which grows without bound as $\alpha\to0$. The
tangent to the circle at $\theta=0$ is vertical, so this is the right answer:
there is no finite limit.

**Exactly.** The sum-to-product identities give

$$
R(\theta,\alpha)
 =\frac{2\cos\!\left(\theta+\tfrac{\alpha}{2}\right)\sin\tfrac{\alpha}{2}}
       {-2\sin\!\left(\theta+\tfrac{\alpha}{2}\right)\sin\tfrac{\alpha}{2}}
 =-\cot\!\left(\theta+\tfrac{\alpha}{2}\right),
$$

which confirms both cases at once: $-\cot\theta$ where that is finite, and
$-\cot(\alpha/2)\approx-2/\alpha$ at $\theta=0$. The pole of $R$ sits at
$\theta=-\alpha/2$; the first-order truncation puts it at $\theta=0$. The two
curves in the second panel differ by exactly that shift.

### Where, precisely, the "smaller" term is bigger

The dropped term in the denominator, $\tfrac12\alpha^{2}\cos\theta$, is smaller
than the kept term $\alpha\sin\theta$ only when

$$
|\alpha\sin\theta|>\tfrac12\alpha^{2}|\cos\theta|
\quad\Longleftrightarrow\quad
|\tan\theta|>\frac{\alpha}{2}.
$$

Inside the window $|\theta|\lesssim\alpha/2$ the "negligible" term is the
dominant one. Shrinking $\alpha$ shrinks the window but never closes it, and the
point $\theta=0$ is always inside. That window is the shaded band in the panel,
and the ratio $\rho$ of the two terms is the number to read off: $\rho<1$ means
the truncation is upside down.

### The rule

For a quotient of two quantities that both tend to zero, write each as a series
and find the first non-zero coefficient:

$$
F(\varepsilon)=\frac{a_p\varepsilon^{p}+a_{p+1}\varepsilon^{p+1}+\cdots}{b_q\varepsilon^{q}+b_{q+1}\varepsilon^{q+1}+\cdots},
\qquad a_p,\,b_q\neq0 .
$$

Then $F\sim\dfrac{a_p}{b_q}\,\varepsilon^{\,p-q}$: the limit is $0$ if $p>q$,
it is $a_p/b_q$ if $p=q$, and there is no finite limit if $p<q$. You have to
expand far enough to *see* $a_p$ and $b_q$. A coefficient that depends on a
parameter, like $\sin\theta$, can be zero at particular values of that
parameter, and at those values the order you need goes up by one.

The same bookkeeping covers the hook: $\sqrt{n^{2}+1}-n$ has leading term
$\tfrac12\varepsilon$ with $\varepsilon=1/n$, and multiplying by $n$ is
dividing by $\varepsilon$. The powers cancel, $p=q=1$, and the limit is the
ratio of leading coefficients, $\tfrac12$.

In the language of the decisive quantity: replacing a small quantity by zero
preserves a limit when the result is still defined at the point in question
*and* the discarded effect $E$, measured after every later operation, still
tends to zero.
