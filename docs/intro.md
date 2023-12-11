---
sidebar_position: 1
title: Quick Start
---

import TogglerExample from "@site/src/components/Examples/toggler-machine-example";

# Welcome to State Backed!

State Backed runs any [XState](https://xstate.js.org/docs/) state machine as a persistent, API-accessible, real-time, stateful backend
that you can interact with directly from your client code, backend code, our CLI, or [dashboard](https://www.statebacked.dev).

We take care of consistency, durability, availability, and all of the infrastructure.
You write simple, testable, visualizable state machines that represent only your business logic.

## Quick Start

### Setup our workspace

Follow along with the CLI-based quick start, below, or use our [web dashboard](https://www.statebacked.dev).

```bash npm2yarn
npm init
npm install --save xstate @statebacked/machine
# Optional but recommended. You can use npx to invoke smply if you don't want to install it globally.
npm install --global smply
```

### Create a machine definition

Machine definitions are typescript or javascript files that default export an XState state machine as well as `allowRead` and `allowWrite` functions.

<TogglerExample />

Our example is a very simple machine that doesn't interact with the outside world.
In your machines, you can run just about anything you want: call external services
to send emails, update your own API, read data from external sources, or schedule
actions and events to run in the future with our reliable timers using all of the power of XState.
There are really only 2 things to keep in mind:
1. Your machine can execute for 90 seconds after it receives an event. After 90 seconds,
if there are still any running services, they will be stopped and your machine will receive
an error event from them. The most recent state of the machine will returned and your machine
will always be in a consistent state. State Backed supports long-running workflows composed of short-running steps.
2. Machines run in a [web standards-like environment](./runtime-environment) with access to normal browser APIs (e.g.
fetch, crypto.subtle, WebAssembly, etc.).

### Upload your machine to State Backed

We'll show you how to create a machine via the CLI, below, but you may want to head over to
our [web dashboard](https://www.statebacked.dev/machines) and follow along with the in-browser
development environment and visualizer.

For the CLI-inclined:

```bash
# You'll be prompted to sign in to State Backed. Your credentials will be stored in ~/.smply.
# replace ./example-machine.ts with ./example-machine.js if you used js above
smply machines create --machine example-machine --node ./example-machine.ts
```

🎉 Woohoo!

You can now create as many instances of your new machine as you'd like.
Send events and read instance state and State Backed will handle persistence and consistency.

### Create a test machine instance and send it some events

The real power of State Backed is sending events via API from your own app but let's create a machine instance and
send an example event from the command line to get a feel for how this works.
Again, feel free to play around with the CLI or head over to the [web dashboard](https://www.statebacked.dev/machines)
and create a machine instance and send it events directly from the browser (hint: check out the logs and transition
history while you're at it).

```bash
smply instances create --machine example-machine --instance session-123 --auth-context '{"sid": "session-123"}'
smply instances send-event --machine example-machine --instance session-123 --auth-context '{"sid": "session-123"}' --event toggle
```

Great! Now, let's integrate State Backed into an app.

### Interact with State Backed machines in your app

In your client-side codebase:

```npm2yarn
npm install --save @statebacked/client
```

<Tabs>
<TabItem value="ts" label="Typescript">

```javascript title=client.ts
import { StateBackedClient } from "@statebacked/client";

// the name of the machine that we created, above
const machineName = "example-machine";

// we can store our session ID in session storage or wherever we like.
// if we switch to use authenticated instead of anonymous sessions, we don't need any session ID.
const sessionId = crypto.randomUUID();

// our State Backed client, using an anonymous session
// we can also configure State Backed to use our existing authentication provider
// to securely include claims about the user making each request
const client = new StateBackedClient({
  anonymous: {
    orgId: "org-YOUR_ORG_ID",
    getSessionId() {
      return sessionId;
    }
  }
});

// name our instances with our session ID to match our authorization rules
const machineInstanceName = sessionId;

const { state, publicContext } = await client.machineInstances.getOrCreate(
  machineName,
  {
    // name of the machine instance
    slug: machineInstanceName,
    context: {
      // we can set some initial context for the machine or leave this undefined
    },
  },
);

// now, we can use our `state` ("on" | "off") and our `publicContext` (`{"toggleCount": 1}`)

// ...

// later, send an event to our machine instance
const { state, publicContext } = await client.machineInstances.sendEvent(
  machineName,
  userId, // our machine instance name
  {
    event: "toggle", // this can also be an object like { type: "event-name", ... } for events that contain data
  },
);
```

</TabItem>
<TabItem value="js" label="Javascript">

```javascript title=client.js
import { StateBackedClient } from "@statebacked/client";

// the name of the machine that we created, above
const machineName = "example-machine";

// we can store our session ID in session storage or wherever we like.
// if we switch to use authenticated instead of anonymous sessions, we don't need any session ID.
const sessionId = crypto.randomUUID();

// our State Backed client, using an anonymous session
// we can also configure State Backed to use our existing authentication provider
// to securely include claims about the user making each request
const client = new StateBackedClient({
  anonymous: {
    orgId: "org-YOUR_ORG_ID",
    getSessionId() {
      return sessionId;
    }
  }
});

// name our instances with our session ID to match our authorization rules
const machineInstanceName = sessionId;

const { state, publicContext } = await client.machineInstances.getOrCreate(
  machineName,
  {
    // name of the machine instance
    slug: machineInstanceName,
    context: {
      // we can set some initial context for the machine or leave this undefined
    },
  },
);

// now, we can use our `state` ("on" | "off") and our `publicContext` (`{"toggleCount": 1}`)

// ...

// later, send an event to our machine instance
const { state, publicContext } = await client.machineInstances.sendEvent(
  machineName,
  userId, // our machine instance name
  {
    event: "toggle", // this can also be an object like { type: "event-name", ... } for events that contain data
  },
);
```

</TabItem>

</Tabs>

That's cool and all but I thought State Backed had built-in real-time and multiplayer support. Let's see it!

```javascript
const unsubscribe = client.machineInstances.subscribe(
  machineName,
  machineInstanceName,
  ({ state, tags, publicContext, done }) => {
    // we just got a new state pushed to us.
    // this could be in response to an event we sent,
    // an event another client sent (if our authorization rules allowed it),
    // or an event that was sent by a reliable timer that our machine kicked off a few seconds ago or a few years ago.
  }
);

// when we're done:
unsubscribe();
```

That's it!
You now have an unlimited number of secure, persistent, stateful, consistent machine instances running your business logic, available for real-time, multiplayer access via simple API.
