---
sidebar_position: 3
---

# Settling

State Backed supports long-running workflows composed of intermediate-length steps.
That means that your machine instances can process a huge amount of data or events in a completely
durable and reliable way by running many short (&lt;90 seconds) actions.

When a machine instance receives an event, the machine continues processing until it "settles" or until
that event's 90 second timeout elapses.

A machine instance is considered "settled" when it has no ephemeral child services running.

An ephemeral child service is any service
[spawned](https://xstate.js.org/docs/guides/actors.html#spawning-actors)
or [invoked](https://xstate.js.org/docs/guides/communication.html) by the machine
with the default spawn or invoke (i.e. any child service that is not persistent).

Persistent child services may be spawned with the
[`spawnPersistentInstance`](https://statebacked.github.io/machine/functions/spawnPersistentInstance.html)
method from [`@statebacked/machine`](https://github.com/statebacked/machine) or by
specifying a persistent source in an `invoke` block by using the
[`persistentInvocableSource`](https://statebacked.github.io/machine/functions/persistentInvocableSource.html)
method from [`@statebacked/machine`](https://github.com/statebacked/machine).

# Ephemeral service invocation example

Consider this machine:

```javascript
import { createMachine, assign } from "xstate";

export default createMachine({
  initial: "idle",
  states: {
    idle: {
      on: {
        run: "run",
      }
    },
    run: {
      invoke: {
        id: "request-data",
        src: async (ctx) => {
          const res = await fetch("https://example.com/");
          if (!res.ok) {
            throw new Error("oops");
          }

          const { data } = await res.json();
          return data;
        },
        onDone: {
          target: "complete",
          actions: assign({
            data: (_, evt) => evt.data
          }),
        },
        onError: "failed",
      },
    },
    complete: {},
    failed: {},
  }
});
```

The request to create a machine instance from this machine will complete right away.

A subsequent request to send the `run` event to the machine instance will wait until
the `request-data` request completes or until 90 seconds have elapsed. If the request
completes prior to the 90 second timeout, the send event request will return the
new state of the machine instance `complete` or `failed`. Otherwise, because the event
produced one successful transition (from `idle` to `run`), it will return `run` as
the state of the machine instance and stop the ongoing fetch after 90 seconds.
Then, when the next event is sent to the machine instance, it will first receive an
error event for the `request-data` service and transition to the `failed` state
and only *then* will it process the new event. This ensures a completely consistent
sequence of states using only the natural error handling primitives provided by
state machines.

# Persistent service invocation example

Consider this machine:

```javascript
import { createMachine, assign } from "xstate";
import { persistentInvocableSource } from "@statebacked/machine";

export default createMachine({
  initial: "idle",
  states: {
    idle: {
      on: {
        run: "run",
      }
    },
    run: {
      on: {
        // receive the proceed event from our child-machine instance
        proceed: "complete"
      },
      invoke: {
        id: "request-data",
        src: persistentInvocableSource({
          machineName: "child-machine",
        }),
      },
    },
    complete: {},
  }
});
```

The request to create a machine instance from this machine will complete right away.

A subsequent request to send the `run` event to the machine instance will also complete
right away but it will create a new, persistent State Backed machine instance of the
"child-machine" machine (it will create a random machine instance name because one wasn't
provided).

Whenever the "child-machine" instance executes a `sendParent` action to send its parent
a "proceed" event, our instance will receive it and execute the appropriate transition.

Time spent to create the new persistent machine instance does not count against the
90 second timeout for event processing.
