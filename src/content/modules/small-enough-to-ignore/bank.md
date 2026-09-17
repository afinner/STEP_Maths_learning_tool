Sorted by how the dropped term comes back, not by topic. Each link opens a
worked paper from the STEP Support Programme, which carries the question, full
solutions and the examiner's report. Work the question before you open it.

### Cancellation — what you kept subtracts to nothing

- [STEP III 2024, Q2(ii)(a)](https://step.maths.org/sites/default/files/2025-06/STEP3_2024_Mock.pdf) — Two leading terms cancel exactly, and what is left under the root decides the limit. The cleanest example in the bank; start here.
- [STEP III 2024, Q11(iii)–(iv)](https://step.maths.org/sites/default/files/2025-06/STEP3_2024_Mock.pdf) — The term you would discard is the entire answer. Simplify it away and the question evaporates.
- [STEP III 2023, Q2(iv)](https://step.maths.org/sites/default/files/2025-02/2023STEP3Mock.pdf) — Substitute $\alpha=0$ and both parts of an area vanish, reporting zero for a region you sketched two parts earlier and watched grow. Sketch it first: the contradiction only lands if the picture is yours.

### Multiplication — a small error meets a large factor

- [STEP II 2021, Q6(iii)–(iv)](https://step.maths.org/sites/default/files/2023-06/STEP_2_2021_Mock_0.pdf) — Two widths are each much smaller than the radius, which says nothing about how they compare with each other. And the angle you have just shown is small arrives multiplied by the radius, which is large.
- [STEP II 2024, Q11(iv)](https://step.maths.org/sites/default/files/2025-06/STEP2_2024_Mock.pdf) — The expansion is in $pk$, not in $p$, so the approximation is excellent at one group size and nonsense at another. Find the size where it breaks.
- [STEP III 2024, Q3](https://step.maths.org/sites/default/files/2025-06/STEP3_2024_Mock.pdf) — A threshold that naive limiting cannot see at all.

### Four limits to do in your head

For each one, decide how far you have to expand before anything survives.
Answers are folded away underneath.

**1.** $\displaystyle\lim_{x\to\infty}\bigl(\sqrt{x^{2}+3x}-x\bigr)$

<details>
<summary>Answer</summary>

$\tfrac32$. Either rationalise to $\dfrac{3x}{\sqrt{x^{2}+3x}+x}$, or expand
$\sqrt{x^{2}+3x}=x+\tfrac32-\tfrac{9}{8x}+\cdots$. The $x$ terms cancel, so
the answer is the first term you would have dropped: one order past leading.

</details>

**2.** $\displaystyle\lim_{x\to0}\frac{\tan x-\sin x}{x^{3}}$

<details>
<summary>Answer</summary>

$\tfrac12$. Both expansions start with $x$, and neither has an $x^{2}$ term,
so the cubes are the first place they differ:
$\tan x-\sin x=\bigl(x+\tfrac13x^{3}\bigr)-\bigl(x-\tfrac16x^{3}\bigr)+\cdots=\tfrac12x^{3}+\cdots$.
Two orders past leading, one of them empty. (Or: $\tan x-\sin x=\tan x\,(1-\cos x)\approx x\cdot\tfrac12x^{2}$.)

</details>

**3.** $\displaystyle\lim_{n\to\infty}n^{4}\left(\cos\frac1n-1+\frac{1}{2n^{2}}\right)$

<details>
<summary>Answer</summary>

$\tfrac1{24}$. The bracket cancels the first two terms of the cosine series by
hand, and the odd powers are absent, so the first survivor is
$\dfrac{1}{24n^{4}}$, four powers past the leading one. The zero coefficients
are still powers you have to pass.

</details>

**4.** $\displaystyle\lim_{n\to\infty}\left(1+\frac1n\right)^{n}$ — and why it is not $1$.

<details>
<summary>Answer</summary>

$e$. The shortcut says $1/n\to0$, so $(1+0)^{n}=1$. But the exponent $n$ is
the large factor: $n\ln\bigl(1+\tfrac1n\bigr)=n\bigl(\tfrac1n-\tfrac{1}{2n^{2}}+\cdots\bigr)=1-\tfrac{1}{2n}+\cdots\to1$,
so the limit is $e^{1}$. The discarded $1/n$ was multiplied by $n$, exactly
as in the hook.

</details>

### Which shortcuts survive?

Each of these replaces the small quantity by zero. Which of them still give
the limit that was asked for?

- **(a)** $\dfrac{3n^{2}+1}{n^{2}+2}$ as $n\to\infty$: divide through by $n^{2}$ and drop the $1/n^{2}$ terms.
- **(b)** $n\bigl(\sqrt{n^{2}+1}-n\bigr)$ as $n\to\infty$: round the root down to $n$.
- **(c)** $\dfrac{n+1}{2n+3}$ as $n\to\infty$: divide through by $n$ and drop the $1/n$ terms.
- **(d)** $\sin\dfrac1n$ as $n\to\infty$: replace $1/n$ by zero.

<details>
<summary>Answer</summary>

(a), (c) and (d) survive; (b) does not. In (a) and (c) nothing later multiplies
the discarded terms back up, and in (d) the shortcut and the limit agree at
zero with nothing afterwards to magnify the gap. In (b) the factor of $n$
outside restores the discarded $1/2n$ to full size, and the shortcut loses the
whole answer.

</details>
