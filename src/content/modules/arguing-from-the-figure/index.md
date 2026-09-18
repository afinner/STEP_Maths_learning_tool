---
id: arguing-from-the-figure
title: Arguing from the figure
summary: A proof that every triangle is isosceles, in which every congruence is true and one step reads a fact off the drawing.
claim: The figure I drew is the general case. My argument is about the objects, not the picture.
context: STEP
hypotheses:
  - id: feet-lie-within-the-sides
    label: Move A off centre
    statement: Each perpendicular foot lies between the two ends of the side it is on.
    violatedBy: >-
      Move A off the line of symmetry and one foot passes its vertex, so that
      side is the difference of the two pieces rather than their sum.
  - id: the-construction-meets-once
    label: Make AB = AC
    statement: >-
      The bisector of angle A and the perpendicular bisector of BC meet at
      exactly one point.
    violatedBy: >-
      Make AB and AC equal and the two lines are the same line, so every point
      on it satisfies both conditions and no single P is determined.
  - id: p-lies-where-it-is-drawn
    label: Flatten the triangle
    statement: P lies inside the triangle, where the figure puts it.
    violatedBy: >-
      P is the midpoint of the arc BC on the far side of the circle through the
      three vertices, so it is below BC for every triangle that has one.
decisiveQuantity:
  symbol: '\sigma = \min(t,\,1-t)'
  name: signed betweenness
  description: >-
    Write a foot of a perpendicular as A + t(V − A) along the side it lands on.
    σ is positive exactly when the foot lies strictly between the two ends, zero
    when it is one of them, and negative once it has passed one. Adding the two
    pieces to recover the whole side needs σ ≥ 0 at that foot, and the two feet
    in this figure always carry opposite signs.
repairedIntuition: >-
  A figure is one sample from the space of configurations the hypotheses
  allow, and a proof has to hold across all of it. Before using a fact about
  betweenness, ordering or sign that you have read off a drawing, name the
  quantity whose sign you have just assumed, and ask whether the hypotheses
  force it.
boundary: >-
  A figure is sound for generating conjectures, for incidence facts that do
  not depend on orientation, and whenever the hypotheses genuinely pin the
  configuration down — which is most of school geometry, and exactly why the
  habit arrives here intact.
question:
  citation: STEP II 2014, Q1
  link: https://step.maths.org/questions/14-s2-q1
  behind: the paper and links onward to solutions, in the STEP database
provenance: >-
  The isosceles fallacy, which is old enough to belong to nobody and is
  written here in this module's own words, and STEP II 2014, Q1, whose
  equation holds in configurations its figure never shows. Every question
  cited is paraphrased into this module's framing; no question text is
  reproduced.
added: 2026-09-09
---

Here is a proof that every triangle is isosceles.

<figure class="hook-figure">
<svg viewBox="0 0 13 10.4" role="img" aria-label="The figure as it is usually drawn: triangle ABC with P inside, the bisector of angle A and the perpendicular bisector of BC meeting at P, and the feet F on AB and G on AC of the perpendiculars from P.">
<path d="M5.70,1.00 L0.50,9.00 L12.50,9.00 Z" fill="none" stroke="var(--ink)" stroke-width="0.09" stroke-linejoin="round"/>
<line x1="5.70" y1="1.00" x2="6.02" y2="6.00" stroke="var(--chart-1)" stroke-width="0.06" stroke-dasharray="0.25 0.2"/>
<line x1="6.50" y1="9.00" x2="6.02" y2="6.00" stroke="var(--chart-1)" stroke-width="0.06" stroke-dasharray="0.25 0.2"/>
<line x1="6.02" y1="6.00" x2="3.51" y2="4.37" stroke="var(--chart-3)" stroke-width="0.06" stroke-dasharray="0.25 0.2"/>
<line x1="6.02" y1="6.00" x2="8.30" y2="4.06" stroke="var(--chart-3)" stroke-width="0.06" stroke-dasharray="0.25 0.2"/>
<path d="M6.90,9.00 L6.84,8.61 L6.44,8.61" fill="none" stroke="var(--ink-faint)" stroke-width="0.06"/>
<path d="M3.73,4.04 L4.06,4.25 L3.84,4.59" fill="none" stroke="var(--ink-faint)" stroke-width="0.06"/>
<path d="M8.04,3.76 L7.74,4.02 L8.00,4.32" fill="none" stroke="var(--ink-faint)" stroke-width="0.06"/>
<circle cx="6.02" cy="6.00" r="0.16" fill="var(--chart-1)"/>
<circle cx="3.51" cy="4.37" r="0.13" fill="var(--chart-3)"/>
<circle cx="8.30" cy="4.06" r="0.13" fill="var(--chart-3)"/>
<circle cx="6.50" cy="9.00" r="0.11" fill="var(--ink-muted)"/>
<circle cx="5.70" cy="1.00" r="0.14" fill="var(--ink)"/>
<circle cx="0.50" cy="9.00" r="0.14" fill="var(--ink)"/>
<circle cx="12.50" cy="9.00" r="0.14" fill="var(--ink)"/>
<text x="6.00" y="0.75" font-size="0.6">A</text>
<text x="-0.20" y="9.60" font-size="0.6">B</text>
<text x="12.75" y="9.60" font-size="0.6">C</text>
<text x="6.30" y="9.65" font-size="0.6">M</text>
<text x="6.27" y="6.50" font-size="0.6">P</text>
<text x="2.81" y="4.47" font-size="0.6">F</text>
<text x="8.55" y="4.16" font-size="0.6">G</text>
</svg>
</figure>

1. Let the bisector of angle $A$ and the perpendicular bisector of $BC$ meet
   at $P$.
2. Drop perpendiculars from $P$ to the two sides: $F$ on $AB$, $G$ on $AC$.
   Let $M$ be the midpoint of $BC$.
3. $AF = AG$: triangles $AFP$ and $AGP$ have a right angle each, equal angles
   at $A$, and $AP$ in common.
4. $PB = PC$: $P$ is on the perpendicular bisector of $BC$.
5. $FB = GC$: triangles $PFB$ and $PGC$ have a right angle each, $PF = PG$
   from step 3, and $PB = PC$ from step 4.
6. $AB = AF + FB$.
7. $AC = AG + GC$.

So $AB = AC$ by steps 3, 5, 6 and 7, for any triangle at all.

Every congruence is genuinely true. Step 1 is fine whenever $AB \neq AC$.
The false step is one of the two additions, and it is false because $F$ is
not where the picture puts it: for every triangle, one of the two feet has
passed its vertex, and the whole side is the *difference* of the two pieces.
The drawing settled a fact the argument never proved.
