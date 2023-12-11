---
sidebar_position: 4
---

# Child instances

In a regular XState machine, you can [invoke](https://xstate.js.org/docs/guides/communication.html)
and [spawn](https://xstate.js.org/docs/guides/actors.html#spawning-actors)
child machines and you can use the [sendTo](https://xstate.js.org/docs/guides/actions.html#send-action)
action to send events to children or sendParent to send an event to your parent.

By default, any children spawned or invoked from a State Backed instance are considered
ephemeral. This means that they only execute as part of processing an event and
they are stopped if they are still running after the 90 second event processing
timeout elapses (and an error event will be delivered prior to processing the
next event they receive).

State Backed *also* supports invoking or spawning persistent machine instances,
which are instances of other State Backed machines. Machines can send events to
persistent children and parents exactly as they would to ephemeral children.
Persistent children are independently addressable, meaning that they are fully-fledged
machine instances that clients can send events to and subscribe to, and outlive
the 90 second event processing timeout. Events sent between persistent machine instances
are reliable and will be retried (up to 5 times) if errors occur during processing.

Like all events sent from external actors, machines must allow events from children
or parents in their `allowRead` and `allowWrite` [authorization functions](./authorization).

## Example

Here is our parent machine (named: `parent-machine`):

```javascript
import {
    AllowRead,
    AllowWrite,
    persistentInvocableSource,
    spawnPersistentInstance,
    sendTo as persistentSendTo
} from "@statebacked/machine";
import { createMachine, assign, sendTo } from "xstate";

// users can read their own instances
export const allowRead: AllowRead = ({authContext, context}) =>
    authContext.sub === context.uid;

export const allowWrite: AllowWrite = ({authContext, context}) =>
    // users can send events to their own instances
    authContext.sub === context.uid
        // and instances of the child-machine can send us events
        && authContext.stateBackedSender?.machineName === "child-machine";

export default createMachine({
    initial: "idle",
    states: {
        idle: {
            on: {
                run: "running"
            }
        },
        running: {
            entry: [
                assign({
                    // within an assign action, we can use spawnPersistentInstance
                    // to spawn a persistent instance and assign a reference to it
                    // to our context, just as we would use the spawn function in xstate
                    actor1: (ctx) => spawnPersistentInstance({
                        machineName: "child-machine"
                    }, {
                        // we can pass an optional initial context
                        context: {
                            uid: ctx.uid
                        }
                    })
                }),
                // send a message to our invoked child
                sendTo("child", {type: "hiFromParent"}),
                // send a delayed message to our spawned child
                persistentSendTo((ctx) => ctx.actor1, { type: "hiFromParent" }, { delay: 200 })
            ],
            invoke: {
                // we can use persistentInvocableSource as the src for our invoke
                // to invoke a persistent machine instance
                src: persistentInvocableSource({
                    machineName: "child-machine",
                }),
                id: "child",
                // we can set the initial context just as we would in a normal invocation
                data: (ctx) => ({
                    uid: ctx.uid
                })
            },
            initial: "start",
            states: {
                start: {
                    on: {
                        childSaysHi: "awaitingSecondChild"
                    }
                },
                awaitingSecondChild: {
                    on: {
                        childSaysHi: "done",
                    }
                },
                done: {}
            }
        }
    }
});
```

And here is our child machine (named `child-machine`):

```javascript
import {
    AllowRead,
    AllowWrite,
} from "@statebacked/machine";
import { createMachine, assign, sendParent } from "xstate";

// users can read their own instances
// because persistent instances are independently addressable, clients could
// query for the state of our child machine instances if they have the instance name
export const allowRead: AllowRead = ({authContext, context}) =>
    authContext.sub === context.uid;

// instances of the parent-machine can send us events
export const allowWrite: AllowWrite = ({authContext, context}) =>
    authContext.stateBackedSender?.machineName === "parent-machine";

export default createMachine({
    initial: "start",
    states: {
        start: {
            entry: sendParent({type: "childSaysHi"}),
            on: {
                hiFromParent: "done"
            }
        },
        done: {}
    }
});
```
