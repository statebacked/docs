---
sidebar_position: 3
---

# Settling

When a machine instance receives an event, the machine continues processing until it "settles" or until
its 10 second timeout elapses.

A machine instance is considered "settled" when it has no child services running.

A child service is any service [spawned](https://xstate.js.org/docs/guides/actors.html#spawning-actors)
or [invoked](https://xstate.js.org/docs/guides/communication.html) by the machine.

## Impact on child services

State Backed does not currently support long-lived child services.
Any spawned services live only as long as the processing of the current event,
which is limited to at most 10 seconds.

We intend to enable long-lived actor support in the future.
Email [support@statebacked.dev](mailto:support@statebacked.dev) if your use
case would benefit from having long-lived actors.

# Service invocation example

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
                svc: async (ctx) => {
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
the `request-data` request completes or until 10 seconds have elapsed. If the request
completes prior to the 10 second timeout, the send event request will return the
new state of the machine instance `complete` or `failed`. Otherwise, because the event
produced one successful transition (from `idle` to `run`), it will return `run` as
the state of the machine instance and, when the next event is sent to the machine instance,
it will first receive an error event for the `request-data` service and transition to the
`failed` state and will *then* process the event.
