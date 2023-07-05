---
sidebar_position: 5
---

# Consistency guarantees

State Backed ensures that your machine is always in a consistent state.
Processing for a machine instance is coordinated such that there is
a single, linearizable history of events and state transitions.

Machine instances will process a single event at a time, each event processing
waiting until the machine instance ["settles"](./settling) or the 10 second
[processing timeout](./limits) elapses.

No service that a machine starts or action that it executes as part of a transition
will run until the transition has already already been durably written to the datastore.

Any service that your machine
[invokes](https://xstate.js.org/docs/guides/communication.html)
or [spawns](https://xstate.js.org/docs/guides/actors.html#spawning-actors)
is run **at most once** when a suitable transition is taken.

It is possible that a transition is taken that calls for a service or actor to
be run but that a timeout or infrastructure error prevents the service or actor
from running or completing.
If that happens, the next event delivered to the machine will be processed after
delivering an error event for each service or actor that should have been run
but was not.

However, it **will never be the case** that an action, service or actor runs and
produces some observable effect (e.g. makes a `fetch` call, etc.) and no transition
causing the action, service, or actor to run was recorded.

## Upshot

This should match your intuition: if you can see a record of a transition,
the effects of the transition happened or failed. They effects may have been attempted
and then failed or they may have failed prior to even being attempted.
