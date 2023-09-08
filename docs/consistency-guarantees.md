---
sidebar_position: 4
---

# Consistency guarantees

State Backed ensures that there is only ever a single instance of your machien instance
running at a given time and guarantees that your instance is always in a consistent state.
Processing for a machine instance is coordinated such that there is
a single, linearizable history of events and state transitions.

Machine instances will process a single event at a time. Processing will continue
until the machine instance ["settles"](./settling) or the 10 second
[processing timeout](./limits) elapses. Each event sent by a client or initiated by
a reliable timer extends the processing timeout such that the machine instance
will continue processing until 10 seconds after the *last* external event was
delivered.

No service that a machine starts or action that it executes as part of a transition
will run until the transition has already already been durably written to the datastore.
This ensures that you will never see an externaly-visible effect without a corresponding
state transition that caused it.

Any service that your machine
[invokes](https://xstate.js.org/docs/guides/communication.html)
or [spawns](https://xstate.js.org/docs/guides/actors.html#spawning-actors)
is run **at most once** when a suitable transition is taken.

It is possible that a transition is taken that calls for a service or actor to
be run but that a timeout or infrastructure error prevents the service or actor
from running or completing.
If that happens, the next event delivered to the machine will be processed after
delivering an error event for each service or actor that should have been run
but was not. This ensures consistency.

However, it **will never be the case** that an action, service or actor runs and
produces some observable effect (e.g. makes a `fetch` call, etc.) and no transition
causing the action, service, or actor to run was recorded.

## Upshot

This should match your intuition: if you can see a record of a transition,
the effects of the transition happened or failed. The effects may have been attempted
and then failed or they may have failed prior to even being attempted.

## Timers

All timers (e.g. `after` transitions or delayed events) are durable and reliable
and execute within a few milliseconds of their intended delivery.

If some error (e.g. a guard or action throwing) prevents the handling of a timer-driven event,
it will be retried up to 5 times.  After the 5th time, the event will be dropped.
