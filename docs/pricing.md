---
sidebar_position: 9
---

# Pricing

:::tip
State Backed is **always free** for up to 1,000 transitions and 10,000 reads each month with 7 day historical
transition retention.
:::

State Backed plans apply to an organization and cover all activity for machines, machine versions, and
machine instances within that organization.
You can access your billing information on the [web dashboard](https://www.statebacked.dev) or by running `smply billing`.

## Pricing dimensions

State Backed pricing has 2 primary dimensions: **transitions** and **reads**.

### Transitions

A transition is counted for every [macrostep](https://xstate.js.org/docs/guides/interpretation.html#transitions)
of a machine instance.
That means that a transition to a state with an `always` transition to another state will count as one
transition.

Further, a transition includes 100kb of context when represented as a UTF8 JSON string.
A transition that results in 350kb of context will be charged as 4 transitions.

For machines that declare [indexes](./concepts/indexes), each index write is charged as 0.5 transitions.

An instance [migration](./concepts/migrations) results in one transition and one index write for each declared index.

### Reads

A read is counted for every request that returns machine instance state *except* for those requests
that result in transitions (that is, every transition includes a free read).

[Index](./concepts/indexes) queries are charged as 1 read.

### Historical transition retention

An historical transition is any transition other than the most recent transition for a machine instance.
The most recent transition for a machine instance is always persisted.
Historical transition retention periods vary by plan and can be extended further with special pricing
upon request.

## Plans

| Plan | Monthly Price | Transition limit | Read limit | Historical data retention | Current data retention |
|------|---------------|------------------|------------|---------------------------|------------------------|
| Free | $0            | 1,000            | 10,000     | 7 days                    | Instances live forever |
| Hobby | $20          | 100,000          | 1,000,000  | 30 days                   | Instances live forever |
| Business | $200      | 2,500,000        | 25,000,000 | 90 days                   | Instances live forever |
| Enterprise | [Contact us](mailto:sales@statebacked.dev) | --   | -- | -- | Instances live forever |

### Free

**State Backed is free for up to 1,000 transitions and 10,000 reads each month with 7 day historical transition retention.**

### Hobby

The State Backed Hobby plan includes 100,000 transitions and 1,000,000 reads per month with 30 day
historical transition retention.

The Hobby plan is **$20 / month** or **$200 / year**.

If you exceed the plan quota, you can choose to have us automatically add an additional bundle
of 100k transitions and 1m reads for $20.
Added bundles do not expire and will automatically be used to cover overages for future months.

### Business

The State Backed Business plan includes 2,500,000 transitions and 25,000,000 reads per month with 90 day
historical transition retention.

The Business plan is **$200 / month** or **$2,000 / year**.

If you exceed the plan quota, you can choose to have us automatically add an additional bundle
of 2.5m transitions and 25m reads for $200.
Added bundles do not expire and will automatically be used to cover overages for future months.

## Included free in all plans

All plans come with unlimited organization members, unlimited machines, unlimited machine versions,
and unlimited machine instances (but creating a machine instance causes at least 1 transition).
