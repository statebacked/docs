---
sidebar_position: 5
---

# Headless features

We are building a fully [open source library of headless features](https://github.com/statebacked/headless) that anyone can install into their State Backed org and access directly from their client via simple React hooks.

Instead of rewriting the same basic application building blocks over and over again, we would love to expose simple, fully-featured, backend-included, customizable features that anyone can pull into any app quickly and easily.

Obviously, we're building these on top of the State Backed platform so they happen to be great examples of creating useful, general-purpose machines.

See the code for the machines [here](https://github.com/statebacked/headless/tree/main/src/machines).

Each machine is used in one or more features, whose code is available [here](https://github.com/statebacked/headless/tree/main/src/features).
Every feature defines a file for each machine that the feature is composed of.
For example, the [rating feature](https://github.com/statebacked/headless/tree/main/src/features/authenticated-rating) relies on a [rating machine](https://github.com/statebacked/headless/blob/main/src/features/authenticated-rating/rating.ts) to represent a user's rating of an item and an [aggregate rating machine](https://github.com/statebacked/headless/blob/main/src/features/authenticated-rating/aggregate-rating.ts) to represent the average rating across all users of an item.

Features come in authenticated and unauthenticated variants, where the authenticated variants require `sub` claim for the user ID and the unauthenticated variants rely on a device ID (`did`) as the user ID.
