### What "do the same to both sides" actually claims

An equation survives any function: if $a=b$ then $\varphi(a)=\varphi(b)$,
whatever $\varphi$ is. An inequality is a statement about *order*, and a
function only preserves order if it is increasing:

$$
\varphi\ \text{strictly increasing on an interval containing } a \text{ and } b
\quad\Longrightarrow\quad
\bigl(a<b \iff \varphi(a)<\varphi(b)\bigr).
$$

If $\varphi$ is strictly decreasing there, the order reverses:
$a<b\iff\varphi(a)>\varphi(b)$. If it is neither, increasing on part of the
range and decreasing on the rest, then nothing about $\varphi(a)$ and
$\varphi(b)$ follows from $a<b$ at all.

That is the whole theory. The difficulty is only that "the same thing" is
usually a *different* function at different $x$. Multiplying both sides by
$x-2$ is the map $t\mapsto(x-2)\,t$: increasing when $x>2$, decreasing when
$x<2$, and constant (every $t$ goes to $0$) at $x=2$. It is not one step; it is
three, and the naive route applies the first of them everywhere.

### The worked example, done properly

$$
\frac{x+1}{x-2}<3 .
$$

**By cases.** For $x>2$ the multiplier is positive and the step is sound:
$x+1<3x-6$, giving $x>\tfrac72$. For $x<2$ the multiplier is negative and the
order turns round: $x+1>3x-6$, giving $x<\tfrac72$, which every $x<2$
satisfies. At $x=2$ the statement is not defined. Union: $x<2$ or $x>\tfrac72$.

**Without cases.** Bring everything to one side and never multiply by anything
whose sign you do not know:

$$
\frac{x+1}{x-2}-3<0
\iff\frac{x+1-3(x-2)}{x-2}<0
\iff\frac{7-2x}{x-2}<0 .
$$

A sign table settles it:

| | $x<2$ | $2<x<\tfrac72$ | $x>\tfrac72$ |
| --- | --- | --- | --- |
| $7-2x$ | $+$ | $+$ | $-$ |
| $x-2$ | $-$ | $+$ | $+$ |
| quotient | $-$ | $+$ | $-$ |

Negative on $x<2$ and on $x>\tfrac72$: two ranges, as the hook said.

**Or multiply by a square.** $(x-2)^{2}>0$ for every $x\neq2$, so multiplying
by it keeps the order everywhere the statement is defined:
$(x+1)(x-2)<3(x-2)^{2}$, which is $(x-2)\bigl[(x+1)-3(x-2)\bigr]<0$, which is
$(x-2)(7-2x)<0$ — the same sign table.

### The disagreement set

Write $D$ for the set of $x$ at which the statement you started with and the
statement you finished with give different verdicts. A step is sound exactly
when $D$ is empty, and when it is not, $D$ *is* the cost of the step. The first
panel measures it directly.

For the multiplication above, $D=\{x\le2\}$. Below $2$ the original holds and
the transformed statement, $x>\tfrac72$, fails; at $x=2$ the original is
undefined while the transformed one has an opinion. $D$ is exactly the set
where the multiplier fails to be positive.

### Squaring

$$
\sqrt{x+2}>x .
$$

Defined for $x\ge-2$. Squaring is $t\mapsto t^{2}$: increasing on $[0,\infty)$
and decreasing on $(-\infty,0]$, so it preserves the order between two numbers
only when both are non-negative. The left side is a square root and never
negative; the right side is $x$.

- If $x<0$: the left side is $\ge0>x$, so the statement holds outright and no
  squaring is needed. This gives $-2\le x<0$.
- If $x\ge0$: both sides are non-negative and squaring is sound. $x+2>x^{2}$
  is $x^{2}-x-2<0$, is $(x-2)(x+1)<0$, is $-1<x<2$. With $x\ge0$: $0\le x<2$.

Union: $-2\le x<2$. The naive route squares immediately and gets $-1<x<2$,
losing $[-2,-1]$: exactly the $x$ at which the right side is negative and lies
further from zero than the left. $D=[-2,-1]$.

### Division, reciprocals, and where the statement lives

$x^{2}>3x$. Dividing by $x$ gives $x>3$, and loses every negative solution: for
$x<0$ the division reverses the order (to $x<3$, satisfied by all of them),
and at $x=0$ it is not a step at all. Correct: $x(x-3)>0$, so $x<0$ or $x>3$.

Reciprocals: $t\mapsto1/t$ is decreasing on $(0,\infty)$ and decreasing on
$(-\infty,0)$, but *not* decreasing across zero, since $-1<2$ and also
$-1<\tfrac12$. So $a<b\Rightarrow\tfrac1a>\tfrac1b$ only when $a$ and $b$ have
the same sign.

A step can also change *where the statement is defined*. Clearing the
denominator makes $x=2$ a legitimate point of the new statement when it was no
point at all of the old one; squaring $\sqrt{x+2}>x$ forgets that $x\ge-2$
unless you carry it along. Those points join $D$ too.

### Three questions before any step

1. Is the operation increasing across *every* value still in play? If it is
   decreasing, turn the sign round. If it is neither, split into cases on which
   it is one or the other.
2. Does it change where the statement is defined? Carry the original domain
   with you.
3. If either answer is unclear, do not apply it. Move everything to one side
   and read the sign off a table.
