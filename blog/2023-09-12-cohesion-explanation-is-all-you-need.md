---
title: Explanation is all you need
authors: [abrgr]
tags: [philosophy]
---

# Explanation is all you need

Cohesion is essential to great software but it seems like such a squishy concept. As it turns out, I think you can define it fairly intuitively. And, unfortunately, I find it missing in most backend systems.

Cohesion and coupling are, to a large extent, duals. Peter Hunt introduced the concepts wonderfully in his great [Rethinking best practices talk](https://www.youtube.com/watch?v=x7cQ3mrcKaY) introducing React.

At the time (back in 2013), common wisdom held that templates should be "de-coupled" from app logic. Instead, Peter argued that any such de-coupling was a fiction and that the benefits to cohesion from colocating templating and logic outweighed the perceived coupling concern.

All these years later, this remains the principle advance that React ushered in but the conceptual framework to understand coupling vs cohesion still hasn't been fully developed or fully adopted by the software community.

Unlike cohesion, the concept of coupling seems much easier to nail down. Coupling measures the degree to which different components depend on one another. We've all rightly had it drilled into our heads that unnecessary coupling is bad; we want to build de-coupled modules.

But we too-often forget that it's *unnecessary* coupling that's bad. We can't just pretend that *necessarily* coupled modules are de-coupled and, while tricks sometimes suffice to turn coupled code into seemingly de-coupled code, the degree of real coupling ultimately depends on the actual thing we're trying to build. The nature of the solution determines how much each of its parts must interact.

That is, the "whole" (the solution) exerts constraints on the "parts", the components.

Cohesion, on the other hand is about ensuring that the things that we have grouped together actually do belong together. False cohesion is obviously bad because it's just unnecessary coupling.

## So what is cohesion?

Cohesion, I believe, is measured by how closely a module reflects the explanation of the essential aspects of what it's supposed to do.

When you have 10 endpoints that all operate on the same data, they necessarily have deep assumptions and dependencies on each other, whether those dependencies are explicit or not. After all, they operate on the same data. Each endpoint embeds some assumptions about what that data must look like by the time it's called.

Any explanation of how that system works would have to discuss a level of abstraction above any of the endpoints themselves. Explaining why any of the endpoints behave as they do would require talking about how the whole set of endpoints is supposed to behave. Likely, when one engineer explains to another how a system like that works, they would talk about the flow that those endpoints jointly implement. They are parts of a whole and that whole doesn't exist in the codebase.

That indicates a lack of cohesion because the **explanation** of how the system works relies on an abstraction that has no analog anywhere in the code! In most endpoint-oriented codebases, there is no flow to point at at all even though everyone talks to their colleagues about flows all the time.
In fact, it is **necessary** to talk about a flow if you want to have a good explanation of how the system behaves or why any particular endpoint is built the way it is.

Instead, if the flow were reified and represented directly, e.g. by creating a [state machine](https://www.statebacked.dev) that represented the flow itself or a workflow that directly implemented the flow, then we could say that the flow demonstrated cohesion because the explanation of how the system worked could refer to actual entities in the code, namely, the state machine or workflow.

The endpoints could even remain in separate modules. Each of them, individually, could be considered somewhat cohesive at a certain level of explanation but to achieve cohesion at the level most of us care about (i.e. the flow), you have to introduce a higher-level structure that matches the explanation of the system.

Good explanations refer to good, cohesive abstractions. And good abstractions must be things you can point to in your system.

The science analog of a codebase without explicit flows and just fictionally-decoupled endpoints would be to ignore chemistry, biology, and psychology because they could be derived from physics.
While the effects at each of these emergent levels could theoretically be derived reductively, the explanations of any of the higher-level effects that we actually experience would be tortuous and so wildly complex that it would be hard to even consider them explanations in the normal sense of the word.
We need levels of abstraction that correspond to good explanations of the things we care about.

David Deutsch, in [The Beginning of Infinity](https://www.amazon.com/Beginning-Infinity-Explanations-Transform-World/dp/0143121359) refers to a thought experiment that's particularly apt:

> Consider one particular copper atom at the tip of the nose of the statue of Sir Winston Churchill that stands in Parliament Square in London. Let me try to explain why that copper atom is there. It is because Churchill served as prime minister in the House of Commons nearby; and because his ideas and leadership contributed to the Allied victory in the Second World War; and because it is customary to honour such people by putting up statues of them; and because bronze, a traditional material for such statues, contains copper, and so on. Thus we explain a low-level physical observation – the presence of a copper atom at a particular location – through extremely high-level theories about emergent phenomena such as ideas, leadership, war and tradition.

He goes on to explain how silly an explanation of how that copper atom came to rest at the tip of that particular statue's nose would look if it were only to refer to phenomena at the level of atoms and physics.

In any complex system, there is an intricate dance of higher levels of emergence creating constraints and influencing lower levels of emergence (in this case, culture influencing atoms even though culture is, itself, an emergent property of atomic effects).

Similarly, in our systems, we have different levels of emergence at which different types of abstractions exist.

Just as is the case for physics and culture though, there is no single direction in which explanations flow between different levels of abstraction.

The crucial point, if we are going to build systems that we can understand (i.e. explain), is that we must have a language of talking about each relevant level of abstraction in our codebases.

Too often, the flow that connects various endpoints is absent from our backend code and it severly hampers our ability to understand our equivalent of why that particular copper atom came to be at the tip of that particular statue's nose - in our scenarios: why this endpoint has some particular validation or guards against some strange phenomena.

If we build software that contains the entities that we talk about when we explain how it works, we will build better, more easily understood systems.

That's one of the crucial insights that got us excited about centering backend systems around state machines. Every engineer explains the components of their systems as a flow but no flow can be found in their codebase. Why not build your system the way you think about it?
