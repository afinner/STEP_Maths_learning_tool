Sorted by how the step goes wrong, not by topic. Each link is the question's
entry in the STEP database, which carries the paper and links onward to
solutions. Follow one expecting the question, not the answer.

### The multiplier changes sign

- [STEP I 2003, Q4](https://step.maths.org/questions/03-s1-q4) — A trigonometric quotient compared with $1$ over a full period. The multiplier is a cosine, which changes sign twice inside the range, so the step runs one way on some arcs and the other way on the rest; and the two angles where it vanishes are outside the original statement and inside the cleared one.
- [STEP I 1995, Q1(i) and (iii)](https://step.maths.org/questions/95-s1-q1) — The same cubic inequality posed first in one variable and then in two. The tempting reduction divides through by an odd power of the second variable, which changes sign with it: the module's lesson one dimension up, where it is much easier to miss.
- [1986 Specimen paper I, Q9(i)](https://step.maths.org/questions/spec-s1-q9) — A modulus stacked on a rational expression. The modulus splits the problem into cases with opposite order behaviour, the expression inside changes sign as well, and one value of $x$ is outside the statement altogether.
- [STEP II 2004, Q2](https://step.maths.org/questions/04-s2-q2) — A quadratic in $|x|$ with a parameter. The modulus splits the problem at zero into branches with opposite order behaviour. Self-marking, which is rare and worth using: the question asks for the total length of the solution set, so drop a branch and the number comes out visibly short.

### Where the same rule is the tool

Not traps. In each of these the question asks you to establish an
order-preserving step, or to lean on one deliberately, which is the other half
of having the idea.

- [STEP II 1997, Q8](https://step.maths.org/questions/97-s2-q8) — Explain why one function being at least another on an interval means its integral is at least the other's, then use it. The module's boundary, set as an examination instruction.
- [STEP I 2017, Q2](https://step.maths.org/questions/17-s1-q2) — An inequality integrated three times in succession. Order survives each integration, but the direction has to be tracked.
- [STEP II 2017, Q6(ii)](https://step.maths.org/questions/17-s2-q6) — A step that squares an inequality, licensed by both sides being non-negative: the exact condition the squaring witness violates, stated as a permission.
- [STEP II 2016, Q4(i)](https://step.maths.org/questions/16-s2-q4) — From $A^{2}\ge B^{2}$ to $|A|\ge|B|$: squaring read backwards. It recovers the moduli and nothing more, which is precisely why the forward step loses sign information.
- [STEP I 2018, Q2(i)](https://step.maths.org/questions/18-s1-q2) — A step taking reciprocals of both sides: order-reversing between quantities of the same sign, and something else entirely across zero.
- [STEP I 2011, Q8(a)](https://step.maths.org/questions/11-s1-q8) — Show that one quantity is less than another exactly when a quadratic in $n$ is positive: the closest thing in the archive to the disagreement set, since it asks for the precise range on which two statements agree.

### Two to do by hand

**1.** Find the total length of the set of $x$ satisfying $x^{2}-5|x|+6<0$.

<details>
<summary>Answer</summary>

$2$. Write $u=|x|$: then $u^{2}-5u+6<0$ gives $2<u<3$, so $2<x<3$ or
$-3<x<-2$, two intervals of length $1$. Treating $|x|$ as $x$ keeps only the
right-hand one and gives $1$, short by exactly the branch that went missing.
That is what makes a question worth asking this way: the number reports the
omission without anyone having to mark it.

</details>

**2.** Which of these steps leave the solution set exactly as it was?

- **(a)** $2x<6$: divide both sides by $2$.
- **(b)** $-2x<6$: divide both sides by $-2$, keeping the sign as it is.
- **(c)** $x<4$: add $3$ to both sides.
- **(d)** $x<4$: square both sides.

<details>
<summary>Answer</summary>

(a) and (c). Dividing by a positive constant and adding a constant are
increasing everywhere. (b) reverses the order and must turn the sign round;
left as it is, the answer $x<-3$ is the complement of the truth $x>-3$. (d)
preserves order only between non-negative numbers: every $x<-4$ satisfies the
original and fails the square.

</details>
