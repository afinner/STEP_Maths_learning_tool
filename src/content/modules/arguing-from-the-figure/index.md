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
  A figure is one sample from the space of configurations the hypotheses allow,
  and a proof has to hold across all of it. Before using a fact about
  betweenness, ordering or sign that you have read off a drawing, name the
  quantity whose sign you have just assumed, and ask whether the hypotheses
  force it.
boundary: >-
  A figure is sound for generating conjectures, for incidence facts that do not
  depend on orientation, and whenever the hypotheses genuinely pin the
  configuration down — which is most of school geometry, and exactly why the
  habit arrives here intact.
provenance: >-
  The isosceles fallacy, which is old enough to belong to nobody and is written
  here in this module's own words. The bank cites STEP questions by paper, year
  and number, paraphrased into this module's framing; two of them are read
  alongside their examiner's reports, which is where the evidence about what
  candidates actually did comes from.
added: 2026-09-09
draft: true
---

Here is a proof that every triangle is isosceles. It is not a trick of
arithmetic and there is nothing hidden in the algebra: each line follows from
the one before it, and the congruences it leans on are genuinely true.

The argument, the figure it comes with, and the question of which step to
distrust are below.
