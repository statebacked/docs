---
sidebar_position: 3
---

# Machine instances

Think of a **[machine definition](./machines.md)** like a class and
**machine instances** as, well, *instances* of that class.

An instance of a machine has persistent state that preserves the state
of the XState machine, including any context, history, etc.

You can create as many instances of each machine as you'd like.
Each instance is independent.
It has its own name, its own state, makes its own authorization decisions,
receives its own events, and handles its own delayed events.

## How to think about machine instances

Your machine is likely related to a particular entity in your system.
If your machine is meant to handle the business logic for how a user
goes through a particular journey in your app, you likely want a
machine instance for each user. If your machine is meant to handle
the business logic for an organization in your app, where each organization
might contain many members with different roles as well as many documents,
you probably want a machine instance for each organization.
If your machine is designed to handle the business logic for a 
multiplayer game, you probably want one machine instance for each
game.

## Interface

Each machine instance exposes 3 pieces of data to authorized callers:
- Its name
- Its current state
- The contents of the `public` property of its context

## Authorization

Since you likely have a machine instance for each entity that your
machine deals with, you want to make sure that entities can only
read and write to the instances that they should be able to access.

Your authorization decisions can be as fine-grained as you like,
even to the point of allowing certain entities to send some events
but not others or allowing some entities to send events only if a
machine instance is in a particular state or has a particular context.

Learn more about authorizing reads and writes to your machine instances
[here](./authorization).

## API

You'll generally interact with machines and machine versions via the `smply`
CLI (or GitHub actions) but, while `smply` does support creating instances,
sending events, and reading instance state, you'll generally want to interact 
with machine instances via the API.

The API is hosted at **https://api.statebacked.dev** and you can view
the full API documentation [here](https://api-docs.statebacked.dev/).

While you're welcome to send requests directly to the API, we recommend
using our [client library](https://www.npmjs.com/package/@statebacked/client)
to interact with your State Backed machine instances.

### Client

The key operations you'll want to use are:

### Install

```bash npm2yarn
npm install --save @statebacked/client
```

Or, if you're using Deno, just replace the imports below with:
```javascript
import { StateBackedClient } from "https://deno.land/x/statebacked_client/mod.ts";
```

### Initialize your client

Every request to a machine instance must include an authentication token (JWT)
that is signed by one of your [API keys](./keys) and includes claims about
the end-user that is making the request.

Learn more about generating a token [here](./authorization).

Once you have a token, initialize your State Backed client.

```javascript
import { StateBackedClient } from "@statebacked/client";

const stateBackedClient = new StateBackedClient(token);
```

### Create a machine instance

A good time to create your machine instance is whenever the entity that the
machine is related to gets created.
For example, you might want to create a user onboarding machine instance when
each user is created.

```javascript
const state = await stateBackedClient.machineInstances.create(
    "your-machine-name",
    {
        slug: "your-machine-instance-name",
        context: { /* any initial context you want to set */ },
    },
);
```

`state` will contain these properties:
- `state` - a string or object representing the current state.
  For machines in a single, top-level state, this will be the name of the state.
  If a machine is hierarchical and in the "child" state of a "parent" state,
  this will be the object `{ "parent": "child" }`.
  If the machine is in multiple parallel states or deeply hierarchical,
  this will be a more deeply-nested object with more than one key at each
  level with a parallel state.
  Identical to an [XState StateValue](https://paka.dev/npm/xstate@4.38.0/api#b15ac32ffdf27aa5).
- `states` - an array of strings representing every (possibly nested) state the 
  machine instance is in. If a machine is in parallel state "parent", which
  has 2 children, "a" and "b", this will be the array:
  `["parent", "parent.a", "parent.b"]`.
  Identical to [XState's state.toStrings()](https://paka.dev/npm/xstate@4.38.0/api#d0a8399161a7d1ca).
- `publicContext` - the contents of the `public` property of the machine
  instance's `context`. This allows you to control the public interface that
  your machine instances expose while keeping any data you don't put under
  the `public` key private to your instance.

### Send an event to a machine instance

Simple event:

```javascript
const state = await stateBackedClient.machineInstances.sendEvent(
    "your-machine-name",
    "your-machine-instance-name",
    {
        event: "your-event-name"
    },
);
```

Event with associated data:

```javascript
const state = await stateBackedClient.machineInstances.sendEvent(
    "your-machine-name",
    "your-machine-instance-name",
    {
        event: {
            type: "your-event-name",
            ...extraData
        }
    },
);
```

`state` has the same properties as described above
(`state`, `states`, and `publicContext`).