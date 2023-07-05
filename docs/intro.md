---
sidebar_position: 1
title: Quick Start
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Welcome to State Backed!

State Backed runs any [XState](https://xstate.js.org/docs/) state machine as a persistent, API-accessible, stateful backend
that you can interact with directly from your client code, backend code, and via our CLI.

We take care of consistency, durability, and availability.
You write simple, testable, visualizable state machines that represent only your business logic.

## Quick Start

### Setup our workspace

```bash npm2yarn
npm init
npm install --save xstate @statebacked/machine-def
# Optional but recommended. You can use npx to invoke smply if you don't want to install it globally.
npm install --global smply
```

### Create a machine definition

Machine definitions are typescript or javascript files that default export an XState state machine as well as `allowRead` and `allowWrite` functions.

<Tabs>
<TabItem value="ts" label="Typescript">

Save this example as `example-machine.ts`:

```javascript title=example-machine.ts
import { createMachine, assign } from "xstate";
import type { AllowRead, AllowWrite } from "@statebacked/machine-def";

// State Backed will call allowRead to determine whether a request to read
// the state of an instance of this machine will be allowed or not.
// authContext contains claims about your end-user that you include in the
// auth token for the request.
//
// In this case, we allow users to read from any machine instance that
// is named with their user id.
export allowRead: AllowRead = ({ machineInstanceName, authContext }) =>
  machineInstanceName === authContext.sub;

// Similarly, State Backed calls allowWrite  to determine whether a request
// to send an event to an instance of this machine will be allowed or not.
//
// In this case, we allow users to write to any machine instance that
// is named with their user id.
export allowWrite: AllowWrite = ({ machineInstanceName, authContext }) =>
  machineInstanceName === authContext.sub;

type Context = {
  public: {
    toggleCount?: number;
  }
};

export default createMachine<Context>({
  predictableActionArguments: true,
  initial: "on",
  states: {
    on: {
      on: {
        toggle: {
          target: "off",
          actions: assign({
            // any context under the `public` key will be visible to authorized clients
            public: (ctx) => ({
              ...ctx.public,
              toggleCount: (ctx.public?.toggleCount ?? 0) + 1
            })
          }),
        },
      },
    },
    off: {
      on: {
        toggle: "on",
      },
    },
  },
});
```

</TabItem>
<TabItem value="js" label="Javascript">

Save this example as `example-machine.js`:

```javascript title=example-machine.js
import { createMachine } from "xstate";

// State Backed will call allowRead to determine whether a request to read
// the state of an instance of this machine will be allowed or not.
// authContext contains claims about your end-user that you include in the
// auth token for the request.
//
// In this case, we allow users to read from any machine instance that
// is named with their user id.
export allowRead = ({ machineInstanceName, authContext }) =>
  machineInstanceName === authContext.sub;

// Similarly, State Backed calls allowWrite  to determine whether a request
// to send an event to an instance of this machine will be allowed or not.
//
// In this case, we allow users to write to any machine instance that
// is named with their user id.
export allowWrite = ({ machineInstanceName, authContext }) =>
  machineInstanceName === authContext.sub;

export default createMachine({
  predictableActionArguments: true,
  initial: "on",
  states: {
    on: {
      on: {
        toggle: {
          target: "off",
          actions: assign({
            // any context under the `public` key will be visible to authorized clients
            public: (ctx) => ({
              ...ctx.public,
              toggleCount: (ctx.public?.toggleCount ?? 0) + 1
            })
          }),
        },
      },
    },
    off: {
      on: {
        toggle: "on",
      },
    },
  },
});
```

</TabItem>
</Tabs>

Our example is a very simple machine that doesn't interact with the outside world.
In your machines, you can run just about anything you want: call external services
to send emails, update your own API, read data from external sources, or schedule
actions and events to run in the future using all of the power of XState.
There are really only 2 things to keep in mind:
1. Your machine can execute for 10 seconds after it receives an event. After 10 seconds,
if there are still any running services, they will be stopped and your machine will receive
an error event from them. The most recent state of the machine will returned and your machine
will always be in a consistent state.
2. Machines run in a web standards-like environment with access to normal browser APIs (e.g.
fetch, crypto.subtle, WebAssembly, etc.).

### Upload your machine to State Backed

```bash
# You'll be prompted to sign in to State Backed. Your credentials will be stored in ~/.smply.
# replace ./example-machine.ts with ./example-machine.js if you used js above
smply machines create --machine example-machine --deno ./example-machine.ts
```

🎉 Woohoo!

You can now create as many instances of your new machine as you'd like.
Send events and read instance state and State Backed will handle persistence and consistency.

### Create a test machine instance and send it some events

The real power of State Backed is sending events via API from your own app but let's create a machine instance and
send an example event from the command line to get a feel for how this works.

```bash
smply instances create --machine example-machine --instance user-123 --auth-context '{"sub": "user-123"}'
smply instances send-event --machine example-machine --instance user-123 --auth-context '{"sub": "user-123"}' --event toggle
```

Great! Now, let's integrate State Backed into an app.

### Create API keys

:::tip

Make sure to store the keys (`sbk_...` and `sbsec_...` somewhere safe).

:::

```bash
# create keys for our production app
smply keys create --use production --name production-app
```

### Create tokens for your end-users

:::danger

Only create tokens on devices that you control (e.g. your server).
Creating tokens requires access to your secret key and anyone who has your secret key can impersonate any of your users.

:::

On your server:

```bash npm2yarn
npm install --save @statebacked/token
```

Generate a State Backed token and pass it to your client.

<Tabs>
<TabItem value="ts" label="Typescript">

```javascript title=your-server.ts
import { signToken } from "@statebacked/token";

// The State Backed key id for the key you generated above
const stateBackedKeyId = process.env.STATE_BACKED_KEY_ID;
// The State Backed secret key for the key you generated above
const stateBackedSecretKey = process.env.STATE_BACKED_SECRET_KEY;
const tokenExpiration = "7d"; // 7 days
const issuer = "your-domain.com"; // TODO: replace with your domain

type User = /* type for your user info */

/**
 * Returns a State Backed authentication token for the given user
 * 
 * You can include any information you need to make authorization decisions
 * as claims in the token.
 * We recommend always including a `sub` claim with the user's id.
 * 
 * Return this token to your client.
 **/
export function getStateBackedToken(user: User) {
  const key = {
    stateBackedKeyId,
    stateBackedSecretKey,
  };

  const claims = {
    sub: user.id,
  };

  return signToken(
    key,
    claims,
    {
      issuer,
      expires: {
        in: tokenExpiration,
      },
    },
  );
}
```

</TabItem>
<TabItem value="js" label="Javascript">

```javascript title=your-server.ts
import { signToken } from "@statebacked/token";

const stateBackedKeyId = process.env.STATE_BACKED_KEY_ID;
const stateBackedSecretKey = process.env.STATE_BACKED_SECRET_KEY;
const tokenExpiration = "7d"; // 7 days
const issuer = "your-domain.com"; // TODO: replace with your domain

/**
 * Returns a State Backed authentication token for the given user
 * 
 * You can include any information you need to make authorization decisions
 * as claims in the token.
 * We recommend always including a `sub` claim with the user's id.
 * 
 * Return this token to your client.
 **/
export function getStateBackedToken(user) {
  const key = {
    stateBackedKeyId,
    stateBackedSecretKey,
  };

  const claims = {
    sub: user.id,
  };

  return signToken(
    key,
    claims,
    {
      issuer,
      expires: {
        in: tokenExpiration,
      },
    },
  );
}
```

</TabItem>
</Tabs>

### Interact with State Backed machines in your app

:::tip

This code can live on your client, server, or anywhere.

:::

```npm2yarn
npm install --save @statebacked/client
```

<Tabs>
<TabItem value="ts" label="Typescript">

```javascript title=client.ts
import { StateBackedClient } from "@statebacked/client";

// the name of the machine that we created, above
const machineName = "example-machine";

// get the token from the server as generated in `getStateBackedToken`, above
const token = await getTokenFromServer();

const client = new StateBackedClient(token);

const { state, publicContext } = await client.machineInstances.create(
  machineName,
  {
    // name of the machine instance
    // here, we name instances with the user id to match our authorization rules
    slug: userId,
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

const token = await getTokenFromServer();
const client = new StateBackedClient(token);

const { state, publicContext } = await client.machineInstances.create(
  machineName,
  {
    // name of the machine instance
    // here, we name instances with the user id to match our authorization rules
    slug: userId,
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

That's it!
You now have an unlimited number of secure, persistent, stateful, consistent machine instances running your business logic, available via simple API.
